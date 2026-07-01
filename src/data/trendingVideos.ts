export interface TrendingVideo {
  id: string;
  title: string;
  niche: string;
  views: string;
  likes: string;
  shares: string;
  saves: string;
  comments: string;
  platform: "TikTok" | "Instagram Reels" | "YouTube Shorts";
  duration: string;
  retentionRate: string;
  growthRate: string;
  viralScore: number;
  author: string;
  description: string;
  keySuccessFactors: string[];
  fullAnalysis: {
    hookType: string;
    deliveryTone: string;
    pacing: string;
    cognitiveLoad: string;
    sourcePlatformStats: string;
  };
}

export const TRENDING_VIDEOS_DB: TrendingVideo[] = [
  // --- TECH (التقنية) ---
  {
    id: "tech_1",
    title: "مطور برامج يكتشف ميزة سرية بالذكاء الاصطناعي توفر 5 ساعات يومياً 🛑",
    niche: "Tech",
    views: "1.2M",
    likes: "135K",
    shares: "18.4K",
    saves: "24.1K",
    comments: "5.3K",
    platform: "TikTok",
    duration: "42s",
    retentionRate: "52.4%",
    growthRate: "+340% هذا الأسبوع",
    viralScore: 98,
    author: "@tech_genius_ar",
    description: "فيديو تكنولوجي قصير يشرح أداة ذكاء اصطناعي مدمجة في VS Code تقوم بمراجعة وتصحيح الأكواد البرمجية آلياً في ثوانٍ. يبدأ الفيديو بلقطة مقربة لشاشة اللابتوب وعليها كود تالف مع عبارة غضب تمثيلية لجذب المشاهدين.",
    keySuccessFactors: [
      "خطاف مقاطعة معرفية (Cognitive Disruption) في أول 3 ثوانٍ",
      "حل مشكلة حقيقية تؤرق كل مبرمج ومصمم (تضييع الوقت)",
      "دعوة ذكية للتفاعل عبر كتابة كلمة معينة في التعليقات للحصول على رابط الأداة"
    ],
    fullAnalysis: {
      hookType: "Shocking Statement (جملة صادمة ومفاجئة)",
      deliveryTone: "Energetic (حماسي وسريع الوتيرة)",
      pacing: "سريع للغاية (لقطات لا تتعدى 1.5 ثانية لكل مشهد بيكسيل)",
      cognitiveLoad: "منخفض - يركز على شاشة واحدة مألوفة للمطورين مع تعليق نصي مضيء",
      sourcePlatformStats: "تصدر قائمة الـ Trending في TikTok Creative Center بالشرق الأوسط لـ 4 أيام متتالية، وحقق معدل إكمال (Watch Time) قياسي بنسبة 42% ممن أتموا الفيديو بالكامل."
    }
  },
  {
    id: "tech_2",
    title: "أكبر خطأ تقع فيه عند شراء هاتف ذكي في 2026 - تجنب هذا الفخ! 📱⚠️",
    niche: "Tech",
    views: "940K",
    likes: "89K",
    shares: "12.2K",
    saves: "15.8K",
    comments: "3.9K",
    platform: "Instagram Reels",
    duration: "35s",
    retentionRate: "47.8%",
    growthRate: "+180% هذا الأسبوع",
    viralScore: 93,
    author: "@tech_omran",
    description: "مراجعة نقدية سريعة لهواتف الفئة المتوسطة، وكشف الخدعة التسويقية التي تتبعها الشركات حول دقة الكاميرا بالميغابكسل ومعدل تحديث الشاشة الوهمي.",
    keySuccessFactors: [
      "إثارة عامل الحماية والخوف من الخسارة المالية (تجنب الفخ)",
      "استخدام نبرة واثقة ومقنعة للغاية مدعومة بأدلة بصرية سريعة",
      "تغيير مستمر في زوايا الكاميرا لحث المشاهد على التركيز المستمر"
    ],
    fullAnalysis: {
      hookType: "Action Hook (خطاف بصرى وحركي قوي)",
      deliveryTone: "Educational/Calm (تعليمي هادئ ورصين)",
      pacing: "متوسط إلى سريع مع تكبيرات بصرية (Z-Cuts)",
      cognitiveLoad: "متوسط - يحتاج لفهم مبسط لمواصفات العتاد الداخلي للموبايل",
      sourcePlatformStats: "حصل على تفاعل غير مسبوق في Instagram Reels كأكثر المقاطع مشاركة (Shares) في تخصص مراجعة الهواتف الذكية لهذا الشهر."
    }
  },
  {
    id: "tech_3",
    title: "برمج تطبيقاً متكاملاً لجوالك في 10 دقائق فقط وبدون كود! 🤯",
    niche: "Tech",
    views: "2.1M",
    likes: "240K",
    shares: "45.2K",
    saves: "62.0K",
    comments: "12.8K",
    platform: "YouTube Shorts",
    duration: "58s",
    retentionRate: "61.3%",
    growthRate: "+410% هذا الأسبوع",
    viralScore: 99,
    author: "@nocode_ar",
    description: "فيديو يعرض بناء تطبيق جوال حقيقي خطوة بخطوة باستخدام منصات No-Code مدعومة بالذكاء الاصطناعي التوليدي، مع إظهار التطبيق يعمل بالفعل على الجوال في نهاية المقطع.",
    keySuccessFactors: [
      "عامل المستحيل (تطبيق بدون كود في 10 دقائق) مما يرفع نسبة الفضول",
      "قيمة عملية فائقة تدفع المتلقي لحفظ المقطع للرجوع إليه وتطبيقه الليلة",
      "إثبات النتيجة مسبقاً في أول ثانية بلقطة سريعة للتطبيق الفعلي"
    ],
    fullAnalysis: {
      hookType: "Visual Pattern (نمط بصري وعرض مسبق للنتيجة)",
      deliveryTone: "Fast-paced (إيقاع تصاعدي متسارع)",
      pacing: "سريع ومكثف بالمعلومات من البداية للنهاية",
      cognitiveLoad: "منخفض - يبسط الخطوات بشكل يمنح المتلقي الثقة للبدء فوراً",
      sourcePlatformStats: "تصدر خوارزميات YouTube Shorts محققاً معدلات بقاء استثنائية (Average View Duration) تجاوزت مدة الفيديو الإجمالية نتيجة إعادة مشاهدة الخطوات المتتالية."
    }
  },

  // --- BUSINESS (الأعمال والمشاريع / التسويق) ---
  {
    id: "business_1",
    title: "كيف تبني مشروعاً سرياً يدر عليك 10,000$ شهرياً برأس مال صفر! 💵🤫",
    niche: "Business",
    views: "1.8M",
    likes: "195K",
    shares: "34.1K",
    saves: "54.8K",
    comments: "9.2K",
    platform: "TikTok",
    duration: "45s",
    retentionRate: "56.1%",
    growthRate: "+290% هذا الأسبوع",
    viralScore: 97,
    author: "@biz_mentor_ar",
    description: "مخطط مبسط للعمل الحر والخدمات الرقمية باستخدام منصات الوساطة الخدمية والذكاء الاصطناعي لإنشاء وتجهيز تلك الخدمات وتسليمها للعملاء الأجانب وتحقيق أرباح بالدولار.",
    keySuccessFactors: [
      "استهداف الدافع المالي القوي (رأس مال صفر وأرباح قياسية)",
      "تقسيم المحتوى إلى خطوات بسيطة جداً (الخطوة 1، الخطوة 2...)",
      "نبرة صوت تعزز الثقة المتبادلة والتشجيع وتدفع بالـ CTA للمتابعة"
    ],
    fullAnalysis: {
      hookType: "Direct Question (سؤال مباشر يستهدف أمنية صعبة)",
      deliveryTone: "Storytelling (قصصي ملهم ومشوق)",
      pacing: "متزن مع سكتات خفيفة لبناء الترقب قبل إعلان الأرقام",
      cognitiveLoad: "منخفض - يختصر العقبات القانونية والتقنية المعقدة",
      sourcePlatformStats: "صنف كأكثر الفيديوهات حفظاً (Bookmarks) في قطاع ريادة الأعمال العربي على TikTok لعام 2026، مما أدى لدفعه آلياً للمزيد من المشاهدين المهتمين بجني المال."
    }
  },
  {
    id: "business_2",
    title: "السر النفسي الذي تخفيه عنك كبرى الشركات لتجعلك تشتري بدون وعي! 🤫🛍️",
    niche: "Business",
    views: "810K",
    likes: "74K",
    shares: "9.8K",
    saves: "12.3K",
    comments: "2.1K",
    platform: "Instagram Reels",
    duration: "38s",
    retentionRate: "45.2%",
    growthRate: "+150% هذا الأسبوع",
    viralScore: 91,
    author: "@marketing_expert_ar",
    description: "كشف أسرار علم النفس التسويقي وأساليب التسعير الذكي (Decoy Effect) التي تطبقها ستاربكس وآبل لتوجيه المتلقي لشراء الحجم الأكبر والأغلى.",
    keySuccessFactors: [
      "استغلال الفضول ونظرية المؤامرة الاستهلاكية (أسرار تخفيها الشركات)",
      "تطبيق أمثلة حية مألوفة ومحبوبة مثل أكواب القهوة",
      "العرض جذاب ومليء بالألوان المتناسقة في الواجهة"
    ],
    fullAnalysis: {
      hookType: "Shocking Statement (إفشاء سر تسويقي كبير)",
      deliveryTone: "Dramatic (درامي غامض ومشوق)",
      pacing: "سريع مع توفير مؤثرات صوتية تثير الحماس (Swoosh, Pop)",
      cognitiveLoad: "متوسط - يقدم تحليلاً اقتصادياً نفسياً مبسطاً",
      sourcePlatformStats: "حصد مئات التعليقات لجمهور يشارك تجاربه الشخصية مع الخدع التسعيرية، مما جعل الخوارزمية تعتبره فيديو ذا طابع تفاعلي نقاشي ممتاز (High Engagement Loop)."
    }
  },

  // --- FITNESS (الرياضة والصحة) ---
  {
    id: "fitness_1",
    title: "دقيقة واحدة كل صباح كفيلة بحرق دهون البطن ونحت الخصر في 30 يوماً! 🔥",
    niche: "Fitness",
    views: "3.2M",
    likes: "310K",
    shares: "88.5K",
    saves: "112.0K",
    comments: "14.5K",
    platform: "TikTok",
    duration: "50s",
    retentionRate: "64.5%",
    growthRate: "+520% هذا الأسبوع",
    viralScore: 99,
    author: "@fit_coach_ar",
    description: "تمرين منزلي ثوري مكثف وسهل التنفيذ ولا يتطلب عتاداً رياضياً، مع شرح وافٍ لعضلات البطن المستهدفة والتنفس الصحيح لرفع الفعالية لـ 200%.",
    keySuccessFactors: [
      "حل سريع جداً وعالي الكفاءة (دقيقة واحدة فقط صباحاً)",
      "إمكانية تطبيق التمرين فوراً في المنزل بدون اشتراك جيم",
      "ندرة التكلفة وصغر الجهد المالي يعززان نسبة المشاركة العائلية"
    ],
    fullAnalysis: {
      hookType: "Silent Text Overlay (نص تفاعلي متحرك على الشاشة مع حركة قوية بالبداية)",
      deliveryTone: "Energetic (حماسي عالي التردد)",
      pacing: "سريع ومتناغم مع إيقاع التمرين الرياضي المصور",
      cognitiveLoad: "منخفض جداً - عرض بصري دقيق يسهل تقليده وحفظه بالذاكرة الجسدية",
      sourcePlatformStats: "تصدر الهاشتاغات الرياضية الأكثر استخداماً ومشاركة على TikTok و Shorts، وسجل أعلى نسبة حفظ وتنزيل (Downloads) للاستخدام اليومي المستقبلي."
    }
  },

  // --- LIFESTYLE (أسلوب الحياة والطهي وغيرها) ---
  {
    id: "lifestyle_1",
    title: "أفضل تنظيم ليومي يضمن لي إنجاز مهام أسبوع كامل في يومين فقط 🧘‍♀️✨",
    niche: "Lifestyle",
    views: "720K",
    likes: "68K",
    shares: "8.1K",
    saves: "14.2K",
    comments: "1.9K",
    platform: "Instagram Reels",
    duration: "40s",
    retentionRate: "43.5%",
    growthRate: "+120% هذا الأسبوع",
    viralScore: 89,
    author: "@cozy_life_ar",
    description: "فيديو مريح بصرياً يعرض روتين الصباح والمساء الممنهج لزيادة الإنتاجية وتقليل التوتر باستخدام أدوات تنظيم ذكية وتنسيق المهام بنظرية بومودورو المطورة.",
    keySuccessFactors: [
      "مؤثرات بصرية وصوتية مهدئة ومريحة للأعصاب (ASMR Aesthetics)",
      "حل مشكلة التشتت وضياع اليوم التي يعاني منها صناع المحتوى ورواد الأعمال",
      "ألوان دافئة ونماذج تصميمية أنيقة تدفع للمشاركة مع الأصدقاء كإلهام جمالي"
    ],
    fullAnalysis: {
      hookType: "Visual Pattern (روتين جمالي هادئ وبداية مريحة بصرياً)",
      deliveryTone: "Educational/Calm (نبرة صوت هادئة ومريحة)",
      pacing: "متزن مريح بصرياً مع فواصل سكون خفيفة",
      cognitiveLoad: "منخفض - يستهدف تصفية الذهن وترتيب الأفكار اليومية",
      sourcePlatformStats: "حصل على نسبة مشاركة عالية جداً بين صناع المحتوى والطلاب في مواسم الاختبارات والعمل عن بعد كروتين مثالي للإلهام والتنظيم."
    }
  }
];
