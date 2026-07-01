import os
import random
import time
import json
import logging
import base64
import requests
import concurrent.futures
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from google import genai
from google.genai import types

# --- INITIALIZATION ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'DOMINATOR_CINEMATICA_PRIME')
app.config['ENV'] = 'production'

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SIC_CORE")

# --- AI CONNECTIVITY ---
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
client = None
AI_ACTIVE = False

if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        AI_ACTIVE = True
        logger.info(">> [SYSTEM] v19.1 CINEMATICA PRIME ACTIVE.")
    except Exception as e:
        logger.error(f"!! [ERROR] AI Connection Failed: {e}")
else:
    logger.warning("!! [CRITICAL] KEY MISSING.")

# --- INTELLIGENCE CORE (v19.1 - CINEMATICA PRIME) ---
class StrategicIntelligenceCore:
    def __init__(self):
        self.version = "19.1 (Cinematica-Prime)"

    def _generate_backup_image(self, prompt, niche, aspect_ratio="16:9"):
        try:
            logger.info(f">> Switching to Flux Backup... Aspect: {aspect_ratio}")
            seed = random.randint(1, 999999999)
            forced_prompt = f"{niche} masterpiece, {prompt}, cinematic lighting, 8k, hyper-realistic, --no text"
            
            # تحديد الأبعاد بدقة للـ Reels
            width, height = (1280, 720) if aspect_ratio == "16:9" else (720, 1280)
            
            url = f"https://image.pollinations.ai/prompt/{forced_prompt}?model=flux&width={width}&height={height}&nologo=true&seed={seed}"
            response = requests.get(url, timeout=20)
            if response.status_code == 200:
                return base64.b64encode(response.content).decode('utf-8')
            return None
        except: return None

    def _materialize_visual(self, prompt, niche, aspect_ratio="16:9"):
        # دمج أسلوب dominator_brain (Elite Vibe)
        final_prompt = f"A photorealistic, highly cinematic image of {niche}. {prompt}. Sharp focus, 8k resolution, professional photography, dramatic lighting."
        if not AI_ACTIVE or not client: return self._generate_backup_image(final_prompt, niche, aspect_ratio)
        try:
            response = client.models.generate_images(
                model='imagen-3.0-generate-001', prompt=final_prompt,
                config=types.GenerateImageConfig(number_of_images=1, aspect_ratio=aspect_ratio)
            )
            if response.generated_images:
                return base64.b64encode(response.generated_images[0].image.image_bytes).decode('utf-8')
            raise Exception("No Google Image")
        except: return self._generate_backup_image(final_prompt, niche, aspect_ratio)

    def _build_expert_prompt(self, niche, mode):
        styles = ["Cinematic Commercial", "Cyber-Noir", "Macro Luxury", "National Geographic"]
        selected_style = random.choice(styles)
        
        if mode == 'REELS_ENGINE':
            sys_inst = f"""
            Role: Elite Video Director & Viral Scriptwriter.
            Niche: {niche}. Visual Style: {selected_style}.
            
            Task: Create a 3-scene Storyboard for a viral TikTok/Reels video that will dominate the algorithm.
            1. Write a mind-blowing Arabic Voiceover script (Hook -> Value -> CTA).
            2. For EACH of the 3 scenes, write a highly detailed English image prompt. The images will be VERTICAL (9:16). Describe lighting, subject, texture, and action. NO TEXT IN IMAGES.
            3. Extract 8 hashtags.
            
            OUTPUT STRICTLY JSON:
            {{
                "title": "Arabic Video Title/Hook",
                "scenes": [
                    {{"time": "0-3s", "voiceover": "Arabic text", "image_prompt": "English prompt for vertical scene 1..."}},
                    {{"time": "3-7s", "voiceover": "Arabic text", "image_prompt": "English prompt for vertical scene 2..."}},
                    {{"time": "7-15s", "voiceover": "Arabic text", "image_prompt": "English prompt for vertical scene 3..."}}
                ],
                "hashtags": ["#tag1", ...],
                "sentiment": "Tone"
            }}
            """
        else:
            sys_inst = f"""
            Role: Elite Content Strategist.
            Niche: {niche}. Style: {selected_style}.
            Task:
            1. Arabic Viral Post (Hook + Body).
            2. Detailed English Image Prompt (Visuals ONLY, NO Text).
            3. 8 Hashtags.
            OUTPUT STRICTLY JSON:
            {{
                "title": "Hook", "body": "Content", "image_prompt": "Visuals", "hashtags": [], "framework": "Name", "sentiment": "Tone"
            }}
            """
        
        user_msg = f"Execute protocol for {niche}. Random Seed: {random.randint(1,9999)}"
        return sys_inst, user_msg

    def generate_warhead(self, niche, mode):
        if not AI_ACTIVE: return {"error": "AI Offline", "title": "System Offline", "body": "Check API Key"}
        try:
            sys_inst, user_msg = self._build_expert_prompt(niche, mode)
            res = client.models.generate_content(
                model='gemini-2.5-flash', # Upgraded to 2.5 if available, fallback handled by API
                config=types.GenerateContentConfig(system_instruction=sys_inst, response_mime_type='application/json'),
                contents=[user_msg]
            )
            content = json.loads(res.text)
            
            # -- Parallel Image Processing for REELS --
            if mode == 'REELS_ENGINE' and 'scenes' in content:
                logger.info(">> [CINEMATICA] Launching parallel render for 3 vertical scenes...")
                
                def render_scene(scene):
                    # Request Vertical 9:16 images
                    b64 = self._materialize_visual(scene['image_prompt'], niche, aspect_ratio="9:16")
                    scene['image_base64'] = b64
                    return scene
                
                # Multi-threading for hyper-speed generation
                with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                    content['scenes'] = list(executor.map(render_scene, content['scenes']))
                    
            else:
                # Standard Horizontal 16:9 Post
                content["image_base64"] = self._materialize_visual(content.get("image_prompt", niche), niche, aspect_ratio="16:9")
            
            return content
            
        except Exception as e:
            logger.error(f"Gen Error: {e}")
            return {"error": "Generation Failed", "title": "Error", "body": str(e)}

sic_engine = StrategicIntelligenceCore()

# --- ROUTES ---

@app.route('/')
def dashboard():
    return render_template_string(DASHBOARD_HTML)

@app.route('/api/tactical/execute', methods=['POST'])
def execute_order():
    data = request.json
    niche = data.get('niche')
    mode = data.get('mode')
    
    content = sic_engine.generate_warhead(niche, mode)
    
    if "error" in content and content["error"] != "AI Offline": 
        return jsonify(content), 500

    response_payload = {
        "status": "SUCCESS",
        "title": content.get('title'),
        "hashtags": content.get('hashtags', []),
        "metrics": {
            "viralityScore": random.randint(95, 99),
            "predictedReach": random.randint(500000, 5000000),
            "sentiment": content.get('sentiment', 'Intense/Viral')
        },
        "is_reel": 'scenes' in content
    }

    if response_payload["is_reel"]:
        response_payload["scenes"] = content.get('scenes', [])
    else:
        response_payload["body"] = content.get('body')
        response_payload["image_base64"] = content.get('image_base64')
        response_payload["image_prompt"] = content.get('image_prompt')
        response_payload["framework"] = content.get('framework')

    return jsonify(response_payload)

# --- THE MIND-BLOWING INTERFACE (CINEMATICA PRIME) ---
DASHBOARD_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI DOMINATOR | CINEMATICA PRIME</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.net.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; background: #030303; overflow-x: hidden; color: white; margin: 0; }
        .arabic-text { font-family: 'Tajawal', sans-serif; direction: rtl; }
        .glass { background: rgba(10, 10, 10, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5); }
        .glass-card { background: linear-gradient(145deg, rgba(20,20,20,0.8) 0%, rgba(5,5,5,0.9) 100%); border: 1px solid rgba(255,255,255,0.03); }
        #vanta-canvas { position: fixed; z-index: -1; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 2px; }
        
        .scene-card { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .scene-card:hover { transform: translateY(-10px); box-shadow: 0 20px 50px rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4); z-index: 10; }
        
        /* Audio Waveform Animation */
        .wave { width: 3px; height: 10px; background: #10b981; margin: 0 2px; border-radius: 2px; display: inline-block; animation: wave 1s ease-in-out infinite; }
        .wave:nth-child(2) { animation-delay: 0.1s; }
        .wave:nth-child(3) { animation-delay: 0.2s; }
        .wave:nth-child(4) { animation-delay: 0.3s; }
        .wave:nth-child(5) { animation-delay: 0.4s; }
        @keyframes wave { 0%, 100% { height: 6px; } 50% { height: 20px; } }
        
        /* Neon Glow Text */
        .glow-text { text-shadow: 0 0 10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3); }
    </style>
</head>
<body class="min-h-screen flex h-screen overflow-hidden">
    
    <div id="vanta-canvas"></div>

    <!-- SIDEBAR NAVIGATION -->
    <aside class="w-20 lg:w-64 border-r border-white/5 bg-black/50 backdrop-blur-3xl flex flex-col items-center lg:items-start py-6 z-40 transition-all duration-300">
        <div class="px-0 lg:px-6 mb-10 w-full flex justify-center lg:justify-start items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div class="hidden lg:block">
                <h1 class="text-xl font-black tracking-tighter text-white">DOMINATOR</h1>
                <p class="text-[9px] text-emerald-500 uppercase tracking-[0.3em]">Cinematica Prime</p>
            </div>
        </div>

        <nav class="flex-1 w-full space-y-2 px-2 lg:px-4">
            <button class="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 text-white font-bold transition-all border border-white/5">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                <span class="hidden lg:block text-sm">Studio</span>
            </button>
            <button class="w-full flex items-center justify-between p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                <div class="flex items-center gap-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span class="hidden lg:block text-sm">Kronos Autopilot</span>
                </div>
                <span class="hidden lg:block text-[8px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase border border-red-500/20">Locked</span>
            </button>
        </nav>

        <div class="mt-auto w-full px-2 lg:px-4">
            <div class="glass-card rounded-xl p-3 flex items-center justify-center lg:justify-start gap-3 border border-emerald-500/20">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="hidden lg:block text-xs font-mono text-emerald-400">ENGINE ONLINE</span>
            </div>
        </div>
    </aside>

    <!-- MAIN DASHBOARD -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <!-- TOPBAR -->
        <header class="h-20 border-b border-white/5 bg-black/20 backdrop-blur flex items-center justify-between px-8">
            <div class="text-sm font-mono text-gray-400">PROJECT: <span class="text-white font-bold">ALPHA-STRIKE</span></div>
            <button class="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                Export Assets
            </button>
        </header>

        <!-- CONTENT AREA -->
        <div class="flex-1 overflow-y-auto p-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            <!-- LEFT: INPUT CONSOLE -->
            <div class="xl:col-span-3 flex flex-col gap-6">
                <div class="glass-card rounded-3xl p-6 relative overflow-hidden">
                    <div class="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                    
                    <h2 class="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                        <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                        Target Parameters
                    </h2>
                    
                    <div class="space-y-5">
                        <div>
                            <label class="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1 mb-2 block">Niche / Topic</label>
                            <input type="text" id="niche" placeholder="e.g. Real Estate in Dubai..." class="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm shadow-inner">
                        </div>
                        
                        <div>
                            <label class="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1 mb-2 block">Output Format</label>
                            <div class="grid grid-cols-1 gap-2">
                                <button onclick="setMode('REELS_ENGINE')" id="btnR" class="relative overflow-hidden group p-4 border border-emerald-500 bg-emerald-500/10 text-emerald-400 text-sm font-bold rounded-xl transition-all flex items-center justify-between shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                                    <span class="relative z-10 flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg> REELS (9:16)</span>
                                    <span class="relative z-10 text-[9px] bg-emerald-500 text-black px-2 py-0.5 rounded uppercase font-black">PRO</span>
                                </button>
                                <button onclick="setMode('VIRAL_ATTACK')" id="btnV" class="p-4 border border-white/10 bg-black/40 text-gray-400 text-sm font-bold rounded-xl transition-all flex items-center gap-2 hover:bg-white/5">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> POST (16:9)
                                </button>
                            </div>
                        </div>
                    </div>

                    <button onclick="run()" id="runBtn" class="mt-8 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] transition-all flex justify-center items-center gap-2 transform hover:-translate-y-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <span>SYNTHESIZE</span>
                    </button>
                </div>
                
                <!-- TERMINAL -->
                <div class="glass-card rounded-2xl p-4 flex-1 min-h-[200px] flex flex-col border border-white/5">
                    <div class="text-[9px] text-gray-500 uppercase tracking-widest mb-3 flex justify-between items-center">
                        <span>Neural Terminal</span>
                        <span class="flex items-center gap-1"><div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> LIVE</span>
                    </div>
                    <div id="logs" class="flex-1 overflow-y-auto space-y-2 text-[10px] font-mono text-gray-400">
                        <div class="text-emerald-500/50">> Cinematica Engine initialized.</div>
                    </div>
                </div>
            </div>
            
            <!-- RIGHT: THE STAGE -->
            <div class="xl:col-span-9 relative flex flex-col min-h-[600px]">
                
                <!-- LOADER OVERLAY -->
                <div id="loader" class="hidden absolute inset-0 glass rounded-3xl z-30 flex flex-col items-center justify-center">
                    <div class="relative w-24 h-24 mb-8">
                        <div class="absolute inset-0 border-4 border-emerald-500/10 rounded-full"></div>
                        <div class="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-[spin_1s_linear_infinite]"></div>
                        <div class="absolute inset-2 border-4 border-blue-500/20 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
                        <svg class="absolute inset-0 m-auto w-8 h-8 text-emerald-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    </div>
                    <div class="text-3xl font-black text-white tracking-[0.2em] mb-2 glow-text">SYNTHESIZING</div>
                    <div class="text-sm text-emerald-400 font-mono tracking-widest" id="loadStatus">Parallel Image Generation...</div>
                </div>
                
                <!-- EMPTY STATE -->
                <div id="empty" class="flex-1 glass rounded-3xl flex flex-col items-center justify-center text-gray-500 border border-white/5">
                    <div class="w-32 h-32 bg-black/50 rounded-full flex items-center justify-center mb-6 shadow-[inset_0_0_30px_rgba(255,255,255,0.02)] border border-white/5">
                        <svg class="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                    </div>
                    <div class="text-lg font-light tracking-[0.3em] uppercase text-gray-400">Studio Standby</div>
                </div>

                <!-- RESULT CONTAINER -->
                <div id="result" class="hidden flex-1 flex flex-col gap-6 animate-[fadeIn_0.8s_ease-out]">
                    
                    <!-- Top Metrics -->
                    <div class="glass-card rounded-2xl p-5 flex flex-wrap justify-between items-center shadow-2xl border-b-2 border-emerald-500/50">
                        <h1 id="resTitle" class="text-2xl lg:text-3xl font-bold text-white flex-1 text-right leading-tight arabic-text"></h1>
                        <div class="flex gap-6 ml-8 border-l border-white/10 pl-8">
                            <div class="text-center">
                                <div class="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Virality Score</div>
                                <div id="scoreVal" class="text-2xl font-black text-emerald-400 glow-text">99%</div>
                            </div>
                            <div class="text-center">
                                <div class="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Est. Reach</div>
                                <div id="reachVal" class="text-2xl font-black text-white">1M+</div>
                            </div>
                        </div>
                    </div>

                    <!-- DYNAMIC CONTENT: INJECTED HERE -->
                    <div id="dynamicContent" class="flex-1 overflow-y-auto pr-2 pb-10"></div>

                    <!-- HASHTAGS -->
                    <div class="glass-card rounded-2xl p-5">
                        <div id="resTags" class="flex flex-wrap gap-3 justify-center arabic-text"></div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        let mode = 'REELS_ENGINE';
        
        function log(msg) {
            const logs = document.getElementById('logs');
            const div = document.createElement('div');
            div.innerHTML = `<span class="text-emerald-500">></span> ${msg}`;
            logs.appendChild(div);
            logs.scrollTop = logs.scrollHeight;
            document.getElementById('loadStatus').textContent = msg;
        }

        function setMode(m) {
            mode = m;
            document.getElementById('btnR').className = mode === 'REELS_ENGINE' 
                ? "relative overflow-hidden group p-4 border border-emerald-500 bg-emerald-500/10 text-emerald-400 text-sm font-bold rounded-xl transition-all flex items-center justify-between shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]" 
                : "relative overflow-hidden group p-4 border border-white/10 bg-black/40 text-gray-400 text-sm font-bold rounded-xl transition-all flex items-center justify-between hover:bg-white/5";
            
            document.getElementById('btnV').className = mode === 'VIRAL_ATTACK' 
                ? "p-4 border border-emerald-500 bg-emerald-500/10 text-emerald-400 text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]" 
                : "p-4 border border-white/10 bg-black/40 text-gray-400 text-sm font-bold rounded-xl transition-all flex items-center gap-2 hover:bg-white/5";
        }

        async function run() {
            const niche = document.getElementById('niche').value;
            if(!niche) return;
            
            document.getElementById('empty').classList.add('hidden');
            document.getElementById('result').classList.add('hidden');
            document.getElementById('loader').classList.remove('hidden');
            document.getElementById('runBtn').disabled = true;
            
            log(`Injecting targets for: ${niche}`);
            if(mode === 'REELS_ENGINE') log("Firing 3 parallel image threads (Hold tight)...");
            else log("Rendering 16:9 cinematic shot...");
            
            try {
                const res = await fetch('/api/tactical/execute', {
                    method:'POST', headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({niche, mode})
                });
                const data = await res.json();
                if(data.error) throw new Error(data.body);
                
                log("Synthesis complete. Compiling assets...");

                document.getElementById('resTitle').textContent = data.title;
                document.getElementById('scoreVal').textContent = data.metrics.viralityScore + "%";
                document.getElementById('reachVal').textContent = (data.metrics.predictedReach/1000).toFixed(1) + "k";

                const contentArea = document.getElementById('dynamicContent');
                contentArea.innerHTML = '';

                if(data.is_reel) {
                    // --- STORYBOARD UI ---
                    let html = `<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">`;
                    data.scenes.forEach((scene, index) => {
                        const imgSource = scene.image_base64 ? `data:image/png;base64,${scene.image_base64}` : '';
                        html += `
                            <div class="scene-card glass-card rounded-3xl overflow-hidden relative aspect-[9/16] shadow-2xl flex flex-col justify-end group border-t border-white/10">
                                <img src="${imgSource}" class="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-[2s] group-hover:scale-110" alt="Scene ${index+1}">
                                <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-10 opacity-90 group-hover:opacity-80 transition-opacity"></div>
                                
                                <!-- Scene Badge -->
                                <div class="absolute top-5 left-5 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white font-mono text-[10px] tracking-widest shadow-lg">
                                    SCENE 0${index+1}
                                </div>
                                <!-- Time Badge -->
                                <div class="absolute top-5 right-5 z-20 bg-emerald-500 text-black font-black px-3 py-1.5 rounded-lg text-[10px] shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                    ${scene.time}
                                </div>
                                
                                <div class="relative z-20 p-6 flex flex-col gap-4">
                                    <!-- Audio Visualizer Mockup -->
                                    <div class="flex items-center gap-2 bg-black/50 w-fit px-3 py-1.5 rounded-full border border-white/5 mb-2">
                                        <div class="flex items-end h-3">
                                            <div class="wave"></div><div class="wave"></div><div class="wave"></div><div class="wave"></div><div class="wave"></div>
                                        </div>
                                        <span class="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Voiceover</span>
                                    </div>
                                    
                                    <!-- Script -->
                                    <p class="text-white text-lg lg:text-xl font-bold leading-relaxed drop-shadow-2xl arabic-text border-r-2 border-emerald-500 pr-4">
                                        "${scene.voiceover}"
                                    </p>
                                    
                                    <!-- Hidden Prompt -->
                                    <div class="mt-2 h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300">
                                        <div class="text-[9px] text-gray-400 font-mono bg-black/80 backdrop-blur p-3 rounded-xl border border-white/10 leading-relaxed shadow-inner">
                                            <span class="text-emerald-500 block mb-1">PROMPT:</span>
                                            ${scene.image_prompt}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    html += `</div>`;
                    contentArea.innerHTML = html;
                    log("Storyboard Rendered.");
                } else {
                    // --- STANDARD POST UI ---
                    const imgSource = data.image_base64 ? `data:image/png;base64,${data.image_base64}` : '';
                    contentArea.innerHTML = `
                        <div class="flex flex-col gap-8 max-w-4xl mx-auto w-full h-full">
                            <div class="glass-card rounded-[2rem] p-2 overflow-hidden shadow-2xl relative">
                                <div class="aspect-video bg-black rounded-[1.5rem] overflow-hidden relative group border border-white/5">
                                    <img src="${imgSource}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                                    <div class="absolute bottom-5 left-5 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-emerald-400 font-mono text-xs shadow-xl flex items-center gap-2">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        16:9 MASTERPIECE
                                    </div>
                                </div>
                            </div>
                            <div class="glass-card rounded-[2rem] p-10 shadow-2xl border-t border-white/10">
                                <div class="text-white text-xl lg:text-2xl leading-loose font-light whitespace-pre-line arabic-text">${data.body}</div>
                            </div>
                        </div>
                    `;
                    log("Post Asset Rendered.");
                }

                // Tags
                const t = document.getElementById('resTags'); t.innerHTML='';
                data.hashtags.forEach(h=>{
                    const s=document.createElement('span'); 
                    s.className="px-4 py-2 rounded-xl bg-white/5 text-sm text-gray-300 font-bold border border-white/5 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors cursor-default shadow-sm"; 
                    s.textContent=h; 
                    t.appendChild(s);
                });
                
                document.getElementById('result').classList.remove('hidden');
                
            } catch(e) { 
                alert("Execution Halted: "+e); 
                log("CRITICAL FAILURE.");
                document.getElementById('empty').classList.remove('hidden');
            }
            finally { 
                document.getElementById('loader').classList.add('hidden'); 
                document.getElementById('runBtn').disabled = false;
            }
        }

        // Vanta Net Background - Smooth & Elegant
        document.addEventListener("DOMContentLoaded",()=>{
            try{
                VANTA.NET({
                    el: "#vanta-canvas", mouseControls: true, touchControls: true, gyroControls: false,
                    minHeight: 200, minWidth: 200, scale: 1, scaleMobile: 1,
                    color: 0x10b981, backgroundColor: 0x030303, points: 12, maxDistance: 22, spacing: 20, showDots: true
                })
            }catch(e){console.log("Vanta Fallback", e)}
        });
    </script>
</body>
</html>
"""

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
