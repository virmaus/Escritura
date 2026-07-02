import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Trash2, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Edit, 
  BookOpen, 
  Eye, 
  ChevronRight, 
  Sparkles,
  Loader2,
  X
} from "lucide-react";
import { Writing } from "../types";

interface WritingsLibraryProps {
  writings: Writing[];
  onAddWriting: (title: string, content: string) => Promise<void>;
  onDeleteWriting: (id: string) => Promise<void>;
  isGeneratingProfile: boolean;
  onGenerateProfile: () => Promise<void>;
}

export default function WritingsLibrary({
  writings,
  onAddWriting,
  onDeleteWriting,
  isGeneratingProfile,
  onGenerateProfile,
}: WritingsLibraryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingWriting, setViewingWriting] = useState<Writing | null>(null);

  const previousWritings = writings.filter(w => w.type === "previous");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddWriting(title, content);
      setTitle("");
      setContent("");
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWordCount = (txt: string) => {
    return txt.trim() ? txt.trim().split(/\s+/).length : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-stone-600" />
            Biblioteca de Escritos Anteriores
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Sube tus textos pasados (artículos, diarios, correos, poemas) para entrenar al analizador de estilo. Se recomiendan al menos 2-3 textos.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="add-writing-btn"
            onClick={() => setIsOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar Escrito
          </button>

          {previousWritings.length > 0 && (
            <button
              id="generate-profile-btn"
              disabled={isGeneratingProfile}
              onClick={onGenerateProfile}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-stone-950 font-semibold text-sm rounded-xl transition-all shadow-sm"
            >
              {isGeneratingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-950" />
                  Entrenar Perfil
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Grid of Writings */}
      {previousWritings.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
          <div className="p-4 bg-stone-100 rounded-full text-stone-400 mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-stone-800">No hay escritos anteriores</h3>
          <p className="text-stone-500 text-sm max-w-md mt-1 mb-6">
            Comienza agregando un par de textos que hayas escrito anteriormente para que la inteligencia artificial pueda descifrar tu voz, muletillas y estilo característico.
          </p>
          <button
            id="add-writing-empty-btn"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-xl transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Agregar mi primer escrito
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {previousWritings.map((writing) => (
              <motion.div
                key={writing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="font-serif font-bold text-stone-800 line-clamp-1 group-hover:text-stone-950 transition-colors">
                      {writing.title}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full">
                      {getWordCount(writing.content)} pal.
                    </span>
                  </div>
                  <p className="text-stone-500 text-sm line-clamp-4 font-serif leading-relaxed italic mb-4">
                    "{writing.content}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-3 mt-auto">
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(writing.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "2-digit"
                    })}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      id={`view-${writing.id}`}
                      onClick={() => setViewingWriting(writing)}
                      className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-stone-800 rounded-lg transition-all"
                      title="Ver escrito completo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      id={`delete-${writing.id}`}
                      onClick={() => onDeleteWriting(writing.id)}
                      className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal to add writing */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                <h3 className="text-lg font-serif font-bold text-stone-900">Agregar Escrito Anterior</h3>
                <button
                  id="close-modal-btn"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 flex flex-col">
                <div>
                  <label htmlFor="writing-title" className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    Título o contexto de la escritura
                  </label>
                  <input
                    id="writing-title"
                    type="text"
                    required
                    placeholder="Ej. Post de blog sobre filosofía, Correo de disculpas, Diario personal de 2024"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-stone-800 text-sm bg-stone-50/50"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label htmlFor="writing-content" className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    Contenido del texto
                  </label>
                  <textarea
                    id="writing-content"
                    required
                    placeholder="Escribe o pega aquí tu texto tal como lo redactaste originalmente..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="w-full flex-1 px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-stone-800 font-serif leading-relaxed text-sm bg-stone-50/50 resize-none min-h-[200px]"
                  />
                  <div className="flex justify-between items-center mt-1 text-xs text-stone-400 font-mono">
                    <span>Mínimo recomendado: 50 palabras</span>
                    <span>{getWordCount(content)} palabras</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                  <button
                    id="cancel-writing-btn"
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-xl text-sm font-medium transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    id="submit-writing-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 text-white font-medium text-sm rounded-xl transition-all shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Agregar a Biblioteca
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal to view writing */}
      <AnimatePresence>
        {viewingWriting && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">{viewingWriting.title}</h3>
                  <p className="text-xs text-stone-400 font-mono mt-0.5">
                    {new Date(viewingWriting.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })} • {getWordCount(viewingWriting.content)} palabras
                  </p>
                </div>
                <button
                  id="close-view-btn"
                  onClick={() => setViewingWriting(null)}
                  className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <p className="text-stone-800 font-serif text-base leading-relaxed whitespace-pre-wrap bg-stone-50 p-5 rounded-xl border border-stone-100 italic">
                  "{viewingWriting.content}"
                </p>
              </div>

              <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex justify-end">
                <button
                  id="close-view-bottom-btn"
                  onClick={() => setViewingWriting(null)}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-xl transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
