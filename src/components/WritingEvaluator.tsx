import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Plus,
  Loader2,
  Trash2,
  History,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Eye,
  Check,
  Save,
  HelpCircle
} from "lucide-react";
import { StyleProfile, Evaluation } from "../types";

interface WritingEvaluatorProps {
  profile: StyleProfile | null;
  onEvaluateText: (title: string, content: string) => Promise<Evaluation>;
  onSaveEvaluation: (evaluation: Evaluation) => Promise<void>;
  isEvaluating: boolean;
}

export default function WritingEvaluator({
  profile,
  onEvaluateText,
  onSaveEvaluation,
  isEvaluating,
}: WritingEvaluatorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [evaluationResult, setEvaluationResult] = useState<Evaluation | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Reset save state when content or title changes
  useEffect(() => {
    setIsSaved(false);
  }, [content, title]);

  const handleEvaluate = async () => {
    if (!content.trim()) return;
    const activeTitle = title.trim() || "Escrito del " + new Date().toLocaleDateString("es-ES");
    try {
      const result = await onEvaluateText(activeTitle, content);
      setEvaluationResult(result);
      setIsSaved(false);
    } catch (error) {
      console.error("Error al evaluar el texto:", error);
    }
  };

  const handleSaveDraft = async () => {
    if (!evaluationResult) return;
    setIsSaving(true);
    try {
      await onSaveEvaluation(evaluationResult);
      setIsSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (confirm("¿Estás seguro de que deseas limpiar el borrador actual?")) {
      setTitle("");
      setContent("");
      setEvaluationResult(null);
      setIsSaved(false);
    }
  };

  // Helper to color evaluate score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getScorePercentageColor = (score: number) => {
    if (score >= 80) return "stroke-emerald-500";
    if (score >= 50) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  return (
    <div className="space-y-6">
      {!profile ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center max-w-2xl mx-auto">
          <HelpCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h4 className="font-serif font-bold text-amber-800 text-lg">Se requiere un Perfil de Estilo</h4>
          <p className="text-amber-700 text-sm mt-1 mb-4">
            Antes de poder evaluar nuevos escritos, debes configurar y entrenar tu Perfil de Estilo agregando al menos un escrito en la biblioteca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Creative Workspace / Editor */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-stone-600" />
                  <h3 className="text-base font-serif font-bold text-stone-800">Taller Literario</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-stone-400">
                    {wordCount} palabras
                  </span>
                  {(title || content || evaluationResult) && (
                    <button
                      id="clear-editor-btn"
                      onClick={handleClear}
                      className="p-1.5 hover:bg-stone-100 text-stone-400 hover:text-stone-700 rounded-lg transition-all"
                      title="Limpiar taller"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title input */}
              <div>
                <input
                  id="evaluator-title"
                  type="text"
                  placeholder="Título del escrito (opcional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-0 py-1 text-lg font-serif font-bold text-stone-800 placeholder-stone-300 border-none focus:outline-none focus:ring-0 bg-transparent"
                />
              </div>

              {/* Editor area */}
              <div className="relative">
                <textarea
                  id="evaluator-content"
                  placeholder="Comienza a redactar tu nuevo escrito aquí... Cuando termines, evaluaremos si se mantiene fiel a tu estilo personal y te daremos alternativas para enriquecer el vocabulario."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={14}
                  className="w-full px-0 py-2 border-none focus:outline-none focus:ring-0 text-stone-800 font-serif text-base leading-relaxed placeholder-stone-300 bg-transparent resize-none min-h-[350px]"
                />
              </div>

              {/* Bottom buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                <span className="text-xs text-stone-400 font-sans">
                  * La IA analizará la sintaxis, figuras retóricas y vocabulario frente a tu perfil.
                </span>

                <button
                  id="evaluate-style-btn"
                  disabled={isEvaluating || !content.trim()}
                  onClick={handleEvaluate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-sm rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Evaluando tu estilo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Evaluar Estilo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Analysis Output */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {isEvaluating ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-stone-200 rounded-2xl p-12 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]"
                >
                  <Loader2 className="w-10 h-10 text-stone-400 animate-spin mb-4" />
                  <h4 className="font-serif font-bold text-stone-800 text-lg">Analizando fidelidad de estilo</h4>
                  <p className="text-stone-500 text-sm max-w-xs mt-1">
                    Comparando la estructura de oraciones, vocablos, conectores y figuras con tu firma literaria...
                  </p>
                </motion.div>
              ) : evaluationResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Score Card */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Reporte de Estilo</h4>
                        <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">Fidelidad de Voz</h3>
                      </div>

                      {/* Score Badge */}
                      <span className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border ${getScoreColor(evaluationResult.fidelityScore)}`}>
                        Fidelidad: {evaluationResult.fidelityScore}%
                      </span>
                    </div>

                    {/* Progress Circle Visualizer */}
                    <div className="flex items-center gap-5 bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="24"
                            className="stroke-stone-200 fill-transparent"
                            strokeWidth="5"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="24"
                            className={`fill-transparent ${getScorePercentageColor(evaluationResult.fidelityScore)}`}
                            strokeWidth="5"
                            strokeDasharray="150.8"
                            strokeDashoffset={150.8 - (150.8 * evaluationResult.fidelityScore) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-sm font-mono font-bold text-stone-800">
                          {evaluationResult.fidelityScore}%
                        </span>
                      </div>

                      <p className="text-stone-600 text-xs leading-relaxed font-serif italic">
                        "{evaluationResult.feedback}"
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-stone-100 pt-3">
                      <span className="text-[10px] text-stone-400 font-mono">
                        Evaluado el {new Date(evaluationResult.createdAt).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>

                      <button
                        id="save-evaluation-btn"
                        onClick={handleSaveDraft}
                        disabled={isSaving || isSaved}
                        className="flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-800 disabled:text-emerald-600 disabled:bg-emerald-50 disabled:px-2.5 disabled:py-1 disabled:rounded-lg transition-all"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Guardando...
                          </>
                        ) : isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Guardado en Historial
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Guardar en Historial
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Filler words caught */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                      Muletillas Detectadas ({evaluationResult.detectedFillers.length})
                    </h4>
                    
                    {evaluationResult.detectedFillers.length === 0 ? (
                      <p className="text-stone-500 text-xs italic bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        ¡Excelente ritmo! No se colaron tus muletillas recurrentes en este borrador.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-stone-500 text-xs leading-relaxed">
                          Has usado estas expresiones repetitivas de tu perfil. Intenta podarlas para agilizar la lectura:
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {evaluationResult.detectedFillers.map((filler, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[11px] rounded-lg font-medium"
                            >
                              "{filler}"
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vocabulary suggestions to enrich */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                        Sugerencias de Enriquecimiento
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full">
                        Vocabulario y Voz
                      </span>
                    </div>

                    {evaluationResult.suggestions.length === 0 ? (
                      <p className="text-stone-500 text-xs italic">
                        La IA no encontró fragmentos débiles o discrepantes. ¡Tu léxico está sumamente alineado y pulido!
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {evaluationResult.suggestions.map((sug, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-2 text-xs"
                          >
                            <div className="flex items-center gap-2 text-stone-400 font-mono text-[10px]">
                              <span>Original</span>
                              <ArrowRight className="w-3 h-3 shrink-0" />
                              <span className="text-amber-800 font-semibold">Propuesta</span>
                            </div>

                            <div className="flex items-center gap-2 font-serif text-sm">
                              <span className="text-stone-400 line-through truncate max-w-[150px]" title={sug.original}>
                                "{sug.original}"
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="text-stone-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                                "{sug.suggested}"
                              </span>
                            </div>

                            <p className="text-stone-500 leading-relaxed pt-1 border-t border-stone-200/50">
                              {sug.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rhetorical Figures Employed */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                      Figuras Retóricas Empleadas ({evaluationResult.detectedFigures.length})
                    </h4>

                    {evaluationResult.detectedFigures.length === 0 ? (
                      <p className="text-stone-400 text-xs italic">
                        No se detectaron recursos poéticos en este texto. Para alinear con tu perfil, considera inyectar alguna metáfora o analogía.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {evaluationResult.detectedFigures.map((figure, index) => (
                          <div
                            key={index}
                            className="text-stone-700 text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-100 font-serif leading-relaxed"
                          >
                            {figure}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="p-3.5 bg-stone-100 text-stone-400 rounded-full mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-semibold text-stone-700">Esperando escrito</h4>
                  <p className="text-stone-400 text-xs max-w-xs mt-1">
                    Redacta algo en el panel de la izquierda y haz clic en "Evaluar Estilo" para ver el análisis de fidelidad, detectar muletillas y obtener recomendaciones de léxico.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
