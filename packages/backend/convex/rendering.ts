import { mutation, query, internalMutation, httpAction } from "./_generated/server";
import { v } from "convex/values";

// Start render process
export const startRender = mutation({
  args: { projectId: v.id("videoProjects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify project ownership and status
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    if (project.status !== "ready_to_render") {
      throw new Error("Project not ready for rendering. Current status: " + project.status);
    }

    // Check if there's already a pending/rendering job
    const existingJob = await ctx.db
      .query("renderJobs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "queued"),
          q.eq(q.field("status"), "rendering")
        )
      )
      .first();

    if (existingJob) {
      throw new Error("A render job is already in progress");
    }

    // Create render job
    const jobId = await ctx.db.insert("renderJobs", {
      projectId: args.projectId,
      status: "queued",
      createdAt: Date.now(),
    });

    // Update project status
    await ctx.db.patch(args.projectId, {
      status: "queued",
      updatedAt: Date.now(),
    });

    return jobId;
  },
});

// Get render status (real-time for UI subscription)
export const getRenderStatus = query({
  args: { projectId: v.id("videoProjects") },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("renderJobs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .first();

    return job;
  },
});

// Get video download URL
export const getVideoDownloadUrl = query({
  args: { projectId: v.id("videoProjects") },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("renderJobs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .first();

    if (!job?.outputStorageId) return null;

    return await ctx.storage.getUrl(job.outputStorageId);
  },
});

// Update render progress (called by render server)
export const updateRenderProgress = internalMutation({
  args: {
    jobId: v.id("renderJobs"),
    status: v.union(
      v.literal("queued"),
      v.literal("rendering"),
      v.literal("completed"),
      v.literal("failed")
    ),
    progress: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    outputStorageId: v.optional(v.id("_storage")),
    renderDurationMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    const updates: Record<string, unknown> = {
      status: args.status,
    };

    if (args.progress !== undefined) updates.progress = args.progress;
    if (args.errorMessage) updates.errorMessage = args.errorMessage;
    if (args.outputStorageId) updates.outputStorageId = args.outputStorageId;
    if (args.renderDurationMs) updates.renderDurationMs = args.renderDurationMs;

    // Set timestamps
    if (args.status === "rendering" && !job.startedAt) {
      updates.startedAt = Date.now();
    }
    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.jobId, updates);

    // Update project status
    let projectStatus: "rendering" | "completed" | "failed" = "rendering";
    if (args.status === "completed") projectStatus = "completed";
    if (args.status === "failed") projectStatus = "failed";

    await ctx.db.patch(job.projectId, {
      status: projectStatus,
      updatedAt: Date.now(),
      ...(args.errorMessage && { errorMessage: args.errorMessage }),
    });
  },
});

// Get queued jobs for render server to pick up
export const getQueuedJobs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("renderJobs")
      .withIndex("by_status", (q) => q.eq("status", "queued"))
      .order("asc")
      .take(args.limit ?? 10);

    // Get project and image data for each job
    const jobsWithData = await Promise.all(
      jobs.map(async (job) => {
        const project = await ctx.db.get(job.projectId);
        if (!project) return null;

        const images = await ctx.db
          .query("projectImages")
          .withIndex("by_project_order", (q) => q.eq("projectId", job.projectId))
          .collect();

        const imagesWithUrls = await Promise.all(
          images.map(async (img) => ({
            url: await ctx.storage.getUrl(img.storageId),
            caption: img.enhancedCaption || img.originalNote,
            date: img.imageDate,
            order: img.order,
          }))
        );

        return {
          jobId: job._id,
          projectId: job.projectId,
          coupleName: project.coupleName,
          images: imagesWithUrls.sort((a, b) => a.order - b.order),
          createdAt: job.createdAt,
        };
      })
    );

    return jobsWithData.filter(Boolean);
  },
});

// Generate upload URL for rendered video (for render server)
export const generateVideoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Cancel a render job
export const cancelRender = mutation({
  args: { jobId: v.id("renderJobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Verify project ownership
    const project = await ctx.db.get(job.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Can only cancel queued jobs
    if (job.status !== "queued") {
      throw new Error("Can only cancel queued jobs");
    }

    await ctx.db.patch(args.jobId, {
      status: "failed",
      errorMessage: "Cancelled by user",
      completedAt: Date.now(),
    });

    await ctx.db.patch(job.projectId, {
      status: "ready_to_render",
      updatedAt: Date.now(),
    });
  },
});

// Retry a failed render
export const retryRender = mutation({
  args: { projectId: v.id("videoProjects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    if (project.status !== "failed") {
      throw new Error("Can only retry failed projects");
    }

    // Reset project status
    await ctx.db.patch(args.projectId, {
      status: "ready_to_render",
      errorMessage: undefined,
      updatedAt: Date.now(),
    });
  },
});

// Cleanup old render jobs (scheduled task)
export const cleanupOldJobs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const oldJobs = await ctx.db
      .query("renderJobs")
      .withIndex("by_created")
      .filter((q) => q.lt(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    let deletedCount = 0;
    for (const job of oldJobs) {
      // Delete the output video if it exists
      if (job.outputStorageId) {
        try {
          await ctx.storage.delete(job.outputStorageId);
        } catch (e) {
          console.error("Failed to delete video:", e);
        }
      }
      await ctx.db.delete(job._id);
      deletedCount++;
    }

    return { deletedCount };
  },
});
