import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, 
  Radio, 
  History, 
  Package, 
  Sliders, 
  Play, 
  Copy, 
  Check, 
  Flame, 
  Terminal, 
  Image as ImageIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap,
  Download,
  Share2,
  Bookmark,
  Sparkles
} from "lucide-react";

interface CinematicaPrimeProps {
  lang: "ar" | "en";
  triggerNotification: (type: "success" | "error" | "info", message: string) => void;
  currentNiche: string;
}

interface Scene {
  time: string;
  voiceover: string;
  image_prompt: string;
  image_base64?: string;
}

interface DominatorPack {
  id: string;
  type: "REELS_ENGINE" | "VIRAL_ATTACK";
  title: string;
  scenes?: Scene[];
  body?: string;
  image_prompt?: string;
  image_base64?: string;
  hashtags: string[];
  sentiment: string;
  framework?: string;
  created_at: string;
}

interface TerminalLog {
  text: string;
  type: "info" | "success" | "error" | "warn";
}

export default function CinematicaPrime({ lang, triggerNotification, currentNiche }: CinematicaPrimeProps) {
  const isAr = lang === "ar";

  // Navigation tab inside Cinematica
  const [innerTab, setInnerTab] = useState<"forge" | "jobs" | "packs" | "console">("forge");

  // Forge Form Inputs
  const [selectedNiche, setSelectedNiche] = useState<string>(currentNiche || "Tech");
  const [engineMode, setEngineMode] = useState<"REELS_ENGINE" | "VIRAL_ATTACK">("REELS_ENGINE");
  const [cinematicStyle, setCinematicStyle] = useState<string>("Cyber-Noir Laboratory with High Contrast Neon");
  const [visualGenerationMode, setVisualGenerationMode] = useState<"LIVE_IMAGE" | "PROMPT_ONLY">("LIVE_IMAGE");

  // Styles presets
  const stylePresets = [
    { value: "Cyber-Noir Laboratory with High Contrast Neon", label: isAr ? "معمل تكنولوجي غامض (Cyber-Noir)" : "Cyber-Noir Tech Lab" },
    { value: "Corporate Premium Office with Amber Ambient Glow", label: isAr ? "مكتب شركات فاخر بإضاءة كهرمانية" : "Corporate Premium Glow" },
    { value: "Cinematic Commercial Epic backlight 8k", label: isAr ? "إعلان تجاري سينمائي ملحمي 8k" : "Cinematic Commercial Epic" },
    { value: "Dark Synthwave Retrowave aesthetic", label: isAr ? "جمالي سيمث ويف ومستقبلي (Synthwave)" : "Dark Synthwave Retro" },
    { value: "Hyper-realistic Modern Workspace", label: isAr ? "مساحة عمل عصرية واقعية للغاية" : "Hyper-realistic Modern Workspace" }
  ];

  // Active Job Polling States
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [jobLogs, setJobLogs] = useState<TerminalLog[]>([]);
  const [jobStatus, setJobStatus] = useState<"idle" | "queued" | "processing" | "done" | "failed">("idle");
  const [pollInterval, setPollInterval] = useState<number>(1500);

  // Completed & Seeded Local State Maps
  const [completedPacks, setCompletedPacks] = useState<DominatorPack[]>([]);
  const [activeJobsList, setActiveJobsList] = useState<{ id: string; niche: string; mode: string; status: string; progress: number }[]>([]);

  // Selected result visualization
  const [latestPack, setLatestPack] = useState<DominatorPack | null>(null);
  const [visualizerTab, setVisualizerTab] = useState<"visual" | "script">("visual");
  const [imageGenPromiseState, setImageGenPromiseState] = useState<"idle" | "pending" | "fulfilled" | "rejected">("idle");
  
  // Audio playback simulator
  const [activePlayingSceneIndex, setActivePlayingSceneIndex] = useState<number | null>(null);
  const [isPlayingScript, setIsPlayingScript] = useState<boolean>(false);

  // Copy success alerts
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Scroll terminal logs to bottom automatically
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [jobLogs]);

  // Keep selectedNiche in sync with App's current profile niche
  useEffect(() => {
    if (currentNiche) {
      setSelectedNiche(currentNiche);
    }
  }, [currentNiche]);

  // Job Status Polling Engine
  useEffect(() => {
    if (!activeJobId) return;

    let timer: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 120; // safe fallback timeout

    const checkJobStatus = async () => {
      try {
        const res = await fetch(`/v1/jobs/${activeJobId}`);
        if (!res.ok) {
          throw new Error("Failed to reach job controller");
        }
        const job = await res.json();

        // Map logs from server to terminal logs
        const mappedLogs = job.logs.map((l: string) => {
          let type: "info" | "success" | "error" | "warn" = "info";
          if (l.includes("✅") || l.includes("complete")) type = "success";
          else if (l.includes("❌") || l.includes("Abort")) type = "error";
          else if (l.includes("⚠️")) type = "warn";
          return { text: l, type };
        });
        setJobLogs(mappedLogs);
        setJobProgress(job.progress);
        setJobStatus(job.status);

        // Update jobs list in state
        setActiveJobsList(prev => {
          const exists = prev.some(j => j.id === activeJobId);
          if (exists) {
            return prev.map(j => j.id === activeJobId ? { ...j, status: job.status, progress: job.progress } : j);
          }
          return [...prev, { id: activeJobId, niche: selectedNiche, mode: engineMode, status: job.status, progress: job.progress }];
        });

        if (job.status === "done" && job.pack_id) {
          // Job complete! Fetch the resulting pack.
          const packRes = await fetch(`/v1/packs/${job.pack_id}`);
          if (packRes.ok) {
            const packData = await packRes.json();
            
            // Map structure
            const newPack: DominatorPack = {
              id: packData.id,
              type: packData.type,
              title: packData.assets.title,
              scenes: packData.type === "REELS_ENGINE" ? packData.assets.scenes : undefined,
              body: packData.type === "VIRAL_ATTACK" ? packData.assets.post : undefined,
              image_prompt: packData.type === "VIRAL_ATTACK" ? packData.assets.visual.prompt : undefined,
              image_base64: packData.type === "VIRAL_ATTACK" ? packData.assets.visual.base64 : undefined,
              hashtags: packData.dominance.hashtags,
              sentiment: packData.genes.sentiment,
              framework: packData.genes.framework,
              created_at: new Date().toISOString()
            };

            setLatestPack(newPack);
            setCompletedPacks(prev => [newPack, ...prev]);
            setActiveJobId(null);
            triggerNotification("success", isAr ? "تم إنجاز تخليق الجينوم السينمائي وتوليد المواد الفايرل!" : "Cinematic Genome synthesis finished successfully!");
          }
        } else if (job.status === "failed") {
          setActiveJobId(null);
          triggerNotification("error", isAr ? "فشلت عملية التخليق بسبب انقطاع الخادم السحابي" : "Synthesis failed due to cloud link disruption");
        } else {
          // Queue next poll
          attempts++;
          if (attempts < maxAttempts) {
            timer = setTimeout(checkJobStatus, pollInterval);
          } else {
            setJobStatus("failed");
            setActiveJobId(null);
            triggerNotification("error", isAr ? "تجاوزت مهلة معالجة الجينوم الوقت المحدد" : "Genome processing request timed out");
          }
        }
      } catch (err: any) {
        console.error("Polling error:", err);
        attempts++;
        if (attempts < maxAttempts) {
          timer = setTimeout(checkJobStatus, pollInterval);
        } else {
          setJobStatus("failed");
          setActiveJobId(null);
          triggerNotification("error", isAr ? "فشل الاتصال مع الخادم وجدولة المهام" : "Failed to establish reliable connection with job controller");
        }
      }
    };

    timer = setTimeout(checkJobStatus, pollInterval);
    return () => clearTimeout(timer);
  }, [activeJobId, pollInterval]);

  // Handle Triggering the Core Synthesis Lab
  const handleLaunchSynthesis = async () => {
    if (activeJobId) {
      triggerNotification("info", isAr ? "هناك عملية تخليق نشطة قيد المعالجة حالياً" : "There is an active synthesis process running currently");
      return;
    }

    setJobProgress(5);
    setJobStatus("queued");
    setJobLogs([
      { text: isAr ? "📌 بدء تحفيز مولد الجينوم السينمائي..." : "📌 Initializing cinematic genome launcher...", type: "info" },
      { text: isAr ? `⚙️ ربط مصفوفة التخصص: [${selectedNiche}] والأسلوب: [${cinematicStyle}]` : `⚙️ Targeting niche: [${selectedNiche}] with style: [${cinematicStyle}]`, type: "info" }
    ]);
    setLatestPack(null);
    setImageGenPromiseState("idle");

    try {
      const res = await fetch("/v1/build-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: selectedNiche,
          mode: engineMode,
          style: cinematicStyle,
          promptOnly: visualGenerationMode === "PROMPT_ONLY"
        })
      });

      if (!res.ok) {
        throw new Error("Failed to initialize backend job");
      }

      const data = await res.json();
      if (data && data.job_id) {
        setActiveJobId(data.job_id);
        triggerNotification("info", isAr ? "تم إرسال المهمة للجينوم.. يرجى تتبع منفذ المعالجة" : "Job submitted successfully! Tracking processing core...");
      } else {
        throw new Error("Invalid job ID received");
      }
    } catch (err: any) {
      setJobStatus("failed");
      setJobLogs(prev => [...prev, { text: `❌ Error launching core process: ${err.message}`, type: "error" }]);
      triggerNotification("error", isAr ? "فشل ربط منفذ التخليق مع السيرفر" : "Failed to establish link with synthesis port");
    }
  };

  // Helper to copy content to clipboard with indicator
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
    triggerNotification("success", isAr ? "تم النسخ بنجاح للحافظة!" : "Copied successfully to clipboard!");
  };

  // Live AI Image Generation from Prompt Input (Direct Promise Tracker)
  const handleGenerateImage = async (prompt: string, aspect_ratio: "16:9" | "9:16", index?: number) => {
    setImageGenPromiseState("pending");
    triggerNotification("info", isAr ? "جاري الاتصال بمولد الصور لتوليد اللوحة الفنية..." : "Connecting to AI image generator...");
    try {
      const res = await fetch("/v1/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          niche: selectedNiche,
          aspect_ratio
        })
      });
      
      if (!res.ok) {
        throw new Error("Failed to generate image from prompt");
      }
      
      const data = await res.json();
      if (data && data.success && data.image_base64) {
        setImageGenPromiseState("fulfilled");
        
        // Update the state of latestPack dynamically
        setLatestPack(prev => {
          if (!prev) return prev;
          if (index !== undefined && prev.type === "REELS_ENGINE" && prev.scenes) {
            const updatedScenes = [...prev.scenes];
            updatedScenes[index] = {
              ...updatedScenes[index],
              image_base64: data.image_base64
            };
            return { ...prev, scenes: updatedScenes };
          } else if (prev.type === "VIRAL_ATTACK") {
            return { ...prev, image_base64: data.image_base64 };
          }
          return prev;
        });
        
        triggerNotification("success", isAr ? "تم توليد الصورة بالكامل وتحديث المعاينة بنجاح!" : "Image generated and visualizer updated successfully!");
      } else {
        throw new Error("No image data returned");
      }
    } catch (err) {
      console.error("Image generation failed:", err);
      setImageGenPromiseState("rejected");
      triggerNotification("error", isAr ? "فشل توليد الصورة الفنية بالذكاء الاصطناعي" : "AI image generation failed");
    }
  };

  // Scene voiceover pacing audio simulator
  const handlePlayScene = (idx: number, voiceover: string) => {
    if (activePlayingSceneIndex === idx) {
      setActivePlayingSceneIndex(null);
      return;
    }
    
    setActivePlayingSceneIndex(idx);
    
    // Use speech synthesis if available and on browser
    const Speech = (window as any).SpeechSynthesisUtterance || (window as any).webkitSpeechSynthesisUtterance;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(voiceover);
      utterance.lang = "ar-SA";
      utterance.rate = 0.95;
      utterance.onend = () => {
        setActivePlayingSceneIndex(null);
      };
      utterance.onerror = () => {
        setActivePlayingSceneIndex(null);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      // simulated timer
      setTimeout(() => {
        setActivePlayingSceneIndex(null);
      }, 4000);
    }
  };

  const renderScenesScriptOnly = (scenes: Scene[]) => {
    return (
      <div className="space-y-4 mt-6">
        {scenes.map((scene, i) => {
          const isPlaying = activePlayingSceneIndex === i;
          return (
            <div 
              key={i}
              className={`p-4 rounded-2xl bg-[#090D1A]/90 border transition-all duration-300 text-right ${
                isPlaying 
                  ? "border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                  : "border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center text-xs font-black font-mono">
                    {i + 1}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono font-bold uppercase tracking-wider">
                    {isAr ? `المشهد ${i+1}` : `Scene ${i+1}`} ({scene.time})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handlePlayScene(i, scene.voiceover)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      isPlaying 
                        ? "bg-[#10B981] text-black border-[#10B981]" 
                        : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleCopyText(scene.voiceover, `vo_script_${i}`)}
                    className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:text-white cursor-pointer"
                    title={isAr ? "نسخ الإلقاء" : "Copy Script"}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-100 font-medium whitespace-pre-wrap">
                {scene.voiceover}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const handlePlayFullScript = (pack: DominatorPack) => {
    if (isPlayingScript) {
      setIsPlayingScript(false);
      window.speechSynthesis?.cancel();
      setActivePlayingSceneIndex(null);
      return;
    }

    if (!pack.scenes || pack.scenes.length === 0) return;
    setIsPlayingScript(true);

    let idx = 0;
    const playNext = () => {
      if (idx >= pack.scenes!.length || !isPlayingScript) {
        setIsPlayingScript(false);
        setActivePlayingSceneIndex(null);
        return;
      }
      
      setActivePlayingSceneIndex(idx);
      const scene = pack.scenes![idx];
      
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(scene.voiceover);
        utterance.lang = "ar-SA";
        utterance.rate = 0.95;
        utterance.onend = () => {
          idx++;
          playNext();
        };
        utterance.onerror = () => {
          setIsPlayingScript(false);
          setActivePlayingSceneIndex(null);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          idx++;
          playNext();
        }, 4000);
      }
    };

    playNext();
  };

  // Render scenes grid
  const renderScenesGrid = (scenes: Scene[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {scenes.map((scene, i) => {
          const isPlaying = activePlayingSceneIndex === i;
          return (
            <div 
              key={i} 
              className={`border rounded-2xl bg-[#090D1A]/95 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 ${
                isPlaying 
                  ? "border-[#10B981] shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-1 ring-[#10B981]" 
                  : "border-white/5 hover:border-[#10B981]/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              }`}
            >
              {/* Scene Frame Aspect Ratio 9:16 vertical */}
              <div className="relative aspect-[9/16] bg-black overflow-hidden flex items-center justify-center border-b border-white/5 group">
                {scene.image_base64 ? (
                  <>
                    <img 
                      src={`data:image/jpeg;base64,${scene.image_base64}`} 
                      alt={`Scene ${i+1}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Hover metadata overlay - fully editable */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-end">
                      <p className="text-[10px] font-mono text-[#10B981] uppercase font-bold mb-1">Edit Visual Prompt</p>
                      <textarea
                        className="w-full text-[10px] text-right bg-black/60 border border-white/10 rounded-lg p-1.5 text-gray-200 font-mono focus:border-[#10B981] focus:outline-none h-16 resize-none"
                        value={scene.image_prompt}
                        dir="ltr"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setLatestPack(prev => {
                            if (!prev || !prev.scenes) return prev;
                            const updatedScenes = [...prev.scenes];
                            updatedScenes[i] = { ...updatedScenes[i], image_prompt: newVal };
                            return { ...prev, scenes: updatedScenes };
                          });
                        }}
                      />
                      <div className="flex gap-1.5 mt-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleGenerateImage(scene.image_prompt, "9:16", i); }}
                          disabled={imageGenPromiseState === "pending"}
                          className="flex-1 py-1 bg-[#10B981] hover:bg-[#12cf91] disabled:opacity-50 text-black text-[9px] font-black rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{imageGenPromiseState === "pending" ? (isAr ? "جاري التوليد" : "Rendering...") : (isAr ? "توليد بالذكاء" : "AI Render")}</span>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopyText(scene.image_prompt, `prompt_${i}`); }}
                          className="py-1 px-2 bg-white/10 hover:bg-white/20 text-white text-[9px] font-bold rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>{copiedStates[`prompt_${i}`] ? (isAr ? "تم!" : "Copied!") : (isAr ? "نسخ" : "Copy")}</span>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#060A14] via-[#0E1528] to-[#060A14] p-5 flex flex-col justify-between text-right">
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-[#10B981] justify-end">
                        <span className="text-[9px] font-black tracking-wider font-mono">PROMPT CORE</span>
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <textarea
                        className="w-full text-xs text-right bg-white/5 border border-white/10 rounded-xl p-2 text-gray-300 font-mono focus:border-[#10B981] focus:outline-none h-24 resize-none"
                        value={scene.image_prompt}
                        dir="ltr"
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setLatestPack(prev => {
                            if (!prev || !prev.scenes) return prev;
                            const updatedScenes = [...prev.scenes];
                            updatedScenes[i] = { ...updatedScenes[i], image_prompt: newVal };
                            return { ...prev, scenes: updatedScenes };
                          });
                        }}
                      />
                    </div>

                    <div className="space-y-2 mt-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleGenerateImage(scene.image_prompt, "9:16", i); }}
                        disabled={imageGenPromiseState === "pending"}
                        className="w-full text-center py-2 bg-[#10B981] hover:bg-[#12cf91] disabled:opacity-50 text-black rounded-xl transition-all font-black flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{imageGenPromiseState === "pending" ? (isAr ? "جاري التوليد..." : "Rendering...") : (isAr ? "توليد الصورة بالذكاء" : "AI Generate Image")}</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopyText(scene.image_prompt, `prompt_${i}`); }}
                        className="w-full text-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 cursor-pointer text-[10px]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedStates[`prompt_${i}`] ? (isAr ? "تم النسخ!" : "Copied!") : (isAr ? "نسخ الموجه البصري" : "Copy Visual Prompt")}</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Overlay details */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold px-3 py-1.5 rounded-full font-mono flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#10B981]" />
                  <span>{scene.time}</span>
                </div>

                <div className="absolute top-3 left-3 bg-[#10B981]/90 text-black text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg font-mono">
                  {i + 1}
                </div>
              </div>

              {/* Text / Voiceover control bar */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-[#10B981]" />
                    {isAr ? "الإلقاء الصوتي" : "Voiceover Script"}
                  </span>
                  <button 
                    onClick={() => handlePlayScene(i, scene.voiceover)}
                    className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isPlaying 
                        ? "bg-[#10B981] text-black border-[#10B981]" 
                        : "bg-white/5 text-gray-300 border-white/10 hover:border-[#10B981]/50 hover:bg-[#10B981]/5"
                    }`}
                  >
                    <Play className={`w-3.5 h-3.5 ${isPlaying ? "animate-pulse" : ""}`} />
                  </button>
                </div>

                <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                  <p className="text-xs leading-relaxed text-right text-gray-200 font-medium">
                    {scene.voiceover}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={() => handleCopyText(scene.voiceover, `vo_${i}`)}
                    className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedStates[`vo_${i}`] ? (isAr ? "تم" : "Copied") : (isAr ? "نسخ الإلقاء" : "Copy Script")}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8 bg-transparent" dir={isAr ? "rtl" : "ltr"}>
      
      {/* Top Controller Status Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-[#0A1021]/80 backdrop-blur-md rounded-2xl border border-white/5 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-1.5 font-sans">
              <Cpu className="w-4 h-4 text-[#10B981]" />
              {isAr ? "الذكاء التكتيكي للانتشار | CINEMATICA PRIME" : "Tactical Virality Core | CINEMATICA PRIME"}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
              {isAr ? "الاتصال: نشط • بروتوكول الجينوم V3" : "Link: Online • Genome V3 Protocol"}
            </p>
          </div>
        </div>

        {/* Cinematica Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={() => setInnerTab("forge")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              innerTab === "forge" 
                ? "bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20" 
                : "bg-[#10162A] text-gray-400 border border-white/5 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "مختبر التخليق" : "Synthesis Forge"}</span>
          </button>

          <button 
            onClick={() => setInnerTab("jobs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              innerTab === "jobs" 
                ? "bg-[#10B981] text-black shadow-lg" 
                : "bg-[#10162A] text-gray-400 border border-white/5 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{isAr ? "الوظائف النشطة" : "Active Jobs"} ({activeJobsList.length})</span>
          </button>

          <button 
            onClick={() => setInnerTab("packs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              innerTab === "packs" 
                ? "bg-[#10B981] text-black shadow-lg" 
                : "bg-[#10162A] text-gray-400 border border-white/5 hover:text-white"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{isAr ? "حزم الجينوم المنجزة" : "Seeded Content Packs"} ({completedPacks.length})</span>
          </button>

          <button 
            onClick={() => setInnerTab("console")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              innerTab === "console" 
                ? "bg-[#10B981] text-black shadow-lg" 
                : "bg-[#10162A] text-gray-400 border border-white/5 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? "منصة التحكم" : "Console Settings"}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace based on selected innerTab */}
      {innerTab === "forge" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form Parameters & Terminal Column */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Forge Panel */}
            <div className="border border-white/5 rounded-3xl bg-[#090D1A]/90 p-6 shadow-2xl space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-black text-white flex items-center gap-2 font-sans">
                  <Cpu className="w-5 h-5 text-[#10B981]" />
                  {isAr ? "محدد معايير التخليق" : "Synthesis Parameters"}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {isAr ? "حدد معايير المحتوى والسيناريو لتقوم شبكة الانتشار السحابية بتخلق موادك التكتيكية الفايرل فوراً." : "Select the target niche, format and aesthetic engine to synthesize viral content models."}
                </p>
              </div>

              <div className="space-y-4">
                {/* Niche selector */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">
                    {isAr ? "النيش أو موضوع التخليق المستهدف" : "Target Niche or Topic"}
                  </label>
                  <input
                    type="text"
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    placeholder={isAr ? "اكتب نيش أو موضوع مخصص (مثال: الذكاء الاصطناعي، تداول الأسهم، ريادة أعمال...)" : "Enter custom niche (e.g., Trading, Artificial Intelligence, Business...)"}
                    className="w-full bg-[#0E1528] border border-white/5 rounded-xl p-3 text-xs text-white focus:border-[#10B981] outline-none font-medium placeholder-gray-600 transition-all duration-200"
                  />
                  {/* Quick Preset Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {[
                      { value: "Tech", label: isAr ? "تقنية" : "Tech" },
                      { value: "Business", label: isAr ? "بزنس" : "Business" },
                      { value: "Fitness", label: isAr ? "رياضة وصحة" : "Fitness" },
                      { value: "Lifestyle", label: isAr ? "تطوير ذات" : "Lifestyle" },
                      { value: "Cooking", label: isAr ? "طبخ ووصفات" : "Cooking" }
                    ].map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setSelectedNiche(p.value)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all duration-150 cursor-pointer font-medium ${
                          selectedNiche === p.value
                            ? "bg-[#10B981]/10 border-[#10B981] text-[#10B981]"
                            : "bg-[#0A0D1A] border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Engine Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">{isAr ? "قناة الانتشار وحجم المواد" : "Engine Delivery Format"}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEngineMode("REELS_ENGINE")}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        engineMode === "REELS_ENGINE"
                          ? "bg-[#10B981]/10 border-[#10B981] text-[#10B981] shadow-md shadow-[#10B981]/5"
                          : "bg-[#0E1528] border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>{isAr ? "محرر ريلز (3 مشاهد • 9:16)" : "Reels Engine (3 Scenes)"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEngineMode("VIRAL_ATTACK")}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        engineMode === "VIRAL_ATTACK"
                          ? "bg-[#10B981]/10 border-[#10B981] text-[#10B981] shadow-md shadow-[#10B981]/5"
                          : "bg-[#0E1528] border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Flame className="w-4 h-4" />
                      <span>{isAr ? "منشور فيروسي (16:9)" : "Viral Post (Widescreen)"}</span>
                    </button>
                  </div>
                </div>

                {/* Visual Generation Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">
                    {isAr ? "نوع التخليق البصري للمشاهد" : "Visual Synthesis Mode"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVisualGenerationMode("LIVE_IMAGE")}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        visualGenerationMode === "LIVE_IMAGE"
                          ? "bg-[#10B981]/10 border-[#10B981] text-[#10B981] shadow-md shadow-[#10B981]/5"
                          : "bg-[#0E1528] border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <div className="flex flex-col items-center text-center">
                        <span>{isAr ? "تخليق وتوليد الصور حية" : "Render Live Images"}</span>
                        <span className="text-[9px] font-medium text-gray-500 mt-0.5">
                          {isAr ? "رسم الصور وعرضها مباشرة" : "Generate directly using AI"}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisualGenerationMode("PROMPT_ONLY")}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        visualGenerationMode === "PROMPT_ONLY"
                          ? "bg-[#10B981]/10 border-[#10B981] text-[#10B981] shadow-md shadow-[#10B981]/5"
                          : "bg-[#0E1528] border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <div className="flex flex-col items-center text-center">
                        <span>{isAr ? "برومبت دقيق احترافي فقط" : "Detailed Prompt Only"}</span>
                        <span className="text-[9px] font-medium text-gray-500 mt-0.5">
                          {isAr ? "توليد نص وصفي فائق الجودة" : "Optimized prompt for copying"}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Cinematic style preset selector */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">{isAr ? "الأسلوب الجمالي والسينمائي للرسم" : "Visual Aesthetic & Cinema Style"}</label>
                  <select
                    value={cinematicStyle}
                    onChange={(e) => setCinematicStyle(e.target.value)}
                    className="w-full bg-[#0E1528] border border-white/5 rounded-xl p-3 text-xs text-white focus:border-[#10B981] outline-none font-medium cursor-pointer"
                  >
                    {stylePresets.map((style) => (
                      <option key={style.value} value={style.value}>{style.label}</option>
                    ))}
                  </select>
                </div>

                {/* Synthesis Trigger Button */}
                <button
                  onClick={handleLaunchSynthesis}
                  disabled={jobStatus === "queued" || jobStatus === "processing"}
                  className="w-full bg-gradient-to-r from-[#10B981] to-emerald-400 hover:from-[#12cf91] hover:to-emerald-300 text-black font-black p-4 rounded-xl shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs font-sans disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {jobStatus === "queued" || jobStatus === "processing" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>{isAr ? `جاري تخليق المواد والجينوم... (${jobProgress}%)` : `Synthesizing Visuals & Scripts... (${jobProgress}%)`}</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4 text-black" />
                      <span>{isAr ? "تخليق المواد والجينوم الفايرل • Run Synthesis" : "Launch Intelligence Synthesis Engine"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Terminal Log Output Module */}
            <div className="border border-white/5 rounded-3xl bg-[#030610] p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-gray-400 font-mono flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#10B981]" />
                  {isAr ? "منفذ التحكم وتتبع المعالجة" : "Intelligence Terminal Log"}
                </span>
                <span className="text-[10px] text-gray-500 font-mono bg-white/2 px-2 py-0.5 rounded border border-white/5">
                  stdout
                </span>
              </div>

              {/* Terminal Logs Viewbox */}
              <div className="h-[220px] overflow-y-auto space-y-2.5 font-mono text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-white/10 pr-2">
                {jobLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-600 text-center text-xs">
                    <p>{isAr ? "اضغط على زر التخليق بالأعلى لمراقبة مخرجات السيرفر حية" : "Start synthesis to monitor real-time background outputs"}</p>
                  </div>
                ) : (
                  jobLogs.map((log, i) => (
                    <div 
                      key={i} 
                      className={`text-right ${
                        log.type === "success" 
                          ? "text-emerald-400" 
                          : log.type === "error" 
                          ? "text-rose-400 font-bold" 
                          : log.type === "warn" 
                          ? "text-amber-400" 
                          : "text-gray-300"
                      }`}
                      dir="rtl"
                    >
                      <span className="text-gray-600 ml-1.5 font-mono">[{new Date().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour12: false })}]</span>
                      {log.text}
                    </div>
                  ))
                )}
                <div ref={terminalEndRef} />
              </div>

              {/* Progress bar */}
              {(jobStatus === "queued" || jobStatus === "processing") && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                    <span>{jobProgress}%</span>
                    <span>{isAr ? "بروتوكول المعالجة السحابية" : "Cloud core syncing"}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#10B981] to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                      style={{ width: `${jobProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Results Visualizer Column */}
          <div className="lg:col-span-7">
            
            {latestPack ? (
              <div className="border border-[#10B981]/20 rounded-3xl bg-[#090D1A]/95 p-6 shadow-2xl space-y-6">
                
                {/* Visualizer header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-5 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider font-mono">
                      {latestPack.type === "REELS_ENGINE" ? (isAr ? " ريلز / Reels" : "Short Reels Storyboard") : (isAr ? " منشور فيروسي / Viral Post" : "Viral Copywriting Widescreen")}
                    </span>
                    <h3 className="text-lg font-black text-white mt-1.5 leading-relaxed font-sans text-right">
                      {latestPack.title}
                    </h3>
                  </div>

                  {/* Actions for the visualizer */}
                  <div className="flex gap-2">
                    {latestPack.type === "REELS_ENGINE" && (
                      <button 
                        onClick={() => handlePlayFullScript(latestPack)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                          isPlayingScript 
                            ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/10" 
                            : "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20 hover:bg-[#10B981] hover:text-black"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{isPlayingScript ? (isAr ? "إيقاف السكربت" : "Stop Playback") : (isAr ? "تشغيل السكربت كاملاً" : "Play Full Script")}</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleCopyText(latestPack.type === "REELS_ENGINE" ? latestPack.scenes!.map((s,i) => `المشهد ${i+1} (${s.time}):\n${s.voiceover}`).join("\n\n") : latestPack.body!, "full_pack")}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 text-gray-300 hover:text-white border border-white/5 hover:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedStates["full_pack"] ? (isAr ? "تم!" : "Copied!") : (isAr ? "نسخ المادة" : "Copy Content")}</span>
                    </button>
                  </div>
                </div>

                {/* Sub Metadata parameters panel */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/2 p-4 rounded-2xl border border-white/5">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">{isAr ? "معدل الحماس والنبض" : "Tone & Sentiment"}</p>
                    <p className="text-xs font-bold text-[#10B981] mt-0.5">{latestPack.sentiment}</p>
                  </div>
                  {latestPack.framework && (
                    <div className="text-right border-r border-white/5 pr-3">
                      <p className="text-[10px] text-gray-500">{isAr ? "الهيكل الإقناعي" : "Copywriting Framework"}</p>
                      <p className="text-xs font-bold text-white mt-0.5">{latestPack.framework}</p>
                    </div>
                  )}
                  <div className="text-right border-r border-white/5 pr-3 col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-gray-500">{isAr ? "حجم مصفوفة الهاشتاجات" : "Dominance Hashtags"}</p>
                    <p className="text-xs font-bold text-gray-400 mt-0.5 font-mono">8 Tags Seeded</p>
                  </div>
                </div>

                {/* Interactive View Filter Tabs */}
                <div className="flex border-b border-white/5 pb-2 pt-1 gap-4 justify-start">
                  <button
                    onClick={() => setVisualizerTab("visual")}
                    id="tab-visual"
                    className={`flex items-center gap-2 pb-2 text-xs font-bold transition-all relative cursor-pointer ${
                      visualizerTab === "visual"
                        ? "text-[#10B981] font-black border-b-2 border-[#10B981]"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{isAr ? "البصريات وتوليد الصور (Visual)" : "Visual & Artwork"}</span>
                    
                    {/* Status Dot */}
                    <span 
                      className={`w-2.5 h-2.5 rounded-full inline-block animate-pulse ml-1 ${
                        imageGenPromiseState === "pending"
                          ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse"
                          : imageGenPromiseState === "fulfilled"
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                          : imageGenPromiseState === "rejected"
                          ? "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                          : latestPack ? (
                            (latestPack.type === "REELS_ENGINE" 
                              ? (latestPack.scenes && latestPack.scenes.length > 0 && latestPack.scenes.some(s => s.image_base64)) 
                              : !!latestPack.image_base64)
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" 
                            : "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                          ) : "bg-gray-500"
                      }`}
                      title={
                        imageGenPromiseState === "pending"
                          ? (isAr ? "جاري توليد الصورة بالذكاء الاصطناعي..." : "Generating AI image...")
                          : imageGenPromiseState === "fulfilled"
                          ? (isAr ? "تم توليد الصورة بنجاح" : "Image generated successfully")
                          : imageGenPromiseState === "rejected"
                          ? (isAr ? "فشل توليد الصورة" : "Image generation failed")
                          : latestPack ? (
                            (latestPack.type === "REELS_ENGINE" 
                              ? (latestPack.scenes && latestPack.scenes.length > 0 && latestPack.scenes.some(s => s.image_base64)) 
                              : !!latestPack.image_base64)
                            ? (isAr ? "اكتمل توليد الصور بنجاح" : "Images generated successfully") 
                            : (isAr ? "لم يتم توليد أي صور" : "No images generated")
                          ) : ""
                      }
                    />
                  </button>

                  <button
                    onClick={() => setVisualizerTab("script")}
                    className={`flex items-center gap-2 pb-2 text-xs font-bold transition-all relative cursor-pointer ${
                      visualizerTab === "script"
                        ? "text-[#10B981] font-black border-b-2 border-[#10B981]"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{isAr ? "النصوص والاسكربت" : "Script & Texts"}</span>
                  </button>
                </div>

                {/* Main Content Render area */}
                {visualizerTab === "visual" ? (
                  latestPack.type === "REELS_ENGINE" ? (
                    // Reels grid view
                    renderScenesGrid(latestPack.scenes || [])
                  ) : (
                    // Viral post widescreen view
                    <div className="space-y-6 animate-fade-in">
                      {/* Featured Image aspect ratio 16:9 widescreen */}
                      <div className="relative aspect-video bg-black overflow-hidden rounded-2xl border border-white/5 group">
                        {latestPack.image_base64 ? (
                          <>
                            <img 
                              src={`data:image/jpeg;base64,${latestPack.image_base64}`} 
                              alt="Featured artwork" 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold px-3 py-1 rounded-full text-[#10B981] font-mono">
                              16:9 Widescreen
                            </div>

                            {/* Overlay image prompt details - fully editable */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-end">
                              <p className="text-[10px] font-mono text-[#10B981] uppercase font-bold mb-1.5">Edit Visual Prompt</p>
                              <textarea
                                className="w-full text-xs text-right bg-black/60 border border-white/10 rounded-xl p-2 text-gray-200 font-mono focus:border-[#10B981] focus:outline-none h-16 resize-none"
                                value={latestPack.image_prompt || ""}
                                dir="ltr"
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setLatestPack(prev => {
                                    if (!prev) return prev;
                                    return { ...prev, image_prompt: newVal };
                                  });
                                }}
                              />
                              <div className="flex gap-2 mt-3 justify-end">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleGenerateImage(latestPack.image_prompt || "", "16:9"); }}
                                  disabled={imageGenPromiseState === "pending"}
                                  className="px-4 py-1.5 bg-[#10B981] hover:bg-[#12cf91] disabled:opacity-50 text-black text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>{imageGenPromiseState === "pending" ? (isAr ? "جاري التوليد..." : "Rendering...") : (isAr ? "أعد توليد اللوحة" : "Regenerate Artwork")}</span>
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleCopyText(latestPack.image_prompt || "", "post_prompt"); }}
                                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>{copiedStates["post_prompt"] ? (isAr ? "تم!" : "Copied!") : (isAr ? "نسخ" : "Copy")}</span>
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#060A14] via-[#0E1528] to-[#060A14] p-6 flex flex-col justify-between text-right">
                            <div className="space-y-3">
                              <div className="flex items-center gap-1.5 text-[#10B981] justify-end">
                                <span className="text-[10px] font-black tracking-wider font-mono">PROMPT CORE (16:9)</span>
                                <Sparkles className="w-3.5 h-3.5" />
                              </div>
                              <textarea
                                className="w-full text-xs text-right bg-white/5 border border-white/10 rounded-xl p-3 text-gray-300 font-mono focus:border-[#10B981] focus:outline-none h-24 resize-none"
                                value={latestPack.image_prompt || ""}
                                dir="ltr"
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setLatestPack(prev => {
                                    if (!prev) return prev;
                                    return { ...prev, image_prompt: newVal };
                                  });
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <p className="text-[10px] text-gray-500 font-medium">
                                {isAr ? "برومبت دقيق جاهز للتوليد الخارجي" : "Prompt optimized for Flux/Midjourney"}
                              </p>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleGenerateImage(latestPack.image_prompt || "", "16:9")}
                                  disabled={imageGenPromiseState === "pending"}
                                  className="px-4 py-2 bg-[#10B981] hover:bg-[#12cf91] disabled:opacity-50 text-black rounded-xl transition-all font-black flex items-center gap-1.5 cursor-pointer text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>{imageGenPromiseState === "pending" ? (isAr ? "جاري التوليد..." : "Rendering...") : (isAr ? "توليد الصورة بالذكاء الاصطناعي" : "AI Generate Image")}</span>
                                </button>
                                <button 
                                  onClick={() => handleCopyText(latestPack.image_prompt || "", "post_prompt")}
                                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl transition-all font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>{copiedStates["post_prompt"] ? (isAr ? "تم!" : "Copied!") : (isAr ? "نسخ الموجه" : "Copy Prompt")}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info message */}
                      <p className="text-[11px] text-gray-400 leading-relaxed text-right">
                        {isAr 
                          ? "💡 يعرض تبويب البصريات الأعمال الفنية المولدة للمشاهد وموجهاتها. يمكنك الانتقال لتبويب النصوص والاسكربت لعرض تفاصيل الإلقاء والتحضير." 
                          : "💡 Visual tab showcases generated artworks and visual prompts. You can switch to Script & Texts tab to focus purely on the text copy and audio voiceover."}
                      </p>
                    </div>
                  )
                ) : (
                  // Script & text-only view
                  latestPack.type === "REELS_ENGINE" ? (
                    renderScenesScriptOnly(latestPack.scenes || [])
                  ) : (
                    <div className="space-y-4 text-right animate-fade-in">
                      <div className="p-5 bg-white/2 border border-white/5 rounded-2xl">
                        <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-[#10B981]" />
                            {isAr ? "نص الإقناع الفيروسي الكامل" : "Full Viral Persuasion Copy"}
                          </span>
                          <button 
                            onClick={() => handleCopyText(latestPack.body || "", "post_body")}
                            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:text-white cursor-pointer"
                            title={isAr ? "نسخ النص" : "Copy Text"}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
                          {latestPack.body}
                        </p>
                      </div>
                    </div>
                  )
                )}

                {/* Hashtags display section */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#10B981]" />
                    {isAr ? "مصفوفة الهاشتاجات لمضاعفة الرواج" : "Algorithmic Hashtags Matrix"}
                  </span>
                  <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
                    {latestPack.hashtags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="text-xs bg-[#10B981]/5 text-[#10B981] border border-[#10B981]/15 px-3 py-1.5 rounded-xl font-mono hover:bg-[#10B981]/10 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                    <button 
                      onClick={() => handleCopyText(latestPack.hashtags.join(" "), "tags")}
                      className="text-xs bg-white/5 text-gray-400 border border-white/5 hover:text-white px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedStates["tags"] ? (isAr ? "تم!" : "Copied!") : (isAr ? "نسخ الكل" : "Copy All")}</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              // Empty / Standby visualizer state
              <div className="h-full flex flex-col justify-center items-center border border-dashed border-white/10 rounded-3xl bg-white/1 p-12 text-center text-gray-500 space-y-4 min-h-[480px]">
                <Cpu className="w-16 h-16 text-gray-700 animate-pulse" />
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-black text-white font-sans">{isAr ? "بانتظار تخليق الجينوم" : "Awaiting Genome Synthesis"}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isAr ? "حدد معايير التخليق في العمود الأيسر وانقر على زر تخليق المواد لتوليد المشاهد السينمائية والسكريبتات حية 100%." : "Choose parameters and run synthesis to view the dynamic scenes and scripts generated by AI."}
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* View list of active jobs */}
      {innerTab === "jobs" && (
        <div className="border border-white/5 rounded-3xl bg-[#090D1A]/90 p-6 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-black text-white flex items-center gap-2 font-sans">
              <History className="w-5 h-5 text-[#10B981]" />
              {isAr ? "سجل منفذ العمليات النشطة" : "Active Core Job Scheduler"}
            </h3>
            <p className="text-xs text-gray-400">
              {isAr ? "تتبع المهام التي تجري في السيرفر حالياً ومستوى تقدم تخليق الصور المجدولة." : "Track state machines and processing pipelines executing asynchronous video renderings on the host."}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs" dir={isAr ? "rtl" : "ltr"}>
              <thead>
                <tr className="border-b border-white/5 text-gray-400">
                  <th className="pb-3 pt-1 px-4">{isAr ? "معرف الوظيفة" : "Job ID"}</th>
                  <th className="pb-3 pt-1 px-4">{isAr ? "التخصص" : "Target Niche"}</th>
                  <th className="pb-3 pt-1 px-4">{isAr ? "النوع" : "Format"}</th>
                  <th className="pb-3 pt-1 px-4">{isAr ? "الحالة" : "Pipeline Status"}</th>
                  <th className="pb-3 pt-1 px-4">{isAr ? "التقدم" : "Execution Rate"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeJobsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      {isAr ? "لا توجد أي وظائف مسجلة في قائمة الانتظار حالياً" : "No active jobs registered in the scheduling queue currently"}
                    </td>
                  </tr>
                ) : (
                  activeJobsList.map((job) => (
                    <tr key={job.id} className="hover:bg-white/1 transition-colors">
                      <td className="py-4 px-4 font-mono text-gray-400">{job.id}</td>
                      <td className="py-4 px-4 font-bold text-white">{job.niche}</td>
                      <td className="py-4 px-4 text-gray-300 font-mono text-[10px]">{job.mode}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          job.status === "done" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : job.status === "failed"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse"
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-gray-300">{job.progress}%</span>
                          <div className="w-16 bg-white/5 rounded-full h-1 overflow-hidden">
                            <div className="bg-[#10B981] h-full" style={{ width: `${job.progress}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View completed content packs */}
      {innerTab === "packs" && (
        <div className="space-y-6">
          <div className="border border-white/5 rounded-3xl bg-[#090D1A]/90 p-6 shadow-2xl space-y-2">
            <h3 className="text-base font-black text-white flex items-center gap-2 font-sans">
              <Package className="w-5 h-5 text-[#10B981]" />
              {isAr ? "مخزن حزم المحتوى المخلقة والمنجزة" : "Completed Content Packs Repository"}
            </h3>
            <p className="text-xs text-gray-400">
              {isAr ? "استعرض كافة الحزم الفايرل التي تم إنشاؤها عبر الذكاء الاصطناعي ومصفوفات الفايرل لتسخيرها مباشرة في قنواتك." : "Examine all fully compiled viral blueprints generated in previous sessions of Cinematica Prime."}
            </p>
          </div>

          {completedPacks.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-3xl bg-white/1 p-12 text-center text-gray-500 space-y-3">
              <Package className="w-12 h-12 mx-auto animate-pulse text-gray-700" />
              <p className="text-xs">{isAr ? "لا توجد أي حزم محتوى منجزة مخزنة حالياً" : "No content packs synthesized in memory yet"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedPacks.map((pack) => (
                <div 
                  key={pack.id} 
                  onClick={() => setLatestPack(pack)}
                  className="border border-white/5 bg-[#090D1A]/95 p-5 rounded-2xl hover:border-[#10B981]/40 transition-all duration-300 cursor-pointer space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] bg-white/5 border border-white/10 text-gray-300 px-2.5 py-1 rounded-full font-mono">
                      {pack.type}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(pack.created_at).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white text-right leading-relaxed font-sans">{pack.title}</h4>

                  <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2">
                    <span className="text-[#10B981] font-bold">{pack.sentiment}</span>
                    <span className="hover:underline text-[#10B981] font-bold flex items-center gap-1">
                      {isAr ? "عرض المواد التفصيلية ←" : "View Details ←"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Advanced configuration settings panel */}
      {innerTab === "console" && (
        <div className="border border-white/5 rounded-3xl bg-[#090D1A]/90 p-6 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-black text-white flex items-center gap-2 font-sans">
              <Sliders className="w-5 h-5 text-[#10B981]" />
              {isAr ? "معايير منفذ المحاكاة ومتحكم الـ API" : "Cinematica Advanced Console Settings"}
            </h3>
            <p className="text-xs text-gray-400">
              {isAr ? "تعديل إعدادات التكرار والتحليل التكتيكي للاتصال بالذكاء السحابي الموحد." : "Adjust system loop parameters, polling intervals and diagnostic metrics of the core."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 bg-white/2 border border-white/5 rounded-2xl">
              <h4 className="text-xs font-bold text-[#10B981]">{isAr ? "إعدادات تتبع المعالجة (Polling Control)" : "Asynchronous Thread Polling"}</h4>
              
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">{isAr ? "معدل تحديث فحص السيرفر (ميلي ثانية)" : "Poll Interval Delay (ms)"}</label>
                <input 
                  type="number" 
                  value={pollInterval}
                  onChange={(e) => setPollInterval(Number(e.target.value))}
                  className="bg-[#0E1528] border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-[11px] text-gray-400 leading-relaxed">
                {isAr ? "تحديد تأخير فحص الوظائف يقلل تكرار طلب الكوتا ويمنع وصول الخادم لحدود القيد ويحمي الاتصال." : "Setting the polling interval prevents API quota threshold saturation on free tier models."}
              </div>
            </div>

            <div className="space-y-4 p-4 bg-white/2 border border-white/5 rounded-2xl">
              <h4 className="text-xs font-bold text-amber-400">{isAr ? "الحصانة التكتيكية ومحاكاة الجينوم" : "Failsafe Redundant Channel"}</h4>
              
              <div className="p-3 bg-[#10B981]/5 border border-[#10B981]/15 rounded-xl text-xs text-gray-300 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span className="font-bold text-white">{isAr ? "الحماية الذاتية نشطة" : "Active Failsafe Channel"}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {isAr ? "في حال تم رصد كوتا مفرغة أو انقطاع في مفتاح Gemini، يقوم النظام فوراً بتوجيه طلبك إلى المحاكاة عالية الدقة وتوليد صور Flux الفاخرة لضمان استمرارية تشغيل برنامجك بنسبة 100% بدون أي أخطاء." : "If the model experiences rate limiting or permission blocks, a backup high-fidelity generator runs seamlessly to keep the pipeline 100% alive."}
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setCompletedPacks([]);
                    setActiveJobsList([]);
                    setLatestPack(null);
                    triggerNotification("success", isAr ? "تم مسح الذاكرة المؤقتة للتخليق بنجاح" : "Synthesis cache cleared successfully");
                  }}
                  className="w-full bg-rose-500/10 text-rose-400 border border-rose-500/15 font-bold py-2 px-4 rounded-xl text-xs hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? "مسح ذاكرة التخليق" : "Reset Console Cache"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
