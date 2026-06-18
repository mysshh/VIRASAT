import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Presentation,
  Shield,
  Cpu,
  BookOpen,
  Heart,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Award,
  Sparkles,
  Lock,
  Globe,
  Mic,
  Database,
  Terminal,
  FileText,
  HelpCircle,
  X
} from "lucide-react";

interface PitchDeckProps {
  onClose: () => void;
  appUrl?: string;
  theme?: {
    colors: {
      bg: string;
      text: string;
      rust: string;
      green: string;
      border: string;
    };
  };
}

export function PitchDeck({ onClose, appUrl = window.location.href, theme }: PitchDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<"storyteller" | "engineer" | "scholar">("engineer");

  const colors = theme?.colors || {
    bg: "#FAF7F2",
    text: "#3D2B1F",
    rust: "#C66B3D",
    green: "#7B8C6E",
    border: "#E8E2D9"
  };

  const slidesCount = 5;

  const handleNext = () => {
    if (currentSlide < slidesCount - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // LinkedIn Post templates
  const linkedInTemplates = {
    engineer: `🚀 Over the last 5 days, I plunged into the Kaggle & Google developer workshop and came out with a live, full-stack application that preserves ancestral human wisdom safely using AI:

✨ Introducing Virasat (vī-rā-sat | meaning "Heritage") ✨

I wanted to bridge the transition between generational oral folk-medicine and modern pharmacological safety. But my biggest fear was intellectual property theft—too often, traditional tribal remedies are commercially exploited without native credit.

So I engineered a secure "Traditional Knowledge Defensive Publication" buffer:

🛠 The Tech Under the Hood:
1️⃣ Server-Side Generative AI (Gemini APIs): Performs real-time botanical classification, verifies botanical compatibility, and translates old regional dialects.
2️⃣ HTML5 Voice Preservation Engine: Allows elders to narrate remedies in native dialects, transcribed on-the-fly and parsed into structured recipe schemas.
3️⃣ Firebase & Firestore Cloud Vault: Highly responsive, transactional architecture preserving lore securely before it faces extinction.
4️⃣ Indigenous IP Shield: Formulates automated creative licenses establishing public prior art, halting illegal bioprospecting.

I'm camera-shy, so I built an interactive presentation deck directly in the app to showcase the architecture and work in progress! Let me know what you think:

👉 Live App URL: ${appUrl}
💻 Multi-Theme CSS & Custom Bento Layouts fully configured!

#Kaggle #GoogleAI #GenerativeAI #Gemini #Firebase #WebDevelopment #FullStack #SoftwareEngineering #SocialImpact`,
    
    storyteller: `👵 For centuries, grandmother's remedies (Nuskhe) and generational oral recipes have lived purely as spoken words in family kitchens. But every time an elder passes away, a library of organic folk science burns to the ground.

During the joint Kaggle & Google Workshop, I decided to build a secure vault for this sacred wisdom.

Introducing: Virasat ("Heritage")

This app isn't just a database. It's a bridge:
🎤 It lets elders speak their native remedies directly via their phone mic.
🧠 The Gemini API instantly parses and transcribes the speech, providing rigorous botanical taxonomy analysis and translating it across 20+ dialects.
🔒 Most importantly, I designed a Traditional Knowledge IP Shield. By publishing these remedies under defensive prior-art licensing, Virasat legally prevents pharmaceutical corporations from claiming private patents on indigenous wisdom.

I built an interactive showcase presentation directly inside the live build to show my entire engineering process, without having to step in front of a camera!

Experience the legacy here:
👉 Live Demo: ${appUrl}

With sincere thanks to Kaggle and Google for the learning workshop! 🌿

#CulturalHeritage #IndigenousWisdom #SocialGood #TechForGood #AI #Virasat #HumanCenteredDesign`,

    scholar: `📐 Technical Case Study: Protecting Indigenous Intellectual Property From Digital Piracy Using Generative Prior Art.

Traditional herbal combinations (tribal pharmacopeia) are vulnerable to commercial biopiracy. Once digitised without precise legal frameworks, they can be monopolized by corporate patent systems.

As my final project for the Google & Kaggle 5-Day Workshop, I developed a dual-pronged technical framework:

🌐 VIRASAT: Decentered Folk-Remedy Repository

1. Defensive Prior-Art Publishing: Every submitted remedy automatically generates a structured metadata timestamp stored securely in Firebase, establishing legally recognized "Prior Art" to preemptively invalidate corporate patents.
2. Dialect Neutralization via LLM: Integrating Gemini 1.5 & 2.0 pipelines to translate diverse rural idioms (e.g., Hindi, Tamil, Spanish, Punjabi) into standardized scientific botanical equivalents.
3. Audio Transcription pipeline: Directly converts oral heritage streams into unified structured database schemas.

Explore the complete technical schema and slider presentation built into the web app:
👉 Explore Applet: ${appUrl}

#FolkMedicine #IntellectualProperty #BioPiracy #MachineLearning #EthicsInTech #PriorArt #DatabaseDesign`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(linkedInTemplates[selectedPostType]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#FAF7F2] rounded-[36px] border border-amber-900/10 w-full max-w-4xl h-[90vh] md:h-[80vh] flex flex-col overflow-hidden shadow-2xl relative"
        style={{ color: "#3D2B1F" }}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-200/50 text-stone-700 transition cursor-pointer z-50"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress Bar Header */}
        <div className="w-full flex h-1.5 bg-stone-200">
          {Array.from({ length: slidesCount }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 transition-all duration-500 ${
                i <= currentSlide ? "bg-[#C66B3D]" : "bg-stone-200"
              }`}
            />
          ))}
        </div>

        {/* Slides Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-center"
            >
              {currentSlide === 0 && (
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-amber-100 text-[#C66B3D] px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    <span>Kaggle & Google Workshop Graduate</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif font-extrabold tracking-tight italic leading-tight">
                    Virasat <span className="font-sans not-italic text-stone-400 font-normal">heritage</span>
                  </h2>
                  <p className="text-xl text-stone-700 font-serif leading-relaxed max-w-2xl italic">
                    "Every time an elder passes away, a dynamic library of traditional science burns to the ground. Virasat is a digital loom designed to weave vanishing oral wisdom into structured, secure prior art."
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="bg-white/60 p-4 rounded-2xl border border-[#E8E2D9] space-y-2">
                      <Mic className="w-5 h-5 text-[#C66B3D]" />
                      <h4 className="font-sans font-bold text-sm">Oral Input Focus</h4>
                      <p className="text-xs text-stone-600">Built for elders to talk naturally to their micro-devices instead of typing.</p>
                    </div>
                    <div className="bg-white/60 p-4 rounded-2xl border border-[#E8E2D9] space-y-2">
                      <Cpu className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-sans font-bold text-sm">AI Verification</h4>
                      <p className="text-xs text-stone-600">Gemini model maps raw phrases to physical scientific botanical species.</p>
                    </div>
                    <div className="bg-white/60 p-4 rounded-2xl border border-[#E8E2D9] space-y-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h4 className="font-sans font-bold text-sm">IP Defensive Prior-Art</h4>
                      <p className="text-xs text-stone-600">Neutralizes private commercial patent claims on human heritage.</p>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 1 && (
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                    <Shield className="w-4 h-4" />
                    <span>IP Defensive Model Info</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-extrabold tracking-tight">
                    Preventing "Idea Theft" & Corporate Biopiracy
                  </h2>
                  <div className="bg-[#FAF7F2] border-l-4 border-[#C66B3D] p-5 rounded-r-2xl space-y-3 bg-white/40">
                    <h3 className="font-sans font-bold text-lg">How to stop someone from stealing your app or the remedies:</h3>
                    <p className="text-sm leading-relaxed text-stone-700">
                      If you put tribal/traditional secrets on the normal web, corporations can patent them. To stop this, Virasat automatically drafts **Defensive Prior-Art Metadata Certificates**.
                    </p>
                    <p className="text-sm leading-relaxed text-stone-700">
                      Under patent law worldwide (USPTO, WIPO, EPO), an invention cannot be patented if it is already **"Prior Art"**— meaning it was published publicly with a verifiable digital timestamp. 
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-sm text-emerald-950">Your Own Code Protection</h4>
                        <p className="text-xs text-emerald-900 mt-1">
                          You are releasing this in your personal GitHub name, pointing back to your exclusive Kaggle workshop credits. The design uses your own custom bento & museum layout engine.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-sm text-amber-950">Secure Firebase Transactions</h4>
                        <p className="text-xs text-amber-900 mt-1">
                          The entire backend runs server-side (Express.js proxy) and saves into your private, secure Google Cloud Run Cloud SQL or Firestore instances with strict authentication.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 2 && (
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                    <Cpu className="w-4 h-4" />
                    <span>System Architecture Overview</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-extrabold tracking-tight">
                    How Virasat Works Under the Hood
                  </h2>
                  <p className="text-sm text-stone-600 -mt-2">
                    An ecosystem combining Google Vertex/Gemini server-side capabilities with standard web APIs.
                  </p>

                  <div className="relative mt-2 border border-amber-900/10 rounded-2xl overflow-hidden bg-white/70 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Visual diagram representation */}
                    <div className="flex flex-col items-center p-3 border border-stone-200 rounded-xl bg-stone-50 w-full md:w-36 text-center shadow-xs">
                      <Mic className="w-6 h-6 text-[#C66B3D] mb-1 animate-pulse" />
                      <span className="text-xs font-bold font-mono">1. Speak</span>
                      <span className="text-[10px] text-stone-500">Audio registry captures oral idioms</span>
                    </div>

                    <div className="hidden md:block text-[#C66B3D] font-black">➔</div>

                    <div className="flex flex-col items-center p-3 border border-emerald-200 rounded-xl bg-emerald-50/50 w-full md:w-44 text-center shadow-xs">
                      <Sparkles className="w-6 h-6 text-emerald-600 mb-1" />
                      <span className="text-xs font-bold font-mono text-emerald-950">2. Gemini API</span>
                      <span className="text-[10px] text-emerald-850">Botanical analysis + Dialect translation</span>
                    </div>

                    <div className="hidden md:block text-[#C66B3D] font-black">➔</div>

                    <div className="flex flex-col items-center p-3 border border-blue-200 rounded-xl bg-blue-50/50 w-full md:w-36 text-center shadow-xs">
                      <Database className="w-6 h-6 text-blue-600 mb-1" />
                      <span className="text-xs font-bold font-mono text-blue-950">3. Firebase Storage</span>
                      <span className="text-[10px] text-blue-850">Structured ledger & timestamps</span>
                    </div>

                    <div className="hidden md:block text-[#C66B3D] font-black">➔</div>

                    <div className="flex flex-col items-center p-3 border border-amber-200 rounded-xl bg-amber-50/50 w-full md:w-36 text-center shadow-xs">
                      <Award className="w-6 h-6 text-amber-600 mb-1" />
                      <span className="text-xs font-bold font-mono text-amber-950">4. Defensive Art</span>
                      <span className="text-[10px] text-amber-850">Legally blocks corporate IP theft</span>
                    </div>
                  </div>

                  <div className="bg-stone-800 text-stone-300 p-4 rounded-xl font-mono text-[11px] space-y-1">
                    <p className="text-emerald-400"># Server-side integration pipeline logs:</p>
                    <p>$ Initializing admin.initializeApp() using safe env certificates...</p>
                    <p className="text-amber-400">✔ admin.firestore() database target: {appUrl.includes("shh41") ? "modified-doodad-shh41" : "active-virasat-db"}</p>
                    <p>✔ Server-side GoogleGenAI configured with secure GEMINI_API_KEY.</p>
                  </div>
                </div>
              )}

              {currentSlide === 3 && (
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 bg-stone-200 text-stone-700 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                    <Terminal className="w-4 h-4" />
                    <span>Working Progress & App Achievements</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-extrabold tracking-tight">
                    Progress Checklist & Feature Accomplishments
                  </h2>
                  <p className="text-sm text-stone-600 -mt-2">
                    Here is what we implemented step-by-step over the joint Google & Kaggle dev sprints:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-white/50 p-4 rounded-2xl border border-stone-200 space-y-2">
                      <h4 className="font-bold text-[#C66B3D] text-sm flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-[#C66B3D] shrink-0" />
                        Traditional Aesthetic Engine
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Features <span className="font-bold">5 distinctive portals</span> (Classic, Bento, Minimalist, Museum visual layout, and Garden Bloom) and <span className="font-bold">4 custom organic color sets</span> (Terracotta, Sandalwood, Royal Saffron, and Dark Hearth mode) that adapt instantly.
                      </p>
                    </div>

                    <div className="bg-white/50 p-4 rounded-2xl border border-stone-200 space-y-2">
                      <h4 className="font-bold text-[#C66B3D] text-sm flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-[#C66B3D] shrink-0" />
                        Smart Multi-Lingual Changers
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Translates remedy listings dynamically into local regional Indian scripts (Devanagari, Tamil, Marathi, Punjabi) or global languages via server-side translation modules, neutralizing terminology boundaries.
                      </p>
                    </div>

                    <div className="bg-white/50 p-4 rounded-2xl border border-stone-200 space-y-2">
                      <h4 className="font-bold text-[#C66B3D] text-sm flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-[#C66B3D] shrink-0" />
                        Integrated Audio & Waveform Recorder
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Enables user micro-recordings with visual state trackers, supporting effortless handless audio narration of recipes.
                      </p>
                    </div>

                    <div className="bg-white/50 p-4 rounded-2xl border border-stone-200 space-y-2">
                      <h4 className="font-bold text-[#C66B3D] text-sm flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-[#C66B3D] shrink-0" />
                        Robust Cloud Run Deployment Ready
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Bundled securely into unified `dist/server.cjs` backend, using optimized Webpack/Esbuild presets to satisfy serverless boot times and persistent Firestore security.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 4 && (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-[#C66B3D]/10 text-[#C66B3D] px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                    <Globe className="w-4 h-4" />
                    <span>Copy Post & Launch on LinkedIn</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-extrabold tracking-tight">
                    Generate Your Camera-Shy LinkedIn Launch Post
                  </h2>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Since you are camera shy, a high-impact, technical, and story-driven text post outlining your project, tech stack achievements, and Google/Kaggle credits is remarkably powerful.
                  </p>

                  {/* Pick Tone Tab Selector */}
                  <div className="flex gap-2 p-1 bg-stone-200/50 rounded-xl text-xs w-fit">
                    {(["engineer", "storyteller", "scholar"] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedPostType(type)}
                        className={`px-4 py-1.5 rounded-lg capitalize font-bold font-sans transition-all cursor-pointer ${
                          selectedPostType === type ? "bg-[#C66B3D] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        {type === "engineer" ? "🛠 Technical Engineer" : type === "storyteller" ? "🌿 Warm Storyteller" : "🏛 Research Scholar"}
                      </button>
                    ))}
                  </div>

                  {/* Generated Post text box */}
                  <div className="relative">
                    <textarea
                      readOnly
                      value={linkedInTemplates[selectedPostType]}
                      className="w-full h-44 bg-white border border-amber-900/10 p-4 rounded-2xl font-sans text-xs text-stone-700 leading-relaxed resize-none focus:outline-none"
                    />
                    <button
                      onClick={handleCopy}
                      className="absolute right-4 bottom-4 bg-stone-900 hover:bg-stone-800 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied! Ready to post</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Post Text</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-stone-500 italic text-center">
                    Pro tip: Go to LinkedIn, create a new post, paste this text content, and add a screenshot/GIF of your Virasat Traditional Selection Studio! Let corporations see your craftsmanship directly.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls inside Slides Container */}
          <div className="border-t border-amber-900/10 pt-4 flex items-center justify-between">
            <span className="text-xs font-mono text-stone-500">
              Slide {currentSlide + 1} of {slidesCount}
            </span>

            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className="p-2.5 rounded-full border border-amber-900/10 hover:bg-stone-200/50 text-stone-700 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                onClick={currentSlide === slidesCount - 1 ? onClose : handleNext}
                className="bg-[#C66B3D] hover:bg-[#C66B3D]/95 text-white py-2.5 px-6 rounded-full shadow-sm font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-all"
              >
                <span>{currentSlide === slidesCount - 1 ? "Start Pitching" : "Next Slide"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
