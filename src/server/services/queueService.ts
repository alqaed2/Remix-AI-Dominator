import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { EventEmitter } from "events";

// Task Types
export type TaskType =
  | "ANALYZE_URL"
  | "PREDICT_SCRIPT"
  | "GENERATE_DAILY_MISSION"
  | "REMIX_TOPIC"
  | "UPLOAD_SCREENSHOT"
  | "GENERATE_IMAGE"
  | "BUILD_PACK";

// Logger Prefix
const LOG_PREFIX = "[QueueService]";

// Event emitter to handle completion callbacks (essential for synchronous API wrappers and fallback queue)
class QueueEventEmitter extends EventEmitter {}
const queueEvents = new QueueEventEmitter();

// Redis connection configurations
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

let isRedisAvailable = false;
let redisConnection: Redis | null = null;
let bullQueue: Queue | null = null;
let bullWorker: Worker | null = null;

// Helper to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to run task with custom timeout
async function runWithTimeout<T>(promiseFn: () => Promise<T>, timeoutMs: number, taskName: string): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`TimeoutError: Task ${taskName} exceeded time limit of ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promiseFn(), timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

// In-Memory Queue State for fallback
interface MemoryJob {
  id: string;
  type: TaskType;
  data: any;
  status: "queued" | "processing" | "completed" | "failed";
  attempts: number;
  maxAttempts: number;
  error?: string;
  result?: any;
}

const memoryQueue: MemoryJob[] = [];
let memoryQueueProcessing = false;

// Initialize Queue Service
export async function initQueueService() {
  console.log(`${LOG_PREFIX} Initializing queue service...`);
  
  // Try establishing connection with Redis
  try {
    redisConnection = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
      maxRetriesPerRequest: null, // Critical requirement for BullMQ
      connectTimeout: 3000,
      retryStrategy(times) {
        if (times > 2) {
          console.log(`${LOG_PREFIX} Redis connection attempt ${times} completed via in-memory queue fallback.`);
          return null; // Stop retrying to trigger fallback
        }
        return Math.min(times * 100, 1000);
      }
    });

    // Handle ioredis connection/error event to avoid Unhandled error event crashes
    redisConnection.on("error", (err: any) => {
      // Log connection status as simple info since we have a robust in-memory fallback
      console.log(`${LOG_PREFIX} Redis connection status: ${err.message || err}`);
    });

    // Test connection
    await new Promise<void>((resolve, reject) => {
      redisConnection!.ping((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    isRedisAvailable = true;
    console.log(`${LOG_PREFIX} Connected to Redis successfully. Launching BullMQ.`);

    // Initialize BullMQ Queue
    bullQueue = new Queue("ai-dominator-queue", {
      connection: redisConnection as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000, // Wait 2s, then 4s, then 8s
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    });

    // Initialize BullMQ Worker
    bullWorker = new Worker(
      "ai-dominator-queue",
      async (job: Job) => {
        const { type, data } = job.data;
        return await executeTaskProcessor(type, data);
      },
      {
        connection: redisConnection as any,
        concurrency: 5, // Handle up to 5 jobs concurrently
      }
    );

    // Setup Worker event listeners
    bullWorker.on("completed", (job: Job, result: any) => {
      console.log(`${LOG_PREFIX} Job ${job.id} of type ${job.data.type} completed successfully.`);
      queueEvents.emit(`job-completed-${job.id}`, result);
    });

    bullWorker.on("failed", (job: Job | undefined, err: Error) => {
      console.error(`${LOG_PREFIX} Job ${job?.id} of type ${job?.data?.type} failed: ${err.message}`);
      if (job) {
        queueEvents.emit(`job-failed-${job.id}`, err);
      }
    });

  } catch (error: any) {
    isRedisAvailable = false;
    console.log(`${LOG_PREFIX} Redis is offline. Running in robust In-Memory fallback mode.`);
  }
}

// Actual task execution mapping (handles external APIs and image generations)
async function executeTaskProcessor(type: TaskType, data: any): Promise<any> {
  const timeoutLimit = 35000; // Enforce a 35 second timeout for external API resilience

  return await runWithTimeout(async () => {
    switch (type) {
      case "ANALYZE_URL": {
        const { analyzeVideoUrl } = await import("./../gemini");
        return await analyzeVideoUrl(data.url);
      }
      
      case "PREDICT_SCRIPT": {
        const { predictVideoSuccess } = await import("./../gemini");
        return await predictVideoSuccess(data.script, data.dna, data.nicheGenome);
      }

      case "GENERATE_DAILY_MISSION": {
        const { generateDailyMission } = await import("./../gemini");
        return await generateDailyMission(data.dna, data.niche);
      }

      case "REMIX_TOPIC": {
        const { remixTopicWithDNA } = await import("./../gemini");
        return await remixTopicWithDNA(
          data.videoTitle,
          data.videoDescription,
          data.niche,
          data.creatorDNA,
          data.profile
        );
      }

      case "UPLOAD_SCREENSHOT": {
        const { analyzeScreenshot } = await import("./../gemini");
        return await analyzeScreenshot(data.base64Image, data.mimeType);
      }

      case "GENERATE_IMAGE": {
        const { fetchImageAsBase64 } = await import("./../dominatorV3Engine");
        return await fetchImageAsBase64(data.prompt, data.niche, data.aspect_ratio);
      }

      case "BUILD_PACK": {
        const { generateWarhead, getJob, savePack } = await import("./../dominatorV3Engine");
        
        const job = getJob(data.jobId);
        if (job) {
          job.status = "processing";
          job.progress = 10;
          job.logs.push("⚙️ Starting cinematic genome construction core...");
        }

        // Update job status to processing in dominator engine
        const updateProgress = (progress: number, logLine: string) => {
          const currentJob = getJob(data.jobId);
          if (currentJob) {
            currentJob.progress = progress;
            currentJob.logs.push(logLine);
            console.log(`[Job ${data.jobId}][${progress}%] ${logLine}`);
          }
        };

        try {
          const resultData = await generateWarhead(
            data.niche,
            data.mode,
            data.style,
            updateProgress,
            false,
            data.promptOnly
          );

          savePack(data.packId, data.mode, resultData);
          if (job) {
            job.status = "done";
            job.progress = 100;
            job.pack_id = data.packId;
            job.logs.push("✅ Cinematic Genome synthesis complete! Pack saved successfully.");
          }

          return resultData;
        } catch (err: any) {
          if (job) {
            job.status = "failed";
            job.progress = 100;
            job.logs.push(`❌ Synthesis Failed: ${err?.message || String(err)}`);
            job.error = err?.message || String(err);
          }
          throw err;
        }
      }

      default:
        throw new Error(`Unsupported task type: ${type}`);
    }
  }, timeoutLimit, type);
}

// In-Memory Queue Loop (Processes fallback tasks sequentially)
async function processMemoryQueue() {
  if (memoryQueueProcessing || memoryQueue.length === 0) return;
  memoryQueueProcessing = true;

  while (memoryQueue.length > 0) {
    const job = memoryQueue[0];
    job.status = "processing";
    console.log(`${LOG_PREFIX} [In-Memory] Processing job ${job.id} (${job.type})`);

    let success = false;
    let attemptsLeft = job.maxAttempts;

    while (attemptsLeft > 0 && !success) {
      try {
        const result = await executeTaskProcessor(job.type, job.data);
        job.status = "completed";
        job.result = result;
        success = true;
        queueEvents.emit(`job-completed-${job.id}`, result);
        console.log(`${LOG_PREFIX} [In-Memory] Job ${job.id} completed successfully.`);
      } catch (err: any) {
        attemptsLeft--;
        console.warn(`${LOG_PREFIX} [In-Memory] Job ${job.id} failed (attempts left: ${attemptsLeft}): ${err.message}`);
        
        if (attemptsLeft > 0) {
          // Exponential backoff simulation
          const waitTime = Math.pow(2, job.maxAttempts - attemptsLeft) * 1000;
          await delay(waitTime);
        } else {
          job.status = "failed";
          job.error = err.message || String(err);
          queueEvents.emit(`job-failed-${job.id}`, err);
          console.error(`${LOG_PREFIX} [In-Memory] Job ${job.id} failed permanently.`);
        }
      }
    }

    // Remove from queue head
    memoryQueue.shift();
  }

  memoryQueueProcessing = false;
}

// Public API: Execute task via Queue and WAIT for result (Used for converting synchronous routes)
export async function executeTask(type: TaskType, data: any, options: { attempts?: number; timeout?: number } = {}): Promise<any> {
  const attempts = options.attempts || 3;
  const timeout = options.timeout || 35000;
  const jobId = `job_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  return new Promise<any>(async (resolve, reject) => {
    // Listen for completions
    const successHandler = (result: any) => {
      cleanup();
      resolve(result);
    };

    const errorHandler = (err: Error) => {
      cleanup();
      reject(err);
    };

    const cleanup = () => {
      queueEvents.off(`job-completed-${jobId}`, successHandler);
      queueEvents.off(`job-failed-${jobId}`, errorHandler);
    };

    queueEvents.on(`job-completed-${jobId}`, successHandler);
    queueEvents.on(`job-failed-${jobId}`, errorHandler);

    if (isRedisAvailable && bullQueue) {
      try {
        console.log(`${LOG_PREFIX} Enqueuing ${type} to BullMQ: job ID ${jobId}`);
        await bullQueue.add(
          jobId,
          { type, data },
          {
            jobId,
            attempts,
            backoff: {
              type: "exponential",
              delay: 2000,
            }
          }
        );
      } catch (err) {
        console.log(`${LOG_PREFIX} Info: Routing job to local memory queue.`);
        enqueueToMemoryQueue(jobId, type, data, attempts);
      }
    } else {
      enqueueToMemoryQueue(jobId, type, data, attempts);
    }
  });
}

// Public API: Just enqueue task and return immediately (Used for background generation)
export async function enqueueTask(type: TaskType, data: any, options: { attempts?: number; jobId?: string } = {}): Promise<string> {
  const jobId = options.jobId || `job_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const attempts = options.attempts || 3;

  if (isRedisAvailable && bullQueue) {
    try {
      console.log(`${LOG_PREFIX} Background enqueuing ${type} to BullMQ: job ID ${jobId}`);
      await bullQueue.add(
        jobId,
        { type, data },
        {
          jobId,
          attempts,
          backoff: {
            type: "exponential",
            delay: 2000,
          }
        }
      );
    } catch (err) {
      console.log(`${LOG_PREFIX} Info: Routing background job to local memory queue.`);
      enqueueToMemoryQueue(jobId, type, data, attempts);
    }
  } else {
    enqueueToMemoryQueue(jobId, type, data, attempts);
  }

  return jobId;
}

// Push to the in-memory fallback queue and kick off processor loop
function enqueueToMemoryQueue(id: string, type: TaskType, data: any, attempts: number) {
  memoryQueue.push({
    id,
    type,
    data,
    status: "queued",
    attempts: 0,
    maxAttempts: attempts,
  });
  // Non-blocking trigger of queue execution
  processMemoryQueue().catch(err => console.error(`${LOG_PREFIX} Error in memory queue process:`, err));
}
