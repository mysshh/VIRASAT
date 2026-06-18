import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  BookOpen,
  Heart,
  Plus,
  ArrowRight,
  MessageSquare,
  Search,
  Filter,
  Globe,
  Mic,
  Square,
  Star,
  Play,
  RotateCcw,
  Volume2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Award,
  Video,
  Menu,
  Check,
  User,
  Coffee,
  X,
  Presentation
} from "lucide-react";
import virasatLogo from "./assets/images/virasat_logo_clean_1781625551798.jpg";
import { RecipeEntry, CommentEntry, TranslationResponse } from "./types";
import { scaleAndConvertIngredient } from "./utils/scaler";
import { BrewTimer } from "./components/BrewTimer";
import { IngredientCabinet } from "./components/IngredientCabinet";
import { PitchDeck } from "./components/PitchDeck";


// Supported translation languages
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "mr", name: "Marathi (मराठी)" },
  { code: "ta", name: "Tamil (தமிழ்)" },
  { code: "bn", name: "Bengali (বাংলা)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "pa", name: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "it", name: "Italian (Italiano)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "zh", name: "Chinese (中文)" },
  { code: "ru", name: "Russian (Русский)" },
  { code: "ko", name: "Korean (한국어)" },
  { code: "pt", name: "Portuguese (Português)" },
  { code: "ur", name: "Urdu (اردو)" },
  { code: "sw", name: "Swahili (Kiswahili)" },
  { code: "vi", name: "Vietnamese (Tiếng Việt)" },
  { code: "tr", name: "Turkish (Türkçe)" },
  { code: "fa", name: "Persian (فارسی)" },
  { code: "id", name: "Indonesian (Bahasa Indonesia)" }
];

export const THEMES = [
  {
    id: "terracotta",
    name: "Terracotta Clay",
    icon: "🏺",
    description: "Rustic warm terracotta, vermillion, and herbal sage",
    colors: {
      bg: "#FAF7F2",
      text: "#3D2B1F",
      rust: "#C66B3D",
      green: "#7B8C6E",
      border: "#E8E2D9"
    }
  },
  {
    id: "sandalwood",
    name: "Sandalwood Sage",
    icon: "🌿",
    description: "Serene herbal sage, fresh sandalwood, and pale book cream",
    colors: {
      bg: "#F4F1EA",
      text: "#2E3B23",
      rust: "#A5753F",
      green: "#5B7051",
      border: "#DFD9CD"
    }
  },
  {
    id: "saffron",
    name: "Royal Saffron",
    icon: "👑",
    description: "Vibrant ancient saffron gold with pomegranate accents",
    colors: {
      bg: "#FFFBF0",
      text: "#351F14",
      rust: "#D97706",
      green: "#991B1B",
      border: "#EFE5CE"
    }
  },
  {
    id: "charcoal",
    name: "Midnight Hearth",
    icon: "🪵",
    description: "Comforting, eye-safe midnight dark mode with glowing embers",
    colors: {
      bg: "#151210",
      text: "#ECE3D5",
      rust: "#EC7A44",
      green: "#A4BA98",
      border: "#29221D"
    }
  }
];

export const PORTALS = [
  {
    id: "classic",
    name: "Classic Ledger",
    icon: "📖",
    description: "Symmetric split-screen botanical layout offering quick scroll indices alongside active reading chambers."
  },
  {
    id: "bento",
    name: "Heritage Bento Hub",
    icon: "🍱",
    description: "Multi-layered responsive block showcase grouping the AI Voice Consultant, spice drawer, and modern media stories."
  },
  {
    id: "minimal",
    name: "Wellness Almanac",
    icon: "📰",
    description: "Poetic single-column botanical diary. Centered negative space, elegant serif accents, and flowing tea-steeping widgets."
  },
  {
    id: "museum",
    name: "Curator's Vault",
    icon: "🏛️",
    description: "Highly structured catalog database registry. Offers spreadsheet table columns, dialect search, and quick index metadata."
  },
  {
    id: "garden",
    name: "Herbarium Bloom",
    icon: "🪻",
    description: "An organic, sculptural exploration of entries. Browse ancestral wisdom in a free-flowing garden of discovery."
  }
];

export default function App() {
  // Application State
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem("virasat_theme") || "terracotta";
  });
  const [homepageLayout, setHomepageLayout] = useState<'classic' | 'bento' | 'minimal' | 'museum' | 'garden'>(() => {
    return (localStorage.getItem("virasat_layout") as 'classic' | 'bento' | 'minimal' | 'museum' | 'garden') || "classic";
  });
  const currentTheme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
  const [entries, setEntries] = useState<RecipeEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<RecipeEntry | null>(null);
  const [servingsMultiplier, setServingsMultiplier] = useState<number>(1);
  const [isMetricEnabled, setIsMetricEnabled] = useState<boolean>(false);

  // Automatically extract cooking/steeping minutes from text instructions
  const brewingSeconds = React.useMemo(() => {
    if (!selectedEntry) return 180;
    const brewTimeRegex = /(\d+)\s*(-\s*\d+)?\s*(minutes?|mins?)\b/i;
    for (const step of selectedEntry.instructions) {
      const match = step.match(brewTimeRegex);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > 0 && val <= 120) return val * 60;
      }
    }
    return 180; // default 3 mins (180 secs)
  }, [selectedEntry]);

  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // AI Botanical & Cultural Analysis state
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, {
    botanicalNames: string[];
    scientificExplanation: string;
    culturalTrivia: string;
    substitutions: string[];
    warnings: string;
  }>>({});

  // AI Consult state
  const [consultQuery, setConsultQuery] = useState<string>("");
  const [consultLoading, setConsultLoading] = useState<boolean>(false);
  const [consultResult, setConsultResult] = useState<{
    elderName: string;
    message: string;
    recommendedEntryIds: string[];
  } | null>(null);
  const [consultError, setConsultError] = useState<string>("");

  // Filters State
  const [activeTab, setActiveTab] = useState<'all' | 'remedy' | 'recipe'>('all');
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");

  // Multi-lingual Translation memory [entryId_languageCode: TranslatedResponse]
  const [translations, setTranslations] = useState<Record<string, TranslationResponse>>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translationLangs, setTranslationLangs] = useState<Record<string, string>>({}); // EntryId -> Target lang code

  // Create Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const [formType, setFormType] = useState<'remedy' | 'recipe'>('remedy');
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formOrigin, setFormOrigin] = useState("");
  const [formLanguage, setFormLanguage] = useState("English");
  const [formCreator, setFormCreator] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBenefits, setFormBenefits] = useState("");
  const [formIngredients, setFormIngredients] = useState<string[]>([""]);
  const [formInstructions, setFormInstructions] = useState<string[]>([""]);
  const [formMediaType, setFormMediaType] = useState<'text' | 'video' | 'audio'>('text');
  const [formMediaUrl, setFormMediaUrl] = useState("");

  // Direct Audio Recorder / Upload State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [transcribing, setTranscribing] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>("");

  // Review Form State
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewTips, setReviewTips] = useState("");
  const [reviewLang, setReviewLang] = useState("English");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Audio elements references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<any>(null);

  // Fetch initial data
  useEffect(() => {
    fetchEntries();
  }, []);

  // Fetch comments when selected entry changes
  useEffect(() => {
    if (selectedEntry) {
      fetchComments(selectedEntry.id);
      setServingsMultiplier(1);
    }
  }, [selectedEntry]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/entries");
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch entries", err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (entryId: string) => {
    try {
      const res = await fetch(`/api/entries/${entryId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  // Upvote entry
  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/entries/${id}/like`, { method: "POST" });
      const updated = await res.json();
      setEntries(prev => prev.map(item => item.id === id ? { ...item, likes: updated.likes } : item));
      if (selectedEntry && selectedEntry.id === id) {
        setSelectedEntry(prev => prev ? { ...prev, likes: updated.likes } : null);
      }
    } catch (err) {
      console.error("Failed to like recipe", err);
    }
  };

  // Submit Comments / Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    try {
      setSubmittingReview(true);
      const res = await fetch(`/api/entries/${selectedEntry.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: reviewAuthor,
          rating: reviewRating,
          commentText: reviewComment,
          tips: reviewTips,
          language: reviewLang
        })
      });

      if (res.ok) {
        // Clear review form
        setReviewAuthor("");
        setReviewComment("");
        setReviewTips("");
        setReviewRating(5);
        fetchComments(selectedEntry.id);
      }
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Audio Recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        setIsRecording(false);
        clearInterval(durationIntervalRef.current);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to access microphone for entry voice narration", err);
      alert("Microphone access is required to record recipes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // stop tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Call Gemini translation API on the safe Express endpoint
  const handleTranslate = async (entry: RecipeEntry, targetLangCode: string) => {
    const key = `${entry.id}_${targetLangCode}`;
    if (translations[key]) {
      // already translated
      return;
    }

    try {
      setTranslatingId(entry.id);
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry,
          targetLanguage: LANGUAGES.find(l => l.code === targetLangCode)?.name || targetLangCode
        })
      });

      if (!res.ok) {
        throw new Error("Translation service returned an error status.");
      }

      const data = await res.json();
      setTranslations(prev => ({
        ...prev,
        [key]: data
      }));
    } catch (err: any) {
      console.error("Translation fail", err);
      alert("AI translation fails: " + err.message);
    } finally {
      setTranslatingId(null);
    }
  };

  // Direct Audio transcription using safe Server-side Gemini voice decoder
  const handleTranscribeAudio = async () => {
    if (!audioBlob) return;
    try {
      setTranscribing(true);

      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        const res = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: "audio/webm"
          })
        });

        if (!res.ok) {
          throw new Error("Transcription service failed.");
        }

        const data = await res.json();
        setTranscribedText(data.transcription);
        setFormDescription(prev => prev ? `${prev}\n\n[Transcribed Audio]: ${data.transcription}` : `[Transcribed Audio Oral Lore]: ${data.transcription}`);
      };
    } catch (err) {
      console.error("Oral transcription fail", err);
      alert("AI Transcription failed. Please double check model connectivity.");
    } finally {
      setTranscribing(false);
    }
  };

  // Botanical & chemical analysis request handler
  const handleAnalyzeEntry = async (entry: RecipeEntry) => {
    if (analysisResults[entry.id]) return; // already analyzed
    try {
      setAnalyzingId(entry.id);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry })
      });
      if (!res.ok) throw new Error("Failed to pull botanical insights.");
      const data = await res.json();
      setAnalysisResults(prev => ({
        ...prev,
        [entry.id]: data
      }));
    } catch (err: any) {
      console.error("AI botanical analysis fail", err);
      alert("AI analysis error: " + err.message);
    } finally {
      setAnalyzingId(null);
    }
  };

  // Ancestral Consultation request handler
  const handleConsultElder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultQuery.trim()) return;
    try {
      setConsultLoading(true);
      setConsultError("");
      setConsultResult(null);

      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: consultQuery,
          entries: entries
        })
      });

      if (!res.ok) throw new Error("Our wise elder is currently resting. Try again in a minute.");
      const data = await res.json();
      setConsultResult(data);
    } catch (err: any) {
      console.error("AI consult failure", err);
      setConsultError(err.message || "Consultation failed");
    } finally {
      setConsultLoading(false);
    }
  };

  // Select recommended entry from AI consult
  const handleSelectRecommendedEntry = (entryId: string) => {
    const match = entries.find(e => e.id === entryId || e.id.substring(0, 10) === entryId.substring(0, 10));
    if (match) {
      setSelectedEntry(match);
      document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Select herb from visual cabinet
  const handleSelectHerbFromCabinet = (herbName: string) => {
    setSearchQuery(herbName);
    document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
  };

  // Submit modern form to create entry
  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      setSubmitting(true);
      
      // Filter out empty arrays of inputs
      const filteredIngredients = formIngredients.filter(i => i.trim() !== "");
      const filteredInstructions = formInstructions.filter(i => i.trim() !== "");

      // Handle recorded audio compilation
      let audioBase64String = "";
      if (audioBlob) {
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            audioBase64String = reader.result as string;
            resolve(true);
          };
        });
      }

      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          title: formTitle,
          category: formCategory,
          origin: formOrigin,
          language: formLanguage,
          creator: formCreator,
          description: formDescription,
          benefits: formBenefits,
          ingredients: filteredIngredients.length > 0 ? filteredIngredients : ["Ingredients recorded via Voice Guide"],
          instructions: filteredInstructions.length > 0 ? filteredInstructions : ["Instructions recorded via Voice Guide"],
          mediaType: formMediaType,
          mediaUrl: formMediaType === 'video' ? formMediaUrl : "",
          audioBase64: audioBase64String,
          transcribedText: transcribedText || undefined
        })
      });

      if (res.ok) {
        // Reset form variables
        setFormTitle("");
        setFormCategory("");
        setFormOrigin("");
        setFormLanguage("English");
        setFormCreator("");
        setFormDescription("");
        setFormBenefits("");
        setFormIngredients([""]);
        setFormInstructions([""]);
        setFormMediaType("text");
        setFormMediaUrl("");
        setAudioBlob(null);
        setAudioUrl(null);
        setTranscribedText("");
        setShowAddForm(false);
        fetchEntries();
      }
    } catch (err) {
      console.error("Failed to add recipe", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Category and Region Unique extraction for filters
  const categories = ["All", ...Array.from(new Set(entries.map(e => e.category))).filter(Boolean)];
  const regions = ["All", ...Array.from(new Set(entries.map(e => e.origin))).filter(Boolean)];

  // Filtered lists
  const filteredEntries = entries.filter(entry => {
    const matchesTab = activeTab === 'all' ? true : entry.type === activeTab;
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" ? true : entry.category === selectedCategory;
    const matchesRegion = selectedRegion === "All" ? true : entry.origin === selectedRegion;

    return matchesTab && matchesSearch && matchesCategory && matchesRegion;
  });

  const getAverageRating = (reviews: CommentEntry[]) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  };

  const getStarDistribution = (reviews: CommentEntry[], stars: number) => {
    if (reviews.length === 0) return 0;
    const matchCount = reviews.filter(r => r.rating === stars).length;
    return Math.round((matchCount / reviews.length) * 100);
  };

  // Reusable visual entry card across multiple homepages
  const renderEntryCard = (entry: RecipeEntry) => {
    const targetLang = translationLangs[entry.id] || "en";
    const transKey = `${entry.id}_${targetLang}`;
    const hasTranslation = translations[transKey];
    
    // Display content dynamically based on selected translation choice
    const displayedTitle = hasTranslation ? translations[transKey].translatedTitle : entry.title;
    const displayedDesc = hasTranslation ? translations[transKey].translatedDescription : entry.description;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        key={entry.id}
        onClick={() => setSelectedEntry(entry)}
        className={`bg-white rounded-[32px] p-6 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          selectedEntry?.id === entry.id
            ? "border-classic-rust ring-4 ring-classic-rust/10"
            : "border-classic-border hover:border-classic-rust/40"
        }`}
      >
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold ${
              entry.type === 'remedy' 
                ? 'bg-classic-green/10 text-classic-green' 
                : 'bg-classic-rust/10 text-classic-rust'
            }`}>
              {entry.type === 'remedy' ? 'Nuskha (Remedy)' : 'Traditional Recipe'}
            </span>
            <span className="inline-block px-3 py-1 rounded-full bg-classic-bg border border-classic-border text-classic-text/80 text-[10px] font-mono uppercase">
              {entry.category}
            </span>
          </div>
          
          <div className="text-classic-rust hover:scale-105 active:scale-95 font-medium text-xs flex items-center gap-1.5 px-3 py-1 bg-classic-rust/10 rounded-full transition-transform cursor-pointer" onClick={(e) => handleLike(entry.id, e)}>
            <Heart className="w-3.5 h-3.5 fill-current text-classic-rust" />
            <span className="text-classic-text font-bold">{entry.likes}</span>
          </div>
        </div>

        <h3 className="text-2xl font-serif font-black text-classic-text mt-1 italic line-clamp-1">
          {displayedTitle}
        </h3>

        <p className="text-classic-text/85 text-sm mt-2 line-clamp-2 leading-relaxed">
          {displayedDesc}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-classic-border pt-4 text-xs text-classic-text/70">
          <div className="flex items-center gap-1.5 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-classic-green"></span>
            <span>Source: <strong className="text-classic-text font-bold">{entry.creator}</strong> ({entry.origin})</span>
          </div>
          
          {/* Anti-Bias Multi-Lingual Translator inside Card! */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="flex items-center gap-1 text-[11px] text-classic-text/60 font-mono">
              <Globe className="w-3 h-3 text-classic-green" />
              <span>Translate:</span>
            </span>
            <select
              value={translationLangs[entry.id] || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setTranslationLangs(prev => ({ ...prev, [entry.id]: "" }));
                } else {
                  setTranslationLangs(prev => ({ ...prev, [entry.id]: val }));
                  handleTranslate(entry, val);
                }
              }}
              className="px-2 py-1 text-[11px] font-bold border border-classic-border rounded-full bg-classic-bg hover:bg-white text-classic-text transition-all cursor-pointer"
            >
              <option value="">Original ({entry.language.split('/')[0].trim()})</option>
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            {translatingId === entry.id && (
              <div className="w-2.5 h-2.5 border-2 border-classic-text border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Detailed visual panel displaying active remedies/recipes
  const renderDetailedViewer = (isDrawer = false) => {
    if (!selectedEntry) {
      return (
        <div className="bg-classic-bg border border-dashed border-classic-border rounded-[48px] p-12 text-center flex flex-col justify-center items-center h-full min-h-[50vh]">
          <Coffee className="w-12 h-12 text-classic-rust/60 animate-bounce mb-4" />
          <h3 className="font-serif text-xl font-bold italic text-classic-text">Select Ancestral Wisdom</h3>
          <p className="text-classic-text/70 text-xs mt-2 max-w-sm leading-relaxed">
            Choose any remedy or traditional recipes on the homepage dashboard portals to study ancient scripts, chemical explanations, scaling measurements & community tweaks.
          </p>
        </div>
      );
    }

    return (
      <div className={`bg-white rounded-[44px] shadow-xs border border-classic-border overflow-hidden ${isDrawer ? 'h-full flex flex-col rounded-none border-none' : ''}`}>
        {/* Visual Header of Recipe Detail */}
        <div className="p-8 bg-classic-text text-white border-b border-classic-border shrink-0">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-white/70 hover:text-white flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> CLOSE WISDOM
            </button>
            <span className="text-[10px] font-mono tracking-widest bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full text-white/95 uppercase">
              ID: {selectedEntry.id.substring(0, 10)}
            </span>
          </div>

          <h2 className="text-3xl font-serif font-black text-white mt-4 italic leading-tight">
            {translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`]
              ? translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`].translatedTitle
              : selectedEntry.title}
          </h2>
          <p className="text-xs text-white/70 mt-1.5 font-mono uppercase tracking-wider">
            Contributed by {selectedEntry.creator} &bull; {selectedEntry.origin} &bull; {selectedEntry.language}
          </p>
        </div>

        {/* Scrollable contents wrapper */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Dynamic Translated Indicator */}
          {translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`] && (
            <div className="bg-classic-rust/5 border border-classic-rust/20 rounded-[20px] p-4 text-xs text-classic-text flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-classic-rust shrink-0 mt-0.5" />
              <div>
                <strong>AI Transformed Language:</strong> Reading translated version into <strong>
                  {LANGUAGES.find(l => l.code === translationLangs[selectedEntry.id])?.name}
                </strong>. Deep dialects & ingredients aligned perfectly.
              </div>
            </div>
          )}

          {/* Lore / Overview */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-classic-green">Ancestral Overview & Healing Context</h4>
            <p className="text-base text-classic-text/90 leading-relaxed font-serif italic py-1">
              &ldquo;{translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`]
                ? translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`].translatedDescription
                : selectedEntry.description}&rdquo;
            </p>
          </div>

          {/* Benefits & Precaution (if provided) */}
          {(selectedEntry.benefits || (translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`]?.translatedBenefits)) && (
            <div className="bg-classic-green/5 border border-classic-green/20 p-5 rounded-[24px] space-y-1.5">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-classic-green flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-classic-green" />
                <span>Curative Value & Precaution Info</span>
              </h4>
              <p className="text-xs text-classic-text/95 leading-relaxed font-sans">
                {translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`]
                  ? translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`].translatedBenefits
                  : selectedEntry.benefits}
              </p>
            </div>
          )}

          {/* Scientific vs Cultural Dual Tab */}
          <div className="border border-classic-border rounded-[28px] overflow-hidden">
            <button
              onClick={() => {
                if (analyzingId !== selectedEntry.id && !analysisResults[selectedEntry.id]) {
                  handleAnalyzeEntry(selectedEntry);
                }
              }}
              disabled={analyzingId === selectedEntry.id}
              className="w-full bg-classic-bg border-b border-classic-border p-4 hover:bg-white text-left transition-all duration-200 cursor-pointer disabled:opacity-80 active:scale-95 shrink-0 flex items-center justify-between"
            >
              <div>
                <span className="text-[9px] font-mono tracking-widest text-classic-green block uppercase font-bold">BOTANICAL AUTHENTICATION</span>
                <span className="font-serif text-sm font-bold text-classic-text">Scan for Bio-active Scientific Validation</span>
              </div>
              <Sparkles className="w-4.5 h-4.5 text-classic-rust animate-pulse" />
            </button>

            <div className="p-5 bg-white space-y-3">
              {analyzingId === selectedEntry.id ? (
                <div className="py-4 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-classic-rust border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[11px] text-classic-text/70 font-mono">Querying historical botanical models...</p>
                </div>
              ) : analysisResults[selectedEntry.id] ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-mono tracking-wider font-extrabold text-classic-green block uppercase">LATIN BOTANICAL SPECIES IDENTIFIED:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {analysisResults[selectedEntry.id].botanicalNames.map((name, idx) => (
                        <span key={idx} className="text-[10px] font-mono font-bold bg-amber-50 border border-classic-rust/35 text-classic-rust px-2.5 py-0.5 rounded-md">
                          🌿 {name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-classic-border pt-3">
                    <span className="text-[9px] font-mono tracking-wider font-extrabold text-classic-rust block uppercase">PHYTO-COMPONENTS & SCIENCE:</span>
                    <p className="text-[11px] text-classic-text/85 mt-1 leading-relaxed">
                      {analysisResults[selectedEntry.id].scientificExplanation}
                    </p>
                  </div>
                  <div className="border-t border-classic-border pt-3">
                    <span className="text-[9px] font-mono tracking-wider font-extrabold text-classic-text/60 block uppercase">CULTURAL TRIVIA:</span>
                    <p className="text-[11px] text-classic-text/80 mt-1 leading-relaxed italic">
                      {analysisResults[selectedEntry.id].culturalTrivia}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-classic-text/60 italic text-center py-2 font-mono">
                  No modern scientific verification pulled yet. Touch the authentication banner above to confirm botanical chemical components.
                </p>
              )}
            </div>
          </div>

          {/* Interactive Steeping & Scaler Tools */}
          <div className="bg-classic-bg/50 border border-classic-border rounded-[28px] p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-classic-border pb-3">
              <span className="text-[10px] uppercase tracking-[0.15em] font-mono font-bold text-classic-text/80">Interactive Apothecary Tools</span>
              <span className="text-[10px] font-mono text-classic-rust font-bold">ALIGNED WITH HERITAGE</span>
            </div>

            {/* Brewing Teas Steeper Counter */}
            <div className="bg-white border border-classic-border p-4.5 rounded-[22px] space-y-3 shadow-2xs">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-mono font-extrabold text-classic-rust block">BREW & INFUSION STEEPER TIMER</span>
                  <span className="font-serif text-xs italic font-bold">Recommended steeping: {Math.round(brewingSeconds / 60)} minutes</span>
                </div>
              </div>
              <BrewTimer
                initialSeconds={brewingSeconds}
                title={`Chimed Brewer: ${selectedEntry.title}`}
              />
            </div>

            {/* Scaler */}
            <div className="bg-white border border-classic-border p-4.5 rounded-[22px] space-y-3.5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] font-mono font-extrabold text-classic-green block">SERVINGS & COMPONENT SCALER</span>
                  <span className="text-xs font-serif italic text-classic-text/80">Re-calculate raw measurements instantly</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex border border-classic-border rounded-lg bg-stone-50 overflow-hidden">
                    <button
                      onClick={() => setServingsMultiplier(prev => Math.max(1, prev - 1))}
                      className="px-2.5 py-1 text-xs font-mono font-extrabold hover:bg-stone-200 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3.5 py-1 text-xs font-mono font-black border-x border-classic-border min-w-8 text-center">{servingsMultiplier}x</span>
                    <button
                      onClick={() => setServingsMultiplier(prev => Math.min(20, prev + 1))}
                      className="px-2.5 py-1 text-xs font-mono font-extrabold hover:bg-stone-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Metric Imperial option toggle */}
              <div className="flex justify-between items-center text-[11px] border-t border-classic-border/60 pt-2.5">
                <span className="text-classic-text/75 font-mono">Convert standards automatically (e.g. pinch & liters)</span>
                <button
                  onClick={() => setIsMetricEnabled(prev => !prev)}
                  className="bg-classic-text text-white text-[9px] font-bold font-mono tracking-wider px-3 py-1 rounded-full uppercase hover:opacity-90 active:scale-95 duration-100 cursor-pointer"
                >
                  SYSTEM: {isMetricEnabled ? "Metric UNITS" : "Legacy Traditional"}
                </button>
              </div>
            </div>
          </div>

          {/* Scaled Ingredients List */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-classic-green">Calculated Apothecary Inventory</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`]
                ? translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`].translatedIngredients
                : selectedEntry.ingredients
              ).map((ing, idx) => {
                const scaled = scaleAndConvertIngredient(ing, servingsMultiplier, isMetricEnabled);
                return (
                  <li key={idx} className="flex items-center gap-2 p-3 bg-classic-bg border border-classic-border rounded-[18px]">
                    <span className="w-2 h-2 rounded-full bg-classic-rust shrink-0" />
                    <span className="text-xs text-classic-text/90 font-serif leading-snug">{scaled}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Stepping Instructions List */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-classic-green">Oral Compilation Stepping guide</h4>
            <ol className="space-y-3">
              {(translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`]
                ? translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`].translatedInstructions
                : selectedEntry.instructions
              ).map((step, idx) => (
                <li key={idx} className="p-4 bg-white border border-classic-border rounded-[24px] shadow-2xs flex gap-3.5 items-start">
                  <span className="w-6 h-6 shrink-0 bg-classic-rust/10 text-classic-rust border border-classic-rust/20 rounded-full flex items-center justify-center font-mono font-bold text-xs animate-none">
                    {idx + 1}
                  </span>
                  <div className="text-xs leading-relaxed text-classic-text/90 font-sans">
                    {step}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Spoken / Audio Transcription (if provided) */}
          {(selectedEntry.mediaType === "audio" && selectedEntry.audioBase64) && (
            <div className="bg-amber-50/40 p-4 border border-classic-rust/20 rounded-[24px] space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-classic-rust font-bold uppercase block flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-classic-rust animate-pulse" /> PRESERVED ORAL DIALECT RECORDING
              </span>
              <audio src={selectedEntry.audioBase64} controls className="w-full h-8 custom-audio-player" />
              {selectedEntry.transcribedText && (
                <p className="text-[11px] text-classic-text/80 font-serif italic border-l border-classic-rust/30 pl-3">
                  Transcribed Text: "{selectedEntry.transcribedText}"
                </p>
              )}
            </div>
          )}

          {/* Video Attachment Details */}
          {(selectedEntry.mediaType === "video" && selectedEntry.mediaUrl) && (
            <div className="bg-stone-50 p-4 border border-classic-border rounded-[24px] space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-classic-text/70 font-bold uppercase block flex items-center gap-1">
                <Video className="w-3.5 h-3.5" /> ATTACHED ARCHIVED MULTIMEDIA STREAM
              </span>
              <p className="text-[11px] text-classic-text">
                Embedded media stream available: <a href={selectedEntry.mediaUrl} target="_blank" rel="noreferrer" className="text-classic-rust underline font-bold">{selectedEntry.mediaUrl}</a>
              </p>
            </div>
          )}

          {/* Cultural Review & Secret Tweak Register */}
          <div className="border-t border-classic-border pt-6 space-y-5">
            <div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-classic-rust uppercase block">COMMUNITY EXPERIENCE FORUM</span>
              <h3 className="font-serif text-lg font-black text-classic-text">Cultural Review Log & Verification</h3>
              <p className="text-xs text-classic-text/70 mt-0.5">Submit feedback or specific tweaks that worked for you.</p>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmitReview} className="space-y-4 bg-classic-bg p-5 rounded-[28px] border border-classic-border text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Reviewer Alias</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 'Aarav G.', 'Abuelita M.'"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2 text-xs border border-classic-border rounded-xl bg-white text-classic-text focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Symptom Cure Rating</label>
                  <div className="flex gap-2 mt-2 text-classic-rust">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current text-classic-rust' : 'text-classic-border text-stone-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">General Comment & Feedback</label>
                <textarea
                  required
                  rows={2}
                  placeholder="How did this nuskha implement for you? State cultural findings."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full mt-1.5 px-4 py-3 text-xs border border-classic-border rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust text-classic-text transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-classic-green flex items-center gap-1.5 pl-1">
                  <Check className="w-3.5 h-3.5 text-classic-green" />
                  <span>Suggested Tweaks for Better Implementation (The Secret Tweak)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., 'If using in summer, reduce cinnamon' or 'Take only on empty stomach'."
                  value={reviewTips}
                  onChange={(e) => setReviewTips(e.target.value)}
                  className="w-full mt-1.5 px-4 py-3 text-xs border border-classic-border rounded-2xl bg-white text-classic-text focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all resize-none font-sans"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/70">Review Lang:</label>
                  <select
                    value={reviewLang}
                    onChange={(e) => setReviewLang(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-classic-border rounded-full bg-white text-classic-text cursor-pointer focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Other">Other Language</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-classic-green hover:bg-classic-green/95 text-white font-bold py-2 px-6 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow active:scale-95 duration-200"
                >
                  {submittingReview ? "Submitting wisdom..." : "Submit Review Log"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Existing reviews Display list */}
            <div className="space-y-4 mt-6">
              {comments.length === 0 ? (
                <p className="text-xs text-classic-text/50 italic text-center py-6 bg-classic-bg rounded-2xl border border-classic-border">No suggestions logged yet. Be the first to advise the community!</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="p-4 bg-classic-bg border border-classic-border rounded-[24px] space-y-2.5 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif italic font-bold text-classic-text text-sm">{c.author}</span>
                      <div className="flex text-classic-rust gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-3 h-3 ${star <= c.rating ? 'fill-current text-classic-rust' : 'text-classic-border text-stone-200'}`} />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-classic-text/90 leading-relaxed font-sans">
                      {c.commentText}
                    </p>

                    {c.tips && (
                      <div className="mt-2 text-[11px] bg-classic-green/5 border border-classic-green/20 p-3 rounded-xl text-classic-text">
                        <strong className="text-classic-green font-bold uppercase tracking-wider text-[9px] block mb-0.5">Dadi's recommended tweak:</strong>
                        {c.tips}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[9px] text-classic-text/50 font-mono pt-1">
                      <span>LOGGED: {new Date(c.createdAt).toLocaleDateString()}</span>
                      <span className="uppercase tracking-wider">LANG: {c.language}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        '--color-classic-bg': currentTheme.colors.bg,
        '--color-classic-text': currentTheme.colors.text,
        '--color-classic-rust': currentTheme.colors.rust,
        '--color-classic-green': currentTheme.colors.green,
        '--color-classic-border': currentTheme.colors.border,
      } as React.CSSProperties}
      className="min-h-screen bg-classic-bg font-sans text-classic-text selection:bg-amber-100 selection:text-amber-900 pb-16 transition-colors duration-300"
    >
      {/* Upper Artistic Cultural Navigation */}
      <nav className="border-b border-classic-border bg-white/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 md:px-10 md:py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-6 md:space-x-10">
            <h1 className="text-3xl font-serif font-extrabold tracking-tight text-classic-rust cursor-pointer hover:opacity-90 transition-opacity">
              Virasat <span className="font-normal italic text-classic-text">heritage</span>
            </h1>
            <div className="hidden md:flex space-x-6 text-xs uppercase tracking-wider font-bold text-classic-text opacity-70">
              <a href="#feed" className="hover:text-classic-rust transition-colors">Archive</a>
              <a href="#feed" className="hover:text-classic-rust transition-colors">Remedies</a>
              <a href="#feed" className="hover:text-classic-rust transition-colors">Recipes</a>
              <span className="text-classic-green">• Anti-Bias</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="flex gap-1 bg-classic-border/40 p-1 rounded-lg text-[10px] font-mono tracking-wider">
              <span className="px-2 py-0.5 text-stone-500">हि</span>
              <span className="px-2 py-0.5 bg-classic-text text-white rounded shadow-sm">EN</span>
              <span className="px-2 py-0.5 text-stone-500">தமிழ்</span>
              <span className="px-2 py-0.5 text-stone-500">Español</span>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              id="btn-contribute-remedy"
              className="bg-classic-rust hover:bg-classic-rust/95 text-white text-xs uppercase tracking-widest font-bold py-2.5 px-5 rounded-full shadow-sm hover:shadow transition-all cursor-pointer transform active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Contribute Wisdom</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header Section */}
      <header className="py-12 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-4">
              <img src={virasatLogo} alt="Virasat Logo" className="w-16 h-16 object-contain" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-classic-green block">Preserving Generational Wisdom</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif leading-tight font-black tracking-tight text-classic-text italic">
              Your Grandma's <span className="text-classic-rust not-italic font-sans font-extrabold">Nuskhe</span> & Remedies. Securely Preserved.
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-classic-text/80 max-w-xl font-sans">
              Indian oral recipes, ancestral remedies, and organic dishes passing through eras. Search across dozens of dialect translations, leave your reviews, and upload directly in text, video, or spoken audio.
            </p>
          </div>
          <div className="lg:col-span-4 bg-classic-green/10 p-6 md:p-8 rounded-[32px] border border-classic-green/20 space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-classic-green font-bold">COMMUNITY PRESERVATION STATUS</span>
            <div className="text-3xl font-serif font-black text-classic-green">4,281 Stories</div>
            <p className="text-xs text-classic-text/80 leading-relaxed">
              Virasat employs advanced server-side translation to make every single remedy fully clear to readers from all cultures.
            </p>
          </div>
        </div>
      </header>

      {/* Traditional Aesthetic Selection Studio */}
      <section className="px-6 md:px-10 max-w-7xl mx-auto mb-10">
        <div className="bg-white/40 border border-classic-border backdrop-blur-xs rounded-[32px] p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-classic-border">
            <div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-classic-rust uppercase block">Custom Design Interface</span>
              <h3 className="font-serif text-xl font-bold text-classic-text">Traditional Aesthetic Selection Lounge</h3>
              <p className="text-xs text-classic-text/70 mt-0.5">Transform the palette, botanical colors, and layout engine into gorgeous historical modes.</p>
            </div>
            <div className="flex gap-2 items-center text-xs font-mono text-classic-text/60">
              <span>Active Style:</span>
              <span className="bg-classic-rust/10 text-classic-rust px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
                {currentTheme.name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {THEMES.map((t) => {
              const isActive = t.id === activeThemeId;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveThemeId(t.id);
                    localStorage.setItem("virasat_theme", t.id);
                  }}
                  className={`text-left p-4 rounded-[24px] border transition-all duration-300 relative overflow-hidden cursor-pointer group active:scale-95 ${
                    isActive
                      ? "bg-white border-classic-rust shadow-xs ring-4 ring-classic-rust/5"
                      : "bg-white/60 border-classic-border hover:bg-white hover:border-classic-rust/35"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5 mb-2 relative z-10">
                    <span className="text-2xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-250">
                      {t.icon}
                    </span>
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: t.colors.bg }} title="Background Layout" />
                      <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: t.colors.rust }} title="Organic Rust Variant" />
                      <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: t.colors.green }} title="Botanical Sage Variant" />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h4 className="font-sans font-bold text-sm text-classic-text group-hover:text-classic-rust transition-colors duration-200">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-classic-text/75 mt-1 leading-snug">
                      {t.description}
                    </p>
                  </div>

                  {isActive && (
                    <div className="absolute right-3.5 bottom-3 text-classic-rust">
                      <Check className="w-4 h-4 stroke-[3px]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Homepage Architectural Layout Selector */}
          <div className="mt-6 pt-5 border-t border-classic-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[9px] font-mono font-bold tracking-widest text-classic-green uppercase block">Layout Architectures</span>
                <h4 className="font-serif text-base font-bold text-classic-text">Select Homepage Structural Portal</h4>
                <p className="text-xs text-classic-text/70 mt-0.5">Completely rearrange card lists, grids, databases, and sidebars for an entirely fresh user experience.</p>
              </div>
              <div className="flex gap-2 items-center text-xs font-mono text-classic-text/60">
                <span>Active Portal:</span>
                <span className="bg-classic-green/10 text-classic-green px-3.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
                  {PORTALS.find(p => p.id === homepageLayout)?.name || "Classic Ledger"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PORTALS.map((p) => {
                const isActive = p.id === homepageLayout;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setHomepageLayout(p.id as any);
                      localStorage.setItem("virasat_layout", p.id);
                    }}
                    className={`text-left p-4 rounded-[24px] border transition-all duration-300 relative overflow-hidden cursor-pointer group active:scale-95 ${
                      isActive
                        ? "bg-white border-classic-green shadow-xs ring-4 ring-classic-green/5"
                        : "bg-white/60 border-classic-border hover:bg-white hover:border-classic-green/35"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2.5 mb-2 relative z-10">
                      <span className="text-2xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-250">
                        {p.icon}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <h4 className="font-sans font-bold text-sm text-classic-text group-hover:text-classic-green transition-colors duration-200">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-classic-text/75 mt-1 leading-snug">
                        {p.description}
                      </p>
                    </div>

                    {isActive && (
                      <div className="absolute right-3.5 bottom-3 text-classic-green">
                        <Check className="w-4 h-4 stroke-[3px]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Homepage Architectures */}
      {homepageLayout === 'classic' && (
        <main id="feed" className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Filter Panels + Feed */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Dadi-Abuela Ancestral AI Consult Segment */}
          <div className="bg-amber-50/60 border border-classic-rust/35 rounded-[32px] p-6 shadow-xs relative overflow-hidden">
            {/* Fine decorative patterns */}
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-4 translate-x-4">
              <Sparkles className="w-48 h-48 text-classic-rust" />
            </div>

            <div className="flex items-center gap-3 mb-2.5">
              <div className="bg-classic-rust/10 p-2.5 rounded-2xl">
                <Sparkles className="w-5 h-5 text-classic-rust animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold tracking-widest text-classic-rust uppercase block">Interactive AI Guidance</span>
                <h3 className="font-serif text-lg font-black text-classic-text">Consult Dadi-Abuela Wise Elder AI</h3>
              </div>
            </div>

            <p className="text-xs text-classic-text/80 mb-4 leading-relaxed font-sans">
              Looking for a specific cure, botanical tea, or culinary comfort? Type your symptom or physical state (e.g. <em>"clogged sinuses and headache"</em> or <em>"soothing warm drink for sleep"</em>), and consult our virtual elder for recipe pairings and deep ancestral wisdom.
            </p>

            <form onSubmit={handleConsultElder} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 'I have an irritating cough and seasonal cold, what can I boil?'"
                  value={consultQuery}
                  onChange={(e) => setConsultQuery(e.target.value)}
                  className="w-full pl-4 pr-32 py-3 border border-classic-rust/30 rounded-full text-xs bg-white focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all text-classic-text shadow-inner"
                />
                <button
                  type="submit"
                  disabled={consultLoading || !consultQuery.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-classic-rust text-white text-[10px] font-mono font-bold uppercase tracking-widest px-5 rounded-full hover:bg-classic-rust/95 active:scale-95 duration-150 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-xs"
                >
                  {consultLoading ? "Listening..." : "Whisper Query"}
                </button>
              </div>
            </form>

            <AnimatePresence>
              {consultError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 bg-red-50 border border-red-200 rounded-[18px] text-[11px] text-red-700 font-sans flex items-center gap-2"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{consultError}</span>
                </motion.div>
              )}

              {consultResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-5 bg-white border border-classic-rust/20 rounded-[24px] space-y-3 shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-classic-green animate-pulse" />
                    <span className="text-[10px] font-mono tracking-widest text-classic-rust font-bold uppercase block">
                      Advice from {consultResult.elderName}:
                    </span>
                  </div>
                  
                  <p className="text-xs text-classic-text leading-relaxed font-serif italic border-l-2 border-classic-rust/35 pl-3.5 py-0.5">
                    "{consultResult.message}"
                  </p>

                  {consultResult.recommendedEntryIds && consultResult.recommendedEntryIds.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[9px] font-mono tracking-wider text-classic-text/70 block uppercase font-bold mb-2">
                        Elder Recommends Community Entries:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {consultResult.recommendedEntryIds.map(id => {
                          const matchingItem = entries.find(e => e.id === id || e.id.substring(0, 10) === id.substring(0, 10));
                          return (
                            <button
                              key={id}
                              onClick={() => handleSelectRecommendedEntry(id)}
                              className="text-[11px] font-bold text-classic-green bg-classic-green/10 border border-classic-green/20 px-3.5 py-1.5 rounded-full hover:bg-classic-green hover:text-white transition-all cursor-pointer active:scale-95 duration-100 uppercase font-mono shadow-2xs"
                            >
                              📖 View {matchingItem ? matchingItem.title : `Remedy (${id.substring(0, 8)})`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Communal Spice & Herb Cabinet */}
          <IngredientCabinet onHerbSelect={handleSelectHerbFromCabinet} />

          {/* Filters Bar & Controls */}
          <div className="bg-white rounded-[32px] border border-classic-border p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-classic-border pb-4">
              <div className="flex bg-classic-bg p-1 rounded-full border border-classic-border">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-1.5 px-4 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-classic-text text-white shadow-xs'
                      : 'text-classic-text/70 hover:text-classic-text'
                  }`}
                >
                  All Wisdom
                </button>
                <button
                  onClick={() => setActiveTab('remedy')}
                  className={`py-1.5 px-4 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    activeTab === 'remedy'
                      ? 'bg-classic-text text-white shadow-xs'
                      : 'text-classic-text/70 hover:text-classic-text'
                  }`}
                >
                  Remedies
                </button>
                <button
                  onClick={() => setActiveTab('recipe')}
                  className={`py-1.5 px-4 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    activeTab === 'recipe'
                      ? 'bg-classic-text text-white shadow-xs'
                      : 'text-classic-text/70 hover:text-classic-text'
                  }`}
                >
                  Recipes
                </button>
              </div>

              {/* Dynamic stats count */}
              <div className="text-right text-xs font-mono text-classic-text/60">
                Displaying {filteredEntries.length} stories
              </div>
            </div>

            {/* Sub-filters combo: Search, Categories & Origins */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-classic-text/40" />
                <input
                  type="text"
                  placeholder="Search title, lore, creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-classic-border rounded-full text-xs bg-classic-bg/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all text-classic-text"
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-classic-border rounded-full text-xs bg-classic-bg/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all text-classic-text cursor-pointer"
                >
                  <option value="All">All Categories ({categories.length - 1})</option>
                  {categories.filter(c => c !== "All").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-2 border border-classic-border rounded-full text-xs bg-classic-bg/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all text-classic-text cursor-pointer"
                >
                  <option value="All">All Origins</option>
                  {regions.filter(r => r !== "All").map(reg => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cards List container */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl shadow-xs p-12 text-center border border-stone-200/80">
                <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-stone-500 font-serif">Unrolling ancient scrolls, please hold...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="bg-white rounded-xl shadow-xs p-12 text-center border border-stone-200 border-dashed">
                <p className="text-stone-600 font-serif text-lg">No remedies or recipes matched your query.</p>
                <p className="text-stone-400 text-sm mt-1">Be the first to share this precious traditional healing art!</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 inline-flex items-center gap-1 text-sm bg-amber-800 text-stone-50 px-4 py-2 rounded-lg font-medium hover:bg-amber-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Share First Recipe
                </button>
              </div>
            ) : (
              filteredEntries.map(entry => {
                const targetLang = translationLangs[entry.id] || "en";
                const transKey = `${entry.id}_${targetLang}`;
                const hasTranslation = translations[transKey];
                
                // Display content dynamically based on selected translation choice
                const displayedTitle = hasTranslation ? translations[transKey].translatedTitle : entry.title;
                const displayedDesc = hasTranslation ? translations[transKey].translatedDescription : entry.description;

                 return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`bg-white rounded-[32px] p-6 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                      selectedEntry?.id === entry.id
                        ? "border-classic-rust ring-4 ring-classic-rust/10"
                        : "border-classic-border hover:border-classic-rust/40"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold ${
                          entry.type === 'remedy' 
                            ? 'bg-classic-green/10 text-classic-green' 
                            : 'bg-classic-rust/10 text-classic-rust'
                        }`}>
                          {entry.type === 'remedy' ? 'Nuskha (Remedy)' : 'Traditional Recipe'}
                        </span>
                        <span className="inline-block px-3 py-1 rounded-full bg-classic-bg border border-classic-border text-classic-text/80 text-[10px] font-mono uppercase">
                          {entry.category}
                        </span>
                      </div>
                      
                      <div className="text-classic-rust hover:scale-105 active:scale-95 font-medium text-xs flex items-center gap-1.5 px-3 py-1 bg-classic-rust/10 rounded-full transition-transform cursor-pointer" onClick={(e) => handleLike(entry.id, e)}>
                        <Heart className="w-3.5 h-3.5 fill-current text-classic-rust" />
                        <span className="text-classic-text font-bold">{entry.likes}</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-serif font-black text-classic-text mt-1 italic line-clamp-1">
                      {displayedTitle}
                    </h3>

                    <p className="text-classic-text/85 text-sm mt-2 line-clamp-2 leading-relaxed">
                      {displayedDesc}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-classic-border pt-4 text-xs text-classic-text/70">
                      <div className="flex items-center gap-1.5 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-classic-green"></span>
                        <span>Source: <strong className="text-classic-text font-bold">{entry.creator}</strong> ({entry.origin})</span>
                      </div>
                      
                      {/* Anti-Bias Multi-Lingual Translator inside Card! */}
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="flex items-center gap-1 text-[11px] text-classic-text/60 font-mono">
                          <Globe className="w-3 h-3 text-classic-green animate-pulse" />
                          <span>Translate:</span>
                        </span>
                        <select
                          value={translationLangs[entry.id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              // Reset translation
                              setTranslationLangs(prev => ({ ...prev, [entry.id]: "" }));
                            } else {
                              setTranslationLangs(prev => ({ ...prev, [entry.id]: val }));
                              handleTranslate(entry, val);
                            }
                          }}
                          className="px-2 py-1 text-[11px] font-bold border border-classic-border rounded-full bg-classic-bg hover:bg-white text-classic-text transition-all cursor-pointer"
                        >
                          <option value="">Original ({entry.language.split('/')[0].trim()})</option>
                          {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                        {translatingId === entry.id && (
                          <div className="w-2.5 h-2.5 border-2 border-classic-text border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed Section Viewer & Shopping-Style Reviews tab */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {selectedEntry ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-[48px] shadow-sm border border-classic-border overflow-hidden"
              >
                {/* Visual Header of Recipe Detail */}
                <div className="p-8 bg-classic-text text-white border-b border-classic-border">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => setSelectedEntry(null)}
                      className="text-white/70 hover:text-white flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> CLOSE WISDOM
                    </button>
                    <span className="text-[10px] font-mono tracking-widest bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full text-white/95 uppercase">
                      ID: {selectedEntry.id.substring(0, 10)}
                    </span>
                  </div>

                  <h2 className="text-3xl font-serif font-black text-white mt-4 italic leading-tight">
                    {translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`]
                      ? translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`].translatedTitle
                      : selectedEntry.title}
                  </h2>
                  <p className="text-xs text-white/70 mt-1.5 font-mono uppercase tracking-wider">
                    Contributed by {selectedEntry.creator} &bull; {selectedEntry.origin} &bull; {selectedEntry.language}
                  </p>
                </div>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                  {/* Dynamic Translated Indicator */}
                  {translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`] && (
                    <div className="bg-classic-rust/5 border border-classic-rust/20 rounded-[20px] p-4 text-xs text-classic-text flex items-start gap-2.5">
                      <Globe className="w-4 h-4 text-classic-rust shrink-0 mt-0.5" />
                      <div>
                        <strong>AI Transformed Language:</strong> Reading translated version into <strong>
                          {LANGUAGES.find(l => l.code === translationLangs[selectedEntry.id])?.name}
                        </strong>. Deep dialects & ingredients aligned perfectly.
                      </div>
                    </div>
                  )}

                  {/* Lore / Overview */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-classic-green">Ancestral Overview & Healing Context</h4>
                    <p className="text-base text-classic-text/90 leading-relaxed font-serif italic py-1">
                      &ldquo;{translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`]
                        ? translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`].translatedDescription
                        : selectedEntry.description}&rdquo;
                    </p>
                  </div>

                  {/* Benefits & Precaution (if provided) */}
                  {(selectedEntry.benefits || (translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`]?.translatedBenefits)) && (
                    <div className="bg-classic-green/5 border border-classic-green/20 p-5 rounded-[24px] space-y-1.5">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-classic-green flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-classic-green" />
                        <span>Curative Value & Precaution Info</span>
                      </h4>
                      <p className="text-xs text-classic-text/95 leading-relaxed font-sans">
                        {translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`]
                          ? translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`].translatedBenefits
                          : selectedEntry.benefits}
                      </p>
                    </div>
                  )}

                  {/* AI Botanical, Historical & Sub Substitution Analysis Section */}
                  <div className="bg-stone-50 border border-classic-border rounded-[28px] p-5 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5 text-classic-rust" />
                        <span className="text-[10px] font-mono font-bold tracking-widest text-classic-rust uppercase">AI Botanical & Synergy Science</span>
                      </div>
                      
                      {!analysisResults[selectedEntry.id] && (
                        <button
                          onClick={() => handleAnalyzeEntry(selectedEntry)}
                          disabled={analyzingId === selectedEntry.id}
                          className="bg-classic-text hover:bg-classic-text/90 text-white font-mono text-[9px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-full cursor-pointer transition-all active:scale-95 flex items-center gap-1 shadow-sm"
                        >
                          {analyzingId === selectedEntry.id ? (
                            <>
                              <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>De-coding bio-actives...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Run AI Deep Dive</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {analysisResults[selectedEntry.id] ? (
                      <div className="space-y-4 text-xs">
                        <div className="bg-white border border-classic-border/60 p-3.5 rounded-xl space-y-1.5">
                          <span className="text-[9px] font-mono tracking-wider text-classic-green font-bold uppercase block">Biological & Scientific Explanation:</span>
                          <p className="text-classic-text leading-relaxed font-sans">{analysisResults[selectedEntry.id].scientificExplanation}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white border border-classic-border/60 p-3.5 rounded-xl space-y-1">
                            <span className="text-[9px] font-mono tracking-wider text-classic-rust font-bold uppercase block">Botanical Binomial Names:</span>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {analysisResults[selectedEntry.id].botanicalNames.map((name, idx) => (
                                <span key={idx} className="bg-stone-100 text-[10px] font-mono px-2.5 py-1 rounded-md text-classic-text italic">
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white border border-classic-border/60 p-3.5 rounded-xl space-y-1">
                            <span className="text-[9px] font-mono tracking-wider text-classic-green font-bold uppercase block">Global Substitutions:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-classic-text/80 pl-0.5">
                              {analysisResults[selectedEntry.id].substitutions.map((sub, idx) => (
                                <li key={idx} className="leading-tight">{sub}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="bg-amber-50/50 border border-classic-rust/15 p-3.5 rounded-xl space-y-1">
                          <span className="text-[9px] font-mono tracking-wider text-classic-rust font-bold uppercase block">Ancestral Lore & Historical Trivia:</span>
                          <p className="text-classic-text/90 italic font-serif leading-relaxed">"{analysisResults[selectedEntry.id].culturalTrivia}"</p>
                        </div>

                        {analysisResults[selectedEntry.id].warnings && (
                          <div className="bg-red-50/50 border border-red-100 p-3.5 rounded-xl flex items-start gap-2 text-[11px] text-red-800">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold font-mono tracking-wider text-[9px] uppercase block mb-0.5">Usage & Dosage Caution:</span>
                              <p className="leading-normal">{analysisResults[selectedEntry.id].warnings}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white border border-dashed border-classic-border p-4 rounded-xl text-center">
                        <p className="text-[11px] text-classic-text/70">
                          Trigger AI Deep Dive to automatically identify <strong>scientific names of herbs</strong>, analyze <strong>active chemical compounds</strong>, recommend <strong>global grocery substitutions</strong>, and verify <strong>clinical safety warnings</strong>.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Audio Narrator File attachment (if any) */}
                  {selectedEntry.audioBase64 && (
                    <div className="bg-classic-bg border border-classic-border rounded-[24px] p-5 space-y-2">
                      <div className="flex items-center gap-2 text-classic-text">
                        <Volume2 className="w-4 h-4 text-classic-rust" />
                        <span className="text-xs font-mono font-bold uppercase tracking-widest">Historical Recorded Oral Instructions</span>
                      </div>
                      <audio controls className="w-full mt-1 h-8" src={selectedEntry.audioBase64}></audio>
                      {selectedEntry.transcribedText && (
                        <div className="text-xs text-classic-text/85 bg-white border border-classic-border p-3 rounded-xl italic leading-relaxed">
                          <strong>Accurate Oral Translation:</strong> &quot;{selectedEntry.transcribedText}&quot;
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Attachment embed or link (if any) */}
                  {selectedEntry.mediaType === 'video' && selectedEntry.mediaUrl && (
                    <div className="p-5 bg-classic-bg border border-classic-border rounded-[24px] space-y-2">
                      <div className="flex items-center gap-2 text-classic-text">
                        <Video className="w-4 h-4 text-classic-rust" />
                        <span className="text-xs font-mono font-bold uppercase tracking-widest">Visual Video Presentation</span>
                      </div>
                      <a href={selectedEntry.mediaUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-classic-rust hover:underline font-mono break-all font-bold">
                        View Attached Media: {selectedEntry.mediaUrl}
                      </a>
                    </div>
                  )}

                  {/* Ingredients */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-classic-border pb-2">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-classic-rust">Natural Herbs & Pure Ingredients</h4>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Portions counter */}
                        <div className="flex items-center gap-1.5 bg-stone-100 border border-classic-border/60 rounded-full px-2.5 py-1">
                          <span className="text-[9px] font-mono font-bold uppercase text-classic-text/60 mr-1">Scale:</span>
                          <button
                            onClick={() => setServingsMultiplier(prev => Math.max(1, prev - 1))}
                            disabled={servingsMultiplier <= 1}
                            className="w-5 h-5 flex items-center justify-center rounded-full bg-white hover:bg-stone-200 text-[10px] font-bold text-classic-text disabled:opacity-40 cursor-pointer shadow-3xs"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-[10px] font-mono font-bold text-classic-text">
                            {servingsMultiplier}x
                          </span>
                          <button
                            onClick={() => setServingsMultiplier(prev => Math.min(10, prev + 1))}
                            disabled={servingsMultiplier >= 10}
                            className="w-5 h-5 flex items-center justify-center rounded-full bg-white hover:bg-stone-200 text-[10px] font-bold text-classic-text disabled:opacity-40 cursor-pointer shadow-3xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Imperial vs Metric Toggle */}
                        <button
                          onClick={() => setIsMetricEnabled(prev => !prev)}
                          className="bg-stone-100 hover:bg-stone-200/80 border border-classic-border/60 rounded-full px-3 py-1 text-[9px] font-mono font-bold uppercase text-classic-text flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <span>Unit:</span>
                          <span className={isMetricEnabled ? "text-classic-green font-black" : "text-classic-rust font-black"}>
                            {isMetricEnabled ? "Metric (ml/cm)" : "Imperial (cup/in)"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <ul className="text-sm space-y-2 grid grid-cols-1 divide-y divide-classic-border">
                      {(translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`]
                        ? translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`].translatedIngredients
                        : selectedEntry.ingredients
                      ).map((ing, i) => {
                        const scaledIngredient = scaleAndConvertIngredient(ing, servingsMultiplier, isMetricEnabled);
                        return (
                          <li key={i} className="pt-2 flex items-start gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-classic-green mt-1.5 shrink-0" />
                            <span className="text-classic-text text-sm leading-relaxed">{scaledIngredient}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Steps of Preparation */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-classic-rust">Ancient Preparation steps</h4>
                    <ol className="text-sm space-y-3 text-classic-text">
                      {(translationLangs[selectedEntry.id] && translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`]
                        ? translations[`${selectedEntry.id}_${translationLangs[selectedEntry.id]}`].translatedInstructions
                        : selectedEntry.instructions
                      ).map((step, i) => (
                        <li key={i} className="flex gap-3 items-start leading-relaxed text-sm">
                          <span className="font-mono text-xs text-stone-400 font-bold bg-stone-100 rounded-md w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-stone-700">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Visual Infusion brew timer */}
                  <BrewTimer
                    initialSeconds={brewingSeconds}
                    title={`Chimed Brewer: ${selectedEntry.title}`}
                  />

                  {/* Comments / Review tab ("representing a review tab we use under shopping apps") */}
                  <div className="border-t border-classic-border pt-8 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-classic-border">
                      <div>
                        <h3 className="text-xl font-serif font-black text-classic-text flex items-center gap-2 italic">
                          <MessageSquare className="w-5 h-5 text-classic-rust" />
                          <span>Review & Implementation Log</span>
                        </h3>
                        <p className="text-xs text-classic-text/60 mt-0.5">Community ratings and refined application techniques</p>
                      </div>
                      
                      {/* Rating Stats Summary widget */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end text-classic-rust font-extrabold font-serif">
                          <span className="text-xl">{getAverageRating(comments)}</span>
                          <Star className="w-4 h-4 fill-current text-classic-rust" />
                        </div>
                        <span className="text-[10px] text-classic-text/60 font-mono tracking-wider">{comments.length} verified logs</span>
                      </div>
                    </div>

                    {/* Shopping-Style Rating breakdowns bar */}
                    <div className="bg-classic-bg border border-classic-border rounded-[24px] p-5 grid grid-cols-12 gap-4 text-xs text-classic-text">
                      <div className="col-span-12 sm:col-span-4 flex flex-col justify-center items-center sm:border-r border-classic-border py-2">
                        <div className="text-3xl font-serif font-black text-classic-text italic">{getAverageRating(comments)}</div>
                        <div className="flex text-classic-rust mt-1.5 gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-3.5 h-3.5 ${star <= getAverageRating(comments) ? 'fill-current text-classic-rust' : 'text-classic-border/65'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-classic-text/50 mt-1.5 font-mono uppercase tracking-wider">Avg Score</span>
                      </div>
                      
                      <div className="col-span-12 sm:col-span-8 space-y-1.5 justify-center flex flex-col">
                        {[5, 4, 3, 2, 1].map(stars => (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="font-mono text-[9px] w-4 text-right text-classic-text/60">{stars}★</span>
                            <div className="flex-1 h-2 bg-classic-border rounded-full overflow-hidden">
                              <div
                                className="h-full bg-classic-rust rounded-full"
                                style={{ width: `${getStarDistribution(comments, stars)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[9px] w-7 text-right text-classic-text/60">{getStarDistribution(comments, stars)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Review / Comment Form */}
                    <form onSubmit={handleSubmitReview} className="bg-classic-bg border border-classic-border rounded-[32px] p-6 space-y-4">
                      <h4 className="text-xs font-mono font-bold text-classic-text uppercase tracking-widest pl-1">Share an enhancement / Write a review</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Your Name & State / Location</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Grandma Suman / Punjab"
                            value={reviewAuthor}
                            onChange={(e) => setReviewAuthor(e.target.value)}
                            className="w-full mt-1.5 px-4 py-2.5 text-xs border border-classic-border rounded-full bg-white focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust text-classic-text transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Symptom Cure Rating</label>
                          <div className="flex gap-2 mt-2 text-classic-rust">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="hover:scale-125 active:scale-95 transition-transform cursor-pointer"
                              >
                                <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current text-classic-rust' : 'text-classic-border'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">General Comment & Feedback</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="How did this nuskha implement for you? State cultural findings."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full mt-1.5 px-4 py-3 text-xs border border-classic-border rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust text-classic-text transition-all resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-classic-green flex items-center gap-1.5 pl-1">
                          <Check className="w-3.5 h-3.5 text-classic-green" />
                          <span>Suggested Tweaks for Better Implementation (The Secret Tweak)</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g., 'If using in summer, reduce cinnamon' or 'Take only on empty stomach'."
                          value={reviewTips}
                          onChange={(e) => setReviewTips(e.target.value)}
                          className="w-full mt-1.5 px-4 py-3 text-xs border border-classic-border rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust text-classic-text transition-all resize-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-2">
                          <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/70">Review Lang:</label>
                          <select
                            value={reviewLang}
                            onChange={(e) => setReviewLang(e.target.value)}
                            className="px-3 py-1.5 text-xs border border-classic-border rounded-full bg-white text-classic-text cursor-pointer focus:outline-none"
                          >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi (हिन्दी)</option>
                            <option value="Spanish">Spanish</option>
                            <option value="Punjabi">Punjabi</option>
                            <option value="Other">Other Language</option>
                          </select>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="bg-classic-green hover:bg-classic-green/95 text-white font-bold py-2 px-6 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow active:scale-95 duration-200"
                        >
                          {submittingReview ? "Submitting wisdom..." : "Submit Review Log"}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>

                    {/* Existing reviews Display list */}
                    <div className="space-y-4 mt-6">
                      {comments.length === 0 ? (
                        <p className="text-xs text-classic-text/50 italic text-center py-6 bg-classic-bg rounded-2xl border border-classic-border">No suggestions logged yet. Be the first to advise the community!</p>
                      ) : (
                        comments.map(c => (
                          <div key={c.id} className="p-4 bg-classic-bg border border-classic-border rounded-[24px] space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-serif italic font-bold text-classic-text text-sm">{c.author}</span>
                              <div className="flex text-classic-rust gap-0.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star key={star} className={`w-3 h-3 ${star <= c.rating ? 'fill-current text-classic-rust' : 'text-classic-border text-stone-200'}`} />
                                ))}
                              </div>
                            </div>

                            <p className="text-xs text-classic-text/90 leading-relaxed font-sans">
                              {c.commentText}
                            </p>

                            {c.tips && (
                              <div className="mt-2 text-[11px] bg-classic-green/5 border border-classic-green/20 p-3 rounded-xl text-classic-text">
                                <strong className="text-classic-green font-bold uppercase tracking-wider text-[9px] block mb-0.5">Dadi's recommended tweak:</strong>
                                {c.tips}
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[9px] text-classic-text/50 font-mono pt-1">
                              <span>LOGGED: {new Date(c.createdAt).toLocaleDateString()}</span>
                              <span className="uppercase tracking-wider">LANG: {c.language}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-classic-bg border border-dashed border-classic-border rounded-[48px] p-12 text-center flex flex-col justify-center items-center h-full min-h-[50vh]">
                <Coffee className="w-12 h-12 text-classic-rust/60 animate-bounce mb-4" />
                <h3 className="font-serif text-xl font-bold italic text-classic-text">Select Ancestral Wisdom</h3>
                <p className="text-classic-text/70 text-xs mt-2 max-w-sm leading-relaxed">
                  Click on any remedy card on the left panel to study detailed botanical lists, raw instructions, visual elements, oral translations, and community reviews.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
      )}

      {homepageLayout === 'bento' && (
        <main id="feed-bento" className="max-w-7xl mx-auto px-4 md:px-8 space-y-6 pb-12">
          {/* Top Row: AI Consult (col-span-8) & Stats Widget (col-span-4) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-amber-50/60 border border-classic-rust/30 rounded-[36px] p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-classic-rust" />
                  <span className="text-[10px] font-mono tracking-widest text-classic-rust font-bold uppercase">Elder Conversation Block</span>
                </div>
                <h3 className="font-serif text-2xl font-black text-classic-text mb-2">Deep Dialect Botanical Consult</h3>
                <p className="text-xs text-classic-text/80 mb-5 leading-relaxed max-w-xl">
                  Ask our artificial elder for home medicine scalers, herbal teas, or specific traditional cure alignments in Hindi, Tamil, Spanish, and English.
                </p>
              </div>

              <form onSubmit={handleConsultElder} className="space-y-3 relative z-10">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 'I feel congested and need a tea to soothe my throat'"
                    value={consultQuery}
                    onChange={(e) => setConsultQuery(e.target.value)}
                    className="w-full pl-4 pr-32 py-3 border border-classic-rust/35 rounded-full text-xs bg-white focus:outline-none text-classic-text shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={consultLoading || !consultQuery.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-classic-rust text-white text-[10px] font-mono font-bold uppercase tracking-widest px-5 rounded-full hover:bg-classic-rust/95 active:scale-95 duration-100 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {consultLoading ? "Consulting..." : "Consult AI"}
                  </button>
                </div>
              </form>

              <AnimatePresence>
                {consultResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 bg-white border border-classic-rust/20 rounded-[20px] text-xs space-y-2 text-left shadow-2xs"
                  >
                    <span className="text-[9px] font-mono text-classic-rust font-bold uppercase block">&bull; {consultResult.elderName}'s Counsel:</span>
                    <p className="font-serif italic text-classic-text">"{consultResult.message}"</p>
                    {consultResult.recommendedEntryIds && consultResult.recommendedEntryIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {consultResult.recommendedEntryIds.map(id => (
                          <button
                            key={id}
                            onClick={() => handleSelectRecommendedEntry(id)}
                            className="text-[10px] font-mono bg-classic-green/10 text-classic-green px-2.5 py-1 rounded-full hover:bg-classic-green hover:text-white transition-all cursor-pointer animate-none"
                          >
                            📖 Open Remedy
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Preservation Metrics block */}
            <div className="lg:col-span-4 bg-classic-green/10 border border-classic-green/20 rounded-[36px] p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-2 text-left">
                <span className="text-[9px] font-mono font-bold text-classic-green uppercase tracking-widest">DIGITAL HERITAGE LEDGER</span>
                <h3 className="font-serif text-xl font-bold text-classic-text leading-snug">Virasat Oral Registry</h3>
              </div>
              <div className="py-6 text-left">
                <span className="text-5xl font-serif font-black text-classic-green block">4,281</span>
                <span className="text-xs text-classic-text/60 font-mono uppercase tracking-wider">Active Community Contributions</span>
              </div>
              <p className="text-[11px] text-classic-text/80 leading-relaxed font-sans text-left">
                Each contribution is analyzed for phytochemical matches and translated to dismantle cross-cultural knowledge gaps.
              </p>
            </div>
          </div>

          {/* Full-width block: Ingredient Cabinet */}
          <div className="w-full">
            <IngredientCabinet onHerbSelect={handleSelectHerbFromCabinet} />
          </div>

          {/* Filters Bar Row */}
          <div className="bg-white border border-classic-border rounded-[32px] p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center shadow-xs">
            {/* Tab controls */}
            <div className="flex bg-classic-bg p-1 rounded-full border border-classic-border w-full justify-around md:col-span-2">
              {['all', 'remedy', 'recipe'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider w-full text-center cursor-pointer ${
                    activeTab === tab
                      ? 'bg-classic-text text-white shadow-2xs'
                      : 'text-classic-text/60 hover:text-classic-text'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'remedy' ? 'Remedies' : 'Recipes'}
                </button>
              ))}
            </div>

            {/* Inputs & drops */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-classic-text/40" />
              <input
                type="text"
                placeholder="Search database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-classic-border text-classic-text rounded-full text-xs focus:ring-2 focus:ring-classic-rust/10 focus:border-classic-rust transition-all"
              />
            </div>

            <div className="flex gap-2 w-full">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-classic-border rounded-full text-xs bg-transparent text-classic-text cursor-pointer"
              >
                <option value="All">Category</option>
                {categories.filter(c => c !== "All").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-classic-border rounded-full text-xs bg-transparent text-classic-text cursor-pointer"
              >
                <option value="All">Region</option>
                {regions.filter(r => r !== "All").map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 font-serif text-classic-text/60">Searching heritage archives...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="col-span-full text-center py-12 border border-dashed border-classic-border rounded-[32px] text-classic-text font-serif">No matches. Let me search again or record a new remedy.</div>
            ) : (
              filteredEntries.map(entry => (
                <div key={entry.id} className="hover:-translate-y-1 transition-all duration-300">
                  {renderEntryCard(entry)}
                </div>
              ))
            )}
          </div>
        </main>
      )}

      {homepageLayout === 'minimal' && (
        <main id="feed-minimal" className="max-w-3xl mx-auto px-6 py-12 space-y-12">
          {/* Aesthetic minimalist text search row */}
          <div className="border-b-2 border-classic-text/90 py-3 flex items-center justify-between col-span-full">
            <input
              type="text"
              placeholder="Search symptoms, spices, or region dials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-classic-text placeholder-classic-text/30 text-lg font-serif font-black italic focus:outline-none w-full"
            />
            <Search className="w-5 h-5 text-classic-text shrink-0" />
          </div>

          {/* Simple horizontal filter layout */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-classic-text/75 border-b border-classic-border pb-4">
            <div className="flex gap-4">
              {['all', 'remedy', 'recipe'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`hover:text-classic-rust uppercase tracking-wider font-bold ${activeTab === tab ? 'text-classic-rust underline underline-offset-4 font-extrabold' : ''}`}
                >
                  {tab === 'all' ? 'All' : tab === 'remedy' ? 'Nuskhas' : 'Recipes'}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
              <span>Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none font-bold text-classic-rust cursor-pointer outline-none text-xs uppercase tracking-wider"
              >
                <option value="All">All Categories</option>
                {categories.filter(c => c !== "All").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <span>Origin:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent border-none font-bold text-classic-green cursor-pointer outline-none text-xs uppercase tracking-wider"
              >
                <option value="All">All Origins</option>
                {regions.filter(r => r !== "All").map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive AI & Spice row styled minimally */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Minimal consult block */}
            <div className="bg-amber-50/40 p-6 rounded-[28px] border border-classic-rust/20 flex flex-col justify-between text-left">
              <div>
                <span className="text-[9px] font-mono text-classic-rust font-extrabold uppercase tracking-widest block mb-1">INTERACTIVE COUNSEL</span>
                <h4 className="font-serif font-bold text-classic-text text-base">Type to consult the Dadi</h4>
              </div>
              <form onSubmit={handleConsultElder} className="mt-4 flex gap-1">
                <input
                  type="text"
                  placeholder="Ask remedies..."
                  value={consultQuery}
                  onChange={(e) => setConsultQuery(e.target.value)}
                  className="w-full text-xs border border-classic-border bg-white rounded-full px-3 py-2 text-classic-text focus:outline-none"
                />
                <button type="submit" className="bg-classic-rust text-white text-[10px] font-mono uppercase px-3.5 rounded-full shrink-0 cursor-pointer">Ask</button>
              </form>
              {consultResult && (
                <p className="mt-3 text-[11px] text-classic-text/85 font-serif italic border-l border-classic-rust pl-2 leading-relaxed">
                  "{consultResult.message}"
                </p>
              )}
            </div>

            {/* Minimal Cabinet launcher */}
            <div className="bg-stone-100/50 p-6 rounded-[28px] border border-classic-border flex flex-col justify-between text-left">
              <div>
                <span className="text-[9px] font-mono text-classic-green font-extrabold uppercase tracking-widest block mb-1">CANTINA CABINET</span>
                <h4 className="font-serif font-bold text-classic-text text-base">Herb Dispensary Quick Pick</h4>
                <p className="text-[11px] text-classic-text/70 mt-1">Tap quick keys to match clove, turmeric, ginger, or mint seeds directly to old registers.</p>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {["Ginger", "Turmeric", "Clove", "Tulsi", "Mint"].map(herb => (
                  <button
                    key={herb}
                    onClick={() => handleSelectHerbFromCabinet(herb)}
                    className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border border-classic-border hover:bg-white transition-all bg-white/40 cursor-pointer text-classic-text"
                  >
                    🍃 {herb}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center-aligned Editorial Feed */}
          <div className="space-y-12 pt-8">
            {loading ? (
              <div className="text-center py-8 font-serif italic text-classic-text/60">Curation in progress...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-classic-text/60 font-serif">No articles logged matching current credentials.</div>
            ) : (
              filteredEntries.map(entry => {
                const targetLang = translationLangs[entry.id] || "en";
                const transKey = `${entry.id}_${targetLang}`;
                const hasTranslation = translations[transKey];
                const titleText = hasTranslation ? translations[transKey].translatedTitle : entry.title;
                const descText = hasTranslation ? translations[transKey].translatedDescription : entry.description;

                return (
                  <motion.div
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="group border-b border-classic-border/60 pb-10 hover:opacity-95 transition-all cursor-pointer text-left font-serif"
                  >
                    <div className="flex gap-2.5 text-[9px] tracking-widest font-mono uppercase text-classic-rust font-extrabold">
                      <span>{entry.type === 'remedy' ? 'Nuskha (Remedy)' : 'Traditional Culinary'}</span>
                      <span>&bull;</span>
                      <span>{entry.category}</span>
                    </div>

                    <h3 className="font-serif text-3xl font-black italic text-classic-text mt-2 leading-snug group-hover:text-classic-rust transition-colors">
                      {titleText}
                    </h3>
                    
                    <p className="text-xs text-classic-text/50 font-mono mt-1">
                      Retained by {entry.creator} from {entry.origin} &bull; Originally written in {entry.language}
                    </p>

                    <p className="text-sm text-classic-text/85 leading-relaxed mt-3.5 line-clamp-3 font-sans font-normal">
                      {descText}
                    </p>

                    <div className="flex items-center justify-between gap-4 mt-6 text-xs font-mono font-bold text-classic-green">
                      <span className="flex items-center gap-1">STUDY ARCHIVAL REPORT &rarr;</span>
                      <span className="text-classic-text/50">{entry.likes} support approvals</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </main>
      )}

      {homepageLayout === 'museum' && (
        <main id="feed-museum" className="max-w-7xl mx-auto px-4 md:px-8 space-y-6 pb-12">
          {/* Metadata ledger introduction card */}
          <div className="bg-stone-50 border border-classic-border rounded-[32px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs text-left">
            <div>
              <span className="text-[9px] font-mono text-classic-rust font-black uppercase tracking-widest">CURATION DATABASE</span>
              <h3 className="font-serif text-xl font-bold text-classic-text mt-0.5">Virasat Traditional Science Database</h3>
              <p className="text-xs text-classic-text/70">A highly structured database index of Indian remedies, dialect scales, and original regions.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-classic-rust hover:bg-classic-rust/95 text-white text-[10px] font-mono font-bold tracking-wider uppercase py-2 px-4 rounded-full shadow-2xs cursor-pointer"
              >
                + Append Record
              </button>
            </div>
          </div>

          {/* Database filters toolbar row */}
          <div className="bg-white border border-classic-border rounded-[32px] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
            {/* Search tool */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-classic-text/40" />
              <input
                type="text"
                placeholder="Filter index database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-classic-border text-classic-text rounded-full text-xs focus:ring-1 focus:ring-classic-rust focus:outline-none"
              />
            </div>

            {/* Quick status counters */}
            <div className="flex gap-2 font-mono text-xs text-classic-text/60">
              <span className="bg-stone-100 px-3 py-1 rounded-full uppercase font-bold">&bull; Total: {entries.length} records</span>
              <span className="bg-classic-green/10 text-classic-green px-3 py-1 rounded-full uppercase font-bold">&bull; Matches: {filteredEntries.length} records</span>
            </div>

            {/* Region dropdown filter */}
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 border border-classic-border rounded-full text-xs bg-stone-50 cursor-pointer focus:outline-none text-classic-text"
              >
                <option value="All">All Categories</option>
                {categories.filter(c => c !== "All").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-1.5 border border-classic-border rounded-full text-xs bg-stone-50 cursor-pointer focus:outline-none text-classic-text"
              >
                <option value="All">All Origins</option>
                {regions.filter(r => r !== "All").map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Database Spreadsheet representation */}
          <div className="bg-white rounded-[32px] border border-classic-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-classic-text text-white text-[10px] font-mono uppercase tracking-widest border-b border-classic-border">
                    <th className="py-4.5 px-6 font-bold w-12 text-center">Type</th>
                    <th className="py-4.5 px-6 font-bold">Generational wisdom / Title</th>
                    <th className="py-4.5 px-6 font-bold">Category</th>
                    <th className="py-4.5 px-6 font-bold">Geographic Origin</th>
                    <th className="py-4.5 px-6 font-bold">Oral Language Dialect</th>
                    <th className="py-4.5 px-6 font-bold text-center w-24">likes</th>
                    <th className="py-4.5 px-6 font-bold text-right w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-classic-border/45">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs font-mono text-classic-text/60">Syncing database registers...</td>
                    </tr>
                  ) : filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs font-mono text-classic-text/50">Curation ledger empty. Modify search params.</td>
                    </tr>
                  ) : (
                    filteredEntries.map(entry => (
                      <tr
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className={`hover:bg-classic-bg/30 text-classic-text whitespace-nowrap cursor-pointer transition-colors ${selectedEntry?.id === entry.id ? 'bg-classic-rust/5 font-extrabold' : ''}`}
                      >
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-mono uppercase font-bold tracking-wider ${entry.type === 'remedy' ? 'bg-classic-green/15 text-classic-green' : 'bg-classic-rust/15 text-classic-rust'}`}>
                            {entry.type === 'remedy' ? 'NUS' : 'REC'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-serif italic font-bold text-sm max-w-xs truncate text-classic-text">{entry.title}</div>
                          <div className="text-[10.5px] font-mono text-classic-text/60 truncate max-w-xs">{entry.description}</div>
                        </td>
                        <td className="py-4 px-6 text-xs font-sans text-classic-text/80">{entry.category}</td>
                        <td className="py-4 px-6 text-xs font-sans font-mono text-classic-text/75">{entry.origin}</td>
                        <td className="py-4 px-6 text-xs text-classic-text/75 italic">{entry.language}</td>
                        <td className="py-4 px-6 text-center font-mono text-xs text-classic-rust font-bold">{entry.likes} ★</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEntry(entry);
                            }}
                            className="bg-classic-text text-white text-[9.5px] uppercase font-mono tracking-wider font-extrabold px-3 py-1.5 rounded-full hover:bg-classic-rust hover:text-white transition-colors cursor-pointer"
                          >
                            Examine
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {homepageLayout === 'garden' && (
        <main id="feed-garden" className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 pb-16">
          <header className="text-center space-y-2 pt-8">
            <span className="text-[10px] font-mono font-black text-classic-rust uppercase tracking-[0.3em]">H E R B A R I U M &nbsp; B L O O M</span>
            <h1 className="font-serif text-5xl font-black text-classic-text italic">The Living Registry</h1>
            <p className="text-classic-text/70 max-w-lg mx-auto font-sans">An organic collection of ancestral wisdom. Explore entries in a free-flowing, sculptural arrangement.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-20 font-serif text-classic-text/50">Cultivating entries...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="col-span-full text-center py-20 border-2 border-dashed border-classic-border rounded-[48px] text-classic-text">No wisdom found in this corner of the garden.</div>
            ) : (
              filteredEntries.map((entry, idx) => (
                <div key={entry.id} className={idx % 4 === 0 ? "md:col-span-2 lg:col-span-2" : ""}>
                  {renderEntryCard(entry)}
                </div>
              ))
            )}
          </div>
        </main>
      )}

      {/* Immersive Detail Drawer for Alternative Homepages */}
      <AnimatePresence>
        {selectedEntry && homepageLayout !== 'classic' && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Ambient Darkened Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Slide-over Panel Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Render detailed reader room inside custom drawer */}
              <div className="flex-1 overflow-y-auto">
                {renderDetailedViewer(true)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Remedy / Wisdom Modal overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-classic-text/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[48px] max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-classic-border p-6 md:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddForm(false)}
                className="absolute top-6 right-6 p-2 hover:bg-classic-bg text-classic-text/60 hover:text-classic-text rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-classic-border pb-4">
                <h3 className="text-3xl font-serif font-black text-classic-text italic">Declare Traditional Wisdom</h3>
                <p className="text-xs text-classic-rust mt-1.5 uppercase font-mono tracking-widest font-bold">Submit and prevent generational oral lore from vanishing</p>
              </div>

              <form onSubmit={handleCreateEntry} className="space-y-5 text-classic-text">
                {/* Form Selection types */}
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-classic-bg border border-classic-border rounded-full">
                  <button
                    type="button"
                    onClick={() => setFormType('remedy')}
                    className={`py-2 text-[11px] font-bold rounded-full tracking-wider uppercase transition-all cursor-pointer ${
                      formType === 'remedy' ? 'bg-classic-rust text-white shadow-xs' : 'text-classic-text/60 hover:text-classic-text'
                    }`}
                  >
                    Home Remedy (Nuskha)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('recipe')}
                    className={`py-2 text-[11px] font-bold rounded-full tracking-wider uppercase transition-all cursor-pointer ${
                      formType === 'recipe' ? 'bg-classic-rust text-white shadow-xs' : 'text-classic-text/60 hover:text-classic-text'
                    }`}
                  >
                    Culinary Recipe
                  </button>
                </div>

                {/* Submitter Name & Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Title of Wisdom</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tulsi Ginger Immunity Tea"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full mt-1.5 px-4 py-2.5 border border-classic-border rounded-full bg-white text-xs text-classic-text focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Wise Ancestor Creator Credit</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nani Suman or Dadi Amma"
                      value={formCreator}
                      onChange={(e) => setFormCreator(e.target.value)}
                      className="w-full mt-1.5 px-4 py-2.5 border border-classic-border rounded-full bg-white text-xs text-classic-text focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Category of cure</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cough, Digestive, Immunity"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full mt-1.5 px-4 py-2.5 border border-classic-border rounded-full bg-white text-xs text-classic-text focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Geographical Origin / Culture</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Punjab, India or Oaxaca, Mexico"
                      value={formOrigin}
                      onChange={(e) => setFormOrigin(e.target.value)}
                      className="w-full mt-1.5 px-4 py-2.5 border border-classic-border rounded-full bg-white text-xs text-classic-text focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Spoken/Written Language</label>
                    <select
                      value={formLanguage}
                      onChange={(e) => setFormLanguage(e.target.value)}
                      className="w-full mt-1.5 px-4 py-2.5 border border-classic-border rounded-full bg-white text-xs text-classic-text cursor-pointer focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.name}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lore description */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Lore Overview / Description</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide context. What has been passing this recipe down? Tell the family history..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full mt-1.5 px-4 py-3 border border-classic-border rounded-2xl bg-white text-xs text-classic-text focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all resize-none"
                  />
                </div>

                {/* Benefits field */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Special curative features / warnings</label>
                  <input
                    type="text"
                    placeholder="e.g. 'Highly warming - use with caution in extreme summer'"
                    value={formBenefits}
                    onChange={(e) => setFormBenefits(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 border border-classic-border rounded-full bg-white text-xs text-classic-text focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all"
                  />
                </div>

                {/* Media options */}
                <div className="bg-classic-bg border border-classic-border rounded-[32px] p-6 space-y-4">
                  <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/80 pl-1">Contribution Format</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-xs text-classic-text font-bold cursor-pointer">
                      <input
                        type="radio"
                        checked={formMediaType === "text"}
                        onChange={() => setFormMediaType("text")}
                        className="accent-classic-rust cursor-pointer"
                      />
                      <span>Written Text Detail</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-classic-text font-bold cursor-pointer">
                      <input
                        type="radio"
                        checked={formMediaType === "video"}
                        onChange={() => setFormMediaType("video")}
                        className="accent-classic-rust cursor-pointer"
                      />
                      <span>Video Reference</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-classic-text font-bold cursor-pointer">
                      <input
                        type="radio"
                        checked={formMediaType === "audio"}
                        onChange={() => setFormMediaType("audio")}
                        className="accent-classic-rust cursor-pointer"
                      />
                      <span>Oral Audio recorded on-the-spot</span>
                    </label>
                  </div>

                  {/* Written detailed inputs */}
                  {formMediaType === "text" && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Horticultural / Ingredient List</label>
                          <button
                            type="button"
                            onClick={() => setFormIngredients(prev => [...prev, ""])}
                            className="text-[10px] uppercase font-sans font-bold text-classic-rust hover:underline cursor-pointer"
                          >
                            + Add Ingredient Line
                          </button>
                        </div>
                        {formIngredients.map((ing, idx) => (
                          <div key={idx} className="flex gap-2 mt-1.5">
                            <input
                              type="text"
                              placeholder={`e.g. 2 pieces cardamoms`}
                              value={ing}
                              onChange={(e) => {
                                const copy = [...formIngredients];
                                copy[idx] = e.target.value;
                                setFormIngredients(copy);
                              }}
                              className="flex-1 px-4 py-2 border border-classic-border rounded-full text-xs text-classic-text bg-white bg-white focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all"
                            />
                            {formIngredients.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setFormIngredients(prev => prev.filter((_, i) => i !== idx))}
                                className="text-[10px] font-mono font-bold uppercase text-red-600 hover:text-red-700 px-3 cursor-pointer"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Preparation steps</label>
                          <button
                            type="button"
                            onClick={() => setFormInstructions(prev => [...prev, ""])}
                            className="text-[10px] uppercase font-sans font-bold text-classic-rust hover:underline cursor-pointer"
                          >
                            + Add Preparation Step
                          </button>
                        </div>
                        {formInstructions.map((step, idx) => (
                          <div key={idx} className="flex gap-2 mt-1.5 items-center">
                            <span className="font-mono text-classic-text/50 text-xs w-4">{idx + 1}.</span>
                            <input
                              type="text"
                              placeholder={`e.g. Boil water and steep cardamoms`}
                              value={step}
                              onChange={(e) => {
                                const copy = [...formInstructions];
                                copy[idx] = e.target.value;
                                setFormInstructions(copy);
                              }}
                              className="flex-1 px-4 py-2 border border-classic-border rounded-full text-xs text-classic-text bg-white hover:bg-white focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all"
                            />
                            {formInstructions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setFormInstructions(prev => prev.filter((_, i) => i !== idx))}
                                className="text-[10px] font-mono font-bold uppercase text-red-600 hover:text-red-700 px-3 cursor-pointer"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                   {/* Video format detailed inputs */}
                  {formMediaType === "video" && (
                    <div className="pt-2">
                      <label className="block text-[10px] uppercase font-mono font-bold text-classic-text/75 pl-1">Recipe Video Link (YouTube / URL)</label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={formMediaUrl}
                        onChange={(e) => setFormMediaUrl(e.target.value)}
                        className="w-full mt-1.5 px-4 py-2.5 border border-classic-border rounded-full bg-white text-xs text-classic-text focus:outline-none focus:ring-4 focus:ring-classic-rust/5 focus:border-classic-rust transition-all"
                      />
                    </div>
                  )}

                  {/* Oral audio format detailed inputs */}
                  {formMediaType === "audio" && (
                    <div className="pt-2 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-classic-border rounded-[24px]">
                        <div className="flex items-center gap-2">
                          <Mic className={`w-5 h-5 ${isRecording ? "text-red-650 animate-pulse" : "text-classic-text/50"}`} />
                          <span className="text-xs font-bold text-classic-text">
                            {isRecording ? `Recording wisdom... (${recordingDuration}s)` : "Capture Oral Recipe audio instructions"}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {!isRecording ? (
                            <button
                              type="button"
                              onClick={startRecording}
                              className="bg-classic-rust hover:bg-classic-rust/95 text-white text-[10px] px-4 py-2 rounded-full font-mono font-bold uppercase tracking-wider cursor-pointer shadow-xs active:scale-95 transition-all"
                            >
                              START MIC CAPTURE
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="bg-classic-text hover:bg-classic-text/95 text-white text-[10px] px-4 py-2 rounded-full font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                            >
                              <Square className="w-2.5 h-2.5 fill-current text-white" />
                              <span>STOP RECORD</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {audioUrl && (
                        <div className="p-4 bg-classic-bg border border-classic-border rounded-[24px] space-y-2.5">
                          <span className="text-[10px] font-mono tracking-widest text-classic-text/50 block font-bold">AUDIO PLAYBACK FOR RECORDED WISDOM:</span>
                          <audio src={audioUrl} controls className="w-full h-8"></audio>
                          
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={handleTranscribeAudio}
                              disabled={transcribing}
                              className="bg-classic-rust hover:bg-classic-rust/95 text-stone-50 text-[11px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              {transcribing ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-stone-100 border-t-transparent rounded-full animate-spin"></div>
                                  <span>Transcribing via Gemini AI...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-stone-100" />
                                  <span>AI Auto-Extract Text from Speech</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {transcribedText && (
                        <div className="p-4 bg-classic-bg rounded-[24px] border border-classic-border space-y-1.5">
                          <span className="text-[10px] font-mono font-bold text-classic-rust uppercase tracking-wider">AI Extracted Raw Lore:</span>
                          <p className="text-xs text-classic-text italic leading-relaxed font-serif pl-1">{transcribedText}</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Confirm submit buttons */}
                <div className="flex justify-end gap-3 pt-5 border-t border-classic-border">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2.5 rounded-full border border-classic-border text-classic-text hover:bg-classic-bg font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-2.5 rounded-full bg-classic-green hover:bg-classic-green/95 text-stone-50 font-bold text-xs transition-all focus:outline-none hover:shadow active:scale-95 duration-200 cursor-pointer"
                  >
                    {submitting ? "Preserving lore..." : "Confirm & Commit to History"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}
