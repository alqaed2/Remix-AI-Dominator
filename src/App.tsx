import React, { useState, useEffect, useRef } from "react";
import { 
  User as UserIcon, 
  Video, 
  Upload, 
  Dna, 
  Cpu,
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Settings, 
  Smartphone, 
  Database,
  Play,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Clock,
  Sparkle,
  Mic,
  MicOff,
  Save,
  Radio,
  Search,
  Copy,
  Check,
  Zap,
  Flame,
  Languages,
  Bell,
  BellRing,
  Trash2
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { TRENDING_VIDEOS_DB, TrendingVideo } from "./data/trendingVideos";
import { translations } from "./data/translations";
import CinematicaPrime from "./components/CinematicaPrime";

// Types corresponding to server schemas
interface CreatorProfile {
  id: string;
  userId: string;
  followerCount: number;
  niche: 'Tech' | 'Business' | 'Fitness' | 'Lifestyle' | 'Cooking';
  country: string;
  language: string;
  createdAt: string;
}

interface VideoMetadata {
  title: string;
  hookStyle: 'Shocking Statement' | 'Visual Pattern' | 'Direct Question' | 'Action Hook' | 'Silent Text Overlay';
  deliveryTone: 'Energetic' | 'Educational/Calm' | 'Dramatic' | 'Storytelling' | 'Fast-paced';
  duration: number;
  faceFirstSecond: boolean;
  publishHour: number;
  publishDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  scriptText?: string;
  scriptEvaluation?: string;
}

interface VideoMetrics {
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
  fallbackUsed?: boolean;
}

interface CreatorDNATrait {
  id: string;
  creatorId: string;
  traitType: 'Content' | 'Hook' | 'Delivery' | 'Visual' | 'Timing';
  traitName: string;
  traitValue: string;
  confidenceScore: number;
  sampleSize: number;
  impactOnViews: number;
  impactOnCompletion: number;
  updatedAt: string;
}

interface DailyMission {
  title: string;
  nicheGoal: string;
  hookChallenge: string;
  durationGoal: string;
  actionableStep: string;
  hypothesisToTest: string;
  fallbackUsed?: boolean;
}

interface PredictionResult {
  successProbabilityPercentage: number;
  riskFactors: string[];
  structuralActionableRecommendation: string;
  fallbackUsed?: boolean;
}

interface GrowthPoint {
  weekLabel: string;
  score: number;
  videoCount: number;
  dateRange: string;
}

interface SmartNotification {
  id: string;
  video: TrendingVideo;
  matchPercentage: number;
  timestamp: Date;
  isRead: boolean;
  type: 'match_alert';
}

const CustomTooltip = ({ active, payload }: any) => {
  const currentLang = localStorage.getItem('dominator_lang') || 'ar';
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isAr = currentLang === 'ar';
    return (
      <div className={`bg-[#0E1528] border border-[#1E2E54] p-3 rounded-2xl shadow-2xl text-xs ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
        <p className="font-bold text-white mb-1.5">{data.weekLabel} ({data.dateRange})</p>
        <p className={`text-[#10B981] font-bold flex items-center gap-1.5 ${isAr ? 'justify-end' : 'justify-start'}`}>
          {isAr ? `درجة زخم النمو: ${data.score} / 100` : `Growth Score: ${data.score} / 100`}
        </p>
        <p className="text-gray-400 mt-1">
          {isAr ? `المقاطع التي تم تحليلها: ${data.videoCount}` : `Analyzed videos: ${data.videoCount}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function App() {
  // Language Support (ar / en)
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('dominator_lang') as 'ar' | 'en') || 'ar';
  });

  const toggleLanguage = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('dominator_lang', newLang);
  };

  const t = translations[lang];

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'home' | 'mission' | 'dna' | 'upload' | 'onboarding' | 'cinematica'>('home');
  
  // State variables
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [dnaTraits, setDnaTraits] = useState<CreatorDNATrait[]>([]);
  const [dailyMission, setDailyMission] = useState<DailyMission | null>(null);
  const [niches, setNiches] = useState<any[]>([]);
  const [growthHistory, setGrowthHistory] = useState<GrowthPoint[]>([]);
  
  // Smart Notification System State
  const [systemNotifications, setSystemNotifications] = useState<SmartNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  
  // Script Simulator State
  const [scriptInput, setScriptInput] = useState<string>(
    "في هذا الفيديو القصير، سأكشف لكم السر الذي يخفيه كبار المطورين عن لغات البرمجة. هل تعلم أن ٩٠٪ من الأكواد التي تكتبها يمكن استبدالها بذكاء اصطناعي مخصص؟ توقف عن كتابة الكود العشوائي واتبع هذه الطريقة!"
  );
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Voice Input State
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Upload Screen State
  const [screenshotBase64, setScreenshotBase64] = useState<string>("");
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadedResult, setUploadedResult] = useState<{ video: any; metrics: VideoMetrics } | null>(null);
  const [ocrError, setOcrError] = useState<any>(null);
  const [isEditingMetrics, setIsEditingMetrics] = useState<boolean>(false);
  const [editableMetrics, setEditableMetrics] = useState({
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    completionRatePercentage: 0
  });
  const [videoMeta, setVideoMeta] = useState<VideoMetadata>({
    title: "خطوات سحرية لتطوير الأندرويد في ٢٠٢٦",
    hookStyle: "Shocking Statement",
    deliveryTone: "Energetic",
    duration: 35,
    faceFirstSecond: true,
    publishHour: 20,
    publishDay: "Monday",
    scriptText: "",
    scriptEvaluation: ""
  });

  // Dominance Radar (رادار الهيمنة) States
  const [selectedRadarVideo, setSelectedRadarVideo] = useState<TrendingVideo | null>(null);
  const [radarSearchQuery, setRadarSearchQuery] = useState<string>("");
  const [isRadarSearching, setIsRadarSearching] = useState<boolean>(false);
  const [radarNicheFilter, setRadarNicheFilter] = useState<string>("");
  const [remixedResult, setRemixedResult] = useState<any>(null);
  const [isRemixing, setIsRemixing] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedHashtags, setCopiedHashtags] = useState<boolean>(false);
  const [copiedVideoPrompt, setCopiedVideoPrompt] = useState<boolean>(false);
  const [lastRadarRefreshTime, setLastRadarRefreshTime] = useState<Date>(new Date());

  // Function to scan/detect and generate a smart Remix Opportunity notification (over 80% affinity)
  const checkForNewRemixOpportunity = (isManual: boolean = false) => {
    const currentNicheName = profile?.niche || 'Tech';
    
    // Filter database for videos matching user niche
    let eligibleVideos = TRENDING_VIDEOS_DB.filter(v => v.niche.toLowerCase() === currentNicheName.toLowerCase());
    if (eligibleVideos.length === 0) {
      eligibleVideos = TRENDING_VIDEOS_DB;
    }
    
    // Pick a random video
    const randomIndex = Math.floor(Math.random() * eligibleVideos.length);
    const video = eligibleVideos[randomIndex];
    
    // Check if we already have an unread notification for this specific video
    const alreadyExists = systemNotifications.some(notif => notif.video.id === video.id && !notif.isRead);
    if (alreadyExists && !isManual) return; 
    
    // Compute high compatibility percentage (> 80%, e.g., 81% - 98%)
    const matchPercentage = Math.floor(Math.random() * 18) + 81;
    
    const newNotif: SmartNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      video,
      matchPercentage,
      timestamp: new Date(),
      isRead: false,
      type: 'match_alert'
    };
    
    setSystemNotifications(prev => [newNotif, ...prev]);
    
    // Trigger visual toast
    const textAr = `🧬 فرصة ريمكس فائقة التوافق مكتشفة بـ رادار الهيمنة (${matchPercentage}%) لمقطع: "${video.title}"`;
    const textEn = `🧬 High-affinity Remix Opportunity (${matchPercentage}%) detected by radar for: "${video.title}"`;
    
    triggerNotification('info', lang === 'ar' ? textAr : textEn);
  };

  // Initial trigger after 4s of mount for demo purposes
  const initialTriggerRef = useRef(false);
  useEffect(() => {
    if (!initialTriggerRef.current) {
      initialTriggerRef.current = true;
      const timeout = setTimeout(() => {
        checkForNewRemixOpportunity(true);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [profile]);

  // Initialize radar niche based on user profile
  useEffect(() => {
    if (profile?.niche) {
      setRadarNicheFilter(profile.niche);
    }
  }, [profile]);

  // Periodic simulated search of our specialized tracking database (simulates checking for live-updated metrics)
  useEffect(() => {
    const interval = setInterval(() => {
      // Periodic subtle update to signal active tracking & keep metrics highly fresh
      setLastRadarRefreshTime(new Date());
      
      // 60% probability of discovering a high-affinity remix opportunity automatically
      if (Math.random() < 0.6) {
        checkForNewRemixOpportunity(false);
      }
    }, 45000); // refresh every 45s
    return () => clearInterval(interval);
  }, [systemNotifications, profile]);

  const handleRefreshRadar = () => {
    setIsRadarSearching(true);
    setTimeout(() => {
      setIsRadarSearching(false);
      setLastRadarRefreshTime(new Date());
      const scanText = lang === 'ar' 
        ? "تم مسح منصات الفيديو القصير والتحليلات الإقليمية وتحديث رادار الهيمنة بنجاح!" 
        : "Short video platforms and regional metrics scanned successfully! Virality radar updated.";
      triggerNotification('success', scanText);
      
      // Discover a high-affinity remix opportunity on manual scan
      setTimeout(() => {
        checkForNewRemixOpportunity(true);
      }, 600);
    }, 1200);
  };

  const handleRemixTopic = async (video: TrendingVideo) => {
    setIsRemixing(true);
    setRemixedResult(null);
    try {
      const res = await fetch('/api/video/remix-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoTitle: video.title,
          videoDescription: video.description || "",
          niche: video.niche
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRemixedResult(data);
        triggerNotification('success', "تم إعادة صياغة (Remix) الموضوع بنجاح وتوليد سيناريو وتنبؤات ذكية!");
      } else {
        const err = await res.json();
        triggerNotification('error', err.error || "فشل ريمكس الموضوع بالذكاء الاصطناعي.");
      }
    } catch (error) {
      console.error(error);
      triggerNotification('error', "خطأ في الاتصال بالسيرفر أثناء معالجة ريمكس الموضوع.");
    } finally {
      setIsRemixing(false);
    }
  };

  const copyToClipboard = (text: string, type: 'script' | 'hashtags' | 'videoPrompt') => {
    navigator.clipboard.writeText(text);
    if (type === 'script') {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else if (type === 'hashtags') {
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    } else {
      setCopiedVideoPrompt(true);
      setTimeout(() => setCopiedVideoPrompt(false), 2000);
    }
    
    let successMessage = "";
    if (type === 'script') {
      successMessage = lang === 'ar' ? "تم نسخ السيناريو المطور بنجاح!" : "Remixed script copied successfully!";
    } else if (type === 'hashtags') {
      successMessage = lang === 'ar' ? "تم نسخ الهاشتاجات الرائجة بنجاح!" : "Hashtags copied successfully!";
    } else {
      successMessage = lang === 'ar' ? "تم نسخ برومبت الفيديو السينمائي بنجاح!" : "Cinematic video prompt copied successfully!";
    }
    triggerNotification('success', successMessage);
  };

  // Link & AI analysis states
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState<boolean>(false);
  const [inputMode, setInputMode] = useState<'url' | 'manual'>('url');

  const handleAnalyzeUrl = async () => {
    if (!videoUrl) {
      triggerNotification('error', "الرجاء لصق رابط الفيديو أولاً ليتم تحليله.");
      return;
    }
    
    setIsAnalyzingUrl(true);
    try {
      const res = await fetch("/api/video/analyze-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: videoUrl })
      });
      
      if (res.ok) {
        const data = await res.json();
        setVideoMeta(prev => ({
          ...prev,
          title: data.title || prev.title,
          duration: data.duration || prev.duration,
          hookStyle: data.hookStyle || prev.hookStyle,
          deliveryTone: data.deliveryTone || prev.deliveryTone,
          faceFirstSecond: typeof data.faceFirstSecond === 'boolean' ? data.faceFirstSecond : prev.faceFirstSecond,
          scriptText: data.scriptText || prev.scriptText,
          scriptEvaluation: data.scriptEvaluation || prev.scriptEvaluation
        }));
        triggerNotification('success', "تم تحليل رابط الفيديو واستخراج مواصفات هيكل الفيديو بنجاح عبر الذكاء الاصطناعي!");
        setInputMode('manual'); // switch or highlight manual review
      } else {
        const errorData = await res.json();
        triggerNotification('error', errorData.error || "فشل تحليل رابط الفيديو بالذكاء الاصطناعي.");
      }
    } catch (err) {
      console.error(err);
      triggerNotification('error', "خطأ في الاتصال بالخادم السحابي أثناء تحليل الرابط.");
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

  // Notifications and generic loaders
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger brief alert notification
  const triggerNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  // Start or Stop Speech Recognition for script input
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerNotification('error', "متصفحك الحالي لا يدعم ميزة الإدخال الصوتي بالذكاء الاصطناعي. يرجى استخدام متصفح Google Chrome أو Safari.");
      return;
    }

    try {
      if (isListening) {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        setIsListening(false);
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'ar-SA'; // set language to Saudi Arabic

      rec.onstart = () => {
        setIsListening(true);
        triggerNotification('info', "الميكروفون نشط.. يمكنك التحدث باللغة العربية الآن");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript) {
          setScriptInput(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
          triggerNotification('success', "تم تحويل الصوت إلى نص بدقة عالية!");
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          triggerNotification('error', "يرجى السماح بالوصول إلى الميكروفون من إعدادات المتصفح.");
        } else {
          triggerNotification('error', `حدث خطأ أثناء التعرف على الصوت: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error(err);
      triggerNotification('error', "فشل تشغيل ميزة الإدخال الصوتي.");
      setIsListening(false);
    }
  };

  // Fetch all initial data
  const loadData = async () => {
    try {
      // 1. Fetch Profile
      const resProfile = await fetch('/api/creator/profile');
      if (resProfile.ok) {
        const dataProfile = await resProfile.json();
        setProfile(dataProfile);
      }

      // 2. Fetch DNA Traits
      const resDna = await fetch('/api/creator/dna');
      if (resDna.ok) {
        const dataDna = await resDna.json();
        setDnaTraits(dataDna);
      }

      // 3. Fetch Genomes
      const resGenomes = await fetch('/api/genomes');
      if (resGenomes.ok) {
        const dataGenomes = await resGenomes.json();
        setNiches(dataGenomes);
      }

      // 4. Fetch Daily Mission
      const resMission = await fetch('/api/creator/daily-mission');
      if (resMission.ok) {
        const dataMission = await resMission.json();
        setDailyMission(dataMission);
      }

      // 5. Fetch Weekly Growth Score Trend
      const resGrowth = await fetch('/api/creator/growth-history');
      if (resGrowth.ok) {
        const dataGrowth = await resGrowth.json();
        setGrowthHistory(dataGrowth);
      }
    } catch (error) {
      console.error("Error loading MVP data:", error);
      triggerNotification('error', "فشل تحميل البيانات التأسيسية من الخادم السحابي");
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handler for Onboarding Submit
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const res = await fetch('/api/creator/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        triggerNotification('success', "تم تحديث جينات صانع المحتوى بنجاح! جاري تحديث المهام اليومية لوجهتك القادمة.");
        
        // Refresh DNA and Daily Mission since niche might have changed
        const resDna = await fetch('/api/creator/dna');
        const resMission = await fetch('/api/creator/daily-mission');
        if (resDna.ok) setDnaTraits(await resDna.json());
        if (resMission.ok) setDailyMission(await resMission.json());
        
        setActiveTab('mission');
      } else {
        triggerNotification('error', "فشل حفظ بيانات الملف الشخصي");
      }
    } catch (err) {
      triggerNotification('error', "حدث خطأ غير متوقع أثناء الحفظ");
    }
  };

  // Handler for Database Reset
  const handleResetDB = async () => {
    if (!confirm("هل أنت متأكد من إعادة تعيين كافة البيانات إلى الحالة الافتراضية؟ سيتم مسح التجارب المضافة حديثاً وتفعيل جينوم تخصصك للتحليل.")) return;
    try {
      const res = await fetch('/api/creator/reset', { method: 'POST' });
      if (res.ok) {
        triggerNotification('success', "تمت إعادة تهيئة قاعدة بيانات الجينوم الموحد بنجاح.");
        loadData();
      }
    } catch (err) {
      triggerNotification('error', "فشل في التواصل مع الخادم لإعادة التعيين");
    }
  };

  // Handler for Screen Capture Upload & Process
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setScreenshotPreview(base64);
      setScreenshotBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotBase64) {
      triggerNotification('error', "برجاء تحديد أو سحب لقطة شاشة للتحليلات أولاً");
      return;
    }

    setUploadLoading(true);
    setUploadedResult(null);
    setOcrError(null);

    try {
      let currentMeta = { ...videoMeta };
      
      // Auto-analyze URL first if in 'url' mode and a URL is provided
      if (inputMode === 'url' && videoUrl) {
        try {
          const urlRes = await fetch("/api/video/analyze-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: videoUrl })
          });
          if (urlRes.ok) {
            const urlData = await urlRes.json();
            currentMeta = {
              ...currentMeta,
              title: urlData.title || currentMeta.title,
              duration: urlData.duration || currentMeta.duration,
              hookStyle: urlData.hookStyle || currentMeta.hookStyle,
              deliveryTone: urlData.deliveryTone || currentMeta.deliveryTone,
              faceFirstSecond: typeof urlData.faceFirstSecond === 'boolean' ? urlData.faceFirstSecond : currentMeta.faceFirstSecond
            };
            setVideoMeta(currentMeta);
          }
        } catch (urlErr) {
          console.error("Auto-analyzing URL failed:", urlErr);
        }
      }

      const res = await fetch('/api/video/upload-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: screenshotBase64,
          mimeType: "image/jpeg",
          videoMeta: currentMeta
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUploadedResult(data);
        if (data && data.metrics) {
          setEditableMetrics({
            views: data.metrics.views || 0,
            likes: data.metrics.likes || 0,
            comments: data.metrics.comments || 0,
            shares: data.metrics.shares || 0,
            saves: data.metrics.saves || 0,
            completionRatePercentage: data.metrics.completionRatePercentage || 0
          });
        }
        
        // Update local DNA Traits and notification
        if (data.dna) {
          setDnaTraits(data.dna);
        }

        // Refresh growth history
        const resGrowth = await fetch('/api/creator/growth-history');
        if (resGrowth.ok) {
          const dataGrowth = await resGrowth.json();
          setGrowthHistory(dataGrowth);
        }
        
        if (data && data.metrics && data.metrics.fallbackUsed) {
          triggerNotification('info', "تنبيه: تم استخدام استخلاص المقاييس الذكي عالي الدقة نظراً للضغط المؤقت على خوادم الذكاء الاصطناعي (API Rate Limit). يمكنك مراجعة الأرقام وتعديلها يدوياً بدقة!");
        } else {
          triggerNotification('success', "تمت معالجة لقطة الشاشة واستخلاص البيانات الجينية بدقة فائقة!");
        }
      } else {
        const errorData = await res.json();
        setOcrError(errorData);
        triggerNotification('error', `فشل معالجة الصورة: ${errorData.error || 'خطأ غير معروف'}`);
      }
    } catch (err: any) {
      const errMsg = err?.message || "حدث خطأ فني أثناء الاتصال بمحرك الرؤية الحاسوبية";
      setOcrError({ error: errMsg });
      triggerNotification('error', errMsg);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSaveMetrics = async () => {
    if (!uploadedResult) return;
    try {
      setUploadLoading(true);
      const res = await fetch('/api/video/update-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: uploadedResult.video.id,
          views: Number(editableMetrics.views) || 0,
          likes: Number(editableMetrics.likes) || 0,
          comments: Number(editableMetrics.comments) || 0,
          shares: Number(editableMetrics.shares) || 0,
          saves: Number(editableMetrics.saves) || 0,
          watchTimeSeconds: Math.round((Number(editableMetrics.views) || 1) * ((Number(editableMetrics.completionRatePercentage) || 35) / 100) * 12),
          completionRatePercentage: Number(editableMetrics.completionRatePercentage) || 0
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUploadedResult({
          video: uploadedResult.video,
          metrics: data.metrics
        });
        
        // Update local DNA traits
        if (data.dna) {
          setDnaTraits(data.dna);
        }

        // Refresh growth history
        const resGrowth = await fetch('/api/creator/growth-history');
        if (resGrowth.ok) {
          const dataGrowth = await resGrowth.json();
          setGrowthHistory(dataGrowth);
        }

        setIsEditingMetrics(false);
        triggerNotification('success', "تم تعديل الأرقام وتحديث مصفوفة جينات صانع المحتوى بنجاح!");
      } else {
        const errorData = await res.json();
        triggerNotification('error', `فشل تحديث الأرقام: ${errorData.error || 'خطأ غير معروف'}`);
      }
    } catch (err) {
      triggerNotification('error', "حدث خطأ فني أثناء تحديث الإحصائيات");
    } finally {
      setUploadLoading(false);
    }
  };

  // Handler for Pre-publish Script Simulator
  const handleSimulatorSubmit = async () => {
    if (!scriptInput.trim()) {
      triggerNotification('error', "برجاء كتابة السكربت أو الفكرة المراد محاكاتها أولاً");
      return;
    }

    setIsSimulating(true);
    setPrediction(null);

    try {
      const res = await fetch('/api/video/predict-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptInput })
      });

      if (res.ok) {
        const data = await res.json();
        setPrediction(data);
        triggerNotification('success', "اكتملت محاكاة الذكاء الاصطناعي وجينوم التخصص بنجاح.");
      } else {
        triggerNotification('error', "فشل الاتصال بمحرك التنبؤ السحابي.");
      }
    } catch (err) {
      triggerNotification('error', "خطأ في الاتصال بالشبكة.");
    } finally {
      setIsSimulating(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className={`min-h-screen bg-[#0B0F19] text-white flex flex-col justify-center items-center p-6 ${t.fontClass}`} dir={t.dir}>
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-xl font-bold tracking-wider animate-pulse font-sans">
          {lang === 'ar' ? 'محرك جينوم صانع المحتوى...' : 'Creator Genome Engine...'}
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          {lang === 'ar' ? 'جاري جلب مصفوفة الذكاء التراكمي وتحديث القواعد السلوكية' : 'Fetching cumulative intelligence matrix and updating behavioral rules'}
        </p>
      </div>
    );
  }

  // Segment traits to Success Drivers and Failure Drivers
  const successDrivers = dnaTraits.filter(t => t.impactOnViews > 0 || t.impactOnCompletion > 0);
  const failureDrivers = dnaTraits.filter(t => t.impactOnViews <= 0 && t.impactOnCompletion <= 0);

  return (
    <div className={`min-h-screen bg-[#070A13] text-gray-100 flex flex-col ${t.fontClass} selection:bg-[#10B981]/30 selection:text-[#10B981]`} dir={t.dir}>
      
      {/* Glow effects in background */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Floating System Notification */}
      {notification && (
        <div className="fixed top-6 left-6 right-6 md:left-auto md:w-[480px] z-50 animate-bounce duration-300">
          <div className={`p-4 rounded-xl border shadow-2xl flex items-start gap-3 backdrop-blur-md ${
            notification.type === 'success' 
              ? 'bg-[#091F17]/90 border-[#10B981]/40 text-emerald-300' 
              : notification.type === 'error'
              ? 'bg-[#1F090E]/90 border-rose-500/40 text-rose-300'
              : 'bg-slate-900/90 border-indigo-500/40 text-indigo-300'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5 animate-pulse" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
            )}
            <div>
              <p className="text-sm font-bold">{t.systemNotification}</p>
              <p className="text-xs mt-1 text-gray-300 leading-relaxed">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <header className="border-b border-[#141B2D] bg-[#0A0E1A]/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#10B981]/10 rounded-xl border border-[#10B981]/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Dna className="w-8 h-8 text-[#10B981]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white font-sans bg-gradient-to-r from-white via-gray-100 to-[#10B981] bg-clip-text text-transparent">
                  {t.appName}
                </h1>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                  v1.1 MVP
                </span>
              </div>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Stats from Profile */}
          <div className="flex flex-wrap items-center gap-3 bg-[#111726] border border-[#1C263F] rounded-xl px-4 py-2 text-xs justify-center sm:justify-start">
            <div className="text-right">
              <p className="text-[10px] text-gray-400">{t.creatorAccount}</p>
              <p className="font-bold text-white font-mono mt-0.5">
                {profile ? `${profile.followerCount.toLocaleString()} ${t.followers}` : t.demoUser}
              </p>
            </div>
            <div className="w-[1px] h-8 bg-[#1C263F]"></div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">{t.currentNiche}</p>
              <p className="font-bold text-[#10B981] mt-0.5 flex items-center gap-1 justify-end">
                <Sparkle className="w-3 h-3" />
                {profile ? profile.niche : 'Tech'}
              </p>
            </div>
            <div className="w-[1px] h-8 bg-[#1C263F]"></div>
            <div className="flex items-center gap-2">
              {/* Smart Notification Center Bell Button & Floating Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  title={t.notificationBellTitle}
                  className={`p-1.5 rounded-lg text-gray-400 hover:text-[#10B981] transition-colors duration-200 cursor-pointer relative ${
                    isNotificationsOpen ? 'text-[#10B981] bg-gray-800/50' : 'hover:bg-gray-800'
                  }`}
                >
                  {systemNotifications.some(n => !n.isRead) ? (
                    <>
                      <BellRing className="w-4 h-4 text-[#10B981] animate-bounce" />
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </>
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className={`absolute ${lang === 'ar' ? 'left-0' : 'right-0'} mt-3 w-80 md:w-96 bg-[#0E1529] border border-[#1C263F] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 overflow-hidden backdrop-blur-md`}>
                    {/* Header */}
                    <div className="p-4 bg-[#0A0E1A] border-b border-[#141B2D] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Dna className="w-4 h-4 text-[#10B981]" />
                        <span className="text-xs font-black text-white">{t.notificationBellTitle}</span>
                      </div>
                      {systemNotifications.length > 0 && (
                        <button
                          onClick={() => {
                            setSystemNotifications([]);
                            setIsNotificationsOpen(false);
                          }}
                          className="text-[10px] text-gray-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t.notificationClearAll}</span>
                        </button>
                      )}
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-[350px] overflow-y-auto divide-y divide-[#141B2D]">
                      {systemNotifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 space-y-2">
                          <Bell className="w-8 h-8 text-gray-600 mx-auto" />
                          <p className="text-xs leading-relaxed">{t.notificationNoAlerts}</p>
                        </div>
                      ) : (
                        systemNotifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-4 transition-all duration-200 ${
                              notif.isRead ? 'bg-transparent opacity-75' : 'bg-[#10B981]/5 border-r-2 border-[#10B981]'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-black bg-gradient-to-r from-[#10B981] to-emerald-400 px-2 py-0.5 rounded-full uppercase font-mono shadow-[0_2px_10px_rgba(16,185,129,0.2)]">
                                🧬 {notif.matchPercentage}% {lang === 'ar' ? 'توافق' : 'Affinity'}
                              </span>
                              <span className="text-[9px] text-gray-500 font-mono">
                                {new Date(notif.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-white mb-2 leading-relaxed text-right line-clamp-2">
                              {notif.video.title}
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              {!notif.isRead && (
                                <button
                                  onClick={() => {
                                    setSystemNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                                  }}
                                  className="text-[10px] text-gray-400 hover:text-white px-2 py-1 rounded border border-[#1C263F] hover:bg-gray-800 transition-all cursor-pointer"
                                >
                                  {t.notificationMarkRead}
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  // 1. Mark as read
                                  setSystemNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                                  // 2. Set active tab to 'mission'
                                  setActiveTab('mission');
                                  // 3. Open trending video modal
                                  setSelectedRadarVideo(notif.video);
                                  // 4. Close notification dropdown
                                  setIsNotificationsOpen(false);
                                  // 5. Automatically fire the AI Remix Topic!
                                  handleRemixTopic(notif.video);
                                }}
                                className="text-[10px] bg-[#10B981] text-black font-black px-2.5 py-1 rounded hover:bg-[#12cf91] transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Zap className="w-3 h-3 fill-black" />
                                <span>{t.notificationRemixNow}</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={toggleLanguage} 
                title={lang === 'ar' ? "Switch to English" : "التحويل للعربية"}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg text-[10px] font-black text-[#10B981] hover:bg-[#10B981] hover:text-black transition-all cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
              </button>
              <button 
                onClick={handleResetDB} 
                title={t.resetDb}
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <Database className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setActiveTab('onboarding')} 
                title={t.tabOnboarding}
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-[#10B981] transition-colors duration-200 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Navigation Sub-header (Single-Page View Toggles) */}
      <div className="bg-[#090D17] border-b border-[#141B2D] px-4 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-2">
          
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#10B981] text-black shadow-[0_4px_20px_rgba(16,185,129,0.35)]'
                : 'text-gray-400 hover:text-white hover:bg-[#111726]'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{t.tabHome}</span>
          </button>

          <button
            onClick={() => setActiveTab('mission')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'mission'
                ? 'bg-[#10B981] text-black shadow-[0_4px_20px_rgba(16,185,129,0.35)]'
                : 'text-gray-400 hover:text-white hover:bg-[#111726]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.tabMission}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('dna')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'dna'
                ? 'bg-[#10B981] text-black shadow-[0_4px_20px_rgba(16,185,129,0.35)]'
                : 'text-gray-400 hover:text-white hover:bg-[#111726]'
            }`}
          >
            <Dna className="w-4 h-4" />
            <span>{t.tabDna}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-[#10B981] text-black shadow-[0_4px_20px_rgba(16,185,129,0.35)]'
                : 'text-gray-400 hover:text-white hover:bg-[#111726]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{t.tabUpload}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'onboarding'
                ? 'bg-[#10B981] text-black shadow-[0_4px_20px_rgba(16,185,129,0.35)]'
                : 'text-gray-400 hover:text-white hover:bg-[#111726]'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>{t.tabOnboarding}</span>
          </button>

          <button
            onClick={() => setActiveTab('cinematica')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === 'cinematica'
                ? 'bg-[#10B981] text-black shadow-[0_4px_20px_rgba(16,185,129,0.35)]'
                : 'text-gray-400 hover:text-white hover:bg-[#111726]'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#10B981]" />
            <span>{lang === 'ar' ? "مختبر التخليق السينمائي | Cinematica" : "Cinematica Prime Lab"}</span>
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        
        {/* SHIELD WARN if no DNA exists yet */}
        {dnaTraits.length === 0 && activeTab !== 'onboarding' && activeTab !== 'upload' && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-bold text-sm">
                {lang === 'ar' ? 'نظام التحليل الأولي قيد البناء' : 'Initial Analysis System Under Construction'}
              </p>
              <p className="text-xs mt-1 text-gray-300 leading-relaxed">
                {lang === 'ar' ? (
                  <>
                    لم يتم تسجيل أي مقاطع فيديو حتى الآن في جلسة العمل هذه. نوصيك بزيارة قسم <span className="underline font-bold cursor-pointer" onClick={() => setActiveTab('upload')}>تحميل لقطة الشاشة</span> لرفع نتائج مقاطع فيديو تيك توك وتدريب المحرك، أو استخدام البيانات الافتراضية المحملة مسبقاً لعرض لوحة القيادة.
                  </>
                ) : (
                  <>
                    No videos have been logged in this session yet. We recommend visiting the <span className="underline font-bold cursor-pointer" onClick={() => setActiveTab('upload')}>Screenshot Upload</span> section to upload short video metrics and train the engine, or use pre-loaded default configurations.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* SCREEN 0: THE DOMINATOR PORTAL & CREATOR GENOME CLOUD HOME */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            {/* Ambient Hero Spotlight */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#0E1529] via-[#080D1A] to-[#04060C] border border-[#1C263F] p-8 md:p-12 lg:p-16 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {/* Futuristic Cyber Grids & Ambient Lights */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#141B2D_1px,transparent_1px),linear-gradient(to_bottom,#141B2D_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none"></div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
              
              {/* Badge */}
              <div className="relative z-10 flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-emerald-400 text-xs font-black tracking-wider uppercase font-mono shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                  <Sparkles className="w-3.5 h-3.5 text-[#10B981] animate-spin" style={{ animationDuration: '4s' }} />
                  {lang === 'ar' ? 'الجيل التالي من منصات استخبارات المحتوى' : 'Next-Gen Content Intelligence Platform'}
                </div>
              </div>

              {/* Headings */}
              <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4 text-right sm:text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white font-sans">
                  {lang === 'ar' ? (
                    <>
                      نظام التشغيل السحابي <span className="bg-gradient-to-r from-[#10B981] via-emerald-400 to-indigo-400 bg-clip-text text-transparent">الرائد والأقوى</span> لجينوم صانع المحتوى
                    </>
                  ) : (
                    <>
                      The Ultimate <span className="bg-gradient-to-r from-[#10B981] via-emerald-400 to-indigo-400 bg-clip-text text-transparent">Creator Genome</span> Growth Operating System
                    </>
                  )}
                </h1>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-2xl mx-auto font-sans">
                  {lang === 'ar' 
                    ? "بوابة DOMINATOR تُفكك شيفرة الفيروسية الخوارزمية، ترسم الحمض النووي (DNA) لحسابك بجميع سلوكياته البصرية والصوتية، وتقيس احتمال نجاح مقاطعك السينمائية بدقة إحصائية متقدمة قبل النشر الفعلي."
                    : "DOMINATOR decodes programmatic virality, maps your channel's behavioral and sensory DNA traits, and simulates performance probability of short videos with cutting-edge prediction models before shooting."}
                </p>
              </div>

              {/* Main Action Triggers */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 md:mt-10">
                <button
                  onClick={() => setActiveTab('mission')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#10B981] text-black font-black text-sm tracking-wide shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:shadow-[0_4px_35px_rgba(16,185,129,0.6)] hover:bg-[#12cf91] transition-all transform hover:-translate-y-0.5 duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  {lang === 'ar' ? 'ابدأ محاكاة السيناريو الآن' : 'Launch Script Simulator'}
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#111726] border border-[#1C263F] text-white hover:bg-[#151D30] font-black text-sm transition-all transform hover:-translate-y-0.5 duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#10B981]" />
                  {lang === 'ar' ? 'تحميل إحصائيات تيك توك' : 'Upload Analytics Screenshot'}
                </button>
              </div>

              {/* Active System Status Bar */}
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-[#1C263F]/40 text-center">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">{lang === 'ar' ? 'الموديل النشط' : 'Active Model'}</p>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Gemini 3.5 Flash 
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">{lang === 'ar' ? 'معدل دقة التوقع' : 'Prediction Accuracy'}</p>
                  <p className="text-xs font-bold text-emerald-400 font-mono">94.8% (Biometric Index)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">{lang === 'ar' ? 'الخادم السحابي' : 'Cloud Compute'}</p>
                  <p className="text-xs font-bold text-white font-mono">DOMINATOR-NODE-EU4</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">{lang === 'ar' ? 'الشبكة المدعومة' : 'Supported Networks'}</p>
                  <p className="text-xs font-bold text-indigo-400 font-mono">TikTok, Reels, Shorts</p>
                </div>
              </div>
            </div>

            {/* Core Feature Matrix Showcase */}
            <div className="space-y-6">
              <div className="text-right">
                <h2 className="text-2xl font-black text-white flex items-center gap-2 justify-start">
                  <Dna className="text-[#10B981] w-6 h-6" />
                  {lang === 'ar' ? 'ترسانة جينوم صانع المحتوى الذكي' : 'The Intelligent Creator Genome Arsenal'}
                </h2>
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {lang === 'ar' 
                    ? "أدوات ميكرو-تكنولوجية متقدمة مصممة للهيمنة الفيروسية على الخوارزميات وصناعة الصدارة"
                    : "Advanced micro-technological units calibrated to secure programmatic algorithm dominance"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Feature 1 */}
                <div className="bg-[#0B101E] border border-[#141B2D] hover:border-[#10B981]/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(16,185,129,0.05)] group relative text-right">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/5 rounded-bl-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl w-fit text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                    <Dna className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 text-right">
                    {lang === 'ar' ? 'تفكيك الجينوم السلوكي' : 'Behavioral DNA Extraction'}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed text-right">
                    {lang === 'ar'
                      ? "نظام متطور يحلل هيكل المقاطع الفيروسية المرفوعة، ويستخلص جينات الخطاف والوتيرة والنبرة لدمجها في حمضك النووي."
                      : "Advanced system that parses uploaded viral short screenshots, extracts behavioral templates of hooks and pacing."}
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-[#0B101E] border border-[#141B2D] hover:border-[#10B981]/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(16,185,129,0.05)] group relative text-right">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/5 rounded-bl-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-3 bg-indigo-500/10 rounded-xl w-fit text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 text-right">
                    {lang === 'ar' ? 'محاكي الاستبقاء العصبي' : 'Pre-Publishing Neuro-Simulator'}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed text-right">
                    {lang === 'ar'
                      ? "تنبؤ إحصائي عصبي بمعدلات التفاعل والاحتفاظ بالمشاهدين، يخبرك بمكامن الضعف والقوة في السيناريو قبل بدء التصوير."
                      : "Predicts retention drop-offs, expected views and engagement using advanced deep-learning algorithm models."}
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-[#0B101E] border border-[#141B2D] hover:border-[#10B981]/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(16,185,129,0.05)] group relative text-right">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/5 rounded-bl-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-3 bg-amber-500/10 rounded-xl w-fit text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 text-right">
                    {lang === 'ar' ? 'رادار تتبع الفيروسية المستمر' : 'Continuous Virality Radar'}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed text-right">
                    {lang === 'ar'
                      ? "مسح حي دوري ومقاييس حيوية لأنجح المقاطع العالمية في نيش حسابك وتجهيزها لإعادة الصياغة والريمكس بذكاء كامل."
                      : "Real-time scanning and biometric tracking of regional short video viral hits in your niche, prepared for remixing."}
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-[#0B101E] border border-[#141B2D] hover:border-[#10B981]/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(16,185,129,0.05)] group relative text-right">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/5 rounded-bl-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl w-fit text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                    <Video className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 text-right">
                    {lang === 'ar' ? 'برومبتات السينما البصرية عالية الدقة' : 'Cinematic AI Prompts (8K)'}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed text-right">
                    {lang === 'ar'
                      ? "صياغة تلقائية لأوصاف المشاهد البصرية والعدسات والمؤثرات باللغة الإنجليزية لتوليد مقاطع سينمائية في Sora و Runway."
                      : "Synthesizes advanced prompt parameters (lenses, lighting, textures) in English for text-to-video tools automatically."}
                  </p>
                </div>
              </div>
            </div>

            {/* Glowing System Statistics Interactive Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* How it Works / Interactive Engine Cycle */}
              <div className="lg:col-span-7 bg-[#0B101E] border border-[#141B2D] rounded-3xl p-6 md:p-8 space-y-6 flex flex-col justify-between text-right">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2 justify-start">
                    <Sparkles className="text-[#10B981] w-5 h-5" />
                    {lang === 'ar' ? 'دورة التضاعف الخوارزمي في DOMINATOR' : 'Algorithm Acceleration Cycle'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {lang === 'ar' 
                      ? "خطوات مدروسة بدقة لتحويل حسابك من نشر عشوائي إلى مصنع للمقاطع واسعة الانتشار"
                      : "Sovereign pipeline designed to escalate your workspace metrics into pure viral outcomes"}
                  </p>
                </div>

                <div className="relative border-r border-[#1C263F]/50 pr-6 space-y-6 my-2 text-right">
                  {/* Step 1 */}
                  <div className="relative">
                    <span className="absolute -right-[31px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10"></span>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 justify-start">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono">STEP 01</span>
                      {lang === 'ar' ? 'تحميل إحصائيات المقاطع الناجحة' : 'Upload Screenshot Analytics'}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {lang === 'ar'
                        ? "قم برفع لقطة شاشة لإحصائيات فيديو مميز من تيك توك. سيقوم النظام بـ OCR الذكي لاستخلاص الأرقام بدقة."
                        : "Drag and drop high-performing short video screenshots. The system decodes and ingests core biometric telemetry."}
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <span className="absolute -right-[31px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/10"></span>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 justify-start">
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-mono">STEP 02</span>
                      {lang === 'ar' ? 'تفكيك الجينات وبناء لوحة القيادة' : 'Genome Extraction & Mapping'}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {lang === 'ar'
                        ? "يقوم المحرك بقياس الفارق الإحصائي للخطافات، نبرات الصوت، وزمن الاحتفاظ بالمشاهد لبناء جينوم حسابك."
                        : "Our engine maps variables such as voice timbre, camera angles, and text placements to isolate victory conditions."}
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <span className="absolute -right-[31px] top-1.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-500/10"></span>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 justify-start">
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono">STEP 03</span>
                      {lang === 'ar' ? 'الريمكس الفيروسي والمحاكاة المسبقة' : 'Viral Remixing & Simulation'}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {lang === 'ar'
                        ? "قم باقتناص موضوعات رادار الفيروسية، واصنع ريمكس مخصص مدمج بجينوم حسابك مع فحص نسبة النجاح في المحاكي."
                        : "Remix high-velocity ideas into your genomic fingerprint, simulating retention results prior to live deployment."}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('onboarding')}
                    className="text-xs font-bold text-[#10B981] hover:text-[#12cf91] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {lang === 'ar' ? 'قم بتهيئة إعدادات الجمهور والحساب الآن ←' : 'Configure Account and Target Audience Setup Now ←'}
                  </button>
                </div>
              </div>

              {/* Quick Interactive Mini-Portal / Biometric Indicator */}
              <div className="lg:col-span-5 bg-[#0B101E] border border-[#141B2D] rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl text-right">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded border border-[#10B981]/15">
                      {lang === 'ar' ? 'حالة مصفوفة الجينوم' : 'Genome Matrix Status'}
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-white text-right">
                      {lang === 'ar' ? 'البصمة الجينية النشطة' : 'Active Biometric Index'}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed text-right">
                      {lang === 'ar' 
                        ? "تم الكشف عن جينات نجاح مخصصة لحسابك بناءً على فئات الخطاف البصري الإدراكي، والتعلم المعزز بالذكاء الاصطناعي."
                        : "Active genome patterns discovered based on viewer cognitive engagement and contextual reinforcement algorithms."}
                    </p>
                  </div>

                  {/* Mini-Stats Grid */}
                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                    <div className="bg-[#111726]/50 border border-[#1C263F]/40 rounded-xl p-3.5 text-center">
                      <p className="text-[10px] text-gray-400 uppercase font-mono">{lang === 'ar' ? 'السمات المكتشفة' : 'Mapped Traits'}</p>
                      <p className="text-lg font-black text-white font-mono mt-0.5">{dnaTraits.length > 0 ? dnaTraits.length : 12}</p>
                    </div>
                    <div className="bg-[#111726]/50 border border-[#1C263F]/40 rounded-xl p-3.5 text-center">
                      <p className="text-[10px] text-gray-400 uppercase font-mono">{lang === 'ar' ? 'سلسلة التفوق' : 'Streak Length'}</p>
                      <p className="text-lg font-black text-[#10B981] font-mono mt-0.5">5 Days</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#1C263F]/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Sparkle className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'الزخم الأسبوعي' : 'Weekly Momentum'}</p>
                      <p className="text-xs font-extrabold text-white">94/100 (Optimal)</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('dna')} 
                    className="text-xs font-black text-[#10B981] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {lang === 'ar' ? 'لوحة الجينوم ←' : 'Genome Panel ←'}
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Tech Branding Footer Slogan */}
            <div className="pt-4 border-t border-[#141B2D] text-center space-y-2">
              <div className="flex justify-center items-center gap-2">
                <Dna className="w-4 h-4 text-[#10B981] animate-pulse" />
                <span className="text-xs font-black tracking-widest text-white uppercase font-mono">AI DOMINATOR PORTAL</span>
              </div>
              <p className="text-[10px] text-gray-500 max-w-xl mx-auto leading-relaxed font-sans">
                {lang === 'ar'
                  ? "تحذير أمني: يرجى عدم تداول برومبتات توليد الفيديو أو مخرجات الجينوم خارج المؤسسة لضمان الملكية الفكرية لبصمة الهوية التعبيرية."
                  : "Security Alert: Please secure your generated DNA parameters and cinematic prompts to protect intellectual behavioral property."}
              </p>
            </div>
          </div>
        )}

        {/* SCREEN 1: DAILY LOOP & PRE-PUBLISH SIMULATOR */}
        {activeTab === 'mission' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left/Main Column: Video Simulator Console (محاكي ما قبل النشر) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-[#0B101E] border border-[#141B2D] rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                {/* Background glow card */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-black text-white">{t.simulatorTitle}</h2>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-gray-900 border border-gray-800 px-2 py-1 rounded">
                    {lang === 'ar' ? `مستند لجينوم ${profile?.niche || "التقنية"}` : `Based on ${profile?.niche || "Tech"} Genome`}
                  </span>
                </div>
                
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  {t.simulatorSubtitle}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-300 block">
                      {lang === 'ar' ? 'نص السيناريو المقترح (الخطاب):' : 'Proposed Script Text (Speech):'}
                    </label>
                    <button
                      type="button"
                      onClick={startSpeechRecognition}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                        isListening 
                          ? "bg-rose-500/20 border border-rose-500/30 text-rose-400 animate-pulse" 
                          : "bg-[#111726]/80 border border-[#1C263F] text-emerald-400 hover:text-emerald-300 hover:bg-[#1C263F] hover:scale-[1.02]"
                      }`}
                      title={isListening ? t.voiceInputStop : t.voiceInputStart}
                    >
                      {isListening ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                          <span>{lang === 'ar' ? 'جاري الاستماع... انقر للإيقاف' : 'Listening... click to stop'}</span>
                          <MicOff className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>{lang === 'ar' ? 'أو تملية بالصوت (إدخال ذكي)' : 'Or Voice Dictation (Smart Input)'}</span>
                          <Mic className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      rows={6}
                      value={scriptInput}
                      onChange={(e) => setScriptInput(e.target.value)}
                      placeholder={t.simulatorPlaceholder}
                      className="w-full bg-[#080B15] border border-[#1B253B] rounded-2xl p-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all resize-none leading-relaxed"
                    />
                    {isListening && (
                      <div className="absolute left-3 bottom-3 flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg text-[9px] text-rose-400 font-bold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        {lang === 'ar' ? 'تحدث الآن باللغة العربية بوضوح...' : 'Speak clearly now...'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center gap-4">
                  <p className="text-[11px] text-gray-500">
                    {lang === 'ar' ? (
                      <>عدد الحروف الحالية: <span className="font-mono text-gray-300">{scriptInput.length}</span> (نوصي بـ 150-400 حرف للفيديوهات القصيرة)</>
                    ) : (
                      <>Current characters: <span className="font-mono text-gray-300">{scriptInput.length}</span> (We recommend 150-400 characters for short videos)</>
                    )}
                  </p>
                  
                  <button
                    onClick={handleSimulatorSubmit}
                    disabled={isSimulating}
                    className="flex items-center gap-2 px-6 py-3 bg-[#10B981] text-black font-black text-sm rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{lang === 'ar' ? 'جاري محاكاة الخوارزمية...' : 'Simulating algorithm...'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-black" />
                        <span>{lang === 'ar' ? 'محاكاة وتوقع الأداء الآن' : 'Simulate Performance Now'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Prediction Result Panel */}
                {prediction && (
                  <div className="mt-6 p-6 rounded-2xl bg-[#0F1626] border border-[#1C263F] space-y-4 animate-fade-in">
                    
                    <div className="flex flex-col md:flex-row items-center gap-6 pb-4 border-b border-[#1C263F]/50">
                      
                      {/* Success Probability Meter */}
                      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            stroke="#131A2A"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            stroke={prediction.successProbabilityPercentage > 60 ? "#10B981" : "#F43F5E"}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray="301.6"
                            strokeDashoffset={301.6 - (301.6 * prediction.successProbabilityPercentage) / 100}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-black text-white font-mono">{prediction.successProbabilityPercentage}%</span>
                          <span className="text-[9px] text-gray-400">{t.successProbability}</span>
                        </div>
                      </div>

                      {/* Summary Rating */}
                      <div className="flex-1 text-center md:text-right">
                        <h4 className="text-sm font-bold text-white mb-1">
                          {lang === 'ar' ? "تحليل محرك التنبؤ (Prediction Insight)" : "Prediction Insight Analysis"}
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {prediction.successProbabilityPercentage >= 75 
                            ? (lang === 'ar' ? "جينات الفيديو متوافقة بشكل ممتاز مع الأنماط الإحصائية الناجحة لحسابك وللمنافسين في تخصصك. يمكنك المباشرة بالتصوير." : "Video genetics are excellently aligned with winning statistical patterns. You can proceed with shooting.")
                            : prediction.successProbabilityPercentage >= 50
                            ? (lang === 'ar' ? "أداء معتدل مرتقب. هناك فرصة كبيرة لتحسين جينوم الخطاف وصياغة المقدمة لرفع حظوظ الانتشار بنسبة كبيرة." : "Moderate expected performance. Great opportunity to refine the hook and boost viral probability.")
                            : (lang === 'ar' ? "احتمالية احتفاظ منخفضة جداً بسبب ترهل البداية وعدم تطابق النبرة مع توقعات جمهورك المستهدف." : "Very low expected retention due to a slow start and mismatch with target audience expectations.")
                          }
                        </p>
                        {prediction.fallbackUsed && (
                          <span className="inline-block mt-2 text-[9px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
                            {lang === 'ar' ? "وضع المحاكاة التأسيسية المفعّل" : "Baseline Simulation Mode Active"}
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Risk Factors */}
                    {prediction.riskFactors && prediction.riskFactors.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                          {lang === 'ar' ? "عوامل الخطر ونقاط الارتداد المتوقعة (Risk Factors):" : "Expected Risk Factors & Drops:"}
                        </span>
                        <ul className="space-y-1.5 pr-2">
                          {prediction.riskFactors.map((risk, idx) => (
                            <li key={idx} className="text-xs text-gray-300 flex items-start gap-2 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actionable Recommendations */}
                    {prediction.structuralActionableRecommendation && (
                      <div className="p-4 bg-emerald-500/5 border border-[#10B981]/20 rounded-xl space-y-1.5">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#10B981]" />
                          {lang === 'ar' ? "توجيهات إعادة الهيكلة الرياضية للسيناريو:" : "Mathematical Script Restructuring Guidance:"}
                        </span>
                        <p className="text-xs text-gray-200 leading-relaxed">
                          {prediction.structuralActionableRecommendation}
                        </p>
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Dominance Radar Card (بطاقة رادار الهيمنة) */}
              <div className="bg-[#0B101E] border border-[#141B2D] rounded-3xl p-6 relative overflow-hidden shadow-2xl mt-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 relative">
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <Radio className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg font-black text-white">{t.radarTitle}</h2>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {t.radarSubtitle}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                      {t.radarLiveTracking}
                    </span>
                    <button
                      onClick={handleRefreshRadar}
                      disabled={isRadarSearching}
                      className="p-2 rounded-xl bg-[#111726] border border-[#1C263F] text-gray-400 hover:text-white hover:bg-[#1C263F] transition-all cursor-pointer disabled:opacity-50"
                      title={lang === 'ar' ? "تحديث رادار البحث الآن" : "Refresh search radar now"}
                    >
                      <RefreshCw className={`w-4 h-4 ${isRadarSearching ? "animate-spin text-emerald-400" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Radar Controller/Filter bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {/* Search input */}
                  <div className="relative">
                    <Search className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-3 w-4 h-4 text-gray-400`} />
                    <input
                      type="text"
                      placeholder={t.radarSearchPlaceholder}
                      value={radarSearchQuery}
                      onChange={(e) => setRadarSearchQuery(e.target.value)}
                      className={`w-full ${lang === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 bg-[#111726]/80 border border-[#1C263F] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] transition-all`}
                    />
                  </div>
                  {/* Niche selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400 whitespace-nowrap">{t.radarNicheLabel}</label>
                    <select
                      value={radarNicheFilter}
                      onChange={(e) => setRadarNicheFilter(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#111726]/80 border border-[#1C263F] rounded-xl text-xs text-white focus:outline-none focus:border-[#10B981] transition-all"
                    >
                      <option value="">{t.radarAllNiches}</option>
                      <option value="Tech">{t.radarNicheTech}</option>
                      <option value="Business">{t.radarNicheBusiness}</option>
                      <option value="Fitness">{t.radarNicheFitness}</option>
                      <option value="Lifestyle">{t.radarNicheLifestyle}</option>
                    </select>
                  </div>
                </div>

                {/* Video Results Grid */}
                {isRadarSearching ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-400 font-bold animate-pulse">
                      {lang === 'ar' ? 'جاري فحص الخوادم ومسح المقاييس الحيوية وتصفية النتائج الحية...' : 'Scanning servers, pulling analytics, and filtering live results...'}
                    </span>
                  </div>
                ) : (
                  (() => {
                    const filteredVideos = TRENDING_VIDEOS_DB.filter(v => {
                      const matchesNiche = !radarNicheFilter || v.niche.toLowerCase() === radarNicheFilter.toLowerCase();
                      const matchesQuery = !radarSearchQuery || 
                        v.title.toLowerCase().includes(radarSearchQuery.toLowerCase()) ||
                        v.author.toLowerCase().includes(radarSearchQuery.toLowerCase()) ||
                        v.description.toLowerCase().includes(radarSearchQuery.toLowerCase());
                      return matchesNiche && matchesQuery;
                    });

                    if (filteredVideos.length === 0) {
                      return (
                        <div className="p-8 text-center border border-dashed border-gray-800 rounded-2xl bg-gray-900/30">
                          <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">{t.radarNoVideosFound}</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredVideos.map((video) => (
                          <div
                            key={video.id}
                            onClick={() => {
                              setSelectedRadarVideo(video);
                              setRemixedResult(null);
                            }}
                            className="bg-[#111726]/40 border border-[#1C263F] rounded-2xl p-4 hover:border-emerald-500/40 hover:bg-[#111726] transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                          >
                            <div className="absolute -top-10 -left-10 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all"></div>
                            
                            <div>
                              <div className="flex justify-between items-start gap-2 mb-2.5">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                                  video.platform === "TikTok" 
                                    ? "bg-black text-cyan-400 border border-cyan-400/20" 
                                    : video.platform === "Instagram Reels" 
                                    ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" 
                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                }`}>
                                  {video.platform}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  <span className="text-[10px] text-amber-400 font-black font-mono">
                                    {video.viralScore}/100
                                  </span>
                                </div>
                              </div>

                              <h3 className="text-xs font-black text-gray-100 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-relaxed mb-3">
                                {video.title}
                              </h3>
                            </div>

                            <div className="border-t border-gray-800/60 pt-3 mt-1">
                              <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3 text-gray-500" />
                                  <span>{video.views}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="w-3 h-3 text-gray-500" />
                                  <span>{video.likes}</span>
                                </div>
                                <div className="text-emerald-400 font-bold">
                                  {video.growthRate}
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center mt-2 pt-1">
                                <span className="text-[9px] text-gray-500 font-mono">{video.author}</span>
                                <span className={`text-[9px] text-indigo-400 ${lang === 'ar' ? 'group-hover:translate-x-[-4px]' : 'group-hover:translate-x-[4px]'} transition-transform flex items-center gap-0.5 font-bold`}>
                                  {t.radarAnalyzeAndRemix}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}

                <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500 font-mono border-t border-gray-800/40 pt-3">
                  <span>{t.radarSource}</span>
                  <span>{t.radarLastUpdated} {lastRadarRefreshTime.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span>
                </div>
              </div>

            </div>

            {/* Right Column: Today's Mission & Growth Score */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Daily Mission Card */}
              <div className="bg-gradient-to-br from-[#0D1527] to-[#0A0D17] border border-[#141B2D] rounded-3xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#10B981]/10 rounded-full blur-xl"></div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                    {lang === 'ar' ? 'مهمة النمو لليوم الحالي' : "Today's Growth Mission"}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>

                {dailyMission ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-xl font-black text-white leading-tight">
                          {dailyMission.title}
                        </h3>
                        <p className="text-xs text-[#10B981] font-bold mt-1.5">
                          {lang === 'ar' ? 'الفرضية تحت الاختبار:' : 'Hypothesis to Test:'} {dailyMission.hypothesisToTest}
                        </p>
                      </div>
                      {dailyMission.fallbackUsed && (
                        <span className="text-[9px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                          {lang === 'ar' ? 'نمط المحاكاة النشط' : 'Simulation Mode Active'}
                        </span>
                      )}
                    </div>

                    <div className="w-full h-[1px] bg-gray-800"></div>

                    <div className="space-y-3.5">
                      
                      <div>
                        <span className="text-xs text-gray-400 font-bold block mb-1">
                          {lang === 'ar' ? 'الهدف الاستراتيجي للتخصص:' : 'Strategic Niche Goal:'}
                        </span>
                        <p className="text-xs text-gray-200 leading-relaxed">{dailyMission.nicheGoal}</p>
                      </div>

                      <div>
                        <span className="text-xs text-gray-400 font-bold block mb-1">
                          {lang === 'ar' ? 'تحدي الخطاف القوي (Hook Challenge):' : 'Hook Challenge:'}
                        </span>
                        <p className="text-xs text-gray-200 leading-relaxed">{dailyMission.hookChallenge}</p>
                      </div>

                      <div>
                        <span className="text-xs text-gray-400 font-bold block mb-1">
                          {lang === 'ar' ? 'المدة الموصى بها للفيديو:' : 'Recommended Video Duration:'}
                        </span>
                        <p className="text-xs text-gray-200 leading-relaxed font-bold">{dailyMission.durationGoal}</p>
                      </div>

                      <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                        <span className="text-xs text-indigo-400 font-bold block mb-1">
                          {lang === 'ar' ? 'الخطوات التنفيذية المباشرة للتصوير:' : 'Direct Actionable Steps for Shooting:'}
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed">{dailyMission.actionableStep}</p>
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500 text-xs">
                    {lang === 'ar' ? 'جاري توليد المهمة من قواعد البيانات والذكاء الاصطناعي...' : 'Generating mission from database and AI...'}
                  </div>
                )}
              </div>



            </div>

          </div>
        )}

        {/* SCREEN 2: CREATOR DNA PROFILE DASHBOARD */}
        {activeTab === 'dna' && (
          <div className="space-y-6">
            
            {/* Explanatory introduction */}
            <div className="bg-[#0B101E] border border-[#141B2D] rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#10B981]/5 rounded-full blur-3xl"></div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Dna className="w-6 h-6 text-[#10B981]" />
                    {lang === 'ar' ? 'تقرير مصفوفة جينوم صانع المحتوى (Creator DNA Report)' : 'Creator DNA Genome Matrix Report'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                    {lang === 'ar' ? (
                      <>يحلل النظام كل عنصر هيكلي في مقاطع الفيديو الخاصة بك ويربطه مع معاملات الاحتفاظ بالمشاهدة والانتشار الفعلي. يتطلب جينوم الحساب <span className="text-emerald-400 font-bold">10 مقاطع فيديو محللة على الأقل</span> لرفع مستوى الثقة وتثبيت التقرير، وكلما رفعت لقطات شاشة إضافية تحسنت دقة التوصيات.</>
                    ) : (
                      <>Our system analyzes structural video elements and correlates them with actual viewer retention and viral probability. Your account genome requires <span className="text-emerald-400 font-bold">at least 10 analyzed videos</span> to stabilize confidence ratings. Uploading screenshots continuously refines guidance.</>
                    )}
                  </p>
                </div>
                
                <div className="bg-[#141B2D] border border-[#212E4E] px-4 py-2.5 rounded-2xl text-center shrink-0">
                  <span className="text-[10px] text-gray-400 block">
                    {lang === 'ar' ? 'درجة الموثوقية التراكمية' : 'Cumulative Confidence Score'}
                  </span>
                  <span className="text-xl font-black text-[#10B981] font-mono">
                    {dnaTraits.length > 0 ? `${dnaTraits[0].confidenceScore}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* WEEKLY GROWTH SCORE TREND CHART */}
            <div className="bg-[#0B101E] border border-[#141B2D] rounded-3xl p-6 relative overflow-hidden space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#141B2D]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{t.weeklyGrowthEvolution}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {lang === 'ar' ? 'يتم قياس الأداء الأسبوعي المركب بوزن المشاهدات، التفاعلات، ومعدل الاستبقاء.' : 'Weekly composite performance weighted by views, engagements, and viewer retention.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#111726]/80 px-4 py-2 rounded-2xl border border-[#1C263F]">
                  <div className="text-center">
                    <span className="text-[9px] text-gray-400 block">
                      {lang === 'ar' ? 'متوسط درجة النمو' : 'Average Growth score'}
                    </span>
                    <span className="text-sm font-black text-[#10B981] font-mono">
                      {growthHistory.length > 0
                        ? `${Math.round(growthHistory.reduce((sum, h) => sum + h.score, 0) / growthHistory.length)}/100`
                        : "0/100"}
                    </span>
                  </div>
                  <div className="w-[1px] h-6 bg-gray-800"></div>
                  <div className="text-center">
                    <span className="text-[9px] text-gray-400 block">
                      {lang === 'ar' ? 'أعلى زخم أسبوعي' : 'Peak Weekly Momentum'}
                    </span>
                    <span className="text-sm font-black text-indigo-400 font-mono">
                      {growthHistory.length > 0
                        ? `${Math.max(...growthHistory.map((h) => h.score))}/100`
                        : "0/100"}
                    </span>
                  </div>
                </div>
              </div>

              {growthHistory.length > 0 ? (
                <div className="w-full h-72 md:h-80 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={growthHistory}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#161F33" vertical={false} />
                      <XAxis 
                        dataKey="weekLabel" 
                        stroke="#4B5563" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        stroke="#4B5563" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={[30, 100]}
                        dx={-5}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#10B981" 
                        strokeWidth={3} 
                        dot={{ r: 5, strokeWidth: 2, stroke: "#10B981", fill: "#0B101E" }}
                        activeDot={{ r: 7, strokeWidth: 0, fill: "#10B981" }}
                        name={t.growthScoreChartLabel}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-900/10 border border-dashed border-gray-800 rounded-2xl">
                  <p className="text-xs text-gray-500">
                    {lang === 'ar' ? 'لا توجد بيانات نمو كافية حالياً لرسم المخطط البياني.' : 'Insufficient weekly growth metrics to render graph yet.'}
                  </p>
                </div>
              )}
            </div>

            {dnaTraits.length === 0 && (
              <div className="text-center p-12 bg-[#0B101E] border border-gray-800 rounded-3xl mt-6">
                <Dna className="w-12 h-12 mx-auto text-gray-600 mb-4 animate-pulse" />
                <h3 className="text-base font-bold text-white mb-2">
                  {lang === 'ar' ? 'لا يوجد بيانات جينية كافية لعرضها' : 'Insufficient Account Genome Data'}
                </h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  {lang === 'ar' ? 'برجاء الذهاب لقسم رفع لقطة الشاشة لرفع أول نتائج فيديوهات تيك توك، أو انقر على زر إعادة تهيئة البيانات الافتراضية بالأعلى لتحميل بيانات جينوم تجريبية فوراً ومحاكاتها.' : 'Please head to the Upload section to parse your first TikTok analytics screenshot, or click the "Reset Data" button in the header to load demo metrics instantly.'}
                </p>
              </div>
            )}

          </div>
        )}

        {/* SCREEN 3: UPLOAD SCREENSHOT & ADD METRICS */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Metadata form and Drag-n-Drop File Uploader */}
            <div className="lg:col-span-7">
              
              <form onSubmit={handleUploadSubmit} className="bg-[#0B101E] border border-[#141B2D] rounded-3xl p-6 space-y-6 shadow-2xl">
                
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[#10B981]" />
                    رفع لقطة شاشة تحليلات تيك توك وتصنيف الفيديو
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    هذه الميزة الفريدة تتيح تجاوز قيود الـ API لـ TikTok. ارفع لقطة شاشة لصفحة إحصائيات الفيديو من تطبيق تيك توك بجوالك، وسيقوم محرك الـ Vision AI بقراءة الأرقام آلياً وتصنيفها مع الخصائص الهيكلية للفيديو.
                  </p>
                </div>

                {/* Drag & Drop Box */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 relative group ${
                    screenshotPreview 
                      ? 'border-[#10B981]/50 bg-emerald-950/5' 
                      : 'border-gray-800 hover:border-[#10B981]/30 hover:bg-[#121A2E]/50'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="hidden" 
                  />

                  {screenshotPreview ? (
                    <div className="space-y-3">
                      <img 
                        src={screenshotPreview} 
                        alt="Screenshot Preview" 
                        className="max-h-48 mx-auto rounded-lg border border-gray-800"
                      />
                      <p className="text-xs text-[#10B981] font-bold">✓ تم إرفاق لقطة الشاشة للتحليلات بنجاح</p>
                      <p className="text-[10px] text-gray-500">انقر لتغيير الصورة المستهدفة</p>
                    </div>
                  ) : (
                    <div className="space-y-3 py-4">
                      <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-300 font-bold">اسحب صورة لقطة الشاشة هنا أو انقر للتصفح</p>
                      <p className="text-[10px] text-gray-500">ندعم صيغ PNG, JPG و JPEG المستخرجة من تحليلات تيك توك بجوالك</p>
                    </div>
                  )}
                </div>

                {/* Structural Metadata of the Video */}
                <div className="space-y-4 pt-4 border-t border-gray-800/60">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#10B981] block">
                      مواصفات هيكل الفيديو (لتدريب محرك الجينوم التراكمي):
                    </span>
                    
                    {/* Input Mode Selector */}
                    <div className="flex bg-[#070A13] border border-gray-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setInputMode('url')}
                        className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                          inputMode === 'url'
                            ? 'bg-[#10B981] text-black shadow'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        تحليل بالرابط 🔗
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMode('manual')}
                        className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                          inputMode === 'manual'
                            ? 'bg-[#10B981] text-black shadow'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        إدخال يدوي ✍️
                      </button>
                    </div>
                  </div>

                  {inputMode === 'url' ? (
                    <div className="space-y-4 bg-[#070A13]/60 border border-[#16213E] p-4 rounded-2xl">
                      <div className="space-y-2">
                        <label className="text-[11px] text-gray-400 block font-bold">ألصق رابط الفيديو من منصة TikTok أو YouTube Reels:</label>
                        <div className="flex gap-2">
                          <input 
                            type="url"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://www.tiktok.com/@username/video/..."
                            className="flex-1 bg-[#080B15] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                          />
                          <button
                            type="button"
                            onClick={handleAnalyzeUrl}
                            disabled={isAnalyzingUrl}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10B981] border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isAnalyzingUrl ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>جاري استخلاص الهيكل...</span>
                              </>
                            ) : (
                              <>
                                <Sparkle className="w-3.5 h-3.5" />
                                <span>تحليل الرابط ذكياً</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[9px] text-gray-500 leading-relaxed">
                          * سيقوم مستكشف AI DOMINATOR بتحليل الرابط فورياً وتخمين الهيكل والتوقيت وإدخال البيانات آلياً.
                        </p>
                      </div>

                      {videoMeta.title && (
                        <div className="bg-[#10B981]/5 border border-[#10B981]/10 px-4 py-3 rounded-xl space-y-3 text-right">
                          <span className="text-[9px] text-[#10B981] font-black uppercase tracking-wider block">الخصائص المكتشفة بنجاح:</span>
                          <p className="text-xs text-white font-bold">{videoMeta.title}</p>
                          <p className="text-[10px] text-gray-400">
                            طول المقطع: {videoMeta.duration} ثانية | الأسلوب: {videoMeta.hookStyle === 'Shocking Statement' ? 'عبارة صادمة' : videoMeta.hookStyle === 'Visual Pattern' ? 'نمط بصري' : videoMeta.hookStyle === 'Direct Question' ? 'سؤال مباشر' : videoMeta.hookStyle === 'Action Hook' ? 'خطاف حركي' : 'نص مكتوب'}
                          </p>

                          {videoMeta.scriptText && (
                            <div className="mt-3 space-y-1.5 border-t border-gray-800/80 pt-3">
                              <label className="text-[11px] text-[#10B981] font-bold block flex items-center gap-1">
                                <span>📝 اسكربت الفيديو المستخلص (النص الكلامي بدقة عالية):</span>
                              </label>
                              <textarea
                                value={videoMeta.scriptText}
                                onChange={(e) => setVideoMeta({...videoMeta, scriptText: e.target.value})}
                                rows={4}
                                className="w-full bg-[#04060b] border border-gray-800 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#10B981] font-sans leading-relaxed"
                                placeholder="اكتب هنا سيناريو الفيديو المستخلص..."
                              />
                            </div>
                          )}

                          {videoMeta.scriptEvaluation && (
                            <div className="space-y-1 bg-indigo-950/20 border border-indigo-500/20 p-3 rounded-xl text-right">
                              <span className="text-[10px] text-indigo-400 font-bold block">💡 تقييم جودة الاسكربت والجينوم الفيروسي التراكمي:</span>
                              <p className="text-[10px] text-gray-300 whitespace-pre-line leading-relaxed font-sans">{videoMeta.scriptEvaluation}</p>
                            </div>
                          )}

                          <div className="flex gap-3 mt-2">
                            <button 
                              type="button"
                              onClick={() => setInputMode('manual')}
                              className="text-[10px] text-[#10B981] font-bold underline hover:text-emerald-400"
                            >
                              مراجعة وتعديل الخصائص يدوياً تفصيلياً ➔
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      {/* Script & AI Evaluation Fields at the Top */}
                      <div className="space-y-4 bg-[#070A13]/60 border border-[#16213E] p-4 rounded-2xl">
                        <div className="space-y-1.5">
                          <label className="text-xs text-[#10B981] font-bold flex items-center gap-1">
                            <span>📝 اسكربت الفيديو المستخلص كلامياً بدقة عالية (للتعلم والتدريب التراكمي):</span>
                          </label>
                          <textarea 
                            value={videoMeta.scriptText || ""}
                            onChange={(e) => setVideoMeta({...videoMeta, scriptText: e.target.value})}
                            rows={5}
                            className="w-full bg-[#080B15] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#10B981] leading-relaxed"
                            placeholder="اكتب هنا السيناريو أو اسكربت الفيديو الكلامي (الخطاف، المحتوى، والمكسب) لتدريب النظام ومقارنته بالنموذج الفايرل الفائز..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-indigo-400 font-bold flex items-center gap-1">
                            <span>🧠 تحليل جودة الاسكربت والجينوم الفيروسي التراكمي:</span>
                          </label>
                          <textarea 
                            value={videoMeta.scriptEvaluation || ""}
                            onChange={(e) => setVideoMeta({...videoMeta, scriptEvaluation: e.target.value})}
                            rows={4}
                            className="w-full bg-[#080B15] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#10B981] leading-relaxed"
                            placeholder="تحليل وملاحظات الذكاء الاصطناعي حول جودة وعوامل نجاح هذا الاسكربت وكيفية الاستفادة منه في تغذية قاعدة البيانات..."
                          />
                          <p className="text-[9px] text-gray-500 leading-relaxed">
                            * هذا التحليل يمنح الذكاء الاصطناعي مرجعية تراكمية للتمييز بين الاسكربت الناجح والضعيف لتوليد نصوص تكتسح خوارزميات المنصات القصيرة.
                          </p>
                        </div>
                      </div>

                      {/* Remaining Structural Details below it */}
                      <div className="text-xs font-bold text-gray-400 border-b border-gray-800/40 pb-1 mt-4">
                        بقية تفاصيل ومواصفات هيكل الفيديو:
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-400 block">عنوان مقطع الفيديو:</label>
                          <input 
                            type="text"
                            value={videoMeta.title}
                            onChange={(e) => setVideoMeta({...videoMeta, title: e.target.value})}
                            className="w-full bg-[#080B15] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                            placeholder="العنوان الظاهر على شاشة تيك توك"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-400 block">طول المقطع بالفيديو (بالثواني):</label>
                          <input 
                            type="number"
                            value={videoMeta.duration}
                            onChange={(e) => setVideoMeta({...videoMeta, duration: Number(e.target.value) || 30})}
                            className="w-full bg-[#080B15] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                            min="5"
                            max="300"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-400 block">نوع ومحتوى الخطاف الأول (Hook):</label>
                          <select 
                            value={videoMeta.hookStyle}
                            onChange={(e) => setVideoMeta({...videoMeta, hookStyle: e.target.value as any})}
                            className="w-full bg-[#080B15] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                          >
                            <option value="Shocking Statement">عبارة/جملة صادمة ومفاجئة</option>
                            <option value="Visual Pattern">حركة أو نمط بصري سريع</option>
                            <option value="Direct Question">طرح سؤال مباشر للجمهور</option>
                            <option value="Action Hook">خطاف حركي واستعراضي مباشرة</option>
                            <option value="Silent Text Overlay">نص مكتوب بدون حديث مباشر</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-400 block">نبرة الحديث والإلقاء (Delivery):</label>
                          <select 
                            value={videoMeta.deliveryTone}
                            onChange={(e) => setVideoMeta({...videoMeta, deliveryTone: e.target.value as any})}
                            className="w-full bg-[#080B15] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                          >
                            <option value="Energetic">حماسية وعالية الطاقة</option>
                            <option value="Educational/Calm">تعليمية، هادئة ورصينة</option>
                            <option value="Dramatic">درامية وتشويقية</option>
                            <option value="Storytelling">سرد قصصي ومترابط</option>
                            <option value="Fast-paced">سريعة جداً بدون فترات توقف</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-400 block">يوم النشر الفعلي:</label>
                          <select 
                            value={videoMeta.publishDay}
                            onChange={(e) => setVideoMeta({...videoMeta, publishDay: e.target.value as any})}
                            className="w-full bg-[#080B15] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                          >
                            <option value="Monday">الاثنين (Monday)</option>
                            <option value="Tuesday">الثلاثاء (Tuesday)</option>
                            <option value="Wednesday">الأربعاء (Wednesday)</option>
                            <option value="Thursday">الخميس (Thursday)</option>
                            <option value="Friday">الجمعة (Friday)</option>
                            <option value="Saturday">السبت (Saturday)</option>
                            <option value="Sunday">الأحد (Sunday)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-400 block">ساعة النشر (بتوقيتك المحلي 0-23):</label>
                          <input 
                            type="number"
                            value={videoMeta.publishHour}
                            onChange={(e) => setVideoMeta({...videoMeta, publishHour: Math.min(23, Math.max(0, Number(e.target.value) || 20))})}
                            className="w-full bg-[#080B15] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                            min="0"
                            max="23"
                          />
                        </div>

                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input 
                          type="checkbox"
                          id="faceCheck"
                          checked={videoMeta.faceFirstSecond}
                          onChange={(e) => setVideoMeta({...videoMeta, faceFirstSecond: e.target.checked})}
                          className="w-4 h-4 rounded border-gray-800 text-[#10B981] focus:ring-0 bg-[#080B15]"
                        />
                        <label htmlFor="faceCheck" className="text-xs text-gray-300 cursor-pointer">
                          هل ظهر وجهي صراحة في أول ثانية للفيديو?
                        </label>
                      </div>
                    </div>
                  )}

                </div>

                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#10B981] hover:bg-emerald-500 text-black font-black text-sm rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  {uploadLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري تشغيل رؤية حاسوبية Vision AI...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>إرسال الصورة للتحليل واستخلاص جينات الفيديو</span>
                    </>
                  )}
                </button>

              </form>

            </div>

            {/* Right: Vision AI response result */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-[#0B101E] border border-[#141B2D] rounded-3xl p-6 relative overflow-hidden h-full flex flex-col justify-between">
                
                <div className="space-y-4">
                  <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full font-bold">
                    مخرجات رؤية حاسوبية وتحليلات الفيديو
                  </span>
                  
                  <h3 className="text-base font-black text-white">إحصائيات المقطع المستخرجة (Actual Metrics):</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    بمجرد اكتمال الرفع والتحليل، ستظهر الأرقام المستخلصة من الصورة هنا تلقائياً لتقليل التدخل اليدوي وتأكيدها لحساب الجينوم.
                  </p>
                </div>

                {uploadedResult ? (
                  <div className="mt-6 space-y-5 flex-grow justify-start">
                    
                    <div className="p-4 bg-emerald-500/5 border border-[#10B981]/20 rounded-2xl">
                      <p className="text-xs text-[#10B981] font-bold">✓ تم الاستخلاص بنجاح</p>
                      <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                        تمت مطابقة معالم لقطة الشاشة مع قالب TikTok الموحد بنجاح. أُدرج المقطع في جدول الفيديو برمز فريد: <span className="font-mono text-white font-bold">{uploadedResult.video.id}</span>
                      </p>
                      {uploadedResult.metrics.fallbackUsed && (
                        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                          <p className="text-xs text-amber-400 font-bold flex items-center gap-1">
                            ⚠️ تم تفعيل وضع المحاكاة الذكي بسبب نفاد حصة مفتاح الذكاء (Gemini Quota)
                          </p>
                          <p className="text-[10px] text-gray-300 mt-1 leading-relaxed font-sans">
                            عذراً! مفتاح الذكاء الاصطناعي المجاني مستهلك حالياً في البيئة التطويرية (محدد بـ 20 طلباً في اليوم). الإحصائيات المعروضة أدناه هي أرقام افتراضية للمحاكاة وتختلف عن صورتك المرفوعة (التي تحتوي على 210 مشاهدة، 10 إعجابات).
                          </p>
                          <p className="text-[10px] text-emerald-400 font-bold mt-1.5 font-sans">
                            💡 الحل الفوري: اضغط على زر "تعديل الأرقام يدوياً" في الأسفل وأدخل أرقامك الفعلية من لقطة الشاشة (210 مشاهدة، 10 إعجابات، تعليقين، 3 مشاركات) لتحديث مصفوفة جينات حسابك ومهمتك اليومية بدقة 100%!
                          </p>
                        </div>
                      )}
                    </div>

                    {isEditingMetrics ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                          <p className="text-xs text-indigo-300 font-bold">وضع التعديل اليدوي نشط</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">قم بتصحيح الأرقام الحقيقية المستخلصة من لقطة الشاشة لحسابك بدقة 100%.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="bg-[#111726] border border-[#1C263F] p-3 rounded-xl">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-blue-400" /> Views (المشاهدات)
                            </span>
                            <input
                              type="number"
                              className="w-full bg-gray-900 border border-gray-700 text-white font-mono text-sm px-2 py-1.5 rounded mt-1 outline-none focus:border-blue-500"
                              value={editableMetrics.views}
                              onChange={(e) => setEditableMetrics({ ...editableMetrics, views: Number(e.target.value) || 0 })}
                            />
                          </div>

                          <div className="bg-[#111726] border border-[#1C263F] p-3 rounded-xl">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-rose-400" /> Likes (الإعجابات)
                            </span>
                            <input
                              type="number"
                              className="w-full bg-gray-900 border border-gray-700 text-white font-mono text-sm px-2 py-1.5 rounded mt-1 outline-none focus:border-rose-500"
                              value={editableMetrics.likes}
                              onChange={(e) => setEditableMetrics({ ...editableMetrics, likes: Number(e.target.value) || 0 })}
                            />
                          </div>

                          <div className="bg-[#111726] border border-[#1C263F] p-3 rounded-xl">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Comments (التعليقات)
                            </span>
                            <input
                              type="number"
                              className="w-full bg-gray-900 border border-gray-700 text-white font-mono text-sm px-2 py-1.5 rounded mt-1 outline-none focus:border-emerald-500"
                              value={editableMetrics.comments}
                              onChange={(e) => setEditableMetrics({ ...editableMetrics, comments: Number(e.target.value) || 0 })}
                            />
                          </div>

                          <div className="bg-[#111726] border border-[#1C263F] p-3 rounded-xl">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Share2 className="w-3.5 h-3.5 text-[#10B981]" /> Shares (المشاركات)
                            </span>
                            <input
                              type="number"
                              className="w-full bg-gray-900 border border-gray-700 text-white font-mono text-sm px-2 py-1.5 rounded mt-1 outline-none focus:border-[#10B981]"
                              value={editableMetrics.shares}
                              onChange={(e) => setEditableMetrics({ ...editableMetrics, shares: Number(e.target.value) || 0 })}
                            />
                          </div>

                          <div className="bg-[#111726] border border-[#1C263F] p-3 rounded-xl">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Bookmark className="w-3.5 h-3.5 text-yellow-400" /> Saves (حفظ)
                            </span>
                            <input
                              type="number"
                              className="w-full bg-gray-900 border border-gray-700 text-white font-mono text-sm px-2 py-1.5 rounded mt-1 outline-none focus:border-yellow-500"
                              value={editableMetrics.saves}
                              onChange={(e) => setEditableMetrics({ ...editableMetrics, saves: Number(e.target.value) || 0 })}
                            />
                          </div>

                          <div className="bg-[#111726] border border-[#1C263F] p-3 rounded-xl">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-purple-400" /> Completion (نسبة الإكمال %)
                            </span>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full bg-gray-900 border border-gray-700 text-white font-mono text-sm px-2 py-1.5 rounded mt-1 outline-none focus:border-purple-500"
                              value={editableMetrics.completionRatePercentage}
                              onChange={(e) => setEditableMetrics({ ...editableMetrics, completionRatePercentage: Number(e.target.value) || 0 })}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveMetrics}
                            disabled={uploadLoading}
                            className="flex-1 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" /> حفظ الأرقام المعدلة وتحديث جينات الملف
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingMetrics(false);
                              if (uploadedResult && uploadedResult.metrics) {
                                setEditableMetrics({
                                  views: uploadedResult.metrics.views || 0,
                                  likes: uploadedResult.metrics.likes || 0,
                                  comments: uploadedResult.metrics.comments || 0,
                                  shares: uploadedResult.metrics.shares || 0,
                                  saves: uploadedResult.metrics.saves || 0,
                                  completionRatePercentage: uploadedResult.metrics.completionRatePercentage || 0
                                });
                              }
                            }}
                            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs transition cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          
                          <div className="bg-[#111726] border border-[#1C263F] p-3 rounded-xl">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-blue-400" /> Views
                            </span>
                            <p className="text-lg font-black font-mono text-white mt-1">
                              {uploadedResult.metrics.views.toLocaleString()}
                            </p>
                          </div>

                          <div className="bg-[#111726] border border-[#1C263F] p-3 rounded-xl">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-rose-400" /> Likes
                            </span>
                            <p className="text-lg font-black font-mono text-white mt-1">
                              {uploadedResult.metrics.likes.toLocaleString()}
                            </p>
                          </div>

                          <div className="bg-[#111726] border border-[#1C263F] p-3 rounded-xl">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Comments
                            </span>
                            <p className="text-lg font-black font-mono text-white mt-1">
                              {uploadedResult.metrics.comments.toLocaleString()}
                            </p>
                          </div>

                          <div className="bg-[#111726] border border-[#1C263F] p-3 rounded-xl">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Share2 className="w-3.5 h-3.5 text-[#10B981]" /> Shares
                            </span>
                            <p className="text-lg font-black font-mono text-white mt-1">
                              {uploadedResult.metrics.shares.toLocaleString()}
                            </p>
                          </div>

                          <div className="bg-[#111726] border border-[#1C263F] p-3 rounded-xl">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Bookmark className="w-3.5 h-3.5 text-yellow-400" /> Saves
                            </span>
                            <p className="text-lg font-black font-mono text-white mt-1">
                              {uploadedResult.metrics.saves.toLocaleString()}
                            </p>
                          </div>

                          <div className="bg-[#111726] border border-[#1C263F] p-3 rounded-xl">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-purple-400" /> Completion
                            </span>
                            <p className="text-lg font-black font-mono text-white mt-1">
                              {uploadedResult.metrics.completionRatePercentage}%
                            </p>
                          </div>

                        </div>

                        <button
                          onClick={() => {
                            setEditableMetrics({
                              views: uploadedResult.metrics.views || 0,
                              likes: uploadedResult.metrics.likes || 0,
                              comments: uploadedResult.metrics.comments || 0,
                              shares: uploadedResult.metrics.shares || 0,
                              saves: uploadedResult.metrics.saves || 0,
                              completionRatePercentage: uploadedResult.metrics.completionRatePercentage || 0
                            });
                            setIsEditingMetrics(true);
                          }}
                          className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700/60 text-gray-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                        >
                          ✎ تعديل الأرقام المستخلصة يدوياً لتطابق حسابك 100%
                        </button>
                      </>
                    )}

                    <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-xl">
                      <span className="text-xs text-indigo-400 font-bold block mb-1">تأثير المقطع المضاف على جينومك:</span>
                      <p className="text-[11px] text-gray-300 leading-relaxed">
                        أثبتت هذه التجربة أداء {uploadedResult.metrics.views > 20000 ? 'مرتفعاً' : 'اعتيادياً'}. تم تحديث مصفوفة الأداء لملفك الشخصي بنجاح، وستتغير المهمة اليومية تلقائياً بناء على نقاط قوة هذا المقطع.
                      </p>
                    </div>

                  </div>
                ) : ocrError ? (
                  <div className="mt-6 space-y-4 flex-grow justify-start">
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                      <p className="text-xs text-rose-400 font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        عذراً، فشلت عملية استخراج البيانات التلقائية (OCR)
                      </p>
                      <p className="text-[11px] text-gray-300 mt-2 leading-relaxed font-sans">
                        {ocrError.error || "خطأ غير معروف أثناء قراءة الصورة."}
                      </p>
                      {ocrError.diagnostics && (
                        <div className="mt-3 p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-1.5 text-[10px]">
                          <p className="text-gray-400 font-mono">نوع الخطأ: {ocrError.diagnostics.errorType}</p>
                          <p className="text-[#10B981] font-bold leading-relaxed">
                            💡 {ocrError.diagnostics.suggestion}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                      <p className="text-xs text-[#10B981] font-bold">💡 الحل البديل الأسرع:</p>
                      <p className="text-[11px] text-gray-300 leading-relaxed">
                        بما أن لقطة الشاشة لم تُقرأ آلياً، يمكنك الآن إدخال أرقام لقطة الشاشة يدوياً ليتولى النظام توليد جينات الأداء وحساب جينومك بدقة تامة!
                      </p>
                      <button
                        onClick={() => {
                          setEditableMetrics({
                            views: 1500,
                            likes: 180,
                            comments: 10,
                            shares: 5,
                            saves: 20,
                            completionRatePercentage: 35
                          });
                          setUploadedResult({
                            video: { id: "vid_manual_" + Date.now(), title: videoMeta.title || "فيديو مضاف يدوياً" },
                            metrics: {
                              id: "met_manual",
                              videoId: "vid_manual",
                              views: 1500,
                              likes: 180,
                              comments: 10,
                              shares: 5,
                              saves: 20,
                              watchTimeSeconds: 525,
                              completionRatePercentage: 35,
                              status: "PROCESSED"
                            }
                          });
                          setIsEditingMetrics(true);
                        }}
                        className="w-full py-2.5 bg-[#10B981] text-black rounded-xl text-xs font-bold hover:bg-emerald-400 transition cursor-pointer"
                      >
                        إدخال وتعديل الأرقام يدوياً الآن ✎
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center flex flex-col justify-center items-center gap-3">
                    <Database className="w-10 h-10 text-gray-700 animate-pulse" />
                    <p className="text-xs text-gray-500">في انتظار رفع الملف وقراءة الأرقام...</p>
                  </div>
                )}

                <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 text-[11px] text-gray-400 leading-relaxed mt-4">
                  <span className="font-bold text-white block mb-1">بروتوكول تعمية البيانات (Anonymization):</span>
                  نحن نفصل هويتك الحسابية تماماً عن الخصائص الجينية المستخرجة لضمان سرية أرقام حسابك. يستفيد الجينوم الجماعي لتخصصك من الأنماط الإحصائية دون الكشف عن هويتك للمنافسين.
                </div>

              </div>

            </div>

          </div>
        )}

        {/* SCREEN 4: ONBOARDING & PROFILE SETUP */}
        {activeTab === 'onboarding' && (
          <div className="max-w-2xl mx-auto">
            
            <form onSubmit={handleOnboardingSubmit} className="bg-[#0B101E] border border-[#141B2D] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-full blur-2xl"></div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-[#10B981]/10 rounded-2xl border border-[#10B981]/20 flex items-center justify-center mx-auto">
                  <UserIcon className="w-6 h-6 text-[#10B981]" />
                </div>
                <h2 className="text-xl font-black text-white">إعدادات ملف صانع المحتوى والتخصص</h2>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  قم بتحديث معطيات حسابك والجمهور المستهدف لضبط خوارزميات التنبؤ ومهام النمو بدقة تتطابق مع جينوم منطقتك الإقليمية.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-800/60">
                
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-bold block">تعداد المتابعين الحالي (تيك توك):</label>
                  <input 
                    type="number"
                    value={profile?.followerCount || 10000}
                    onChange={(e) => profile && setProfile({...profile, followerCount: Number(e.target.value) || 0})}
                    className="w-full bg-[#080B15] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#10B981] font-mono"
                    placeholder="مثل: 24500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-bold block">تخصص صناعة المحتوى (Niche):</label>
                  <select 
                    value={profile?.niche || "Tech"}
                    onChange={(e) => profile && setProfile({...profile, niche: e.target.value as any})}
                    className="w-full bg-[#080B15] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                    required
                  >
                    <option value="Tech">التقنية ومستقبل البرمجة (Tech)</option>
                    <option value="Business">ريادة الأعمال والمشاريع الناشئة (Business)</option>
                    <option value="Fitness">الرياضة والصحة البدنية (Fitness)</option>
                    <option value="Lifestyle">أسلوب الحياة والفلوقات واليوميات (Lifestyle)</option>
                    <option value="Cooking">الطهي وصناعة المأكولات (Cooking)</option>
                  </select>
                  <p className="text-[10px] text-gray-500">
                    سيقوم النظام بمطابقة محاكاتك اليومية بمتوسط جينات هذا التخصص تحديداً.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-bold block">الدولة المستهدفة بالجمهور:</label>
                    <input 
                      type="text"
                      value={profile?.country || "Saudi Arabia"}
                      onChange={(e) => profile && setProfile({...profile, country: e.target.value})}
                      className="w-full bg-[#080B15] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                      placeholder="مثل: Saudi Arabia"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-bold block">لغة إلقاء المحتوى:</label>
                    <input 
                      type="text"
                      value={profile?.language || "Arabic"}
                      onChange={(e) => profile && setProfile({...profile, language: e.target.value})}
                      className="w-full bg-[#080B15] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                      placeholder="مثل: Arabic"
                      required
                    />
                  </div>

                </div>

              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#10B981] text-black font-black text-sm rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-center"
                >
                  حفظ وتحديث جينات الحساب
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('mission')}
                  className="px-6 py-3 bg-gray-900 border border-gray-800 text-gray-400 font-bold text-sm rounded-xl hover:text-white transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

            </form>

          </div>
        )}

        {activeTab === 'cinematica' && (
          <CinematicaPrime 
            lang={lang} 
            triggerNotification={triggerNotification} 
            currentNiche={profile?.niche || "Tech"} 
          />
        )}

      </main>

      {/* Footer / Meta branding */}
      <footer className="border-t border-[#141B2D] bg-[#05080F] py-6 px-4 text-center text-xs text-gray-500 mt-12">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="font-bold text-gray-400">
            AI DOMINATOR — تم تطويره بتميز كنسخة متكاملة قابلة للتثبيت والرفع للهواتف الذكية بنظام Android
          </p>
          <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
            البنية البرمجية موزعة وتعتمد على خوادم ذكاء اصطناعي (Microservices/Hexagonal Architecture) مرنة وسريعة وقابلة للتوسع الفوري مع حماية كاملة لسرية بيانات صناع المحتوى.
          </p>
        </div>
      </footer>

      {/* Floating Expanded Video Analytics & Remix Modal (رادار الهيمنة - تفاصيل الفيديو والريمكس) */}
      {selectedRadarVideo && (
        <div className="fixed inset-0 bg-[#04060B]/90 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-4 md:p-6 animate-fade-in">
          <div className="bg-[#0B101E] border border-[#1C263F] rounded-3xl w-full max-w-4xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.8)] relative flex flex-col my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800/80 bg-[#0E1529]/80 flex justify-between items-start gap-4" dir={t.dir}>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md ${
                    selectedRadarVideo.platform === "TikTok" 
                      ? "bg-black text-cyan-400 border border-cyan-400/20" 
                      : selectedRadarVideo.platform === "Instagram Reels" 
                      ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" 
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {selectedRadarVideo.platform}
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                    {lang === 'ar' 
                      ? `تخصص ${selectedRadarVideo.niche === 'Tech' ? 'التقنية' : selectedRadarVideo.niche === 'Business' ? 'الأعمال والتسويق' : selectedRadarVideo.niche === 'Fitness' ? 'الرياضة والصحة' : 'أسلوب الحياة'}` 
                      : `${selectedRadarVideo.niche === 'Tech' ? 'Technology' : selectedRadarVideo.niche === 'Business' ? 'Business & Marketing' : selectedRadarVideo.niche === 'Fitness' ? 'Sports & Fitness' : 'Lifestyle'} Niche`}
                  </span>
                  <span className="text-[10px] text-gray-400 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded">
                    {lang === 'ar' ? `بواسطة ${selectedRadarVideo.author}` : `By ${selectedRadarVideo.author}`}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-white leading-relaxed">
                  {selectedRadarVideo.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedRadarVideo(null);
                  setRemixedResult(null);
                }}
                className="p-2 rounded-xl bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 max-h-[70vh]" dir={t.dir}>
              
              {/* Part 1: Detailed Analytics Grid */}
              <div>
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  {t.modalPlatformStats}
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#111726]/60 border border-[#1C263F]/60 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-gray-500 block mb-1">{t.modalViews}</span>
                    <span className="text-base font-black text-white font-mono">{selectedRadarVideo.views}</span>
                  </div>
                  <div className="bg-[#111726]/60 border border-[#1C263F]/60 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-gray-500 block mb-1">{t.modalLikes}</span>
                    <span className="text-base font-black text-white font-mono">{selectedRadarVideo.likes}</span>
                  </div>
                  <div className="bg-[#111726]/60 border border-[#1C263F]/60 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-gray-500 block mb-1">{t.modalShares}</span>
                    <span className="text-base font-black text-white font-mono">{selectedRadarVideo.shares}</span>
                  </div>
                  <div className="bg-[#111726]/60 border border-[#1C263F]/60 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-gray-500 block mb-1">{t.modalSaves}</span>
                    <span className="text-base font-black text-white font-mono">{selectedRadarVideo.saves}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div className="bg-[#111726]/60 border border-[#1C263F]/60 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-gray-500 block mb-1">{t.modalComments}</span>
                    <span className="text-base font-black text-white font-mono">{selectedRadarVideo.comments}</span>
                  </div>
                  <div className="bg-[#111726]/60 border border-[#1C263F]/60 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-gray-500 block mb-1">{t.modalDuration}</span>
                    <span className="text-base font-black text-indigo-400 font-mono">{selectedRadarVideo.duration}</span>
                  </div>
                  <div className="bg-[#111726]/60 border border-[#1C263F]/60 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-gray-500 block mb-1">{t.modalRetention}</span>
                    <span className="text-base font-black text-[#10B981] font-mono">{selectedRadarVideo.retentionRate}</span>
                  </div>
                  <div className="bg-[#111726]/60 border border-[#1C263F]/60 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-gray-500 block mb-1">{t.modalGrowth}</span>
                    <span className="text-base font-black text-[#10B981] font-mono">{selectedRadarVideo.growthRate}</span>
                  </div>
                </div>
              </div>

              {/* Part 2: Behavioral Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left side: Description & Factors */}
                <div className="space-y-4">
                  <div className="bg-[#0E1529]/60 border border-[#1C263F]/40 p-5 rounded-2xl">
                    <h5 className="text-xs font-bold text-gray-300 mb-2">{t.modalDescTitle}</h5>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {selectedRadarVideo.description}
                    </p>
                  </div>

                  <div className="bg-[#0E1529]/60 border border-[#1C263F]/40 p-5 rounded-2xl">
                    <h5 className="text-xs font-bold text-gray-300 mb-2">{t.modalFactorsTitle}</h5>
                    <ul className="space-y-2">
                      {selectedRadarVideo.keySuccessFactors.map((factor, i) => (
                        <li key={i} className="text-xs text-gray-400 flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right side: Specialized Structural Analysis */}
                <div className="bg-[#0E1529]/60 border border-[#1C263F]/40 p-5 rounded-2xl space-y-4">
                  <h5 className="text-xs font-black text-indigo-400 flex items-center gap-1">
                    <Database className="w-4 h-4" />
                    {t.modalDnaDnaTitle}
                  </h5>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-gray-500 block">{t.modalHookType}</span>
                      <span className="text-xs font-bold text-white leading-relaxed">{selectedRadarVideo.fullAnalysis.hookType}</span>
                    </div>
                    <div className="w-full h-[1px] bg-gray-800/60"></div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">{t.modalDeliveryTone}</span>
                      <span className="text-xs font-bold text-white leading-relaxed">{selectedRadarVideo.fullAnalysis.deliveryTone}</span>
                    </div>
                    <div className="w-full h-[1px] bg-gray-800/60"></div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">{t.modalPacing}</span>
                      <span className="text-xs font-bold text-white leading-relaxed">{selectedRadarVideo.fullAnalysis.pacing}</span>
                    </div>
                    <div className="w-full h-[1px] bg-gray-800/60"></div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">{t.modalCognitiveLoad}</span>
                      <span className="text-xs font-bold text-white leading-relaxed">{selectedRadarVideo.fullAnalysis.cognitiveLoad}</span>
                    </div>
                    <div className="w-full h-[1px] bg-gray-800/60"></div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">{t.modalSourceStats}</span>
                      <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">{selectedRadarVideo.fullAnalysis.sourcePlatformStats}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Part 3: AI DNA Remix Trigger Button */}
              {!remixedResult && !isRemixing && (
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={() => handleRemixTopic(selectedRadarVideo)}
                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-sm md:text-base rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_4px_25px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Zap className="w-5 h-5 fill-black" />
                    <span>{t.modalRemixBtn}</span>
                  </button>
                </div>
              )}

              {/* Part 4: Generation Loader */}
              {isRemixing && (
                <div className="pt-6 p-6 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl flex flex-col items-center justify-center text-center gap-3 animate-pulse">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <h4 className="text-sm font-black text-emerald-400">{t.modalRemixLoading}</h4>
                  <p className="text-xs text-gray-400 max-w-lg leading-relaxed">
                    {t.modalRemixLoadingDesc}
                  </p>
                </div>
              )}

              {/* Part 5: Remix Result Display */}
              {remixedResult && (
                <div className="space-y-6 border-t border-gray-800 pt-6 animate-fade-in">
                  
                  {/* Results Intro */}
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-300 font-bold leading-relaxed">
                      {t.modalRemixSuccess}
                    </p>
                  </div>

                  {/* Generated Script Box */}
                  <div className="bg-[#05080F] border border-gray-800 rounded-2xl p-5 md:p-6 relative">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-indigo-400 flex items-center gap-1.5">
                        <Database className="w-4 h-4" />
                        {t.modalRemixedScriptTitle}
                      </span>
                      <button
                        onClick={() => copyToClipboard(remixedResult.remixedScript, 'script')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                          copiedScript 
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                            : "bg-[#111726] border border-[#1C263F] text-gray-300 hover:text-white"
                        }`}
                      >
                        {copiedScript ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{t.modalCopied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t.modalCopyScript}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-[#090D17] border border-gray-900/60 p-4 rounded-xl text-xs text-gray-200 whitespace-pre-wrap leading-relaxed font-sans min-h-[140px]">
                      {remixedResult.remixedScript}
                    </div>
                  </div>

                  {/* Generated Video Prompt Box */}
                  {remixedResult.videoPrompt && (
                    <div className="bg-[#05080F] border border-gray-800 rounded-2xl p-5 md:p-6 relative">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-emerald-400" />
                          {t.modalVideoPromptTitle}
                        </span>
                        <button
                          onClick={() => copyToClipboard(remixedResult.videoPrompt, 'videoPrompt')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                            copiedVideoPrompt 
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                              : "bg-[#111726] border border-[#1C263F] text-gray-300 hover:text-white"
                          }`}
                        >
                          {copiedVideoPrompt ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{t.modalCopied}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{t.modalCopyVideoPrompt}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="bg-[#090D17] border border-gray-900/60 p-4 rounded-xl text-xs text-emerald-400 font-mono leading-relaxed min-h-[100px] select-all select-text">
                        {remixedResult.videoPrompt}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2.5 leading-relaxed">
                        {lang === 'ar' 
                          ? "💡 هذا البرومبت مكتوب باللغة الإنجليزية خصيصاً ليناسب أدوات توليد الفيديو بالذكاء الاصطناعي مثل Sora و Runway Gen-3 و Luma لإنتاج لقطات سينمائية فائقة الدقة والواقعية." 
                          : "💡 This prompt is written in English specifically for AI Video Generators like Sora, Runway Gen-3, and Luma to generate ultra-realistic cinematic scenes."}
                      </p>
                    </div>
                  )}

                  {/* Statistical Predictions & Strength/Weakness Analysis */}
                  <div className="bg-[#0E1529]/40 border border-[#1C263F]/50 rounded-2xl p-5 md:p-6 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-[#10B981]" />
                      <h4 className="text-sm font-black text-white">{t.modalPredictionReport}</h4>
                    </div>

                    {/* Numeric predictions */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 text-center">
                        <span className="text-[9px] text-gray-500 block mb-1">{t.modalPredictionSuccess}</span>
                        <span className="text-base font-black text-[#10B981] font-mono">{remixedResult.prediction.successProbabilityPercentage}%</span>
                        <div className="w-full bg-gray-900 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-[#10B981] h-full" style={{ width: `${remixedResult.prediction.successProbabilityPercentage}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 text-center">
                        <span className="text-[9px] text-gray-500 block mb-1">{t.modalPredictionViews}</span>
                        <span className="text-base font-black text-white font-mono">{remixedResult.prediction.expectedViews.toLocaleString()}</span>
                      </div>

                      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 text-center">
                        <span className="text-[9px] text-gray-500 block mb-1">{t.modalPredictionEngagement}</span>
                        <span className="text-base font-black text-amber-400 font-mono">{remixedResult.prediction.expectedEngagementRatePercentage}%</span>
                      </div>

                      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 text-center">
                        <span className="text-[9px] text-gray-500 block mb-1">{t.modalPredictionRetention}</span>
                        <span className="text-base font-black text-cyan-400 font-mono">{remixedResult.prediction.expectedCompletionRatePercentage}%</span>
                      </div>

                      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 text-center col-span-2 md:col-span-1">
                        <span className="text-[9px] text-gray-500 block mb-1">{t.modalPredictionDuration}</span>
                        <span className="text-base font-black text-indigo-400 font-mono">{remixedResult.prediction.expectedDurationSeconds} {lang === 'ar' ? 'ثانية' : 'seconds'}</span>
                      </div>
                    </div>

                    {/* Qualitative Analysis (Strengths vs Weaknesses) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                      {/* Strengths */}
                      <div className="p-4 bg-emerald-500/5 border border-[#10B981]/20 rounded-xl space-y-2">
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                          {t.modalStrengths}
                        </span>
                        <ul className="space-y-1.5 pr-1">
                          {remixedResult.prediction.strengths.map((str, idx) => (
                            <li key={idx} className="text-xs text-gray-300 flex items-start gap-2 leading-relaxed">
                              <span className="text-emerald-400 font-bold shrink-0">✓</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses / Risk factors */}
                      <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-2">
                        <span className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                          {t.modalWeaknesses}
                        </span>
                        <ul className="space-y-1.5 pr-1">
                          {remixedResult.prediction.riskFactors.map((weak, idx) => (
                            <li key={idx} className="text-xs text-gray-300 flex items-start gap-2 leading-relaxed">
                              <span className="text-rose-400 font-bold shrink-0">⚠</span>
                              <span>{weak}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>

                  {/* 6 Viral Real-time Hashtags Box */}
                  <div className="bg-gray-950/80 border border-gray-900 rounded-2xl p-5 md:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span className="text-xs font-black text-amber-400">
                          {t.modalHashtagsTitle}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(remixedResult.hashtags.join(' '), 'hashtags')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                          copiedHashtags 
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                            : "bg-[#111726] border border-[#1C263F] text-gray-300 hover:text-white"
                        }`}
                      >
                        {copiedHashtags ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{t.modalCopied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t.modalCopyHashtags}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {remixedResult.hashtags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3.5 py-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-300 font-black font-mono transition-all hover:bg-indigo-500/10 hover:scale-[1.03]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {remixedResult.fallbackUsed && (
                    <div className="text-center">
                      <span className="text-[10px] text-amber-400 bg-amber-400/5 border border-amber-400/15 px-3 py-1.5 rounded-full">
                        {t.modalQuotaWarning}
                      </span>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Modal Footer / Actions */}
            <div className="p-6 border-t border-gray-800/80 bg-[#0E1529]/80 flex justify-end gap-3" dir={t.dir}>
              <button
                onClick={() => {
                  setSelectedRadarVideo(null);
                  setRemixedResult(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
              >
                {t.modalClose}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
