export interface TranslationSet {
  dir: "rtl" | "ltr";
  langCode: "ar" | "en";
  fontClass: string;
  appName: string;
  appSubtitle: string;
  creatorAccount: string;
  demoUser: string;
  followers: string;
  currentNiche: string;
  resetDb: string;
  resetDbSuccess: string;
  systemNotification: string;
  notificationBellTitle: string;
  notificationMatchDetected: string;
  notificationRemixNow: string;
  notificationMarkRead: string;
  notificationNoAlerts: string;
  notificationClearAll: string;
  todayMissionTitle: string;
  dnaStreakTitle: string;
  dailyGoal: string;
  dailyTargetDesc: string;
  dnaStreakActive: string;
  dnaStreakDesc: string;
  activeDnaGenetics: string;
  overallGrowthScore: string;
  overallGrowthScoreDesc: string;
  recentAchievements: string;
  achievementNicheKing: string;
  achievementNicheKingDesc: string;
  achievementRetentionLord: string;
  achievementRetentionLordDesc: string;

  // Tabs
  tabHome: string;
  tabMission: string;
  tabDna: string;
  tabUpload: string;
  tabOnboarding: string;

  // Tab 1: Simulator & Radar
  simulatorTitle: string;
  simulatorSubtitle: string;
  simulatorPlaceholder: string;
  simulateBtn: string;
  simulatingActive: string;
  voiceInputTitle: string;
  voiceInputListening: string;
  voiceInputNotSupported: string;
  voiceInputStart: string;
  voiceInputStop: string;

  radarTitle: string;
  radarSubtitle: string;
  radarLiveTracking: string;
  radarSearchPlaceholder: string;
  radarNicheLabel: string;
  radarAllNiches: string;
  radarNicheTech: string;
  radarNicheBusiness: string;
  radarNicheFitness: string;
  radarNicheLifestyle: string;
  radarNoVideosFound: string;
  radarGrowthRate: string;
  radarViews: string;
  radarLikes: string;
  radarAnalyzeAndRemix: string;
  radarSource: string;
  radarLastUpdated: string;

  // Simulator Results
  simResultTitle: string;
  simResultDesc: string;
  successProbability: string;
  expectedViews: string;
  expectedRetention: string;
  suggestedDuration: string;
  sec: string;
  evaluationTitle: string;
  visualSceneStory: string;
  hookStrength: string;
  verbalPacing: string;
  psychologicalTriggers: string;
  recomAndOptimizations: string;

  // Radar Modal & Remix
  modalPlatformStats: string;
  modalViews: string;
  modalLikes: string;
  modalShares: string;
  modalSaves: string;
  modalComments: string;
  modalDuration: string;
  modalRetention: string;
  modalGrowth: string;
  modalDescTitle: string;
  modalFactorsTitle: string;
  modalDnaDnaTitle: string;
  modalHookType: string;
  modalDeliveryTone: string;
  modalPacing: string;
  modalCognitiveLoad: string;
  modalSourceStats: string;
  modalRemixBtn: string;
  modalRemixLoading: string;
  modalRemixLoadingDesc: string;
  modalRemixSuccess: string;
  modalRemixedScriptTitle: string;
  modalCopyScript: string;
  modalCopied: string;
  modalPredictionReport: string;
  modalPredictionSuccess: string;
  modalPredictionViews: string;
  modalPredictionEngagement: string;
  modalPredictionRetention: string;
  modalPredictionDuration: string;
  modalStrengths: string;
  modalWeaknesses: string;
  modalHashtagsTitle: string;
  modalCopyHashtags: string;
  modalVideoPromptTitle: string;
  modalCopyVideoPrompt: string;
  modalQuotaWarning: string;
  modalClose: string;

  // Tab 2: Creator Genome Dashboard
  genomeTitle: string;
  genomeSubtitle: string;
  weeklyGrowthEvolution: string;
  growthScoreChartLabel: string;
  analyzedVideosCount: string;
  successDriversTitle: string;
  successDriversDesc: string;
  failureDriversTitle: string;
  failureDriversDesc: string;
  noDnaData: string;

  // Tab 3: Upload Screenshots
  uploadTitle: string;
  uploadSubtitle: string;
  dragDropText: string;
  orSelectFile: string;
  supportedFormats: string;
  analyzingScreenshot: string;
  analyzingScreenshotDesc: string;
  actualMetricsTitle: string;
  editMetrics: string;
  saveMetrics: string;
  extractedSuccessMsg: string;
  metricsSavedMsg: string;
  metaVideoTitle: string;
  metaDuration: string;
  metaHookStyle: string;
  metaDeliveryTone: string;
  metaShowFace: string;
  metaPublishTime: string;
  metaPublishDay: string;
  metaScriptText: string;
  submitToDnaEngine: string;
  submittingToDna: string;

  // Tab 4: Onboarding / Profile
  onboardingTitle: string;
  onboardingSubtitle: string;
  profileName: string;
  avatarUrl: string;
  followerCountLabel: string;
  nicheSelectLabel: string;
  audienceGender: string;
  audienceCountry: string;
  audienceAge: string;
  accountAgeMonths: string;
  onboardingUpdateBtn: string;
  onboardingUpdating: string;
  onboardingSuccessMsg: string;

  // Footer
  footerCopyright: string;
  footerSlogan: string;
}

export const translations: Record<"ar" | "en", TranslationSet> = {
  ar: {
    dir: "rtl",
    langCode: "ar",
    fontClass: "font-sans",
    appName: "AI DOMINATOR",
    appSubtitle: "نظام تشغيل النمو التراكمي واستخبارات جينوم صانع المحتوى",
    creatorAccount: "حساب صانع المحتوى",
    demoUser: "مستخدم تجريبي",
    followers: "متابع",
    currentNiche: "التخصص الحالي",
    resetDb: "إعادة ضبط البيانات إلى التكوين الأولي",
    resetDbSuccess: "تمت إعادة ضبط قاعدة البيانات المحلية للتطبيق بنجاح إلى الإعدادات الافتراضية للذكاء الاصطناعي!",
    systemNotification: "إشعار النظام",
    notificationBellTitle: "تنبيهات الهيمنة الذكية (فرص ريمكس)",
    notificationMatchDetected: "فرصة ريمكس فائقة التوافق مكتشفة! 🧬",
    notificationRemixNow: "ابدأ الريمكس الفوري",
    notificationMarkRead: "تحديد كمقروء",
    notificationNoAlerts: "لا توجد فرص ريمكس نشطة تتجاوز 80% في رادارك حالياً.",
    notificationClearAll: "مسح جميع التنبيهات",
    todayMissionTitle: "مهمة النمو اليومية الموصى بها",
    dnaStreakTitle: "سلسلة تفوق الجينوم (DNA Streak)",
    dailyGoal: "الهدف اليومي الحالي",
    dailyTargetDesc: "تحليل سيناريو جديد في محاكي النشر وتأكيد حيازة فرصة انتشار تتعدى 80% لتغذية خوارزمية جينوم حسابك الإقليمية.",
    dnaStreakActive: "نشطة حالياً",
    dnaStreakDesc: "أنت في المسار الذهبي للنمو! حافظ على معدل نشر الماتريكس ونظافة الخطافات لتحقيق التضاعف الخوارزمي هذا الأسبوع.",
    activeDnaGenetics: "الجينات الفعالة بحسابك حالياً",
    overallGrowthScore: "مؤشر زخم النمو الإجمالي (Growth Score)",
    overallGrowthScoreDesc: "المقياس الذكي لتراكم القوة والانتشار السلوكي لحسابك بالمنصات.",
    recentAchievements: "أوسمة الهيمنة المكتسبة حديثاً",
    achievementNicheKing: "ملك النيش الإقليمي",
    achievementNicheKingDesc: "تم حيازة هذا الوسام لتصدر معدلات التفاعل الإقليمية مقارنة بالمنافسين.",
    achievementRetentionLord: "سيد الاستبقاء والمحافظة",
    achievementRetentionLordDesc: "تم إحرازه لتحقيق فيديوهاتك نسبة إكمال تتخطى الـ 60% بانتظام.",

    tabHome: "الرئيسية",
    tabMission: "استوديو النمو اليومي",
    tabDna: "لوحة جينوم صانع المحتوى",
    tabUpload: "تحليل لقطة شاشة وتحميل الإحصائيات",
    tabOnboarding: "تهيئة الحساب والجمهور",

    // Tab 1: Simulator & Radar
    simulatorTitle: "محاكي نجاح الفيديو قبل النشر",
    simulatorSubtitle: "قم بكتابة أو لصق السيناريو (Script) الخاص بك، وسيقوم محرك استخبارات DOMINATOR بتحليله وتوقع إحصائيات انتشاره قبل تصويره ونشره بالفعل.",
    simulatorPlaceholder: "اكتب أو الصق فكرة المقطع أو النص البرمجي الكامل للسيناريو هنا (الحد الأدنى 15 كلمة لضمان دقة الفحص الجيني)...",
    simulateBtn: "فحص السيناريو وجينات التفاعل بالذكاء الاصطناعي 🚀",
    simulatingActive: "جاري استنطاق المحاكي وتفكيك جينات السيناريو السلوكية...",
    voiceInputTitle: "إدخال بالصوت (الذكاء الاصطناعي الصوتي)",
    voiceInputListening: "جاري الاستماع... تحدث الآن بالعامية أو الفصحى",
    voiceInputNotSupported: "متصفحك الحالي لا يدعم ميزة التعرف على الصوت بالذكاء الاصطناعي.",
    voiceInputStart: "ابدأ الإملاء الصوتي للسيناريو",
    voiceInputStop: "إيقاف التسجيل الصوتي",

    radarTitle: "رادار الهيمنة والانتشار الفيروسي",
    radarSubtitle: "نظام البحث الدوري في منصات التحليل المتخصصة لاقتناص الفيديوهات الأكثر رواجاً ومواضيعها الفيروسية بحسب تخصص حسابك حالياً.",
    radarLiveTracking: "تتبع حي مستمر",
    radarSearchPlaceholder: "البحث بالكلمات المفتاحية في المواضيع الشائعة...",
    radarNicheLabel: "النيش:",
    radarAllNiches: "جميع التخصصات",
    radarNicheTech: "التقنية (Tech)",
    radarNicheBusiness: "الأعمال والمشاريع (Business)",
    radarNicheFitness: "الرياضة والصحة (Fitness)",
    radarNicheLifestyle: "أسلوب الحياة (Lifestyle)",
    radarNoVideosFound: "لم نجد فيديوهات مطابقة للبحث الحالي في هذا التخصص. جرب تغيير الفلتر.",
    radarGrowthRate: "النمو الأسبوعي",
    radarViews: "مشاهدة",
    radarLikes: "إعجاب",
    radarAnalyzeAndRemix: "تحليل وريمكس ←",
    radarSource: "المصدر: شبكة متتبعي الفيروسية والانتشار الذكية",
    radarLastUpdated: "تم التحديث تلقائياً:",

    // Simulator Results
    simResultTitle: "تقرير تقييم السيناريو الإحصائي والتعبيري المسبق",
    simResultDesc: "قمنا بفحص السيناريو مقابل جينوم حسابك والبيانات التاريخية للنيش، وهذه هي النتائج التنبؤية المعتمدة:",
    successProbability: "نسبة النجاح المتوقعة",
    expectedViews: "المشاهدات المرتقبة",
    expectedRetention: "نسبة الاستبقاء المتوقعة",
    suggestedDuration: "المدة المقترحة للسيناريو",
    sec: "ثانية",
    evaluationTitle: "التشخيص الجيني الدقيق والتحليل النقدي للسيناريو",
    visualSceneStory: "سرد المشهد البصري المقترح بالذكاء الاصطناعي:",
    hookStrength: "قوة الخطاف الأول (Hook Evaluation):",
    verbalPacing: "سرعة ونبرة الإلقاء اللفظي (Verbal Pacing):",
    psychologicalTriggers: "المحفزات السيكولوجية للمتلقي (Psychological Triggers):",
    recomAndOptimizations: "توصيات ومقترحات التطوير والتحسين الفوري:",

    // Radar Modal & Remix
    modalPlatformStats: "إحصائيات وتحليلات الفيديو الدقيقة (منصة التتبع والتحليل)",
    modalViews: "المشاهدات الكلية",
    modalLikes: "تسجيلات الإعجاب",
    modalShares: "إعادة المشاركة (Shares)",
    modalSaves: "المحفوظات (Saves)",
    modalComments: "التعليقات",
    modalDuration: "مدة الفيديو",
    modalRetention: "نسبة الإكمال (Retention)",
    modalGrowth: "النمو الأسبوعي",
    modalDescTitle: "وصف المحتوى وسرد المشاهد البصرية:",
    modalFactorsTitle: "أسرار النجاح والانتشار القياسي للفيديو:",
    modalDnaDnaTitle: "مواصفات هيكل وجينات الفيديو (Structural DNA)",
    modalHookType: "أسلوب ومحفز الخطاف الأول:",
    modalDeliveryTone: "نبرة وطريقة إلقاء المتحدث:",
    modalPacing: "وتيرة الحركة والمونتاج (Pacing):",
    modalCognitiveLoad: "الحمل الذهني على المتلقي (Cognitive Load):",
    modalSourceStats: "إحصائيات وقوة التفاعل بالمنصة الأم:",
    modalRemixBtn: "ريمكس موضوع الفيديو بالذكاء الاصطناعي وبأسلوب الـ DNA الخاص بك 🚀",
    modalRemixLoading: "تحليل جينوم حسابك وصياغة الحمض النووي (DNA) المخصص...",
    modalRemixLoadingDesc: "يقوم نظام الذكاء الاصطناعي بدراسة نقاط القوة في حسابك السلوكية، وإعادة بناء هيكل الفيديو الفيروسي بنفس الموضوع والمحاور الأساسية، وصياغة اسكربت مذهل يتحدث تماماً بشخصيتك وبصمتك التعبيرية مع توليد توقعات إحصائية دقيقة وحقيقية.",
    modalRemixSuccess: "تم صياغة وريمكس الموضوع بنجاح تام! تم تدريب الموديل على جينومك السلوكي لتقمص هويتك ونبرة صوتك الفائزة لإنتاج سيناريو مذهل متطابق مع حمضك النووي (DNA) ومضمون النجاح.",
    modalRemixedScriptTitle: "السيناريو الحصري المطور بـ DNA حسابك (AI Remixed Script)",
    modalCopyScript: "نسخ السيناريو",
    modalCopied: "تم النسخ!",
    modalPredictionReport: "تقرير توقعات النجاح الإحصائي المسبق للفيديو (Predictive Report)",
    modalPredictionSuccess: "نسبة النجاح المتوقعة",
    modalPredictionViews: "المشاهدات المرتبة",
    modalPredictionEngagement: "نسبة التفاعل المتوقعة",
    modalPredictionRetention: "نسبة الإكمال المتوقعة",
    modalPredictionDuration: "المدة المقترحة",
    modalStrengths: "مكامن القوة العالية وعوامل الانتشار (Strengths):",
    modalWeaknesses: "عوامل الضعف ومواطن الخطر (Weaknesses):",
    modalHashtagsTitle: "الهاشتاغات الـ 6 الأكثر رواجاً ونشاطاً بالمنصات حالياً في هذا النيش:",
    modalCopyHashtags: "نسخ الهاشتاغات",
    modalVideoPromptTitle: "برومبت توليد الفيديو السينمائي بالذكاء الاصطناعي (AI Video Prompt)",
    modalCopyVideoPrompt: "نسخ برومبت الفيديو",
    modalQuotaWarning: "تنبيه: تعمل خوادم التحليل حالياً بنظام الكوتا السحابية الاحتياطية فائق الدقة.",
    modalClose: "إغلاق النافذة",

    // Tab 2: Creator Genome Dashboard
    genomeTitle: "بصمة الحمض النووي وصناعة جينوم حسابك",
    genomeSubtitle: "شاشة استخبارات حيوية تستعرض الجينات المكتشفة التي تغذي أداء حسابك إقليمياً بحسب الفيديوهات التي رفعت إحصائياتها سابقاً.",
    weeklyGrowthEvolution: "منحنى زخم النمو التراكمي الأسبوعي (Growth Score Evolution)",
    growthScoreChartLabel: "درجة زخم النمو",
    analyzedVideosCount: "المقاطع التي تم تحليلها:",
    successDriversTitle: "محركات النجاح وجذب المشاهد (Success Drivers)",
    successDriversDesc: "الجينات والعوامل السلوكية والتقنية التي ساهمت تاريخياً في دفع فيديوهاتك نحو الانتشار الفيروسي وتخطي معدلات تخصصك الإقليمية:",
    failureDriversTitle: "محركات الهبوط وخسارة المتابعين (Failure Drivers)",
    failureDriversDesc: "العناصر والثغرات في السيناريو والإنتاج والتوقيت التي أدت بوضوح لانخفاضRetention Rate وكساد المقطع بالمنصات:",
    noDnaData: "لا يوجد بيانات جينية كافية لعرضها. يرجى الذهاب لقسم (تحليل لقطة شاشة) ورفع لقطات إحصائيات فيديوهاتك لتغذية محرك الجينوم وتوليد بصمتك السلوكية الفائزة.",

    // Tab 3: Upload Screenshots
    uploadTitle: "محرك استخلاص وقراءة إحصائيات الفيديوهات الفيروسية",
    uploadSubtitle: "قم برفع لقطة شاشة (Screenshot) لصفحة تحليلات أي مقطع منشور لك من استوديو صناع المحتوى (TikTok / Reels / Shorts)، وسيقوم الذكاء الاصطناعي باستخلاص الأرقام وتفسير جينات نجاحها فوراً.",
    dragDropText: "اسحب وأفلت لقطة شاشة التحليلات هنا",
    orSelectFile: "أو اختر ملفاً من جهازك مباشرة",
    supportedFormats: "الصيغ المدعومة: PNG, JPG, JPEG مع دقة قراءة واضحة للأرقام ونسب الاحتفاظ والمشاهدات.",
    analyzingScreenshot: "جاري تحليل لقطة الشاشة بالذكاء الاصطناعي البصري واستخلاص الأرقام الإقليمية الفائقة...",
    analyzingScreenshotDesc: "نقوم بتمرير الصورة على نموذج قراءة النصوص المتقدم (Vision OCR) ومطابقتها بترميزات تيك توك وإنستغرام لتعبئة الإحصائيات وهندسة الجينوم تلقائياً بدون تدخل يدوي.",
    actualMetricsTitle: "إحصائيات المقطع المستخرجة (Actual Metrics):",
    editMetrics: "تعديل الإحصائيات يدوياً",
    saveMetrics: "حفظ الإحصائيات والتغييرات",
    extractedSuccessMsg: "تم قراءة الإحصائيات بنجاح بالذكاء الاصطناعي البصري! يرجى مراجعة وتعبئة البيانات الإضافية في الأسفل لتأكيد الهضم الجيني.",
    metricsSavedMsg: "تم حفظ وتعديل الإحصائيات بنجاح تام!",
    metaVideoTitle: "عنوان الفيديو المكتوب بالمنصة:",
    metaDuration: "مدة المقطع الكلية (بالثواني):",
    metaHookStyle: "أسلوب الخطاف المعتمد بأول ثانيتين:",
    metaDeliveryTone: "نبرة الصوت وأسلوب الإلقاء المهيمن:",
    metaShowFace: "ظهور وجه صانع المحتوى فوراً في أول ثانية:",
    metaPublishTime: "ساعة النشر الفعلية (توقيت محلي 24 ساعة):",
    metaPublishDay: "يوم النشر الفعلي:",
    metaScriptText: "النص اللفظي الفعلي للسيناريو المتحدث به (اختياري لتغذية التحليل الجيني العميق):",
    submitToDnaEngine: "إرسال البيانات لمحرك الجينوم وتحديث البصمة السلوكية فورا 🧬",
    submittingToDna: "جاري تعشيق الإحصائيات وبناء البنية الجينية وتحديث خوارزمية صانع المحتوى...",

    // Tab 4: Onboarding / Profile
    onboardingTitle: "تهيئة ملف صانع المحتوى ومواصفات الجمهور والنيش",
    onboardingSubtitle: "إعدادات الهوية الأساسية وقناة البث لصانع المحتوى. يرجى تزويد النظام بدقة تامة لتوليد وتحليل المحتوى بصورة ممتازة ومتطابقة مع تخصصك والجمهور المستهدف.",
    profileName: "الاسم أو الاسم الفني لصانع المحتوى:",
    avatarUrl: "رابط الصورة الشخصية (Avatar URL):",
    followerCountLabel: "عدد المتابعين الحالي بالمنصات (رقم دقيق لتقدير النمو):",
    nicheSelectLabel: "التخصص المهيمن والنيش الفعلي لحسابك:",
    audienceGender: "الجنس المهيمن على جمهورك (Audience Gender Dominance):",
    audienceCountry: "الدولة المهيمنة على التفاعل الجغرافي بالمنصات:",
    audienceAge: "الفئة العمرية الأكثر تفاعلاً بمقاطعك:",
    accountAgeMonths: "عمر حسابك الحالي بالمنصات (بالأشهر):",
    onboardingUpdateBtn: "تحديث وحفظ الإعدادات بالخوادم المركزية لـ DOMINATOR 💾",
    onboardingUpdating: "جاري ربط وتحديث ملامح الملف السلوكي وحفظ البيانات الجغرافية...",
    onboardingSuccessMsg: "تم تحديث وحفظ بيانات ملف صانع المحتوى والجمهور بنجاح تام! تم إعادة تشكيل رادار الهيمنة ليتطابق مع تخصصك الجديد فورا.",

    // Footer
    footerCopyright: "جميع الحقوق محفوظة © ٢٠٢٦ نظام DOMINATOR السحابي.",
    footerSlogan: "الذكاء الاصطناعي واستخبارات البيانات للنمو السريع والانتشار الفيروسي."
  },
  en: {
    dir: "ltr",
    langCode: "en",
    fontClass: "font-sans",
    appName: "AI DOMINATOR",
    appSubtitle: "Cumulative Growth OS & Creator Genome Intelligence",
    creatorAccount: "Creator Profile",
    demoUser: "Demo User",
    followers: "followers",
    currentNiche: "Current Niche",
    resetDb: "Reset local database to initial defaults",
    resetDbSuccess: "Local application database successfully reset to default AI configurations!",
    systemNotification: "System Notification",
    notificationBellTitle: "Smart Dominance Alerts (Remix Opportunities)",
    notificationMatchDetected: "High Remix Compatibility Detected! 🧬",
    notificationRemixNow: "Instant Remix",
    notificationMarkRead: "Mark as Read",
    notificationNoAlerts: "No active remix opportunities exceeding 80% affinity in your radar currently.",
    notificationClearAll: "Clear All Alerts",
    todayMissionTitle: "Recommended Daily Growth Mission",
    dnaStreakTitle: "Genome Dominance Streak (DNA Streak)",
    dailyGoal: "Current Daily Goal",
    dailyTargetDesc: "Analyze a new script in the simulator and confirm a success probability exceeding 80% to fuel your regional account genome.",
    dnaStreakActive: "Currently Active",
    dnaStreakDesc: "You are on the golden trajectory! Maintain matrix posting consistency and clean hook structures to unlock compounding algorithm growth this week.",
    activeDnaGenetics: "Active Genetic Profile in Your Account",
    overallGrowthScore: "Overall Growth Score Indicator",
    overallGrowthScoreDesc: "Smart indicator of cumulative strength and behavioral spread of your account across short video platforms.",
    recentAchievements: "Recent Dominance Achievements Unlocked",
    achievementNicheKing: "Regional Niche King",
    achievementNicheKingDesc: "Earned for leading regional engagement rates compared to direct competitors.",
    achievementRetentionLord: "Lord of Viewer Retention",
    achievementRetentionLordDesc: "Earned for consistently maintaining video completion rates above 60%.",

    tabHome: "Home Portal",
    tabMission: "Daily Growth Loop & Simulator",
    tabDna: "Creator Genome Dashboard",
    tabUpload: "Screenshot OCR & Upload Metrics",
    tabOnboarding: "Account & Audience Setup",

    // Tab 1: Simulator & Radar
    simulatorTitle: "Pre-Publishing Video Success Simulator",
    simulatorSubtitle: "Paste your video script below. The DOMINATOR engine will analyze and estimate performance metrics before you record and publish.",
    simulatorPlaceholder: "Type or paste your video idea or full verbal script here (Minimum 15 words for high genetic accuracy)...",
    simulateBtn: "Simulate Success & Check Engagement DNA 🚀",
    simulatingActive: "Querying simulator & analyzing behavioral script genetics...",
    voiceInputTitle: "Voice Input (Speech-to-Text AI)",
    voiceInputListening: "Listening... speak now in Arabic or English",
    voiceInputNotSupported: "Your browser does not support speech recognition APIs.",
    voiceInputStart: "Start Voice Dictation",
    voiceInputStop: "Stop Recording",

    radarTitle: "Dominance Radar & Viral Trends",
    radarSubtitle: "Automated scan of short-video platforms to capture hot viral topics and videos matched to your account's niche.",
    radarLiveTracking: "Live Real-time Tracking",
    radarSearchPlaceholder: "Search hot viral topics with keywords...",
    radarNicheLabel: "Niche:",
    radarAllNiches: "All Niches",
    radarNicheTech: "Technology (Tech)",
    radarNicheBusiness: "Business & Projects (Business)",
    radarNicheFitness: "Fitness & Health (Fitness)",
    radarNicheLifestyle: "Lifestyle",
    radarNoVideosFound: "No trending videos matched your search filters. Try modifying your criteria.",
    radarGrowthRate: "Weekly Growth",
    radarViews: "views",
    radarLikes: "likes",
    radarAnalyzeAndRemix: "Analyze & Remix ←",
    radarSource: "Source: Intelligent Viral Trends Tracking Network",
    radarLastUpdated: "Auto-updated at:",

    // Simulator Results
    simResultTitle: "Pre-Publishing Statistical & Behavioral Evaluation Report",
    simResultDesc: "We analyzed the script against your account profile and historical niche benchmarks. Here are the predictions:",
    successProbability: "Estimated Success Probability",
    expectedViews: "Expected Views Range",
    expectedRetention: "Expected Audience Retention",
    suggestedDuration: "Suggested Video Duration",
    sec: "seconds",
    evaluationTitle: "Deep Genetic Diagnosis & Critical Script Analysis",
    visualSceneStory: "Suggested AI Visual Storyboarding & Scenes:",
    hookStrength: "First 2-Sec Hook Strength:",
    verbalPacing: "Speech Pacing & Delivery Tone:",
    psychologicalTriggers: "Psychological Viewer Triggers:",
    recomAndOptimizations: "Immediate Optimization Recommendations:",

    // Radar Modal & Remix
    modalPlatformStats: "Detailed Video Analytics (Intelligent Tracking Platform)",
    modalViews: "Total Views",
    modalLikes: "Likes Count",
    modalShares: "Shares Count",
    modalSaves: "Saves Count",
    modalComments: "Comments",
    modalDuration: "Duration",
    modalRetention: "Completion Rate (Retention)",
    modalGrowth: "Weekly Growth",
    modalDescTitle: "Content Description & Visual Sequence:",
    modalFactorsTitle: "Secrets Behind the Video's Exponential Success:",
    modalDnaDnaTitle: "Structural DNA & Video Blueprint",
    modalHookType: "Hook Style & Trigger:",
    modalDeliveryTone: "Speaker Delivery & Tone:",
    modalPacing: "Editing Speed & Pacing:",
    modalCognitiveLoad: "Cognitive Load on Viewer:",
    modalSourceStats: "Engagement Weight on Origin Platform:",
    modalRemixBtn: "Remix Topic with AI (Tailored to Your Account DNA) 🚀",
    modalRemixLoading: "Analyzing your account profile and generating personalized DNA script...",
    modalRemixLoadingDesc: "The AI system evaluates your account strengths, retains the core viral topic, and builds a completely fresh, high-impact script written in your unique personality, style, and tone, while providing detailed performance predictions.",
    modalRemixSuccess: "Topic remixed successfully! The model has been calibrated with your behavioral genome to adopt your unique high-converting voice, crafting an incredible script tailored to your style.",
    modalRemixedScriptTitle: "Exclusive Script Crafted with Your Account DNA (AI Remixed Script)",
    modalCopyScript: "Copy Script",
    modalCopied: "Copied!",
    modalPredictionReport: "Pre-Evaluation Success Probability & Statistical Forecast",
    modalPredictionSuccess: "Estimated Success Probability",
    modalPredictionViews: "Projected Views",
    modalPredictionEngagement: "Projected Engagement Rate",
    modalPredictionRetention: "Projected Completion Rate",
    modalPredictionDuration: "Suggested Duration",
    modalStrengths: "High-Potential Strengths & Virality Factors:",
    modalWeaknesses: "Identified Weaknesses & Risk Factors:",
    modalHashtagsTitle: "6 Most Active Trending Hashtags in this Niche Right Now:",
    modalCopyHashtags: "Copy Hashtags",
    modalVideoPromptTitle: "Cinematic AI Video Generation Prompt (AI Video Prompt)",
    modalCopyVideoPrompt: "Copy Video Prompt",
    modalQuotaWarning: "Note: Cloud analysis is running under optimized regional backup servers.",
    modalClose: "Close Window",

    // Tab 2: Creator Genome Dashboard
    genomeTitle: "Behavioral Genome & Creator DNA Profile",
    genomeSubtitle: "Live analytics displaying discovered behavioral patterns fueling your account growth, computed from your uploaded screenshots.",
    weeklyGrowthEvolution: "Weekly Cumulative Growth Score Evolution",
    growthScoreChartLabel: "Growth Score",
    analyzedVideosCount: "Analyzed Videos:",
    successDriversTitle: "Key Success & Engagement Drivers",
    successDriversDesc: "Behavioral and technical genes that historically drove your videos to go viral, exceeding regional niche averages:",
    failureDriversTitle: "Key Failure & Retention Drops Drivers",
    failureDriversDesc: "Gaps in scriptwriting, production, hooks, or timing that caused sharp viewer drops and platform stagnation:",
    noDnaData: "Insufficient genetic data. Please navigate to 'Screenshot OCR & Upload Metrics' and upload your analytics screens to feed the engine and build your winning creator profile.",

    // Tab 3: Upload Screenshots
    uploadTitle: "Viral Video Analytics Screenshot Harvester",
    uploadSubtitle: "Upload a screenshot from your creator center analytics page (TikTok, Reels, or Shorts). Our AI will parse metrics, extract statistics, and instantly digest its success genes.",
    dragDropText: "Drag and drop analytics screenshot here",
    orSelectFile: "Or select a file from your device",
    supportedFormats: "Supported formats: PNG, JPG, JPEG. Ensure numbers, retention metrics, and views are clearly visible.",
    analyzingScreenshot: "Analyzing screenshot via vision-AI models...",
    analyzingScreenshotDesc: "Running Advanced Vision OCR matching TikTok/Reels configurations to extract metrics and feed your genome automatically without manual entry.",
    actualMetricsTitle: "Extracted Video Metrics (Actual):",
    editMetrics: "Edit Metrics Manually",
    saveMetrics: "Save Metrics & Changes",
    extractedSuccessMsg: "Metrics parsed successfully by AI Vision! Review and populate details below to confirm genome feeding.",
    metricsSavedMsg: "Metrics updated and saved successfully!",
    metaVideoTitle: "Video Title on Platform:",
    metaDuration: "Total Video Duration (seconds):",
    metaHookStyle: "Hook Style Used in First 2 Seconds:",
    metaDeliveryTone: "Dominant Tone & Delivery Style:",
    metaShowFace: "Face appears immediately in the first second:",
    metaPublishTime: "Actual Publish Hour (24-hour format):",
    metaPublishDay: "Actual Publish Day:",
    metaScriptText: "Spoken Script text (Optional for deep semantic analysis):",
    submitToDnaEngine: "Send to Genome Engine & Update Behavioral Profile 🧬",
    submittingToDna: "Syncing metrics, generating creator blueprint, and updating behavioral patterns...",

    // Tab 4: Onboarding / Profile
    onboardingTitle: "Onboarding & Creator Target Audience Setup",
    onboardingSubtitle: "Primary identity and target audience configuration. Provide accurate details to calibrate all generation, scripting, and simulation tasks to your target niche.",
    profileName: "Creator Name or Nickname:",
    avatarUrl: "Avatar Image URL:",
    followerCountLabel: "Current Followers (Precise count for growth estimations):",
    nicheSelectLabel: "Primary Channel Niche:",
    audienceGender: "Dominant Audience Gender:",
    audienceCountry: "Primary Geolocation Target (Country):",
    audienceAge: "Primary Audience Age Group:",
    accountAgeMonths: "Current Account Age (in months):",
    onboardingUpdateBtn: "Update Profile & Save to Central Servers 💾",
    onboardingUpdating: "Syncing behavioral profile settings and saving location metrics...",
    onboardingSuccessMsg: "Profile settings updated successfully! Dominance radar and success parameters re-calibrated instantly.",

    // Footer
    footerCopyright: "All rights reserved © 2026 DOMINATOR Cloud OS.",
    footerSlogan: "Advanced AI-driven growth engineering and data intelligence for creators."
  }
};
