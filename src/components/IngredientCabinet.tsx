import React, { useState, useMemo } from "react";
import { Search, Sparkles, Filter, Info, X, Leaf, HelpCircle } from "lucide-react";

export interface HerbProfile {
  id: string;
  name: string;
  localName: string;
  botanicalName: string;
  category: string;
  properties: string; // e.g. anti-viral, digestive heater
  dosha: string; // Vata Pitta Kapha balance
  primaryCompound: string; // bio-active compounds
  synergyCombo: string; // synergy
  substitution: string; // modern replacement
  trivia: string; // lore
  iconColor: string; // decorative background style
}

const HERBS_DATA: HerbProfile[] = [
  {
    id: "tulsi",
    name: "Tulsi",
    localName: "Holy Basil",
    botanicalName: "Ocimum tenuiflorum",
    category: "Lungs & Immunity",
    properties: "Deep expectorant, adaptogen, reduces fever, respiratory support.",
    dosha: "Pacifies Kapha and Vata (Warm energy)",
    primaryCompound: "Eugenol & Ursolic acid",
    synergyCombo: "Boiled with Fresh Ginger & Honey to elevate cellular respiratory recovery.",
    substitution: "Sweet Italian Basil or Thai Basil mixed with a pinch of fresh mint.",
    trivia: "Tulsi is known as the 'Queen of Herbs' in India and is grown in the central courtyards of traditional homes to purify ambient air.",
    iconColor: "emerald"
  },
  {
    id: "turmeric",
    name: "Haldi",
    localName: "Turmeric / Golden Root",
    botanicalName: "Curcuma longa",
    category: "Anti-inflammation & Bones",
    properties: "Strong antioxidant, joint tissue healer, liver cleanser.",
    dosha: "Balances all three Doshas (Vata, Pitta, Kapha)",
    primaryCompound: "Curcumin (polyphenol)",
    synergyCombo: "Must be taken with Black Pepper (piperine) to boost curcumin absorption by 2,000%!",
    substitution: "Fresh ginger powder + a tiny pinch of mild yellow mustard powder.",
    trivia: "In traditional weddings, turmeric paste is rubbed onto the skin of the bride and groom to grant an antibacterial radiant glow.",
    iconColor: "amber"
  },
  {
    id: "ginger",
    name: "Adrak",
    localName: "Ginger Root",
    botanicalName: "Zingiber officinale",
    category: "Warmth & Digestion",
    properties: "Speeds up stomach emptying, destroys cold toxins, increases circulatory fire (Agni).",
    dosha: "Calms Vata & Kapha, increases Pitta in excess",
    primaryCompound: "Gingerols & Shogaols",
    synergyCombo: "Paired with Rock Sugar (Mishri) to offset harsh throat-burn and cool stomach membranes.",
    substitution: "Galangal root or premium dry ginger powder (Sunth) on 1:3 ratio.",
    trivia: "Ayurveda refers to dried ginger as 'Vishwabheshaja'—the universal medicine.",
    iconColor: "orange"
  },
  {
    id: "black-pepper",
    name: "Kali Mirch",
    localName: "Black Peppercorns",
    botanicalName: "Piper nigrum",
    category: "Bio-Availability Catalyst",
    properties: "Increases gut enzyme secretion, releases sinus blockages, expels cold wind.",
    dosha: "Strongly pacifies Kapha, increases Agni (metabolic fire)",
    primaryCompound: "Piperine (alkaloid)",
    synergyCombo: "Activates Curcumin / Turmeric to ensure deep intestinal absorption.",
    substitution: "White pepper or a mix of crushed Sichuan pepper and grains of paradise.",
    trivia: "Black pepper was so valued in Roman times that it was used to buy ships, pay taxes, and settle ransom demands.",
    iconColor: "stone"
  },
  {
    id: "cardamom",
    name: "Elaichi",
    localName: "Green Cardamom",
    botanicalName: "Elettaria cardamomum",
    category: "Stomach Calm & Breath",
    properties: "Eliminates gas, treats mouth ulcers, balances acidity, natural aromatic relaxant.",
    dosha: "Soothes Pitta and Vata, keeps mucus down",
    primaryCompound: "1,8-Cineole & Terpinyl acetate",
    synergyCombo: "Brewed with robust black tea or heavy milk to cut down acid acidifiers.",
    substitution: "A tiny grating of whole nutmeg + a dash of cinnamon powder.",
    trivia: "Cardamom is the third-most expensive spice in the world, harvested entirely by hand in wet tropical valleys.",
    iconColor: "teal"
  },
  {
    id: "cloves",
    name: "Laung",
    localName: "Cloves",
    botanicalName: "Syzygium aromaticum",
    category: "Dental & Pain Relief",
    properties: "Natural local anesthetic, fights blood pathogens, heats cold core lungs.",
    dosha: "Strongly warm, reduces Vata and Kapha congestion",
    primaryCompound: "Eugenol",
    synergyCombo: "Simmered with Holy Basil (Tulsi) for painful dry toothaches or sore throat rasps.",
    substitution: "Allspice berries, ground",
    trivia: "In ancient China, citizens held a whole clove in their mouths to ensure sweet breath when addressing the Emperor.",
    iconColor: "rose"
  },
  {
    id: "cinnamon",
    name: "Dalchini",
    localName: "Ceylon Cinnamon",
    botanicalName: "Cinnamomum verum",
    category: "Blood Sugar & Circulation",
    properties: "Helps cells utilize glucose, sweetens food without sugar, dilates blood capillaries.",
    dosha: "Soothes Vata and Kapha, stimulates Pitta",
    primaryCompound: "Cinnamaldehyde (essential oils)",
    synergyCombo: "Paired with green and black tea to naturally temper bitter tannins.",
    substitution: "Cassia bark (standard store cinnamon) or a light grating of nutmeg.",
    trivia: "Ceylon cinnamon is 'true' cinnamon; it is softer, sweet, and low in coumarin compared to thick, woody cassia bark.",
    iconColor: "amber"
  },
  {
    id: "mustard-seeds",
    name: "Sarson",
    localName: "Mustard Greens & Seeds",
    botanicalName: "Brassica juncea / nigra",
    category: "Blood Minerals & Heat",
    properties: "High iron content, stimulates blood flow, relieves muscle stiffness via external oil poultices.",
    dosha: "Calutes Kapha, warm and heavy",
    primaryCompound: "Sinigrin & Glucosilanates",
    synergyCombo: "Tempered (popped) in warm Ghee to remove bitterness and unlock essential selenium.",
    substitution: "Collard greens or Swiss chard paired with dry brown mustard seeds.",
    trivia: "Sarson ka Saag is traditionally steamed in massive earthen clay handis for 4+ hours, stirred continuously using a wooden churn (madhani).",
    iconColor: "lime"
  }
];

interface IngredientCabinetProps {
  onHerbSelect: (herbName: string) => void;
}

export function IngredientCabinet({ onHerbSelect }: IngredientCabinetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHerb, setSelectedHerb] = useState<HerbProfile | null>(null);

  // Filter herbs by search query
  const filteredHerbs = useMemo(() => {
    if (!searchTerm.trim()) return HERBS_DATA;
    const term = searchTerm.toLowerCase();
    return HERBS_DATA.filter(
      (h) =>
        h.name.toLowerCase().includes(term) ||
        h.localName.toLowerCase().includes(term) ||
        h.botanicalName.toLowerCase().includes(term) ||
        h.category.toLowerCase().includes(term) ||
        h.properties.toLowerCase().includes(term) ||
        h.primaryCompound.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", icon: "🍵" };
      case "amber":
        return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon: "🌙" };
      case "orange":
        return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", icon: "🔥" };
      case "stone":
        return { bg: "bg-stone-50", border: "border-stone-200", text: "text-stone-800", icon: "🪨" };
      case "teal":
        return { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-800", icon: "🌱" };
      case "rose":
        return { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-800", icon: "🌹" };
      case "lime":
        return { bg: "bg-lime-50", border: "border-lime-200", text: "text-lime-800", icon: "🥬" };
      default:
        return { bg: "bg-stone-50", border: "border-stone-200", text: "text-stone-800", icon: "🍃" };
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-classic-border p-6 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <Leaf className="w-4.5 h-4.5 text-classic-green" />
            <span className="text-[10px] font-mono tracking-widest text-classic-green font-bold uppercase">Heritage Pharmacopeia</span>
          </div>
          <h3 className="font-serif text-lg font-black text-classic-text">Communal Spice & Herb Cabinet</h3>
          <p className="text-xs text-classic-text/60 mt-0.5">Explore biodynamic, active bio-chemicals, and medicinal synergy properties of ancient botanicals.</p>
        </div>

        {/* Mini Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search active compound/herb..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-4 py-2 border border-classic-border rounded-full text-xs focus:outline-none focus:border-classic-rust w-full sm:w-56 bg-stone-50 text-classic-text"
          />
          <Search className="w-3.5 h-3.5 text-classic-text/40 absolute left-3 top-2.5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-classic-text/40 hover:text-classic-text text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {filteredHerbs.map((herb) => {
          const colors = getColorClasses(herb.iconColor);
          const isSelected = selectedHerb?.id === herb.id;

          return (
            <button
              key={herb.id}
              onClick={() => setSelectedHerb(isSelected ? null : herb)}
              className={`p-3 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer ${
                colors.bg
              } ${colors.border} ${
                isSelected
                  ? "ring-4 ring-classic-rust/10 bg-white"
                  : "hover:scale-[1.02] hover:shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xl filter drop-shadow-2xs">{colors.icon}</span>
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider bg-black/5 px-2 py-0.5 rounded-full text-classic-text/60">
                  {herb.category.split(" ")[0]}
                </span>
              </div>
              <h4 className="font-serif font-black text-sm text-classic-text group-hover:text-classic-rust transition-colors mb-0.5">
                {herb.name}
              </h4>
              <p className="text-[10px] font-mono italic text-classic-text/60 line-clamp-1 block mb-1">
                {herb.localName}
              </p>
              <p className="text-[10px] text-classic-text/80 line-clamp-2 leading-tight">
                {herb.properties}
              </p>
              <div className="text-[9px] font-mono font-bold text-classic-rust mt-1.5 inline-flex items-center gap-0.5 group-hover:translate-x-0.5 duration-150 transform">
                <span>View Details</span>
                <span>→</span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredHerbs.length === 0 && (
        <div className="text-center py-6 border border-dashed border-classic-border rounded-2xl bg-stone-50">
          <HelpCircle className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-xs text-classic-text/60">No herbal elements matched your active search term.</p>
          <button
            onClick={() => setSearchTerm("")}
            className="text-xs text-classic-rust font-bold mt-1 hover:underline"
          >
            Clear and view all spices
          </button>
        </div>
      )}

      {/* Expanded Herb Detailed Card Modal/Drawer overlay */}
      {selectedHerb && (
        <div className="bg-stone-50 border border-classic-border rounded-2xl p-5 md:p-6 space-y-4 relative overflow-hidden transition-all duration-300">
          <button
            onClick={() => setSelectedHerb(null)}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white hover:bg-stone-100 flex items-center justify-center border border-classic-border text-classic-text hover:text-classic-rust cursor-pointer shadow-2xs transition-all"
            title="Close Description"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start gap-4 pb-4 border-b border-stone-200">
            <div className="bg-white border border-classic-border/60 w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-2xs shrink-0 transform -rotate-1">
              {getColorClasses(selectedHerb.iconColor).icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-serif font-black text-xl text-classic-text leading-tight">{selectedHerb.name}</h4>
                <span className="bg-stone-100 border border-stone-200 text-stone-600 text-[9px] font-mono px-2.5 py-0.5 rounded-full italic">
                  {selectedHerb.botanicalName}
                </span>
              </div>
              <p className="text-xs text-classic-text/80">
                Commonly known as <strong className="text-classic-rust">{selectedHerb.localName}</strong> &bull; Category: <strong className="text-classic-green">{selectedHerb.category}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
            <div className="space-y-3">
              <div className="bg-white border border-classic-border/40 p-3.5 rounded-xl space-y-1">
                <span className="text-[9px] font-mono tracking-wider text-classic-green font-bold uppercase block">Energetic Balance (Dosha Support):</span>
                <p className="text-classic-text leading-relaxed font-sans">{selectedHerb.dosha}</p>
              </div>

              <div className="bg-white border border-classic-border/40 p-3.5 rounded-xl space-y-1">
                <span className="text-[9px] font-mono tracking-wider text-classic-rust font-bold uppercase block">Primary Bio-Active Compound:</span>
                <p className="text-classic-text leading-relaxed font-mono text-[11px] font-bold">{selectedHerb.primaryCompound}</p>
              </div>

              <div className="bg-white border border-classic-border/40 p-3.5 rounded-xl space-y-1">
                <span className="text-[9px] font-mono tracking-wider text-classic-text/50 font-bold uppercase block">Everyday Store Substitution:</span>
                <p className="text-classic-text italic leading-snug">{selectedHerb.substitution}</p>
              </div>
            </div>

            <div className="space-y-3 flex flex-col justify-between">
              <div className="bg-white border border-classic-border/40 p-3.5 rounded-xl space-y-1">
                <span className="text-[9px] font-mono tracking-wider text-classic-rust font-bold uppercase block">Ancient Synergistic Pairing:</span>
                <p className="text-classic-text leading-relaxed">{selectedHerb.synergyCombo}</p>
              </div>

              <div className="bg-amber-50/50 border border-classic-rust/20 p-3.5 rounded-xl space-y-1">
                <span className="text-[9px] font-mono tracking-wider text-classic-rust font-bold uppercase block">Ancestral Lore & Historical Custom:</span>
                <p className="text-classic-text/90 italic font-serif leading-relaxed">"{selectedHerb.trivia}"</p>
              </div>

              {/* Action Button: Filter Community Feed */}
              <button
                onClick={() => {
                  onHerbSelect(selectedHerb.name);
                }}
                className="w-full bg-classic-text hover:bg-classic-text/90 text-white font-mono text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Recipes containing "{selectedHerb.name}"</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
