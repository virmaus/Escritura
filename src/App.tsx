import React, { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "./firebase";
import { Writing, StyleProfile, Evaluation } from "./types";
import ProfileDashboard from "./components/ProfileDashboard";
import WritingsLibrary from "./components/WritingsLibrary";
import WritingEvaluator from "./components/WritingEvaluator";
import EvaluationsHistory from "./components/EvaluationsHistory";
import { 
  Sparkles, 
  BookOpen, 
  PenTool, 
  History, 
  Loader2, 
  User, 
  Flame,
  AlertCircle
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "writings" | "evaluator" | "history">("dashboard");
  const [writings, setWritings] = useState<Writing[]>([]);
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // 1. Subscribe to writings in Firestore
  useEffect(() => {
    const q = query(collection(db, "writings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const writingsData: Writing[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        writingsData.push({
          id: doc.id,
          title: data.title || "",
          content: data.content || "",
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
          type: data.type || "previous",
          wordCount: data.content ? data.content.trim().split(/\s+/).length : 0,
        } as Writing);
      });
      setWritings(writingsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore writings listener error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to style profile in Firestore
  useEffect(() => {
    const docRef = doc(db, "profiles", "active");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          voicePatterns: data.voicePatterns || [],
          fillers: data.fillers || [],
          rhetoricalFigures: data.rhetoricalFigures || [],
          tone: data.tone || "",
          sentenceStructure: data.sentenceStructure || "",
          vocabularyRichness: data.vocabularyRichness || 50,
          lastUpdated: data.lastUpdated?.toMillis ? data.lastUpdated.toMillis() : (data.lastUpdated || Date.now()),
          totalWritingsAnalyzed: data.totalWritingsAnalyzed || 0,
        } as StyleProfile);
      } else {
        setProfile(null);
      }
    }, (error) => {
      console.error("Firestore profile listener error:", error);
    });

    return () => unsubscribe();
  }, []);

  // 3. Subscribe to evaluations in Firestore
  useEffect(() => {
    const q = query(collection(db, "evaluations"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const evalsData: Evaluation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        evalsData.push({
          id: doc.id,
          title: data.title || "",
          content: data.content || "",
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
          fidelityScore: data.fidelityScore || 0,
          feedback: data.feedback || "",
          detectedFillers: data.detectedFillers || [],
          suggestions: data.suggestions || [],
          detectedFigures: data.detectedFigures || [],
        } as Evaluation);
      });
      setEvaluations(evalsData);
    }, (error) => {
      console.error("Firestore evaluations listener error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Core functions
  const handleAddWriting = async (title: string, content: string) => {
    setApiError(null);
    try {
      await addDoc(collection(db, "writings"), {
        title,
        content,
        type: "previous",
        createdAt: new Date(),
      });
    } catch (err: any) {
      console.error(err);
      setApiError("No se pudo guardar el escrito en la base de datos.");
      throw err;
    }
  };

  const handleDeleteWriting = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este escrito?")) {
      setApiError(null);
      try {
        await deleteDoc(doc(db, "writings", id));
      } catch (err) {
        console.error(err);
        setApiError("Error al eliminar el escrito.");
      }
    }
  };

  const handleGenerateProfile = async () => {
    const previousWritings = writings.filter(w => w.type === "previous");
    if (previousWritings.length === 0) {
      alert("Debes agregar al menos un escrito anterior para poder analizar tu estilo.");
      return;
    }

    setIsGeneratingProfile(true);
    setApiError(null);

    try {
      const response = await fetch("/api/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writings: previousWritings }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Ocurrió un error al generar el perfil.");
      }

      const profileData = await response.json();

      // Store in Firestore
      await setDoc(doc(db, "profiles", "active"), {
        ...profileData,
        lastUpdated: new Date(),
        totalWritingsAnalyzed: previousWritings.length,
      });

      setActiveTab("dashboard");
    } catch (err: any) {
      console.error(err);
      setApiError(err?.message || "No se pudo generar el perfil de estilo. Inténtalo de nuevo.");
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  const handleEvaluateText = async (title: string, content: string): Promise<Evaluation> => {
    if (!profile) {
      throw new Error("No hay un perfil de estilo activo para comparar.");
    }

    setIsEvaluating(true);
    setApiError(null);

    try {
      const response = await fetch("/api/evaluate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, profile }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al evaluar el borrador.");
      }

      const evaluationData = await response.json();
      
      // Return a structured Evaluation object (not saved to DB yet, let user save manually)
      return {
        id: "temp-" + Date.now(),
        title,
        content,
        createdAt: Date.now(),
        ...evaluationData,
      } as Evaluation;

    } catch (err: any) {
      console.error(err);
      setApiError(err?.message || "Error al conectar con la IA para la evaluación.");
      throw err;
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveEvaluation = async (evaluation: Evaluation) => {
    try {
      await addDoc(collection(db, "evaluations"), {
        title: evaluation.title,
        content: evaluation.content,
        fidelityScore: evaluation.fidelityScore,
        feedback: evaluation.feedback,
        detectedFillers: evaluation.detectedFillers,
        suggestions: evaluation.suggestions,
        detectedFigures: evaluation.detectedFigures,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("Error saving evaluation:", err);
      setApiError("No se pudo registrar la evaluación en el historial.");
    }
  };

  const handleDeleteEvaluation = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este informe del historial?")) {
      try {
        await deleteDoc(doc(db, "evaluations", id));
      } catch (err) {
        console.error(err);
        setApiError("Error al eliminar el informe.");
      }
    }
  };

  const previousWritingsCount = writings.filter(w => w.type === "previous").length;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans flex flex-col antialiased">
      {/* Sleek top navigation header */}
      <header className="bg-white border-b border-stone-200 py-4 px-6 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-900 text-white rounded-xl shadow-inner">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-stone-900 leading-tight">
                Estilo
              </h1>
              <span className="text-[10px] font-semibold text-stone-400 tracking-wider uppercase block">
                Analizador de Escritura Personal
              </span>
            </div>
          </div>

          {/* Tab switches */}
          <nav className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              id="tab-dashboard"
              onClick={() => { setActiveTab("dashboard"); setApiError(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Perfil
            </button>
            <button
              id="tab-writings"
              onClick={() => { setActiveTab("writings"); setApiError(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "writings"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Biblioteca ({previousWritingsCount})
            </button>
            <button
              id="tab-evaluator"
              onClick={() => { setActiveTab("evaluator"); setApiError(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "evaluator"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Taller
            </button>
            <button
              id="tab-history"
              onClick={() => { setActiveTab("history"); setApiError(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Historial ({evaluations.length})
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* API Error Panel */}
        {apiError && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 text-rose-800 max-w-4xl mx-auto">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-sm">Error en la operación</h5>
              <p className="text-xs mt-0.5">{apiError}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="w-8 h-8 text-stone-400 animate-spin mb-3" />
            <span className="text-stone-500 text-sm">Cargando base de datos y tus escritos...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === "dashboard" && (
              <ProfileDashboard
                profile={profile}
                writingsCount={previousWritingsCount}
                onGenerateProfile={handleGenerateProfile}
                isGeneratingProfile={isGeneratingProfile}
              />
            )}

            {activeTab === "writings" && (
              <WritingsLibrary
                writings={writings}
                onAddWriting={handleAddWriting}
                onDeleteWriting={handleDeleteWriting}
                isGeneratingProfile={isGeneratingProfile}
                onGenerateProfile={handleGenerateProfile}
              />
            )}

            {activeTab === "evaluator" && (
              <WritingEvaluator
                profile={profile}
                onEvaluateText={handleEvaluateText}
                onSaveEvaluation={handleSaveEvaluation}
                isEvaluating={isEvaluating}
              />
            )}

            {activeTab === "history" && (
              <EvaluationsHistory
                evaluations={evaluations}
                onDeleteEvaluation={handleDeleteEvaluation}
              />
            )}
          </div>
        )}
      </main>

      {/* Elegant minimalist footer */}
      <footer className="bg-white border-t border-stone-200 py-6 px-6 text-center text-xs text-stone-400 font-sans mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>
            © {new Date().getFullYear()} Estilo Studio. Diseñado con tipografías serif clásicas y análisis lingüístico avanzado.
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Fiel a tu propia voz literaria.
          </span>
        </div>
      </footer>
    </div>
  );
}
