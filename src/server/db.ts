import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  followerCount: number;
  niche: 'Tech' | 'Business' | 'Fitness' | 'Lifestyle' | 'Cooking';
  country: string;
  language: string;
  createdAt: string;
}

export interface Video {
  id: string;
  creatorId: string;
  title: string;
  hookStyle: 'Shocking Statement' | 'Visual Pattern' | 'Direct Question' | 'Action Hook' | 'Silent Text Overlay';
  deliveryTone: 'Energetic' | 'Educational/Calm' | 'Dramatic' | 'Storytelling' | 'Fast-paced';
  duration: number; // in seconds
  faceFirstSecond: boolean;
  publishHour: number; // 0-23
  publishDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  createdAt: string;
}

export interface VideoMetrics {
  id: string;
  videoId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  watchTimeSeconds: number;
  completionRatePercentage: number;
  status: 'QUEUED' | 'PROCESSED' | 'FAILED';
  error?: string;
  createdAt: string;
}

export interface CreatorDNATrait {
  id: string;
  creatorId: string;
  traitType: 'Content' | 'Hook' | 'Delivery' | 'Visual' | 'Timing';
  traitName: string;
  traitValue: string;
  confidenceScore: number; // 0 - 100
  sampleSize: number;
  impactOnViews: number; // Percentage impact e.g. +45 or -20
  impactOnCompletion: number; // Percentage impact e.g. +12 or -5
  updatedAt: string;
}

export interface NicheGenome {
  niche: string;
  avgViews: number;
  avgCompletionRate: number;
  topHookStyle: string;
  topDeliveryTone: string;
  bestPublishHour: number;
  bestPublishDay: string;
}

// Initialize Prisma Client
let prisma: PrismaClient | null = null;
const isPrismaEnabled = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "";

if (isPrismaEnabled) {
  try {
    prisma = new PrismaClient();
    console.log("[Prisma Client] Initialized successfully using PostgreSQL datasource.");
  } catch (error) {
    console.error("[Prisma Client] Failed to initialize Prisma Client:", error);
    prisma = null;
  }
} else {
  console.log("[Prisma Client] DATABASE_URL is not set. Running in file-based fallback mode.");
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  creatorProfiles: CreatorProfile[];
  videos: Video[];
  videoMetrics: VideoMetrics[];
  creatorDNA: CreatorDNATrait[];
  nicheGenomes: NicheGenome[];
}

const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      id: 'user_1',
      email: 'creator@dominator.ai',
      passwordHash: 'hashed_password',
      createdAt: new Date().toISOString()
    }
  ],
  creatorProfiles: [
    {
      id: 'profile_1',
      userId: 'user_1',
      followerCount: 24500,
      niche: 'Tech',
      country: 'Saudi Arabia',
      language: 'Arabic',
      createdAt: new Date().toISOString()
    }
  ],
  videos: [
    {
      id: 'vid_1',
      creatorId: 'profile_1',
      title: 'كيف تبرمج تطبيق أندرويد في ١٠ دقائق',
      hookStyle: 'Direct Question',
      deliveryTone: 'Educational/Calm',
      duration: 55,
      faceFirstSecond: true,
      publishHour: 20,
      publishDay: 'Monday',
      createdAt: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'vid_2',
      creatorId: 'profile_1',
      title: 'سر لغات البرمجة الخفي الذي لا يريدونك معرفته',
      hookStyle: 'Shocking Statement',
      deliveryTone: 'Dramatic',
      duration: 32,
      faceFirstSecond: true,
      publishHour: 19,
      publishDay: 'Tuesday',
      createdAt: new Date(Date.now() - 32 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'vid_3',
      creatorId: 'profile_1',
      title: 'توقف عن كتابة الكود البرمجي العشوائي!',
      hookStyle: 'Action Hook',
      deliveryTone: 'Energetic',
      duration: 45,
      faceFirstSecond: false,
      publishHour: 21,
      publishDay: 'Thursday',
      createdAt: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'vid_4',
      creatorId: 'profile_1',
      title: 'لماذا يفشل ٩٠٪ من المطورين الجدد؟',
      hookStyle: 'Direct Question',
      deliveryTone: 'Storytelling',
      duration: 62,
      faceFirstSecond: true,
      publishHour: 18,
      publishDay: 'Sunday',
      createdAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'vid_5',
      creatorId: 'profile_1',
      title: 'أقوى لابتوب للمطورين في ٢٠٢٦',
      hookStyle: 'Visual Pattern',
      deliveryTone: 'Fast-paced',
      duration: 28,
      faceFirstSecond: false,
      publishHour: 15,
      publishDay: 'Wednesday',
      createdAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'vid_6',
      creatorId: 'profile_1',
      title: 'مستقبل الذكاء الاصطناعي التوليدي',
      hookStyle: 'Shocking Statement',
      deliveryTone: 'Dramatic',
      duration: 40,
      faceFirstSecond: true,
      publishHour: 20,
      publishDay: 'Monday',
      createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'vid_7',
      creatorId: 'profile_1',
      title: 'تعلم كيف تبني SaaS كامل لوحدك',
      hookStyle: 'Action Hook',
      deliveryTone: 'Educational/Calm',
      duration: 58,
      faceFirstSecond: true,
      publishHour: 20,
      publishDay: 'Friday',
      createdAt: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'vid_8',
      creatorId: 'profile_1',
      title: 'أسرار النجاح في العمل الحر',
      hookStyle: 'Silent Text Overlay',
      deliveryTone: 'Storytelling',
      duration: 75,
      faceFirstSecond: false,
      publishHour: 11,
      publishDay: 'Saturday',
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'vid_9',
      creatorId: 'profile_1',
      title: 'خطوات احتراف الـ Mobile Apps',
      hookStyle: 'Direct Question',
      deliveryTone: 'Educational/Calm',
      duration: 48,
      faceFirstSecond: true,
      publishHour: 22,
      publishDay: 'Thursday',
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'vid_10',
      creatorId: 'profile_1',
      title: 'هذا الكود سينقذ مشروعك القادم',
      hookStyle: 'Visual Pattern',
      deliveryTone: 'Energetic',
      duration: 35,
      faceFirstSecond: true,
      publishHour: 20,
      publishDay: 'Monday',
      createdAt: new Date().toISOString()
    }
  ],
  videoMetrics: [
    {
      id: 'met_1',
      videoId: 'vid_1',
      views: 12500,
      likes: 1200,
      comments: 98,
      shares: 340,
      saves: 520,
      watchTimeSeconds: 42.5 * 12500,
      completionRatePercentage: 42.5,
      status: 'PROCESSED',
      createdAt: new Date().toISOString()
    },
    {
      id: 'met_2',
      videoId: 'vid_2',
      views: 34000,
      likes: 4200,
      comments: 312,
      shares: 950,
      saves: 1400,
      watchTimeSeconds: 58.2 * 34000,
      completionRatePercentage: 58.2,
      status: 'PROCESSED',
      createdAt: new Date().toISOString()
    },
    {
      id: 'met_3',
      videoId: 'vid_3',
      views: 8400,
      likes: 620,
      comments: 45,
      shares: 120,
      saves: 180,
      watchTimeSeconds: 22.1 * 8400,
      completionRatePercentage: 22.1,
      status: 'PROCESSED',
      createdAt: new Date().toISOString()
    },
    {
      id: 'met_4',
      videoId: 'vid_4',
      views: 21000,
      likes: 2300,
      comments: 189,
      shares: 512,
      saves: 830,
      watchTimeSeconds: 48.0 * 21000,
      completionRatePercentage: 48.0,
      status: 'PROCESSED',
      createdAt: new Date().toISOString()
    },
    {
      id: 'met_5',
      videoId: 'vid_5',
      views: 15300,
      likes: 1800,
      comments: 140,
      shares: 410,
      saves: 620,
      watchTimeSeconds: 31.4 * 15300,
      completionRatePercentage: 31.4,
      status: 'PROCESSED',
      createdAt: new Date().toISOString()
    },
    {
      id: 'met_6',
      videoId: 'vid_6',
      views: 45000,
      likes: 5800,
      comments: 480,
      shares: 1540,
      saves: 2100,
      watchTimeSeconds: 61.5 * 45000,
      completionRatePercentage: 61.5,
      status: 'PROCESSED',
      createdAt: new Date().toISOString()
    },
    {
      id: 'met_7',
      videoId: 'vid_7',
      views: 29000,
      likes: 3100,
      comments: 290,
      shares: 780,
      saves: 1150,
      watchTimeSeconds: 52.8 * 29000,
      completionRatePercentage: 52.8,
      status: 'PROCESSED',
      createdAt: new Date().toISOString()
    },
    {
      id: 'met_8',
      videoId: 'vid_8',
      views: 9800,
      likes: 850,
      comments: 67,
      shares: 140,
      saves: 250,
      watchTimeSeconds: 28.5 * 9800,
      completionRatePercentage: 28.5,
      status: 'PROCESSED',
      createdAt: new Date().toISOString()
    },
    {
      id: 'met_9',
      videoId: 'vid_9',
      views: 18900,
      likes: 2050,
      comments: 155,
      shares: 420,
      saves: 710,
      watchTimeSeconds: 44.2 * 18900,
      completionRatePercentage: 44.2,
      status: 'PROCESSED',
      createdAt: new Date().toISOString()
    },
    {
      id: 'met_10',
      videoId: 'vid_10',
      views: 31500,
      likes: 3900,
      comments: 280,
      shares: 880,
      saves: 1350,
      watchTimeSeconds: 54.0 * 31500,
      completionRatePercentage: 54.0,
      status: 'PROCESSED',
      createdAt: new Date().toISOString()
    }
  ],
  creatorDNA: [],
  nicheGenomes: [
    {
      niche: 'Tech',
      avgViews: 22500,
      avgCompletionRate: 45.4,
      topHookStyle: 'Shocking Statement',
      topDeliveryTone: 'Dramatic',
      bestPublishHour: 20,
      bestPublishDay: 'Monday'
    },
    {
      niche: 'Business',
      avgViews: 18400,
      avgCompletionRate: 38.2,
      topHookStyle: 'Direct Question',
      topDeliveryTone: 'Storytelling',
      bestPublishHour: 18,
      bestPublishDay: 'Sunday'
    },
    {
      niche: 'Fitness',
      avgViews: 29000,
      avgCompletionRate: 49.8,
      topHookStyle: 'Visual Pattern',
      topDeliveryTone: 'Energetic',
      bestPublishHour: 17,
      bestPublishDay: 'Thursday'
    },
    {
      niche: 'Lifestyle',
      avgViews: 15200,
      avgCompletionRate: 42.1,
      topHookStyle: 'Visual Pattern',
      topDeliveryTone: 'Fast-paced',
      bestPublishHour: 19,
      bestPublishDay: 'Friday'
    },
    {
      niche: 'Cooking',
      avgViews: 35000,
      avgCompletionRate: 55.4,
      topHookStyle: 'Action Hook',
      topDeliveryTone: 'Fast-paced',
      bestPublishHour: 12,
      bestPublishDay: 'Saturday'
    }
  ]
};

// Ensure data folder and file exists for fallback database
function initDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
  }
}

function readDB(): DatabaseSchema {
  initDB();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file, returning in-memory initial state:', error);
    return INITIAL_DB;
  }
}

function writeDB(data: DatabaseSchema) {
  initDB();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

// Global, type-safe database handler that supports PostgreSQL/Prisma & falls back to JSON DB
export const db = {
  getUsers: async (): Promise<User[]> => {
    if (prisma) {
      try {
        const prismaUsers = await prisma.user.findMany();
        return prismaUsers.map(u => ({
          id: u.id,
          email: u.email,
          passwordHash: u.passwordHash,
          createdAt: u.createdAt.toISOString()
        }));
      } catch (e) {
        console.error("[Prisma DB Error] getUsers failed, falling back to JSON DB:", e);
      }
    }
    return readDB().users;
  },

  addUser: async (user: User): Promise<User> => {
    if (prisma) {
      try {
        const created = await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            createdAt: new Date(user.createdAt)
          }
        });
        return {
          id: created.id,
          email: created.email,
          passwordHash: created.passwordHash,
          createdAt: created.createdAt.toISOString()
        };
      } catch (e) {
        console.error("[Prisma DB Error] addUser failed, falling back to JSON DB:", e);
      }
    }
    const data = readDB();
    data.users.push(user);
    writeDB(data);
    return user;
  },

  getCreatorProfiles: async (): Promise<CreatorProfile[]> => {
    if (prisma) {
      try {
        const profiles = await prisma.creatorProfile.findMany();
        return profiles.map(p => ({
          id: p.id,
          userId: p.userId,
          followerCount: p.followerCount,
          niche: p.niche as any,
          country: p.country,
          language: p.language,
          createdAt: p.createdAt.toISOString()
        }));
      } catch (e) {
        console.error("[Prisma DB Error] getCreatorProfiles failed, falling back to JSON DB:", e);
      }
    }
    return readDB().creatorProfiles;
  },

  getCreatorProfileByUserId: async (userId: string): Promise<CreatorProfile | null> => {
    if (prisma) {
      try {
        const p = await prisma.creatorProfile.findUnique({
          where: { userId }
        });
        if (p) {
          return {
            id: p.id,
            userId: p.userId,
            followerCount: p.followerCount,
            niche: p.niche as any,
            country: p.country,
            language: p.language,
            createdAt: p.createdAt.toISOString()
          };
        }
        return null;
      } catch (e) {
        console.error("[Prisma DB Error] getCreatorProfileByUserId failed, falling back to JSON DB:", e);
      }
    }
    const profiles = readDB().creatorProfiles;
    return profiles.find(p => p.userId === userId) || null;
  },

  addCreatorProfile: async (profile: CreatorProfile): Promise<CreatorProfile> => {
    if (prisma) {
      try {
        // Ensure user_1 exists in DB first for multi-tenant relations
        const existingUser = await prisma.user.findUnique({ where: { id: profile.userId } });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: profile.userId,
              email: profile.userId === "user_1" ? "creator@dominator.ai" : `user_${profile.userId}@dominator.ai`,
              passwordHash: "hashed_password",
              createdAt: new Date()
            }
          });
        }

        const upserted = await prisma.creatorProfile.upsert({
          where: { userId: profile.userId },
          update: {
            followerCount: profile.followerCount,
            niche: profile.niche,
            country: profile.country,
            language: profile.language,
            createdAt: new Date(profile.createdAt)
          },
          create: {
            id: profile.id,
            userId: profile.userId,
            followerCount: profile.followerCount,
            niche: profile.niche,
            country: profile.country,
            language: profile.language,
            createdAt: new Date(profile.createdAt)
          }
        });
        return {
          id: upserted.id,
          userId: upserted.userId,
          followerCount: upserted.followerCount,
          niche: upserted.niche as any,
          country: upserted.country,
          language: upserted.language,
          createdAt: upserted.createdAt.toISOString()
        };
      } catch (e) {
        console.error("[Prisma DB Error] addCreatorProfile failed, falling back to JSON DB:", e);
      }
    }
    const data = readDB();
    data.creatorProfiles = data.creatorProfiles.filter(p => p.userId !== profile.userId);
    data.creatorProfiles.push(profile);
    writeDB(data);
    return profile;
  },

  getVideos: async (creatorId: string): Promise<Video[]> => {
    if (prisma) {
      try {
        const vids = await prisma.video.findMany({
          where: { creatorId }
        });
        return vids.map(v => ({
          id: v.id,
          creatorId: v.creatorId,
          title: v.title,
          hookStyle: v.hookStyle as any,
          deliveryTone: v.deliveryTone as any,
          duration: v.duration,
          faceFirstSecond: v.faceFirstSecond,
          publishHour: v.publishHour,
          publishDay: v.publishDay as any,
          createdAt: v.createdAt.toISOString()
        }));
      } catch (e) {
        console.error("[Prisma DB Error] getVideos failed, falling back to JSON DB:", e);
      }
    }
    const data = readDB();
    return data.videos.filter(v => v.creatorId === creatorId);
  },

  addVideo: async (video: Video): Promise<Video> => {
    if (prisma) {
      try {
        const created = await prisma.video.create({
          data: {
            id: video.id,
            creatorId: video.creatorId,
            title: video.title,
            hookStyle: video.hookStyle,
            deliveryTone: video.deliveryTone,
            duration: video.duration,
            faceFirstSecond: video.faceFirstSecond,
            publishHour: video.publishHour,
            publishDay: video.publishDay,
            createdAt: new Date(video.createdAt)
          }
        });
        return {
          id: created.id,
          creatorId: created.creatorId,
          title: created.title,
          hookStyle: created.hookStyle as any,
          deliveryTone: created.deliveryTone as any,
          duration: created.duration,
          faceFirstSecond: created.faceFirstSecond,
          publishHour: created.publishHour,
          publishDay: created.publishDay as any,
          createdAt: created.createdAt.toISOString()
        };
      } catch (e) {
        console.error("[Prisma DB Error] addVideo failed, falling back to JSON DB:", e);
      }
    }
    const data = readDB();
    data.videos.push(video);
    writeDB(data);
    return video;
  },

  getMetrics: async (videoId: string): Promise<VideoMetrics | null> => {
    if (prisma) {
      try {
        const m = await prisma.videoMetrics.findUnique({
          where: { videoId }
        });
        if (m) {
          return {
            id: m.id,
            videoId: m.videoId,
            views: m.views,
            likes: m.likes,
            comments: m.comments,
            shares: m.shares,
            saves: m.saves,
            watchTimeSeconds: m.watchTimeSeconds,
            completionRatePercentage: m.completionRatePercentage,
            status: m.status as any,
            error: m.error || undefined,
            createdAt: m.createdAt.toISOString()
          };
        }
        return null;
      } catch (e) {
        console.error("[Prisma DB Error] getMetrics failed, falling back to JSON DB:", e);
      }
    }
    const data = readDB();
    return data.videoMetrics.find(m => m.videoId === videoId) || null;
  },

  getAllMetrics: async (): Promise<VideoMetrics[]> => {
    if (prisma) {
      try {
        const ms = await prisma.videoMetrics.findMany();
        return ms.map(m => ({
          id: m.id,
          videoId: m.videoId,
          views: m.views,
          likes: m.likes,
          comments: m.comments,
          shares: m.shares,
          saves: m.saves,
          watchTimeSeconds: m.watchTimeSeconds,
          completionRatePercentage: m.completionRatePercentage,
          status: m.status as any,
          error: m.error || undefined,
          createdAt: m.createdAt.toISOString()
        }));
      } catch (e) {
        console.error("[Prisma DB Error] getAllMetrics failed, falling back to JSON DB:", e);
      }
    }
    return readDB().videoMetrics;
  },

  addMetrics: async (metrics: VideoMetrics): Promise<VideoMetrics> => {
    if (prisma) {
      try {
        const upserted = await prisma.videoMetrics.upsert({
          where: { videoId: metrics.videoId },
          update: {
            views: metrics.views,
            likes: metrics.likes,
            comments: metrics.comments,
            shares: metrics.shares,
            saves: metrics.saves,
            watchTimeSeconds: metrics.watchTimeSeconds,
            completionRatePercentage: metrics.completionRatePercentage,
            status: metrics.status,
            error: metrics.error || null,
            createdAt: new Date(metrics.createdAt)
          },
          create: {
            id: metrics.id,
            videoId: metrics.videoId,
            views: metrics.views,
            likes: metrics.likes,
            comments: metrics.comments,
            shares: metrics.shares,
            saves: metrics.saves,
            watchTimeSeconds: metrics.watchTimeSeconds,
            completionRatePercentage: metrics.completionRatePercentage,
            status: metrics.status,
            error: metrics.error || null,
            createdAt: new Date(metrics.createdAt)
          }
        });
        return {
          id: upserted.id,
          videoId: upserted.videoId,
          views: upserted.views,
          likes: upserted.likes,
          comments: upserted.comments,
          shares: upserted.shares,
          saves: upserted.saves,
          watchTimeSeconds: upserted.watchTimeSeconds,
          completionRatePercentage: upserted.completionRatePercentage,
          status: upserted.status as any,
          error: upserted.error || undefined,
          createdAt: upserted.createdAt.toISOString()
        };
      } catch (e) {
        console.error("[Prisma DB Error] addMetrics failed, falling back to JSON DB:", e);
      }
    }
    const data = readDB();
    data.videoMetrics = data.videoMetrics.filter(m => m.videoId !== metrics.videoId);
    data.videoMetrics.push(metrics);
    writeDB(data);
    return metrics;
  },

  getCreatorDNA: async (creatorId: string): Promise<CreatorDNATrait[]> => {
    if (prisma) {
      try {
        const dna = await prisma.creatorDNATrait.findMany({
          where: { creatorId }
        });
        if (dna.length > 0) {
          return dna.map(d => ({
            id: d.id,
            creatorId: d.creatorId,
            traitType: d.traitType as any,
            traitName: d.traitName,
            traitValue: d.traitValue,
            confidenceScore: d.confidenceScore,
            sampleSize: d.sampleSize,
            impactOnViews: d.impactOnViews,
            impactOnCompletion: d.impactOnCompletion,
            updatedAt: d.updatedAt.toISOString()
          }));
        }
        
        // Dynamic fallback and compilation
        const allVids = await prisma.video.findMany({ where: { creatorId } });
        const videoIds = allVids.map(v => v.id);
        const allMets = await prisma.videoMetrics.findMany({
          where: { videoId: { in: videoIds }, status: "PROCESSED" }
        });

        const mappedSchema: DatabaseSchema = {
          users: [],
          creatorProfiles: [],
          videos: allVids.map(v => ({
            id: v.id,
            creatorId: v.creatorId,
            title: v.title,
            hookStyle: v.hookStyle as any,
            deliveryTone: v.deliveryTone as any,
            duration: v.duration,
            faceFirstSecond: v.faceFirstSecond,
            publishHour: v.publishHour,
            publishDay: v.publishDay as any,
            createdAt: v.createdAt.toISOString()
          })),
          videoMetrics: allMets.map(m => ({
            id: m.id,
            videoId: m.videoId,
            views: m.views,
            likes: m.likes,
            comments: m.comments,
            shares: m.shares,
            saves: m.saves,
            watchTimeSeconds: m.watchTimeSeconds,
            completionRatePercentage: m.completionRatePercentage,
            status: m.status as any,
            error: m.error || undefined,
            createdAt: m.createdAt.toISOString()
          })),
          creatorDNA: [],
          nicheGenomes: []
        };

        const calculated = calculateDNAForCreator(creatorId, mappedSchema);
        return calculated;
      } catch (e) {
        console.error("[Prisma DB Error] getCreatorDNA failed, falling back to JSON DB:", e);
      }
    }

    const data = readDB();
    const dna = data.creatorDNA.filter(d => d.creatorId === creatorId);
    if (dna.length === 0) {
      const d = calculateDNAForCreator(creatorId, data);
      return d;
    }
    return dna;
  },

  saveCreatorDNA: async (creatorId: string, dna: CreatorDNATrait[]): Promise<void> => {
    if (prisma) {
      try {
        await prisma.creatorDNATrait.deleteMany({
          where: { creatorId }
        });
        if (dna.length > 0) {
          await prisma.creatorDNATrait.createMany({
            data: dna.map(d => ({
              id: d.id,
              creatorId: d.creatorId,
              traitType: d.traitType,
              traitName: d.traitName,
              traitValue: d.traitValue,
              confidenceScore: d.confidenceScore,
              sampleSize: d.sampleSize,
              impactOnViews: d.impactOnViews,
              impactOnCompletion: d.impactOnCompletion,
              updatedAt: new Date(d.updatedAt)
            }))
          });
        }
        return;
      } catch (e) {
        console.error("[Prisma DB Error] saveCreatorDNA failed, falling back to JSON DB:", e);
      }
    }
    const data = readDB();
    data.creatorDNA = data.creatorDNA.filter(d => d.creatorId !== creatorId);
    data.creatorDNA.push(...dna);
    writeDB(data);
  },

  getNicheGenome: async (niche: string): Promise<NicheGenome> => {
    if (prisma) {
      try {
        const genome = await prisma.nicheGenome.findFirst({
          where: { niche: { equals: niche, mode: "insensitive" } }
        });
        if (genome) {
          return {
            niche: genome.niche,
            avgViews: genome.avgViews,
            avgCompletionRate: genome.avgCompletionRate,
            topHookStyle: genome.topHookStyle,
            topDeliveryTone: genome.topDeliveryTone,
            bestPublishHour: genome.bestPublishHour,
            bestPublishDay: genome.bestPublishDay
          };
        }
      } catch (e) {
        console.error("[Prisma DB Error] getNicheGenome failed, falling back to JSON DB:", e);
      }
    }
    const data = readDB();
    return data.nicheGenomes.find(n => n.niche.toLowerCase() === niche.toLowerCase()) || data.nicheGenomes[0];
  },

  getAllNicheGenomes: async (): Promise<NicheGenome[]> => {
    if (prisma) {
      try {
        const genomes = await prisma.nicheGenome.findMany();
        if (genomes.length > 0) {
          return genomes.map(g => ({
            niche: g.niche,
            avgViews: g.avgViews,
            avgCompletionRate: g.avgCompletionRate,
            topHookStyle: g.topHookStyle,
            topDeliveryTone: g.topDeliveryTone,
            bestPublishHour: g.bestPublishHour,
            bestPublishDay: g.bestPublishDay
          }));
        }
      } catch (e) {
        console.error("[Prisma DB Error] getAllNicheGenomes failed, falling back to JSON DB:", e);
      }
    }
    return readDB().nicheGenomes;
  },

  resetDB: async (): Promise<void> => {
    if (prisma) {
      try {
        // Clear all tables for a full clean state
        await prisma.creatorDNATrait.deleteMany({});
        await prisma.videoMetrics.deleteMany({});
        await prisma.video.deleteMany({});
        await prisma.creatorProfile.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.nicheGenome.deleteMany({});

        // Reseed initial structure
        await prisma.user.create({
          data: {
            id: 'user_1',
            email: 'creator@dominator.ai',
            passwordHash: 'hashed_password',
            createdAt: new Date()
          }
        });

        await prisma.creatorProfile.create({
          data: {
            id: 'profile_1',
            userId: 'user_1',
            followerCount: 24500,
            niche: 'Tech',
            country: 'Saudi Arabia',
            language: 'Arabic',
            createdAt: new Date()
          }
        });

        await prisma.video.createMany({
          data: INITIAL_DB.videos.map(v => ({
            id: v.id,
            creatorId: v.creatorId,
            title: v.title,
            hookStyle: v.hookStyle,
            deliveryTone: v.deliveryTone,
            duration: v.duration,
            faceFirstSecond: v.faceFirstSecond,
            publishHour: v.publishHour,
            publishDay: v.publishDay,
            createdAt: new Date(v.createdAt)
          }))
        });

        await prisma.videoMetrics.createMany({
          data: INITIAL_DB.videoMetrics.map(m => ({
            id: m.id,
            videoId: m.videoId,
            views: m.views,
            likes: m.likes,
            comments: m.comments,
            shares: m.shares,
            saves: m.saves,
            watchTimeSeconds: m.watchTimeSeconds,
            completionRatePercentage: m.completionRatePercentage,
            status: m.status,
            createdAt: new Date(m.createdAt)
          }))
        });

        await prisma.nicheGenome.createMany({
          data: INITIAL_DB.nicheGenomes.map(g => ({
            niche: g.niche,
            avgViews: g.avgViews,
            avgCompletionRate: g.avgCompletionRate,
            topHookStyle: g.topHookStyle,
            topDeliveryTone: g.topDeliveryTone,
            bestPublishHour: g.bestPublishHour,
            bestPublishDay: g.bestPublishDay
          }))
        });

        console.log("[Prisma Client] Database successfully reset and seeded.");
        return;
      } catch (e) {
        console.error("[Prisma DB Error] resetDB failed, falling back to JSON DB:", e);
      }
    }
    writeDB(INITIAL_DB);
  }
};

// Helper to calculate the Creator DNA mathematically based on actual video metrics
export function calculateDNAForCreator(creatorId: string, data: DatabaseSchema): CreatorDNATrait[] {
  const creatorVideos = data.videos.filter(v => v.creatorId === creatorId);
  const videoIds = creatorVideos.map(v => v.id);
  const metrics = data.videoMetrics.filter(m => videoIds.includes(m.videoId) && m.status === 'PROCESSED');

  if (metrics.length === 0) {
    return [];
  }

  // Calculate baseline (mean views and mean completion rate)
  const totalViews = metrics.reduce((sum, m) => sum + m.views, 0);
  const avgViews = totalViews / metrics.length;

  const totalComp = metrics.reduce((sum, m) => sum + m.completionRatePercentage, 0);
  const avgComp = totalComp / metrics.length;

  const sampleSize = metrics.length;
  const confidenceScore = Math.min(100, sampleSize * 10);

  // Group by traits to find drivers
  const hookStyles: Record<string, { views: number[]; comps: number[] }> = {};
  const deliveryTones: Record<string, { views: number[]; comps: number[] }> = {};
  const visuals: Record<string, { views: number[]; comps: number[] }> = {
    'With Face': { views: [], comps: [] },
    'Without Face': { views: [], comps: [] }
  };
  const timings: Record<string, { views: number[]; comps: number[] }> = {
    'Prime Time (18:00 - 22:00)': { views: [], comps: [] },
    'Off-peak Hours': { views: [], comps: [] }
  };
  const contentDurations: Record<string, { views: number[]; comps: number[] }> = {
    'Short (< 35s)': { views: [], comps: [] },
    'Medium (35s - 60s)': { views: [], comps: [] },
    'Long (> 60s)': { views: [], comps: [] }
  };

  creatorVideos.forEach(v => {
    const met = metrics.find(m => m.videoId === v.id);
    if (!met) return;

    // Hook Style
    if (!hookStyles[v.hookStyle]) hookStyles[v.hookStyle] = { views: [], comps: [] };
    hookStyles[v.hookStyle].views.push(met.views);
    hookStyles[v.hookStyle].comps.push(met.completionRatePercentage);

    // Delivery
    if (!deliveryTones[v.deliveryTone]) deliveryTones[v.deliveryTone] = { views: [], comps: [] };
    deliveryTones[v.deliveryTone].views.push(met.views);
    deliveryTones[v.deliveryTone].comps.push(met.completionRatePercentage);

    // Face first second
    const faceKey = v.faceFirstSecond ? 'With Face' : 'Without Face';
    visuals[faceKey].views.push(met.views);
    visuals[faceKey].comps.push(met.completionRatePercentage);

    // Timing
    const timingKey = (v.publishHour >= 18 && v.publishHour <= 22) ? 'Prime Time (18:00 - 22:00)' : 'Off-peak Hours';
    timings[timingKey].views.push(met.views);
    timings[timingKey].comps.push(met.completionRatePercentage);

    // Duration
    const durationKey = v.duration < 35 ? 'Short (< 35s)' : (v.duration <= 60 ? 'Medium (35s - 60s)' : 'Long (> 60s)');
    contentDurations[durationKey].views.push(met.views);
    contentDurations[durationKey].comps.push(met.completionRatePercentage);
  });

  const traits: CreatorDNATrait[] = [];

  const addTrait = (type: 'Content' | 'Hook' | 'Delivery' | 'Visual' | 'Timing', name: string, value: string, viewsList: number[], compsList: number[]) => {
    if (viewsList.length === 0) return;
    const traitAvgViews = viewsList.reduce((sum, v) => sum + v, 0) / viewsList.length;
    const traitAvgComp = compsList.reduce((sum, v) => sum + v, 0) / compsList.length;

    // View lift vs baseline
    const impactOnViews = Math.round(((traitAvgViews - avgViews) / (avgViews || 1)) * 100);
    // Completion lift vs baseline
    const impactOnCompletion = Math.round(((traitAvgComp - avgComp) / (avgComp || 1)) * 100);

    traits.push({
      id: `${type.toLowerCase()}_${value.replace(/\s+/g, '_')}`,
      creatorId,
      traitType: type,
      traitName: name,
      traitValue: value,
      confidenceScore,
      sampleSize,
      impactOnViews,
      impactOnCompletion,
      updatedAt: new Date().toISOString()
    });
  };

  // Process hook traits
  Object.keys(hookStyles).forEach(h => {
    addTrait('Hook', 'طريقة الخطاف', h, hookStyles[h].views, hookStyles[h].comps);
  });

  // Process delivery
  Object.keys(deliveryTones).forEach(d => {
    addTrait('Delivery', 'نبرة الإلقاء', d, deliveryTones[d].views, deliveryTones[d].comps);
  });

  // Process visual
  Object.keys(visuals).forEach(v => {
    addTrait('Visual', 'البصريات والظهور', v, visuals[v].views, visuals[v].comps);
  });

  // Process timings
  Object.keys(timings).forEach(t => {
    addTrait('Timing', 'أوقات النشر', t, timings[t].views, timings[t].comps);
  });

  // Process content duration
  Object.keys(contentDurations).forEach(c => {
    addTrait('Content', 'مدة مقطع الفيديو', c, contentDurations[c].views, contentDurations[c].comps);
  });

  return traits;
}
