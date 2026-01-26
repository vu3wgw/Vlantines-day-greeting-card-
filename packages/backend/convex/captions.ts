import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// Get images for a project (internal query for actions)
export const getProjectImages = internalQuery({
  args: { projectId: v.id("videoProjects") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("projectImages")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
      .collect();
    return images;
  },
});

// Update project status (internal mutation for actions)
export const updateProjectStatus = internalMutation({
  args: {
    projectId: v.id("videoProjects"),
    status: v.union(
      v.literal("draft"),
      v.literal("processing"),
      v.literal("ready_to_render"),
      v.literal("queued"),
      v.literal("rendering"),
      v.literal("completed"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.errorMessage) {
      updates.errorMessage = args.errorMessage;
    }
    await ctx.db.patch(args.projectId, updates);
  },
});

// Update image caption (internal mutation for actions)
export const updateImageCaption = internalMutation({
  args: {
    imageId: v.id("projectImages"),
    enhancedCaption: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.imageId, {
      enhancedCaption: args.enhancedCaption,
    });
  },
});

// Trigger caption enhancement (user-facing mutation)
export const enhanceCaptions = mutation({
  args: { projectId: v.id("videoProjects") },
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

    // Check minimum image count
    const images = await ctx.db
      .query("projectImages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (images.length < 5) {
      throw new Error("Minimum 5 images required");
    }

    // Update status to processing
    await ctx.db.patch(args.projectId, {
      status: "processing",
      updatedAt: Date.now(),
    });

    // Schedule the AI enhancement action
    await ctx.scheduler.runAfter(0, internal.captions.enhanceCaptionsAction, {
      projectId: args.projectId,
    });
  },
});

// Internal action that calls Gemini to enhance captions
export const enhanceCaptionsAction = internalAction({
  args: { projectId: v.id("videoProjects") },
  handler: async (ctx, args) => {
    try {
      // Get all images for this project
      const images = await ctx.runQuery(internal.captions.getProjectImages, {
        projectId: args.projectId,
      });

      if (images.length < 5) {
        await ctx.runMutation(internal.captions.updateProjectStatus, {
          projectId: args.projectId,
          status: "failed",
          errorMessage: "Minimum 5 images required",
        });
        return;
      }

      // Prepare all notes for single Gemini call
      const notesPayload = images.map((img, i) => ({
        index: i,
        note: img.originalNote,
        date: img.imageDate || null,
      }));

      // Single Gemini API call for all captions
      const prompt = `You are a romantic caption writer for a Valentine's Day video.
Transform these brief notes about couple memories into heartfelt, romantic captions.

RULES:
- Keep each caption under 80 characters for video overlay readability
- Make them emotional and romantic but not overly cheesy
- Preserve the essence of what the user wrote
- If a date is provided, you can reference the time/season poetically
- Use present tense for timeless feel ("Where our story began" not "Where our story began in 2020")

Input notes (JSON):
${JSON.stringify(notesPayload, null, 2)}

Return ONLY a valid JSON array with the same indices, containing "enhancedCaption" for each.
Example format: [{"index": 0, "enhancedCaption": "Where our forever began..."}]

Your response:`;

      const model = google("gemini-2.5-flash");
      const result = await generateText({
        model,
        prompt,
      });

      // Parse response and update each image
      let enhanced;
      try {
        // Extract JSON from response (handle markdown code blocks)
        let jsonText = result.text.trim();
        if (jsonText.startsWith("```json")) {
          jsonText = jsonText.slice(7);
        }
        if (jsonText.startsWith("```")) {
          jsonText = jsonText.slice(3);
        }
        if (jsonText.endsWith("```")) {
          jsonText = jsonText.slice(0, -3);
        }
        enhanced = JSON.parse(jsonText.trim());
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", result.text);
        await ctx.runMutation(internal.captions.updateProjectStatus, {
          projectId: args.projectId,
          status: "failed",
          errorMessage: "Failed to parse AI response",
        });
        return;
      }

      // Update each image with its enhanced caption
      for (const item of enhanced) {
        const image = images[item.index];
        if (image && item.enhancedCaption) {
          await ctx.runMutation(internal.captions.updateImageCaption, {
            imageId: image._id,
            enhancedCaption: item.enhancedCaption,
          });
        }
      }

      // Update project status to ready
      await ctx.runMutation(internal.captions.updateProjectStatus, {
        projectId: args.projectId,
        status: "ready_to_render",
      });
    } catch (error) {
      console.error("Caption enhancement failed:", error);
      await ctx.runMutation(internal.captions.updateProjectStatus, {
        projectId: args.projectId,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
});

// Get enhanced captions for preview
export const getProjectCaptions = query({
  args: { projectId: v.id("videoProjects") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("projectImages")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
      .collect();

    return images.map((img) => ({
      id: img._id,
      order: img.order,
      originalNote: img.originalNote,
      enhancedCaption: img.enhancedCaption,
      imageDate: img.imageDate,
    }));
  },
});
