import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new video project
export const createProject = mutation({
  args: {
    title: v.optional(v.string()),
    coupleName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const projectId = await ctx.db.insert("videoProjects", {
      userId: identity.subject,
      title: args.title,
      coupleName: args.coupleName,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

// Get a project by ID
export const getProject = query({
  args: { projectId: v.id("videoProjects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // Get all images for this project
    const images = await ctx.db
      .query("projectImages")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Get URLs for all images
    const imagesWithUrls = await Promise.all(
      images.map(async (img) => ({
        ...img,
        url: await ctx.storage.getUrl(img.storageId),
      }))
    );

    return {
      ...project,
      images: imagesWithUrls,
    };
  },
});

// Get all projects for the current user
export const getUserProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const projects = await ctx.db
      .query("videoProjects")
      .withIndex("by_user_created", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return projects;
  },
});

// Generate upload URL for image
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Add image to project
export const addImageToProject = mutation({
  args: {
    projectId: v.id("videoProjects"),
    storageId: v.id("_storage"),
    order: v.number(),
    originalNote: v.string(),
    imageDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify project ownership
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Check image count limit (max 10)
    const existingImages = await ctx.db
      .query("projectImages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (existingImages.length >= 10) {
      throw new Error("Maximum 10 images allowed per video");
    }

    const imageId = await ctx.db.insert("projectImages", {
      projectId: args.projectId,
      storageId: args.storageId,
      order: args.order,
      originalNote: args.originalNote,
      imageDate: args.imageDate,
      createdAt: Date.now(),
    });

    // Update project timestamp
    await ctx.db.patch(args.projectId, {
      updatedAt: Date.now(),
    });

    return imageId;
  },
});

// Update image metadata
export const updateImage = mutation({
  args: {
    imageId: v.id("projectImages"),
    originalNote: v.optional(v.string()),
    imageDate: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    // Verify project ownership
    const project = await ctx.db.get(image.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const updates: Record<string, unknown> = {};
    if (args.originalNote !== undefined) updates.originalNote = args.originalNote;
    if (args.imageDate !== undefined) updates.imageDate = args.imageDate;
    if (args.order !== undefined) updates.order = args.order;

    await ctx.db.patch(args.imageId, updates);

    // Update project timestamp
    await ctx.db.patch(image.projectId, {
      updatedAt: Date.now(),
    });
  },
});

// Delete image from project
export const deleteImage = mutation({
  args: { imageId: v.id("projectImages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    // Verify project ownership
    const project = await ctx.db.get(image.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Delete the image from storage
    await ctx.storage.delete(image.storageId);

    // Delete the database record
    await ctx.db.delete(args.imageId);

    // Update project timestamp
    await ctx.db.patch(image.projectId, {
      updatedAt: Date.now(),
    });
  },
});

// Update project details
export const updateProject = mutation({
  args: {
    projectId: v.id("videoProjects"),
    title: v.optional(v.string()),
    coupleName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };
    if (args.title !== undefined) updates.title = args.title;
    if (args.coupleName !== undefined) updates.coupleName = args.coupleName;

    await ctx.db.patch(args.projectId, updates);
  },
});

// Delete a project and all its images
export const deleteProject = mutation({
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

    // Delete all images
    const images = await ctx.db
      .query("projectImages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const image of images) {
      await ctx.storage.delete(image.storageId);
      await ctx.db.delete(image._id);
    }

    // Delete render jobs
    const jobs = await ctx.db
      .query("renderJobs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const job of jobs) {
      if (job.outputStorageId) {
        await ctx.storage.delete(job.outputStorageId);
      }
      await ctx.db.delete(job._id);
    }

    // Delete the project
    await ctx.db.delete(args.projectId);
  },
});
