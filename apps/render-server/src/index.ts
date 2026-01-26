import "dotenv/config";
import express from "express";
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { renderVideo } from "./renderer";

// Environment variables
const PORT = process.env.PORT || 3002;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const CONVEX_URL = process.env.CONVEX_URL!;

if (!CONVEX_URL) {
  console.error("CONVEX_URL environment variable is required");
  process.exit(1);
}

// Initialize Redis connection
const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Initialize Convex client
const convex = new ConvexHttpClient(CONVEX_URL);

// Create the render queue
const renderQueue = new Queue("video-renders", { connection });

// Express app for health checks and manual triggers
const app = express();
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Manual job trigger endpoint (for testing)
app.post("/render/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    await renderQueue.add("render", { jobId }, { jobId });
    res.json({ message: "Job queued", jobId });
  } catch (error) {
    res.status(500).json({ error: "Failed to queue job" });
  }
});

// Queue stats endpoint
app.get("/stats", async (req, res) => {
  const waiting = await renderQueue.getWaitingCount();
  const active = await renderQueue.getActiveCount();
  const completed = await renderQueue.getCompletedCount();
  const failed = await renderQueue.getFailedCount();

  res.json({ waiting, active, completed, failed });
});

// Create the worker
const worker = new Worker(
  "video-renders",
  async (job) => {
    const startTime = Date.now();
    console.log(`[Worker] Processing job ${job.id}`);

    try {
      // Get job data from Convex
      const queuedJobs = await convex.query(api.rendering.getQueuedJobs, { limit: 1 });
      const renderJob = queuedJobs.find((j) => j.jobId === job.data.jobId) || queuedJobs[0];

      if (!renderJob) {
        console.log(`[Worker] No job found for ${job.data.jobId}`);
        return;
      }

      console.log(`[Worker] Found job ${renderJob.jobId} with ${renderJob.images.length} images`);

      // Update status to rendering
      await convex.mutation(api.rendering.updateRenderProgress, {
        jobId: renderJob.jobId,
        status: "rendering",
        progress: 0,
      });

      // Render the video
      const { outputPath, duration } = await renderVideo({
        images: renderJob.images,
        coupleName: renderJob.coupleName,
        onProgress: async (progress) => {
          // Update progress every 5%
          if (progress % 5 === 0 || progress === 100) {
            await convex.mutation(api.rendering.updateRenderProgress, {
              jobId: renderJob.jobId,
              status: "rendering",
              progress,
            });
          }
        },
      });

      console.log(`[Worker] Rendered video to ${outputPath}`);

      // Upload to Convex storage
      const uploadUrl = await convex.mutation(api.rendering.generateVideoUploadUrl, {});

      const videoBuffer = await Bun.file(outputPath).arrayBuffer();
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "video/mp4" },
        body: videoBuffer,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload video to Convex");
      }

      const { storageId } = await uploadResponse.json();
      console.log(`[Worker] Uploaded video, storageId: ${storageId}`);

      // Update job as completed
      const renderDurationMs = Date.now() - startTime;
      await convex.mutation(api.rendering.updateRenderProgress, {
        jobId: renderJob.jobId,
        status: "completed",
        progress: 100,
        outputStorageId: storageId,
        renderDurationMs,
      });

      // Clean up temp file
      await Bun.write(outputPath, ""); // Clear file
      console.log(`[Worker] Job ${renderJob.jobId} completed in ${renderDurationMs}ms`);

      return { storageId, renderDurationMs };
    } catch (error) {
      console.error(`[Worker] Job ${job.id} failed:`, error);

      // Update job as failed
      if (job.data.jobId) {
        await convex.mutation(api.rendering.updateRenderProgress, {
          jobId: job.data.jobId,
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
      }

      throw error;
    }
  },
  {
    connection,
    concurrency: 2, // Process 2 videos at a time
    limiter: {
      max: 20,
      duration: 60000, // Max 20 jobs per minute
    },
  }
);

// Worker event handlers
worker.on("completed", (job, result) => {
  console.log(`[Worker] Job ${job.id} completed:`, result);
});

worker.on("failed", (job, error) => {
  console.error(`[Worker] Job ${job?.id} failed:`, error.message);
});

worker.on("error", (error) => {
  console.error("[Worker] Error:", error);
});

// Poll for new jobs from Convex
async function pollForJobs() {
  try {
    const queuedJobs = await convex.query(api.rendering.getQueuedJobs, { limit: 5 });

    for (const job of queuedJobs) {
      // Check if job is already in queue
      const existingJob = await renderQueue.getJob(job.jobId);
      if (!existingJob) {
        console.log(`[Poller] Adding job ${job.jobId} to queue`);
        await renderQueue.add("render", { jobId: job.jobId }, { jobId: job.jobId });
      }
    }
  } catch (error) {
    console.error("[Poller] Error polling for jobs:", error);
  }
}

// Start polling every 5 seconds
setInterval(pollForJobs, 5000);

// Start the server
app.listen(PORT, () => {
  console.log(`[Server] Render server running on port ${PORT}`);
  console.log(`[Server] Connected to Redis at ${REDIS_URL}`);
  console.log(`[Server] Connected to Convex at ${CONVEX_URL}`);
  console.log(`[Worker] Started with concurrency: 2`);

  // Initial poll
  pollForJobs();
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Server] Shutting down...");
  await worker.close();
  await renderQueue.close();
  await connection.quit();
  process.exit(0);
});
