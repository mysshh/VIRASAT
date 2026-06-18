import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import * as admin from "firebase-admin";
import fs from "fs";

dotenv.config();

let db: admin.firestore.Firestore;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: config.projectId,
    });
    db = admin.firestore(undefined, config.firestoreDatabaseId);
    console.log("Firebase initialized successfully.");
  } else {
    console.error("firebase-applet-config.json not found.");
    // In production, we must have firebase config, so we should probably not crash, 
    // but the app needs functional storage... actually crashing might be better
    // to signal failure, or we just fail to initialize.
  }
} catch (err) {
  console.error("Error initializing Firebase:", err);
}

const app = express();
const PORT = 3000;

// Setup JSON body parsing with high limit for audio uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY) {
  ai = new GoogleGenAI({
    apiKey: API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable not found. AI features will be unavailable.");
}

// REST API Routes

// Clean entries list
app.get("/api/entries", async (req, res) => {
  try {
    const snapshot = await db.collection("entries").orderBy("createdAt", "desc").get();
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new entry
app.post("/api/entries", async (req, res) => {
  try {
    const { type, title, category, origin, language, creator, description, benefits, ingredients, instructions, mediaType, mediaUrl, audioBase64, transcribedText } = req.body;
    
    if (!title || !type) {
      return res.status(400).json({ error: "Title and Entry Type are required." });
    }

    const newEntry = {
      type,
      title,
      category: category || "General",
      origin: origin || "Global Heritage",
      language: language || "English",
      creator: creator || "Anonymous Giver",
      description: description || "",
      benefits: benefits || "",
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      instructions: Array.isArray(instructions) ? instructions : [],
      mediaType: mediaType || "text",
      mediaUrl: mediaUrl || "",
      audioBase64: audioBase64 || "",
      transcribedText: transcribedText || "",
      createdAt: new Date().toISOString(),
      likes: 0
    };

    const docRef = await db.collection("entries").add(newEntry);
    res.status(201).json({ id: docRef.id, ...newEntry });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Like an entry
app.post("/api/entries/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const entryRef = db.collection("entries").doc(id);
    await db.runTransaction(async (transaction) => {
      const entryDoc = await transaction.get(entryRef);
      if (!entryDoc.exists) {
        throw new Error("Entry not found");
      }
      const data = entryDoc.data()!;
      transaction.update(entryRef, { likes: (data.likes || 0) + 1 });
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.message === "Entry not found" ? 404 : 500).json({ error: err.message });
  }
});

// Get comments for an entry
app.get("/api/entries/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.collection("comments").where("entryId", "==", id).get();
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Post a comment
app.post("/api/entries/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { author, rating, commentText, tips, language } = req.body;

    if (!author || !rating || !commentText) {
      return res.status(400).json({ error: "Author, Star Rating, and Comment are required." });
    }

    const newComment = {
      entryId: id,
      author: author || "Kind Contributor",
      rating: Number(rating),
      commentText: commentText || "",
      tips: tips || "",
      language: language || "English",
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection("comments").add(newComment);
    res.status(201).json({ id: docRef.id, ...newComment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI translation route (using the requested server-side Gemini API structure)
app.post("/api/translate", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "Gemini AI features are currently unavailable. Check GEMINI_API_KEY." });
  }
  
  const { entry, targetLanguage } = req.body;
  if (!entry || !targetLanguage) {
    return res.status(400).json({ error: "Recipe data and target language are required for translation." });
  }

  try {
    const prompt = `
      You are an expert heritage native translator and language anti-bias guardian.
      Translate the following heritage recipe or home remedy into "${targetLanguage}".
      Make sure to translate fully and naturally, maintaining all absolute details, local ingredients lists, and instructions.
      Keep cultural nuances intact. Do not lose the warm, ancestral voice.
      
      Here is the JSON of the entry:
      ${JSON.stringify({
        title: entry.title,
        description: entry.description,
        benefits: entry.benefits,
        ingredients: entry.ingredients,
        instructions: entry.instructions
      })}

      Respond STRICTLY with a clean, fully-populated JSON object conforming to this schema (do NOT surround it with markdown block quotes or anything except valid JSON):
      {
        "translatedTitle": "String translated title",
        "translatedDescription": "String translated description",
        "translatedBenefits": "String translated benefits",
        "translatedIngredients": ["Array of translated strings"],
        "translatedInstructions": ["Array of translated strings"]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedTitle: { type: Type.STRING },
            translatedDescription: { type: Type.STRING },
            translatedBenefits: { type: Type.STRING },
            translatedIngredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            translatedInstructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["translatedTitle", "translatedDescription", "translatedIngredients", "translatedInstructions"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (err: any) {
    console.error("AI translation error:", err);
    res.status(500).json({ error: "Failed to translate entry safely: " + err.message });
  }
});

// AI voice transcription route
app.post("/api/transcribe", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "Gemini AI features are currently unavailable. Check GEMINI_API_KEY." });
  }

  const { audioBase64, mimeType } = req.body;
  if (!audioBase64) {
    return res.status(400).json({ error: "Audio base64 data is required." });
  }

  try {
    // strip the prefix: data:audio/webm;base64,...
    const base64Data = audioBase64.includes(";base64,")
      ? audioBase64.split(";base64,")[1]
      : audioBase64;

    const detectedMime = mimeType || "audio/webm";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: detectedMime
          }
        },
        "This audio tells a traditional home remedy (nuskha) or ancestral recipe. Please transcribe it completely in its spoken language. Keep it very accurate. Do not add commentaries or conversational fillers, just provide the exact transcription text."
      ]
    });

    const text = response.text || "Transcribing failed or returned empty text.";
    res.json({ transcription: text.trim() });
  } catch (err: any) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: "AI transcription failed: " + err.message });
  }
});

// AI Botanical and Cultural Analysis Route
app.post("/api/analyze", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "Gemini AI features are currently unavailable. Check GEMINI_API_KEY." });
  }

  const { entry } = req.body;
  if (!entry) {
    return res.status(400).json({ error: "Recipe or remedy details are required for botanical analysis." });
  }

  try {
    const prompt = `
      You are an expert ethnobotanist, herbal pharmacist, and historical culinary anthropologist.
      Analyze the following traditional remedy or recipe.
      Identify any key ingredients and provide scientific botanical names, biological details on why it works, the synergy between ingredients (e.g., black pepper activating curcumin), fascinating cultural or historical trivia, highly relevant regional ingredient substitutions, and crucial clinical usage warnings or contraindications.

      Here are the recipe/remedy details:
      Title: ${entry.title}
      Description: ${entry.description}
      Benefits: ${entry.benefits || "Not specified"}
      Ingredients: ${JSON.stringify(entry.ingredients)}

      Respond STRICTLY with a clean, fully-populated JSON object conforming to this schema (do NOT surround it with markdown block quotes or anything except valid JSON):
      {
        "botanicalNames": ["List of identified botanical/herbal ingredients with their scientific binomial names"],
        "scientificExplanation": "Deep bio-active or physiological explanation of why this combined formula or dish benefits the body",
        "culturalTrivia": "A beautiful historical nugget, legendary origin story, or cultural custom associated with these ingredients",
        "substitutions": ["List of suggestions for modern, store-bought, or Western-market substitutes if specific heritage crops/greens/spices are unavailable"],
        "warnings": "Essential safety precautions, dosage advice, or groups who should avoid this (e.g., allergic, pregnant, hot summer warnings)"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            botanicalNames: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            scientificExplanation: { type: Type.STRING },
            culturalTrivia: { type: Type.STRING },
            substitutions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            warnings: { type: Type.STRING }
          },
          required: ["botanicalNames", "scientificExplanation", "culturalTrivia", "substitutions", "warnings"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (err: any) {
    console.error("AI Analysis error:", err);
    res.status(500).json({ error: "Failed to perform botanical analysis: " + err.message });
  }
});

// AI Ancestral Consult Route (Symptom/Need matchmaking)
app.post("/api/consult", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "Gemini AI features are currently unavailable. Check GEMINI_API_KEY." });
  }

  const { query, entries } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Symptom or query string is required." });
  }

  try {
    const formattedEntries = Array.isArray(entries) ? entries.map(e => ({
      id: e.id,
      title: e.title,
      type: e.type,
      category: e.category,
      origin: e.origin,
      description: e.description,
      benefits: e.benefits
    })) : [];

    const prompt = `
      You are "Dadi-Abuela AI", a loving, warm, wise composite elder representing generations of global traditional healers, herbalists, and doting grandmas.
      A user comes to you seeking advice for a health symptom, nutrition need, or comforting traditional dish craving.
      
      Here is what they are asking: "${query}"

      Here is our current community database of traditional wisdom (entries):
      ${JSON.stringify(formattedEntries)}

      As a caring elder, reply with comforting, warm, sage advice. 
      1. Choose a charming, culturally diverse nickname/name for yourself that fits the style (e.g., Grandma savitri, Abuela Sofia, Biji, Nona, etc.)
      2. Provide warm, home-cooked-style remedy advice. Match any of our community entries in the database if they are relevant to their request, referencing them by their exact ID so they can view them.
      3. Recommend additional general traditional wisdom if no entries match exactly.
      4. Maintain a warm, encouraging oral story voice. It should feel like sitting in a sunny kitchen chatting with an ancestor.

      Respond STRICTLY with a clean, fully-populated JSON object conforming to this schema:
      {
        "elderName": "Custom name of the elder (e.g., 'Biji' or 'Abuela Elena')",
        "message": "Warm, conversational, sage elder advice to print for the user",
        "recommendedEntryIds": ["Array of string entry IDs that are relevant and recommended from the database, or empty if none fit"]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            elderName: { type: Type.STRING },
            message: { type: Type.STRING },
            recommendedEntryIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["elderName", "message", "recommendedEntryIds"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (err: any) {
    console.error("AI Consult error:", err);
    res.status(500).json({ error: "Dadi-Abuela AI was unable to process your request: " + err.message });
  }
});

// Vite Middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Heritage sharing platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
