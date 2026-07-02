import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  History, 
  Trash2, 
  Eye, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  AlertCircle,
  Award,
  Sparkles,
  X
} from "lucide-react";
import { Evaluation } from "../types";

interface EvaluationsHistoryProps {
  evaluations: Evaluation[];
  onDeleteEvaluation: (id: string) => Promise<void>;
}

export default function EvaluationsHistory({
  evaluations,
  onDeleteEvaluation,
}: EvaluationsHistoryProps) {
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <h2 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
          <History className="w-6 h-6 text-stone-600" />
          Historial de Evaluaciones y Borradores
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Revisa tus borradores guardados, la puntuación de fidelidad de estilo histórica y las recomendaciones dadas por la inteligencia artificial.
        </p>
      </div>

      {evaluations.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
          <div className="p-4 bg-stone-100 rounded-full text-stone-400 mb-4">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-stone-800">No hay evaluaciones guardadas</h3>
          <p className="text-stone-500 text-sm max-w-sm mt-1">
            Redacta un texto en el taller literario, presiona "Evaluar Estilo" y luego guárdalo para comenzar a registrar tu historial.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {evaluations.map((evalItem) => (
              <motion.div
                key={evalItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="font-serif font-bold text-stone-800 line-clamp-1">
                      {evalItem.title}
                    </h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${getScoreColor(evalItem.fidelityScore)}`}>
                      {evalItem.fidelityScore}% fid.
                    </span>
                  </div>

                  <p className="text-stone-500 text-xs line-clamp-3 font-serif leading-relaxed italic mb-4">
                    "{evalItem.content}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-3 mt-auto">
                  <span className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {new Date(evalItem.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short"
                    })} • {new Date(evalItem.createdAt).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      id={`view-eval-${evalItem.id}`}
                      onClick={() => setSelectedEvaluation(evalItem)}
                      className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-stone-800 rounded-lg transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Informe
                    </button>
                    <button
                      id={`delete-eval-${evalItem.id}`}
                      onClick={() => onDeleteEvaluation(evalItem.id)}
                      className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detailed Evaluation Report Modal */}
      <AnimatePresence>
        {selectedEvaluation && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">{selectedEvaluation.title}</h3>
                  <p className="text-xs text-stone-400 font-mono mt-0.5">
                    Evaluado el {new Date(selectedEvaluation.createdAt).toLocaleString("es-ES")}
                  </p>
                </div>
                <button
                  id="close-eval-modal-btn"
                  onClick={() => setSelectedEvaluation(null)}
                  className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Text and Feedback */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Borrador Original</h4>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 max-h-[220px] overflow-y-auto">
                      <p className="text-stone-800 font-serif text-sm leading-relaxed whitespace-pre-wrap italic">
                        "{selectedEvaluation.content}"
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Evaluación del Tutor</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border-2 border-stone-200 flex items-center justify-center font-mono font-bold text-stone-800">
                            {selectedEvaluation.fidelityScore}%
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-stone-400 uppercase tracking-wider">Fidelidad de Voz</span>
                            <span className="text-stone-700 text-sm font-serif font-medium">Estilo bien consolidado</span>
                          </div>
                        </div>

                        <p className="text-stone-600 text-sm leading-relaxed font-serif italic bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                          "{selectedEvaluation.feedback}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-stone-100" />

                {/* Fillers & Figures details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fillers */}
                  <div>
                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      Muletillas Detectadas ({selectedEvaluation.detectedFillers.length})
                    </h4>
                    {selectedEvaluation.detectedFillers.length === 0 ? (
                      <p className="text-stone-500 text-xs italic bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                        No se detectaron muletillas en este borrador.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 p-3 bg-stone-50 rounded-xl border border-stone-100">
                        {selectedEvaluation.detectedFillers.map((filler, idx) => (
                          <span key={idx} className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] rounded-md font-medium">
                            "{filler}"
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Figures */}
                  <div>
                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-stone-600 shrink-0" />
                      Figuras Retóricas Empleadas ({selectedEvaluation.detectedFigures.length})
                    </h4>
                    {selectedEvaluation.detectedFigures.length === 0 ? (
                      <p className="text-stone-500 text-xs italic bg-stone-50 p-3 rounded-xl border border-stone-100">
                        Ningún recurso literario destacado.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {selectedEvaluation.detectedFigures.map((fig, idx) => (
                          <div key={idx} className="text-stone-700 text-xs bg-stone-50 p-2 rounded-lg border border-stone-100 font-serif">
                            {fig}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggestions List */}
                {selectedEvaluation.suggestions && selectedEvaluation.suggestions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                      Recomendaciones de Enriquecimiento Aplicadas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedEvaluation.suggestions.map((sug, idx) => (
                        <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1">
                          <div className="flex items-center gap-1 text-stone-400 font-mono text-[9px]">
                            <span className="line-through">"{sug.original}"</span>
                            <span>→</span>
                            <span className="text-amber-800 font-bold">"{sug.suggested}"</span>
                          </div>
                          <p className="text-stone-600 leading-relaxed font-sans text-xs">
                            {sug.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex justify-end shrink-0">
                <button
                  id="close-report-btn"
                  onClick={() => setSelectedEvaluation(null)}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-xl transition-all"
                >
                  Cerrar Reporte
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
