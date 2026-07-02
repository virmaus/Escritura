import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Lazy initialization of GoogleGenAI
let ai: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// Helper to sleep for retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate content with automatic model fallback and retries to handle 503/overload errors
async function generateContentWithFallback(
  aiClient: GoogleGenAI,
  prompt: string,
  responseMimeType: string = "application/json"
): Promise<string> {
  const models = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-2.5-flash"
  ];
  let lastError: any = null;

  // PASO 1: Intento rápido across todos los modelos en secuencia sin pausas
  console.log("[Gemini] Iniciando PASO 1: Intento rápido de todos los modelos...");
  for (const model of models) {
    try {
      console.log(`[Gemini] Paso 1 - Probando modelo: ${model}`);
      const response = await aiClient.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType
        }
      });

      if (response && response.text) {
        console.log(`[Gemini] Éxito absoluto con ${model} en Paso 1`);
        return response.text;
      }
    } catch (error: any) {
      lastError = error;
      const status = error?.status || error?.code;
      const errMsg = (error?.message || "").toLowerCase();

      console.warn(
        `[Gemini] El modelo ${model} falló en Paso 1. Status: ${status}, Mensaje: ${error?.message || error}`
      );

      // Si el error es de autenticación o de entrada inválida de cliente, no tiene sentido seguir con otros modelos
      if (
        status === 400 || 
        status === 401 || 
        status === 403 || 
        errMsg.includes("key") || 
        errMsg.includes("api_key") ||
        errMsg.includes("invalid")
      ) {
        throw error;
      }
    }
  }

  // PASO 2: Si todos los modelos fallaron en el primer intento rápido, esperamos un poco y hacemos un último reintento
  console.log("[Gemini] Todos los modelos de Paso 1 fallaron. Esperando 2000ms antes de iniciar PASO 2...");
  await sleep(2000);

  for (const model of models) {
    try {
      console.log(`[Gemini] Paso 2 - Reintentando modelo: ${model}`);
      const response = await aiClient.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType
        }
      });

      if (response && response.text) {
        console.log(`[Gemini] Éxito absoluto con ${model} en Paso 2`);
        return response.text;
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`[Gemini] El modelo ${model} falló en Paso 2:`, error?.message || error);
    }
  }

  throw lastError || new Error("No se pudo generar contenido con ninguno de los modelos de Gemini disponibles.");
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Endpoint to analyze multiple writings and generate a Style Profile
app.post("/api/analyze-profile", async (req, res) => {
  try {
    const { writings } = req.body;
    if (!writings || !Array.isArray(writings) || writings.length === 0) {
      return res.status(400).json({ error: "Debe proporcionar una lista de escritos para analizar." });
    }

    const aiClient = getAIClient();

    // Compile writings text for the model
    const compiledWritings = writings
      .map((w, index) => `=== ESCRITO ${index + 1}: ${w.title || "Sin título"} ===\n${w.content}\n`)
      .join("\n\n");

    const prompt = `
Actúa como un experto lingüista, editor literario y analista de estilo de escritura.
Analiza la siguiente recopilación de escritos anteriores de un mismo autor para descifrar su "huella dactilar de estilo" (Style Profile / Perfil de Estilo).

Debes identificar de forma precisa:
1. Patrones de voz y estilo (p. ej., "Directo y asertivo", "Melancólico y detallado", "Uso recurrente de descripciones sensoriales").
2. Muletillas y palabras recurrentes (palabras o conectores que el autor repite con excesiva frecuencia o que definen su ritmo de habla/escritura).
3. Figuras retóricas favoritas (metáforas, hipérboles, anáforas, comparaciones, etc.) que utiliza activamente, junto con ejemplos exactos extraídos de los textos.
4. Tono general (humorístico, formal, nostálgico, poético, académico, coloquial).
5. Estructura de oraciones (p. ej., "Oraciones muy breves e impactantes", "Párrafos largos con oraciones subordinadas complejas").
6. Riqueza de vocabulario (una puntuación estimada entre 1 y 100 basada en la diversidad léxica y complejidad del lenguaje empleado).

Textos a analizar:
${compiledWritings}

Devuelve el análisis estrictamente en formato JSON con la siguiente estructura (todas las descripciones deben ser en Español):
{
  "voicePatterns": ["patrón 1", "patrón 2", "..."],
  "fillers": ["muletilla 1", "muletilla 2", "..."],
  "rhetoricalFigures": [
    {
      "name": "Nombre de la figura (ej: Metáfora)",
      "count": 3,
      "examples": ["ejemplo de texto 1", "ejemplo de texto 2"]
    }
  ],
  "tone": "Descripción detallada del tono",
  "sentenceStructure": "Descripción detallada de la estructura de oraciones",
  "vocabularyRichness": 85
}

Devuelve SOLAMENTE el objeto JSON válido. No incluyas markdown (como \`\`\`json ... \`\`\`), ni introducciones ni explicaciones adicionales fuera de los campos JSON.
`;

    const responseText = await generateContentWithFallback(aiClient, prompt);
    const profile = JSON.parse(responseText.trim());

    res.json(profile);
  } catch (error: any) {
    console.error("Error en /api/analyze-profile:", error);
    res.status(500).json({ error: error?.message || "Error interno del servidor al analizar el perfil." });
  }
});

// API Endpoint to evaluate a new text against a Style Profile
app.post("/api/evaluate-text", async (req, res) => {
  try {
    const { content, profile } = req.body;
    if (!content || !profile) {
      return res.status(400).json({ error: "Se requiere el contenido del nuevo escrito y el perfil de estilo para la evaluación." });
    }

    const aiClient = getAIClient();

    const prompt = `
Actúa como un mentor literario y corrector de estilo interactivo.
Evalúa el siguiente NUEVO texto escrito por un usuario frente a su "Perfil de Estilo Personal" previamente determinado.

Perfil de Estilo de Referencia:
- Patrones de voz: ${JSON.stringify(profile.voicePatterns)}
- Tono: ${profile.tone}
- Estructura de oraciones: ${profile.sentenceStructure}
- Muletillas conocidas: ${JSON.stringify(profile.fillers)}
- Figuras retóricas preferidas: ${JSON.stringify(profile.rhetoricalFigures)}

Nuevo Texto a Evaluar:
"""
${content}
"""

Tu objetivo es proporcionar una evaluación minuciosa:
1. Puntuación de fidelidad al estilo ("fidelityScore"): Un entero del 0 al 100 que indique qué tan fiel se mantiene el nuevo escrito al estilo del autor (tono, estructura, patrones).
2. Comentarios generales de retroalimentación ("feedback") en Español, explicándole de manera amigable qué partes capturan perfectamente su voz y dónde se desvía.
3. Identificación de muletillas conocidas u otras palabras sobreutilizadas detectadas en este nuevo texto ("detectedFillers").
4. Sugerencias específicas de mejora ("suggestions"): Una lista de fragmentos del texto original que podrían cambiarse, junto con una alternativa sugerida para enriquecer el vocabulario o alinear el tono, y la justificación.
5. Figuras retóricas detectadas ("detectedFigures"): Figuras poéticas o recursos literarios que el autor usó en este nuevo texto que refuerzan su estilo.

Devuelve estrictamente un objeto JSON con la siguiente estructura (en Español):
{
  "fidelityScore": 85,
  "feedback": "Comentario detallado de feedback literario...",
  "detectedFillers": ["básicamente", "en plan"],
  "suggestions": [
    {
      "original": "frase u oración original del texto",
      "suggested": "propuesta de reemplazo enriquecida o alineada al estilo",
      "reason": "por qué esta alternativa enriquece el texto o encaja mejor con su voz"
    }
  ],
  "detectedFigures": ["Metáfora: 'ejemplo'", "Comparación: 'ejemplo'"]
}

Devuelve SOLAMENTE el objeto JSON válido. No incluyas markdown (como \`\`\`json ... \`\`\`), ni explicaciones fuera del JSON.
`;

    const responseText = await generateContentWithFallback(aiClient, prompt);
    const evaluation = JSON.parse(responseText.trim());

    res.json(evaluation);
  } catch (error: any) {
    console.error("Error en /api/evaluate-text:", error);
    res.status(500).json({ error: error?.message || "Error interno del servidor al evaluar el texto." });
  }
});

// Configure Vite or Static Files
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
    console.log(`[Express] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
