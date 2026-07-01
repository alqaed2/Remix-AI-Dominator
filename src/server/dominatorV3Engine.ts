import { GoogleGenAI, Type } from "@google/genai";
import { db } from "./db";

// Types matching the Python app.py schemas
export interface Scene {
  time: string;
  voiceover: string;
  image_prompt: string;
  image_base64?: string;
}

export interface ReelsPack {
  title: string;
  scenes: Scene[];
  hashtags: string[];
  sentiment: string;
}

export interface ViralAttackPack {
  title: string;
  body: string;
  image_prompt: string;
  image_base64?: string;
  hashtags: string[];
  framework: string;
  sentiment: string;
}

export type DominatorPack = ReelsPack | ViralAttackPack;

// In-Memory Database for Jobs & Packs to support full asynchronous polling
export interface Job {
  id: string;
  status: "queued" | "processing" | "done" | "failed";
  error?: string;
  pack_id?: string;
  progress: number; // 0 to 100
  logs: string[];
  created_at: string;
}

const jobs: Record<string, Job> = {};
const packs: Record<string, { id: string; type: "REELS_ENGINE" | "VIRAL_ATTACK"; data: DominatorPack; created_at: string }> = {};

// Helper to get Gemini Client with lazy initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
      console.log("[Strategic Core] GEMINI_API_KEY placeholder or missing. Utilizing high-fidelity simulation engine.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-dominator',
        }
      }
    });
  }
  return aiClient;
}

function getFallbackSvgBase64(prompt: string, aspect_ratio: "16:9" | "9:16" = "16:9"): string {
  const width = aspect_ratio === "16:9" ? 1280 : 720;
  const height = aspect_ratio === "16:9" ? 720 : 1280;
  
  const escapedPrompt = prompt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  const shortPrompt = escapedPrompt.length > 100 ? escapedPrompt.substring(0, 100) + "..." : escapedPrompt;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#060A16" />
      <stop offset="50%" stop-color="#0E172E" />
      <stop offset="100%" stop-color="#040710" />
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#6366F1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <circle cx="${width/2}" cy="${height/2}" r="${width * 0.3}" stroke="url(#glow)" stroke-width="2" fill="none" opacity="0.12" />
  <circle cx="${width/2}" cy="${height/2}" r="${width * 0.2}" stroke="#10B981" stroke-width="1" fill="none" opacity="0.15" stroke-dasharray="10, 5" />
  
  <path d="M 40,40 L 80,40 M 40,40 L 40,80" stroke="#10B981" stroke-width="2" fill="none" opacity="0.7" />
  <path d="M ${width - 40},40 L ${width - 80},40 M ${width - 40},40 L ${width - 40},80" stroke="#10B981" stroke-width="2" fill="none" opacity="0.7" />
  <path d="M 40,${height - 40} L 80,${height - 40} M 40,${height - 40} L 40,${height - 80}" stroke="#10B981" stroke-width="2" fill="none" opacity="0.7" />
  <path d="M ${width - 40},${height - 40} L ${width - 80},${height - 40} M ${width - 40},${height - 40} L ${width - 40},${height - 80}" stroke="#10B981" stroke-width="2" fill="none" opacity="0.7" />

  <g transform="translate(${width/2}, ${height/2 - 40})" text-anchor="middle">
    <text y="-30" fill="#10B981" font-family="monospace" font-size="18" font-weight="bold" letter-spacing="4">DOMINATOR V3</text>
    <text y="0" fill="#ffffff" font-family="monospace" font-size="11" opacity="0.5" letter-spacing="2">INTELLIGENCE CINEMA PORT</text>
    <text y="60" fill="#a5b4fc" font-family="sans-serif" font-size="12" font-style="italic" opacity="0.8" width="${width - 100}">${shortPrompt}</text>
  </g>
</svg>`;

  return Buffer.from(svg).toString("base64");
}

// Generate image using Pollinations AI (Flux model or fast Turbo backup) and convert to base64
export async function fetchImageAsBase64(prompt: string, niche: string, aspect_ratio: "16:9" | "9:16" = "16:9"): Promise<string> {
  const maxAttempts = 2;
  const cleanedPrompt = prompt.replace(/[^\w\s\u0600-\u06FF,.-]/gi, '');
  const forcedPrompt = encodeURIComponent(`${niche} masterpiece, ${cleanedPrompt}, cinematic lighting, 8k, hyper-realistic, --no text`);
  const width = aspect_ratio === "16:9" ? 1280 : 720;
  const height = aspect_ratio === "16:9" ? 720 : 1280;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const seed = Math.floor(Math.random() * 999999999);
      // Attempt 1 uses premium Flux model, Attempt 2 uses ultra-fast turbo fallback
      const modelParam = attempt === 1 ? "model=flux" : "model=turbo";
      const url = `https://image.pollinations.ai/prompt/${forcedPrompt}?${modelParam}&width=${width}&height=${height}&nologo=true&seed=${seed}`;

      console.log(`[Strategic Core] Fetching image from Pollinations AI (Attempt ${attempt}/${maxAttempts}): width=${width}, height=${height}`);
      const timeoutMs = attempt === 1 ? 12000 : 8000;
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        return Buffer.from(buffer).toString("base64");
      }
      console.warn(`[Strategic Core] Pollinations AI attempt ${attempt} returned status: ${res.status}`);
    } catch (error) {
      console.warn(`[Strategic Core] Pollinations AI image generation attempt ${attempt} failed/timed out:`, error);
    }
  }
  // Return a stunning themed vector SVG placeholder instead of empty string
  return getFallbackSvgBase64(prompt, aspect_ratio);
}

// Strategic AI Core generator
export function getDynamicFallback(
  niche: string,
  mode: "REELS_ENGINE" | "VIRAL_ATTACK",
  style: string
): DominatorPack {
  const isAr = /[\u0600-\u06FF]/.test(niche); // Detect if niche input is Arabic
  
  // Normalize/detect niche category
  let category: "tech" | "business" | "fitness" | "cooking" | "lifestyle" | "custom" = "custom";
  const lowerNiche = niche.toLowerCase();
  
  if (lowerNiche.includes("tech") || lowerNiche.includes("برمج") || lowerNiche.includes("كود") || lowerNiche.includes("ذكاء") || lowerNiche.includes("تقن") || lowerNiche.includes("software") || lowerNiche.includes("code") || lowerNiche.includes("ai")) {
    category = "tech";
  } else if (lowerNiche.includes("busin") || lowerNiche.includes("مال") || lowerNiche.includes("تجار") || lowerNiche.includes("ماركت") || lowerNiche.includes("تسويق") || lowerNiche.includes("أرباح") || lowerNiche.includes("finance") || lowerNiche.includes("market") || lowerNiche.includes("sales")) {
    category = "business";
  } else if (lowerNiche.includes("fit") || lowerNiche.includes("رياض") || lowerNiche.includes("جيم") || lowerNiche.includes("صحة") || lowerNiche.includes("diet") || lowerNiche.includes("health") || lowerNiche.includes("gym")) {
    category = "fitness";
  } else if (lowerNiche.includes("cook") || lowerNiche.includes("طبخ") || lowerNiche.includes("أكل") || lowerNiche.includes("شيف") || lowerNiche.includes("food") || lowerNiche.includes("recipe") || lowerNiche.includes("kitchen")) {
    category = "cooking";
  } else if (lowerNiche.includes("life") || lowerNiche.includes("ذات") || lowerNiche.includes("يوم") || lowerNiche.includes("motivation") || lowerNiche.includes("mindset") || lowerNiche.includes("عادات") || lowerNiche.includes("طاقة")) {
    category = "lifestyle";
  }

  if (mode === "REELS_ENGINE") {
    let title = "";
    let scenes: Scene[] = [];
    let hashtags: string[] = [];
    let sentiment = "";

    if (category === "tech") {
      title = isAr ? `لماذا يجب أن تتوقف عن كتابة الكود العشوائي في تخصص ${niche}!` : `Stop writing unoptimized code for ${niche}!`;
      scenes = [
        {
          time: "0-3s",
          voiceover: isAr 
            ? `توقف عن إضاعة وقتك الثمين في كتابة كود عشوائي غير مدروس! هناك طريقة سرية تمكنك من مضاعفة كفاءة الكود في تخصص ${niche} بجهد أقل بـ 10 مرات.`
            : `Stop wasting your precious time writing unoptimized code for ${niche}! There is a secret workflow that boosts your system performance by 10x with zero effort.`,
          image_prompt: `A close-up shot of a developer's eyes reflecting futuristic neon glowing code, dark cyber-noir technology laboratory workspace, styled with ${style}, cinematic backlighting, 8k.`
        },
        {
          time: "3-7s",
          voiceover: isAr
            ? `السر الحقيقي يكمن في تطبيق خوارزميات الأتمتة السحابية الذكية وهندسة النظم. بمجرد تعديل بنية المنظومة، ستحصل على سرعة خارقة في المعالجة.`
            : `The true secret lies in cloud automation pipelines and system micro-architecture. By tuning this core system, you unlock lightning-fast processing speeds.`,
          image_prompt: `A magnificent glowing 3D holographic neural network matrix and digital DNA helix spinning in a tech room, styled with ${style}, ambient ray-tracing, photorealistic.`
        },
        {
          time: "7-15s",
          voiceover: isAr
            ? `ابدأ الآن رحلة التميز والاحتراف التقني! اضغط على زر المتابعة فوراً لتصلك الخطة الجينومية الكاملة والمجانية لتبسيط كودك اليوم.`
            : `Start your ultimate engineering journey today! Follow us now and get the full system optimization blueprint for free today.`,
          image_prompt: `A beautiful modern premium sleek software engineering studio setup, high-contrast ambient glow, styled with ${style}, masterpiece.`
        }
      ];
      hashtags = isAr 
        ? ["#برمجة", `#${niche.replace(/\s+/g, '_')}`, "#ذكاء_اصطناعي", "#تقنية", "#مطورين", "#كود", "#انتشار", "#ريلز"]
        : ["#coding", `#${niche.replace(/\s+/g, '')}`, "#developer", "#software", "#ai", "#tech", "#viral", "#reels"];
      sentiment = "Highly Tech-forward, Authoritative & Inspiring";
    } else if (category === "business") {
      title = isAr ? `أكبر سر يخفيه عنك أصحاب الملايين للسيطرة على سوق ${niche}!` : `The hidden million-dollar strategy to dominate ${niche}!`;
      scenes = [
        {
          time: "0-3s",
          voiceover: isAr
            ? `هل مللت من المحاولات العشوائية والمبيعات المتقلبة؟ هناك بروتوكول تسويقي سري يضمن لك مبيعات مستقرة ومستمرة في تخصص ${niche}.`
            : `Are you tired of inconsistent sales and unpredictable growth? This is the secret marketing protocol that guarantees non-stop revenue in the ${niche} market.`,
          image_prompt: `Macro shot of glowing metallic gold coins next to a futuristic virtual trading graph on screen, styled with ${style}, high contrast reflection.`
        },
        {
          time: "3-7s",
          voiceover: isAr
            ? `يكمن السر في هندسة مسار قمع المبيعات الذكي وإدراك سيكولوجية المشتري بالاعتماد على التحليلات التراكمية الدقيقة للعملاء لزيادة الولاء.`
            : `It all comes down to behavioral conversion tunnels and high-fidelity lead engagement based on data-driven customer metrics.`,
          image_prompt: `A clean luxury modern corporate office meeting room with holographic digital growth charts, styled with ${style}, elegant atmosphere.`
        },
        {
          time: "7-15s",
          voiceover: isAr
            ? `لا تفوت هذه الفرصة الذهبية! اكتب كلمة بزنس في التعليقات وسأرسل لك خطة الاختراق المالي لنمو تخصصك مجاناً.`
            : `Don't let this opportunity slip away! Comment 'business' below and I will send you the exact financial breakthrough system for free.`,
          image_prompt: `Sleek high-end minimalist executive office desk with custom glowing brand, styled with ${style}, premium cinematic depth.`
        }
      ];
      hashtags = isAr
        ? ["#ريادة_أعمال", `#${niche.replace(/\s+/g, '_')}`, "#تجارة_إلكترونية", "#بزنس", "#تسويق_رقمي", "#استثمار", "#نمو_مبيعات", "#ريلز"]
        : ["#business", `#${niche.replace(/\s+/g, '')}`, "#entrepreneur", "#marketing", "#ecommerce", "#finance", "#viral", "#reels"];
      sentiment = "Educational, Financial-expert & High-pulse";
    } else if (category === "fitness") {
      title = isAr ? `أسرع طريقة لإعادة تشكيل جسمك وبناء اللياقة في ${niche}!` : `The fastest way to transform your body with ${niche}!`;
      scenes = [
        {
          time: "0-3s",
          voiceover: isAr
            ? `إذا كنت تظن أن خسارة الدهون وبناء القوة في تخصص ${niche} يتطلب الحرمان الشديد، فأنت تعاني بلا داع! هناك أسلوب ذكي جداً.`
            : `If you think transforming your strength and energy with ${niche} requires self-deprivation, you are mistaken! There is a far smarter way.`,
          image_prompt: `Close-up shot of a muscular athlete preparing to train, sweat glistening under dynamic dramatic lighting, styled with ${style}, 8k.`
        },
        {
          time: "3-7s",
          voiceover: isAr
            ? `من خلال الجمع بين التغذية التراكمية المحسوبة والتدريب عالي الكثافة الموجه بدقة، ستجعل جسمك آلة لحرق الدهون حتى في أوقات الراحة.`
            : `By matching macro-nutritional science with targeted metabolic conditioning, you turn your body into a constant fat-burning powerhouse.`,
          image_prompt: `High-tech modern training studio with glowing neon circle indicators and biometric stats screens, styled with ${style}.`
        },
        {
          time: "7-15s",
          voiceover: isAr
            ? `ابدأ تحولك البدني الاستثنائي الليلة! اضغط على زر المتابعة وأرسل لي كلمة رشاقة لأرسل لك جدول السعرات والتمارين المناسب مجاناً.`
            : `Start your ultimate body transformation tonight! Hit follow and DM me 'fit' to receive your customized macro guide and training routine for free.`,
          image_prompt: `A beautiful clean arrangement of dietary supplement bottle and fitness smart tracker on a dark sleek counter, styled with ${style}.`
        }
      ];
      hashtags = isAr
        ? ["#رياضة", `#${niche.replace(/\s+/g, '_')}`, "#صحة", "#جيم", "#دايت", "#تمرين", "#نشاط", "#كمال_أجسام"]
        : ["#fitness", `#${niche.replace(/\s+/g, '')}`, "#gym", "#workout", "#health", "#nutrition", "#aesthetic", "#reels"];
      sentiment = "High-energy, Inspiring & Athletic";
    } else if (category === "cooking") {
      title = isAr ? `السر البسيط للوصول إلى طعم أشهر الفنادق في وجبات ${niche}!` : `The simple secret to gourmet flavor in ${niche} dishes!`;
      scenes = [
        {
          time: "0-3s",
          voiceover: isAr
            ? `هل تساءلت يوماً كيف تجعل وجبات ${niche} تضاهي جودة أرقى مطاعم العالم؟ السر يكمن في تكامل النكهات وموازنة البهارات العطرية.`
            : `Ever wondered how to make your ${niche} dishes taste like they were prepared in a 5-star restaurant? The secret is flavor chemistry and timing.`,
          image_prompt: `Close-up of fresh colorful aromatic ingredients being skillfully prepared on a sleek marble surface, styled with ${style}, epic slow-motion view.`
        },
        {
          time: "3-7s",
          voiceover: isAr
            ? `بإضافة التتبيلة في درجات حرارة منخفضة وتفعيل التفاعل اللوني للمكونات مع الزيوت الطبيعية، ستستخلص عمقاً هائلاً ونكهة لا تُنسى في ثوانٍ.`
            : `By introducing slow temperature infusions and blending organic spices, you extract unmatched richness and dynamic aroma instantly.`,
          image_prompt: `A stunning gourmet plate of food inside an active luxury restaurant kitchen with golden light flares, styled with ${style}.`
        },
        {
          time: "7-15s",
          voiceover: isAr
            ? `احفظ هذا المنشور فوراً كي لا تفقده، واكتب شيف في التعليقات لأرسل لك الدليل السري لأهم بهارات المطاعم مجاناً اليوم!`
            : `Save this video so you don't lose it, and comment 'chef' to get our exclusive gourmet spice manual sent straight to your inbox!`,
          image_prompt: `Elegant modern minimal dining setup with delicious masterfully styled dishes, warm ambient glow, styled with ${style}.`
        }
      ];
      hashtags = isAr
        ? ["#طبخ", `#${niche.replace(/\s+/g, '_')}`, "#وصفات", "#أكلات", "#شيف", "#مطبخ", "#طعام_صحي", "#لذيذ"]
        : ["#cooking", `#${niche.replace(/\s+/g, '')}`, "#recipe", "#foodie", "#chef", "#kitchen", "#gourmet", "#reels"];
      sentiment = "Warm, Creative & Gastronomic";
    } else if (category === "lifestyle") {
      title = isAr ? `٣ عادات صباحية بسيطة ستغير طاقتك ونجاحك في مجال ${niche}!` : `3 morning habits that will revolutionize your progress in ${niche}!`;
      scenes = [
        {
          time: "0-3s",
          voiceover: isAr
            ? `النجاح الباهر والإنتاجية الفائقة في ${niche} لا يأتيان بمحض الصدفة، بل هما نتاج عادات تراكمية تصنع فرقاً مذهلاً في تركيزك اليومي.`
            : `Incredible focus and unmatched productivity in ${niche} are not luck. They are the result of small, deliberate habits that stack up daily.`,
          image_prompt: `Macro shot of an elegant leather-bound planner journal next to a steaming ceramic cup of coffee, morning sun rays, styled with ${style}.`
        },
        {
          time: "3-7s",
          voiceover: isAr
            ? `ابدأ يومك بتدوين أهم ٣ أهداف، ثم استثمر أول ٤٥ دقيقة من يومك في التركيز الذهني الكامل دون تشتيت الانتباه بالهاتف أو الإشعارات.`
            : `Begin by writing down your top 3 objectives, and commit the first 45 minutes of your morning to deep mental work with absolute silence.`,
          image_prompt: `A bright sleek minimalist home workspace filled with natural indoor green plants and neat desk, styled with ${style}, calm ambient.`
        },
        {
          time: "7-15s",
          voiceover: isAr
            ? `إذا كنت مستعداً لصناعة فارق حقيقي في حياتك، شارك هذا المقطع مع صديق واكتب كلمة مستعد لنبدأ معاً تحدي التميز!`
            : `If you are ready to unleash your true potential, share this with a partner and comment 'ready' to start the ultimate growth challenge today!`,
          image_prompt: `Scenic panoramic view of a mountain sunrise from a modern high-rise luxury apartment window, styled with ${style}.`
        }
      ];
      hashtags = isAr
        ? ["#تطوير_ذاتي", `#${niche.replace(/\s+/g, '_')}`, "#يوميات", "#إنتاجية", "#تحفيز", "#عادات_النجاح", "#وعي", "#إيجابية"]
        : ["#mindset", `#${niche.replace(/\s+/g, '')}`, "#productivity", "#habits", "#motivation", "#lifestyle", "#focus", "#reels"];
      sentiment = "Calm, Motivating & Elevating";
    } else {
      // Custom Niche
      title = isAr ? `كيف تسيطر وتتميز بالكامل في مجال ${niche}!` : `How to completely dominate the ${niche} landscape!`;
      scenes = [
        {
          time: "0-3s",
          voiceover: isAr
            ? `هل تبحث عن الطريقة الأسرع للانتشار والتفوق في تخصص ${niche}؟ هناك استراتيجية سرية تمكنك من السيطرة وجذب المتابعين في صمت.`
            : `Looking for the absolute fastest way to stand out and scale in the ${niche} niche? This is the covert strategy to captivate your audience.`,
          image_prompt: `A stunning modern artistic representation of ${niche} themes with high-contrast glowing elements, styled with ${style}, spectacular composition.`
        },
        {
          time: "3-7s",
          voiceover: isAr
            ? `من خلال دمج الأساليب السينمائية الحديثة وتحسين معدلات التفاعل والاحتفاظ، يمكنك بناء حضور قوي جداً والتفوق على جميع منافسيك اليوم.`
            : `By introducing modern cinematic hooks and optimizing audience retention, you build unmatched authority in ${niche} easily.`,
          image_prompt: `An incredible interactive holographic display showing conceptual glowing structures of ${niche}, styled with ${style}, 8k resolution.`
        },
        {
          time: "7-15s",
          voiceover: isAr
            ? `ابدأ فوراً رحلة الهيمنة وبناء اسمك المميز! اضغط على زر المتابعة واكتب اسم تخصصك في التعليقات لأرسل لك هدية استثنائية فورا.`
            : `Start your ultimate journey of dominance today! Follow us and comment your niche below to receive our exclusive strategy guide for free.`,
          image_prompt: `A beautiful prestigious minimalist workspace setup, elegant atmospheric lights, styled with ${style}, professional masterwork.`
        }
      ];
      hashtags = isAr
        ? ["#صناعة_محتوى", `#${niche.replace(/\s+/g, '_')}`, "#تميز", "#إبداع", "#استراتيجية", "#ذكاء_اصطناعي", "#انتشار", "#ريلز"]
        : ["#creators", `#${niche.replace(/\s+/g, '')}`, "#creative", "#strategy", "#viral", "#reels", "#growth", "#dominance"];
      sentiment = "Highly Professional, Confident & Visionary";
    }

    return { title, scenes, hashtags, sentiment };
  } else {
    // VIRAL_ATTACK
    let title = "";
    let body = "";
    let image_prompt = "";
    let hashtags: string[] = [];
    let framework = "Hook-Problem-Solution-CTA Pattern";
    let sentiment = "";

    if (category === "tech") {
      title = isAr ? `الاستراتيجية التقنية السرية للريادة في مجال ${niche} لعام ٢٠٢٦` : `The stealth technical blueprint for ${niche} in 2026`;
      body = isAr
        ? `هل تلاحظ كيف تنجح بعض التطبيقات والمنظومات التقنية في ${niche} بشكل مذهل بينما يفشل المطورون الآخرون في جذب العملاء؟ 🧠\n\nالسر لا يكمن في كتابة أسطر كود أكثر، بل في هندسة النظم السحابية الذكية وتوفير الأتمتة الموثوقة.\n\nإليك ٣ خطوات تكتيكية لتطبيقها فوراً:\n١. بسّط واجهة المستخدم وخفف زمن الاستجابة إلى أقل من ١٥٠ مللي ثانية.\n٢. اعتمد على بنية ميكروسيرفيسس مستقلة لتفادي انهيار الخادم أثناء الضغط.\n٣. ابنِ واجهات برمجة مريحة وسهلة التكامل.\n\nاحفظ هذه الاستراتيجية وجربها الليلة لتلاحظ فارقاً مذهلاً! 🚀`
        : `Have you noticed how some software solutions in ${niche} capture the market effortlessly while others struggle with bug reports and server load? 🧠\n\nThe secret isn't writing more lines of code. It's about smart server architecture and continuous automated workflows.\n\nHere are 3 tactical rules to implement now:\n1. Keep latency below 150ms with edge rendering.\n2. Modularize your system to handle peak scaling demands seamlessly.\n3. Keep your interfaces simple, robust and beautifully documented.\n\nSave this post and optimize your engineering pipeline tonight! 🚀`;
      image_prompt = `Widescreen view of a futuristic minimalist programming laboratory with dark neon charts, glowing screens displaying cloud metrics, styled with ${style}, 8k.`;
      hashtags = isAr
        ? ["#برمجة", `#${niche.replace(/\s+/g, '_')}`, "#ذكاء_اصطناعي", "#تقنية", "#مطورين", "#كود", "#أتمتة", "#ريادة_تقنية"]
        : ["#coding", `#${niche.replace(/\s+/g, '')}`, "#developer", "#cloud", "#software", "#ai", "#viral", "#growth"];
      sentiment = "Highly Tech-forward, Analytical & Authoritative";
    } else if (category === "business") {
      title = isAr ? `الدليل المختصر لإنشاء آلة أرباح مستقرة في سوق ${niche}` : `The direct roadmap to building a recurring income engine in ${niche}`;
      body = isAr
        ? `لماذا تفشل ٩٠٪ من المشاريع الناشئة في مجال ${niche} خلال سنتها الأولى؟ 📊\n\nالجواب الصادم هو غياب هندسة قمع التحويل وضعف صياغة عرض القيمة المناسب للجمهور.\n\nإليك ٣ أسرار لتصحيح المسار ومضاعفة أرباحك:\n١. استبدل العروض العامة بمنتج وحيد يحل مشكلة عميقة وواضحة جداً لعملائك.\n٢. ابنِ نظام مراسلات ومتابعة تلقائي لتعزيز ولاء العميل واستمراريته.\n٣. صمم استراتيجية تسعير مرنة تدعم الاشتراكات الدورية.\n\nابدأ بتطبيق هذه الخطوات الليلة لتشهد نمواً فورياً في عوائدك! 📈`
        : `Why do 90% of new business ventures in ${niche} fail in their first year? 📊\n\nThe cold hard truth is a lack of high-fidelity sales funnels and a weak core value proposition.\n\nHere are 3 bulletproof steps to fix your business and multiply revenue:\n1. Solve one specific, acute pain point instead of offering a generic feature set.\n2. Set up automated nurturing flows to dramatically increase lifetime value.\n3. Introduce recurring subscription models to stabilize cash flow.\n\nSave this blueprint and execute these adjustments starting today! 📈`;
      image_prompt = `Widescreen view of a modern prestigious corporate office boardroom with holographic golden charts, styled with ${style}, luxurious ambient glow.`;
      hashtags = isAr
        ? ["#ريادة_أعمال", `#${niche.replace(/\s+/g, '_')}`, "#تجارة_إلكترونية", "#بزنس", "#تسويق_رقمي", "#استثمار", "#أرباح", "#نجاح"]
        : ["#business", `#${niche.replace(/\s+/g, '')}`, "#marketing", "#entrepreneur", "#finance", "#ecommerce", "#viral", "#growth"];
      sentiment = "Educational, Strategic & Highly Professional";
    } else if (category === "fitness") {
      title = isAr ? `استراتيجية التغيير البدني الذكي وبناء القوة في مجال ${niche}` : `The hyper-efficient body recomposition guide with ${niche}`;
      body = isAr
        ? `هل تبذل جهداً هائلاً في التدريب والتغذية في تخصص ${niche} دون الحصول على نتائج ملموسة؟ 🏋️‍♂️\n\nالخطأ الأكبر هو الإفراط في الجهد الرياضي العشوائي وإهمال تنظيم فترات الاستشفاء العضلي والهرموني.\n\nإليك ٣ ركائز أساسية لتسريع نتائجك:\n١. ركز على التدرج الدوري في رفع الأوزان والتحفيز المستمر لألياف العضلات.\n٢. اضبط نسبة البروتين والدهون الصحية بدقة لتسريع الشفاء والبناء الذاتي.\n٣. احصل على قسط نوم عميق لا يقل عن ٧ ساعات يومياً لتعزيز هرمونات البناء.\n\nاحفظ هذا الدليل، وطبقه بدءاً من الليلة لتشعر بالفارق وتلمس التحول! 💪`
        : `Are you putting endless hours of hard work into training and diets in ${niche} but still getting average results? 🏋️‍♂️\n\nThe fatal mistake is overloading your body with random exercises while neglecting systemic recovery.\n\nHere are the 3 essential keys to unlock extreme transformation:\n1. Apply progressive overload with absolute focus on form and tempo.\n2. Optimize your protein and healthy fat distribution for instant cell repair.\n3. Guarantee at least 7 hours of deep sleep to maximize muscle synthesis.\n\nSave this post and take command of your physical fitness goals starting tonight! 💪`;
      image_prompt = `Widescreen view of an aesthetic high-performance physical gym with glowing neon lights and high-end gear, styled with ${style}, raw cinematic depth.`;
      hashtags = isAr
        ? ["#رياضة", `#${niche.replace(/\s+/g, '_')}`, "#صحة", "#جيم", "#دايت", "#تمرين", "#نشاط", "#كمال_أجسام"]
        : ["#fitness", `#${niche.replace(/\s+/g, '')}`, "#gym", "#workout", "#nutrition", "#health", "#aesthetic", "#viral"];
      sentiment = "Motivating, Athletic & Authority-driven";
    } else if (category === "cooking") {
      title = isAr ? `أسرار تحضير وجبات ${niche} بنكهة وجودة المطاعم الفاخرة` : `Chef secrets to gourmet styling and taste in ${niche}`;
      body = isAr
        ? `هل ترغب في رفع جودة وتقديم وجباتك في ${niche} لتبهر عائلتك وأصدقائك مثل كبار الطهاة؟ 🍽️\n\nالسر لا يتطلب بهارات باهظة الثمن، بل يكمن في التحكم الدقيق بدرجات الحرارة وتنسيق المكونات جمالياً.\n\nإليك ٣ خطوات عملية لتغيير أسلوب طبخك اليوم:\n١. استخدم الطبخ البطيء لتكثيف الصلصات ودمج النكهات بعمق.\n٢. نسّق الطبق بالاعتماد على التباين اللوني والارتفاع لإضافة فخامة بصرية.\n٣. أضف توازناً حمضياً خفيفاً في النهاية لتعزيز الشعور بالانتعاش واللذة.\n\nاحفظ هذه الأسرار، وشارك طعامك الرائع بحب واعتزاز دائماً! 🌶️`
        : `Want to elevate your styling and flavor execution in ${niche} to level up like a pro chef? 🍽️\n\nYou don't need complex ingredients. The true distinction comes from thermal control and beautiful plate composition.\n\nHere are 3 professional techniques to try now:\n1. Leverage reduction techniques to intensify your base sauces.\n2. Plate your food with contrasting colors and vertical volume for visual elegance.\n3. Balance fat profile with a splash of acidity right before serving.\n\nSave this culinary guide and prepare a masterpiece dinner tonight! 🌶️`;
      image_prompt = `Widescreen view of an elegant plated gourmet food masterpiece on a marble counter in a fine-dining kitchen, styled with ${style}, glorious soft ambient.`;
      hashtags = isAr
        ? ["#طبخ", `#${niche.replace(/\s+/g, '_')}`, "#وصفات", "#أكلات", "#شيف", "#مطبخ", "#فن_الطهي", "#طعام"]
        : ["#cooking", `#${niche.replace(/\s+/g, '')}`, "#recipe", "#foodie", "#chef", "#gourmet", "#plating", "#viral"];
      sentiment = "Warm, Creative, Culinary-expert";
    } else if (category === "lifestyle") {
      title = isAr ? `دليل إعادة بناء التركيز الذهني والتفوق اليومي في ${niche}` : `The ultimate focus and productivity system in ${niche}`;
      body = isAr
        ? `هل تشعر بالتشتت المستمر وضيق الوقت أمام أهدافك الكبيرة في ${niche}؟ 🌿\n\nالخلل لا يكمن في قلة الساعات، بل في استنزاف طاقتك الذهنية في مهام ثانوية تمنعك من التقدم الفعلي.\n\nإليك ٣ استراتيجيات مجربة لاستعادة تركيزك الخارق للعادة:\n١. حدد عاداتك الصباحية وخصص أول ساعة من يومك بدون هواتف أو تشتيت.\n٢. طبّق مبدأ التجميع للقيام بالمهام المتشابهة دفعة واحدة لتقليل الجهد الفكري.\n٣. صمم مساحة عمل هادئة خالية من الفوضى ومحفزة للتفكير الإيجابي.\n\nاحفظ هذه النصائح الثمينة وابدأ يومك غداً بتركيز حديدي وحضور كامل! ✨`
        : `Do you feel continuously distracted and exhausted while chasing your major ambitions in ${niche}? 🌿\n\nThe issue is not a shortage of time. It is the scattering of your finite mental bandwidth on superficial notifications.\n\nHere are 3 proven practices to recapture focus and master your days:\n1. Protect your first morning hour. No emails, no social media feeds, no noise.\n2. Group similar cognitive tasks together to bypass context-switching fatigue.\n3. Shape your physical workspace to be minimalist, clean and visually inspiring.\n\nSave this mindset guide and design a high-focus routine starting tomorrow! ✨`;
      image_prompt = `Widescreen view of a gorgeous minimalist bright study room filled with green indoor plants and natural soft window light, styled with ${style}, serene atmosphere.`;
      hashtags = isAr
        ? ["#تطوير_ذاتي", `#${niche.replace(/\s+/g, '_')}`, "#يوميات", "#إنتاجية", "#تحفيز", "#هدوء", "#تنظيم_الوقت", "#إيجابية"]
        : ["#mindset", `#${niche.replace(/\s+/g, '')}`, "#productivity", "#lifestyle", "#focus", "#growth", "#inspiration", "#viral"];
      sentiment = "Calm, Reflective & Empowering";
    } else {
      title = isAr ? `استراتيجية الانتشار والنمو المتكامل في تخصص ${niche}` : `The custom organic growth playbook for ${niche}`;
      body = isAr
        ? `هل تسعى لتثبيت حضورك والانتشار بقوة في تخصص ${niche}؟ 📈\n\nصناعة المحتوى والنجاح في هذا المجال يتطلبان تركيزاً شديداً على احتياجات الجمهور الفردية وتقديم قيمة حقيقية وصادقة.\n\nإليك ٣ ركائز ذهبية تضمن لك التفوق والنمو:\n١. ابدأ بخطاف كلامي قوي يحل مشكلة شائعة فوراً لإثارة فضول المتابع.\n٢. حافظ على اتساق وبساطة أسلوبك في الطرح لسهولة الفهم والاستيعاب.\n٣. ادعُ للتفاعل المباشر بطريقة مبتكرة وسهلة لتعزيز روابط الثقة المتبادلة.\n\nاحفظ هذه الخطوات البسيطة، وابدأ بتطبيقها الليلة لتلاحظ تصاعداً رائعاً في تفاعلك! 🚀`
        : `Are you looking to scale your authority and impact in the ${niche} ecosystem? 📈\n\nDominating this landscape requires a deep understanding of your audience's core challenges and delivering pure value.\n\nHere are the 3 major pillars of viral organic growth:\n1. Use a clear, undeniable hook addressing an active friction point in the first 3 seconds.\n2. Keep your delivery clean, visual, and highly authentic to gain immediate trust.\n3. End with a simple, high-incentive call to action that makes participation effortless.\n\nSave this playbook and design your next viral campaign tonight! 🚀`;
      image_prompt = `Widescreen conceptual view representing ${niche} with beautifully designed artistic elements and glowing cyber neon lines, styled with ${style}, 8k.`;
      hashtags = isAr
        ? ["#صناعة_محتوى", `#${niche.replace(/\s+/g, '_')}`, "#تميز", "#إبداع", "#استراتيجية", "#نمو_حسابات", "#انتشار", "#ريلز"]
        : ["#creators", `#${niche.replace(/\s+/g, '')}`, "#creative", "#strategy", "#viral", "#growth", "#reels", "#dominance"];
      sentiment = "Highly Confident, Authoritative & Professional";
    }

    return { title, body, image_prompt, hashtags, framework, sentiment };
  }
}

// Strategic AI Core generator
export async function generateWarhead(
  niche: string,
  mode: "REELS_ENGINE" | "VIRAL_ATTACK" = "REELS_ENGINE",
  customStyle?: string,
  onProgress?: (progress: number, logLine: string) => void,
  forceSimulation = false,
  promptOnly = false
): Promise<DominatorPack> {
  const style = customStyle || "Cinematic Commercial with Dramatic Lighting";
  const ai = forceSimulation ? null : getGeminiClient();

  if (onProgress) onProgress(10, `🎯 Connecting to intelligence core for niche: [${niche}] using style: [${style}]`);

  if (!ai) {
    // Return high fidelity simulation response if API key is not present or if we are forced to simulate
    if (onProgress) onProgress(30, "⚙️ API Key not configured or offline backup mode active. Launching high-fidelity local genetic simulation module...");
    await new Promise(resolve => setTimeout(resolve, 1500));

    const fallbackPack = getDynamicFallback(niche, mode, style);

    if (mode === "REELS_ENGINE") {
      if (onProgress) onProgress(60, `🧠 Engineering customized 3-scene storyboard script for niche [${niche}] (Hook -> Value -> CTA)...`);
      const reelsPack = fallbackPack as ReelsPack;

      if (promptOnly) {
        if (onProgress) onProgress(80, "📝 User requested PROMPT_ONLY. Skipping image rendering, providing high-fidelity visual prompts directly.");
      } else {
        if (onProgress) onProgress(80, "🎨 Rendering vertical scenes (9:16) via Flux Cinema channel...");
        await Promise.all(reelsPack.scenes.map(async (scene, i) => {
          if (onProgress) onProgress(80 + (i * 3), `🎬 Rendering Scene ${i+1}/3: ${scene.time}`);
          scene.image_base64 = await fetchImageAsBase64(scene.image_prompt, niche, "9:16");
        }));
      }
      return reelsPack;
    } else {
      if (onProgress) onProgress(60, `🧠 Engineering high-engagement viral copywriter content for niche [${niche}]...`);
      const attackPack = fallbackPack as ViralAttackPack;

      if (promptOnly) {
        if (onProgress) onProgress(90, "📝 User requested PROMPT_ONLY. Skipping widescreen rendering, presenting premium prompt only.");
      } else {
        if (onProgress) onProgress(90, "🎨 Rendering widescreen feature image (16:9)...");
        attackPack.image_base64 = await fetchImageAsBase64(attackPack.image_prompt, niche, "16:9");
      }
      return attackPack;
    }
  }

  try {
    // Real Gemini logic with Google GenAI SDK with robust candidate fallbacks
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.5-flash", "gemini-3.1-pro-preview"];
    const systemInstruction = mode === "REELS_ENGINE" ? 
      `Role: Elite Video Director & Viral Scriptwriter.
Niche: ${niche}. Visual Style: ${style}.

Task: Create a 3-scene Storyboard for a viral TikTok/Reels video that will dominate the algorithm.
1. Write a mind-blowing Arabic Voiceover script (Hook -> Value -> CTA).
2. For EACH of the 3 scenes, write a highly detailed English image prompt. The images will be VERTICAL (9:16). Describe lighting, subject, texture, and action. NO TEXT IN IMAGES.
3. Extract 8 hashtags.

OUTPUT STRICTLY JSON:
{
  "title": "Arabic Video Title/Hook",
  "scenes": [
    {"time": "0-3s", "voiceover": "Arabic text", "image_prompt": "English prompt for vertical scene 1..."},
    {"time": "3-7s", "voiceover": "Arabic text", "image_prompt": "English prompt for vertical scene 2..."},
    {"time": "7-15s", "voiceover": "Arabic text", "image_prompt": "English prompt for vertical scene 3..."}
  ],
  "hashtags": ["#tag1", ...],
  "sentiment": "Tone"
}` : 
      `Role: Elite Content Strategist.
Niche: ${niche}. Style: ${style}.
Task:
1. Arabic Viral Post (Hook + Body).
2. Detailed English Image Prompt (Visuals ONLY, NO Text).
3. 8 Hashtags.
OUTPUT STRICTLY JSON:
{
  "title": "Hook",
  "body": "Content",
  "image_prompt": "Visuals",
  "hashtags": [],
  "framework": "Name",
  "sentiment": "Tone"
}`;

    let responseText = "";
    let modelUsed = "";
    let lastError: any = null;
    const maxRetriesPerModel = 3;

    for (const model of candidateModels) {
      for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
        try {
          if (onProgress) onProgress(35, `🚀 Requesting genetic synthesis from Gemini model: [${model}] (attempt ${attempt}/${maxRetriesPerModel})...`);
          const response = await ai.models.generateContent({
            model: model,
            contents: `Generate a high-performance content pack for niche: [${niche}] using style: [${style}]`,
            config: {
              responseMimeType: "application/json",
              systemInstruction: systemInstruction,
              responseSchema: mode === "REELS_ENGINE" ? {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  scenes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING },
                        voiceover: { type: Type.STRING },
                        image_prompt: { type: Type.STRING }
                      },
                      required: ["time", "voiceover", "image_prompt"]
                    }
                  },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sentiment: { type: Type.STRING }
                },
                required: ["title", "scenes", "hashtags", "sentiment"]
              } : {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  body: { type: Type.STRING },
                  image_prompt: { type: Type.STRING },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  framework: { type: Type.STRING },
                  sentiment: { type: Type.STRING }
                },
                required: ["title", "body", "image_prompt", "hashtags", "framework", "sentiment"]
              }
            }
          });

          if (response && response.text) {
            responseText = response.text;
            modelUsed = model;
            console.log(`[Strategic Core] Successfully generated content using model: ${model}`);
            break; // Success! exit retry loop
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          console.warn(`[Strategic Core] Model ${model} attempt ${attempt} failed/refused: ${errMsg}`);

          // If a model is denied access (403), skip to next candidate immediately to avoid slow loops
          const isPermissionDenied = errMsg.includes("PERMISSION_DENIED") || errMsg.includes("denied access") || errMsg.includes("403");
          if (isPermissionDenied) {
            console.log(`[Strategic Core] Access denied on model ${model}. Transitioning immediately to next model candidate...`);
            break; // exit retry loop for this model, proceed to next model in candidateModels
          }

          const isQuotaExceeded = errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429");
          if (isQuotaExceeded) {
            const match = errMsg.match(/Please retry in ([\d.]+)s/i);
            let waitMs = match ? Math.ceil(parseFloat(match[1]) * 1000) + 1200 : 4000;
            if (waitMs > 12000) waitMs = 12000;
            console.log(`[Strategic Core] Quota Exceeded (429) for ${model}. Sleeping for ${waitMs}ms before retrying same model...`);
            await new Promise((resolve) => setTimeout(resolve, waitMs));
          } else {
            // General transient error backoff
            if (attempt < maxRetriesPerModel) {
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
          }
        }
      }
      // If we successfully got a response from the current model's attempts, break the outer loop
      if (responseText) {
        break;
      }
    }

    if (!responseText) {
      throw lastError || new Error("All candidate models failed to generate content.");
    }

    if (onProgress) onProgress(65, "🧠 Synthesizing raw genetic data into structural content schema...");
    const data = JSON.parse(responseText.trim());

    if (mode === "REELS_ENGINE") {
      const reelsData = data as ReelsPack;
      if (promptOnly) {
        if (onProgress) onProgress(80, "📝 User requested PROMPT_ONLY. Synthesizing high-fidelity visual prompts without rendering images...");
      } else {
        if (onProgress) onProgress(80, "🎨 Spawning high-performance visual asset renderer...");
        await Promise.all(reelsData.scenes.map(async (scene, i) => {
          if (onProgress) onProgress(80 + (i * 3), `🎬 Rendering Scene ${i+1}/3: ${scene.time}`);
          scene.image_base64 = await fetchImageAsBase64(scene.image_prompt, niche, "9:16");
        }));
      }
      return reelsData;
    } else {
      const postData = data as ViralAttackPack;
      if (promptOnly) {
        if (onProgress) onProgress(85, "📝 User requested PROMPT_ONLY. Synthesizing high-fidelity widescreen prompt without rendering image...");
      } else {
        if (onProgress) onProgress(85, "🎨 Rendering widescreen promotional artwork (16:9)...");
        postData.image_base64 = await fetchImageAsBase64(postData.image_prompt, niche, "16:9");
      }
      return postData;
    }

  } catch (error) {
    console.error("[Strategic Core] Real generation failed, falling back gracefully to high-fidelity simulated content.", error);
    // Silent fallback
    if (onProgress) onProgress(75, "⚠️ Intelligence link saturated. Switching to high-fidelity backup generator...");
    return await generateWarhead(niche, mode, customStyle, undefined, true, promptOnly);
  }
}

export function savePack(id: string, type: "REELS_ENGINE" | "VIRAL_ATTACK", data: DominatorPack) {
  packs[id] = {
    id,
    type,
    data,
    created_at: new Date().toISOString()
  };
}

// Background builder job manager
export function createJob(niche: string, mode: "REELS_ENGINE" | "VIRAL_ATTACK", style?: string, promptOnly: boolean = false): string {
  const jobId = `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const packId = `pack_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  jobs[jobId] = {
    id: jobId,
    status: "queued",
    progress: 5,
    logs: ["📌 Job queued in Tactical Control System.", "🔮 Initializing strategic pipeline..."],
    created_at: new Date().toISOString()
  };

  // Enqueue via queueService so that it runs inside a managed background worker (BullMQ / fallback queue)
  import("./services/queueService").then(({ enqueueTask }) => {
    enqueueTask("BUILD_PACK", { jobId, packId, niche, mode, style, promptOnly }, { jobId })
      .catch((err) => {
        console.error(`[Job ${jobId}] Queue enqueue failed:`, err);
        const currentJob = jobs[jobId];
        if (currentJob) {
          currentJob.status = "failed";
          currentJob.error = err?.message || String(err);
          currentJob.logs.push(`❌ Queue Placement Aborted: ${currentJob.error}`);
        }
      });
  });

  return jobId;
}

export function getJob(id: string): Job | null {
  return jobs[id] || null;
}

export function getPack(id: string) {
  return packs[id] || null;
}

export function getTrendingHashtags(niche: string, limit: number = 12): string[] {
  const allTags: Record<string, string[]> = {
    tech: ["#برمجة", "#تطوير_ويب", "#ذكاء_اصطناعي", "#تقنية", "#مطورين", "#SaaS", "#كود", "#أندرويد", "#أيفون", "#تعلم_البرمجة", "#تكنولوجيا", "#نصائح_برمجية"],
    business: ["#تسويق_رقمي", "#ريادة_أعمال", "#مشاريع", "#أرباح", "#العمل_الحر", "#ستارتاب", "#تجارة_إلكترونية", "#استثمار", "#مال", "#نجاح", "#صناعة_محتوى", "#بزنس"],
    fitness: ["#رياضة", "#جيم", "#فتنس", "#صحة", "#دايت", "#تخسيس", "#عضلات", "#تمرين", "#حياة_صحية", "#كمال_أجسام", "#نشاط", "#تغذية"],
    lifestyle: ["#يوميات", "#فلوق", "#سفر", "#ترتيب", "#ديكور", "#تصوير", "#ستايل", "#حياة", "#إيجابية", "#عائلتي", "#مشترياتي", "#روتين_يومي"],
    cooking: ["#طبخ", "#وصفات", "#أكلات", "#شيف", "#مطبخ", "#حلويات", "#لذيذ", "#عشاء_سريع", "#وصفة_سهلة", "#طعام", "#دايت_صحي", "#اكلات_سريعة"]
  };

  const key = niche.toLowerCase();
  const list = allTags[key] || allTags["tech"];
  return list.slice(0, limit);
}
