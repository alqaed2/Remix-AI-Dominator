import fs from 'fs';
import path from 'path';

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

// Ensure data folder and file exists
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

export const db = {
  getUsers: () => readDB().users,
  addUser: (user: User) => {
    const data = readDB();
    data.users.push(user);
    writeDB(data);
    return user;
  },

  getCreatorProfiles: () => readDB().creatorProfiles,
  getCreatorProfileByUserId: (userId: string) => {
    const profiles = readDB().creatorProfiles;
    return profiles.find(p => p.userId === userId) || null;
  },
  addCreatorProfile: (profile: CreatorProfile) => {
    const data = readDB();
    // Prevent duplicate user profiles
    data.creatorProfiles = data.creatorProfiles.filter(p => p.userId !== profile.userId);
    data.creatorProfiles.push(profile);
    writeDB(data);
    return profile;
  },

  getVideos: (creatorId: string) => {
    const data = readDB();
    return data.videos.filter(v => v.creatorId === creatorId);
  },
  addVideo: (video: Video) => {
    const data = readDB();
    data.videos.push(video);
    writeDB(data);
    return video;
  },

  getMetrics: (videoId: string) => {
    const data = readDB();
    return data.videoMetrics.find(m => m.videoId === videoId) || null;
  },
  getAllMetrics: () => readDB().videoMetrics,
  addMetrics: (metrics: VideoMetrics) => {
    const data = readDB();
    data.videoMetrics = data.videoMetrics.filter(m => m.videoId !== metrics.videoId);
    data.videoMetrics.push(metrics);
    writeDB(data);
    return metrics;
  },

  getCreatorDNA: (creatorId: string) => {
    const data = readDB();
    const dna = data.creatorDNA.filter(d => d.creatorId === creatorId);
    if (dna.length === 0) {
      // Calculate them dynamically
      const d = calculateDNAForCreator(creatorId, data);
      return d;
    }
    return dna;
  },
  saveCreatorDNA: (creatorId: string, dna: CreatorDNATrait[]) => {
    const data = readDB();
    data.creatorDNA = data.creatorDNA.filter(d => d.creatorId !== creatorId);
    data.creatorDNA.push(...dna);
    writeDB(data);
  },

  getNicheGenome: (niche: string) => {
    const data = readDB();
    return data.nicheGenomes.find(n => n.niche.toLowerCase() === niche.toLowerCase()) || data.nicheGenomes[0];
  },
  getAllNicheGenomes: () => readDB().nicheGenomes,

  resetDB: () => {
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
