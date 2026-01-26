import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Video projects - main entity linking user to their video
  videoProjects: defineTable({
    userId: v.string(), // Clerk user ID
    title: v.optional(v.string()),
    coupleName: v.optional(v.string()), // For outro slide
    status: v.union(
      v.literal("draft"), // Still uploading/editing images
      v.literal("processing"), // Enhancing captions with Gemini
      v.literal("ready_to_render"), // Captions enhanced, ready for render
      v.literal("queued"), // In render queue
      v.literal("rendering"), // Currently rendering
      v.literal("completed"), // Video ready
      v.literal("failed") // Something went wrong
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Images for each project
  projectImages: defineTable({
    projectId: v.id("videoProjects"),
    storageId: v.id("_storage"), // Convex file storage ID
    order: v.number(), // Display order (0-9)
    originalNote: v.string(), // User's brief note
    enhancedCaption: v.optional(v.string()), // Gemini-enhanced romantic caption
    imageDate: v.optional(v.string()), // Date of the memory
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_order", ["projectId", "order"]),

  // Render jobs for tracking progress
  renderJobs: defineTable({
    projectId: v.id("videoProjects"),
    status: v.union(
      v.literal("queued"),
      v.literal("rendering"),
      v.literal("completed"),
      v.literal("failed")
    ),
    progress: v.optional(v.number()), // 0-100 percentage
    errorMessage: v.optional(v.string()),
    outputStorageId: v.optional(v.id("_storage")), // Final video file
    renderDurationMs: v.optional(v.number()),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),
});
