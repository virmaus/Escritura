import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Award,
  Zap,
  Info,
  ChevronRight,
  MessageSquare,
  Bookmark
} from "lucide-react";
import { StyleProfile } from "../types";

interface ProfileDashboardProps {
  profile: StyleProfile | null;
  writingsCount: number;
  onGenerateProfile: () => Promise<void>;
  isGeneratingProfile: boolean;
}

export default function ProfileDashboard({
  profile,
  writingsCount,
  onGenerateProfile,
  isGeneratingProfile,
}: ProfileDashboardProps) {

  // Simple helper to render vocabulary score ring
  const renderScoreRing = (score: number) => {
    const strokeDashoffset = 251.2 - (251.2 * score) / 100;
    return (
      <div className="relative flex items-center justify-center w-28 h-28">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="40"
            className="stroke-stone-100 fill-transparent"
            strokeWidth="8"
          />
          <motion.circle
            cx="56"
            cy="56"
            r="40"
            className="stroke-amber-500 fill-transparent"
            strokeWidth="8"
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-mono font-bold text-stone-800">{score}%</span>
          <span className="text-[9px] text-stone-400 font-semibold uppercase tracking-wider">Vocabulario</span>
        </div>
      </div>
    );
  };

  if (!profile) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center max-w-3xl mx-auto my-6">
        <div className="p-4 bg-amber-50 rounded-full text-amber-500 mb-4 animate-pulse">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-serif font-bold text-stone-800">Crea tu Huella dactilar de Estilo</h3>
        <p className="text-stone-500 text-sm mt-2 mb-6 max-w-md">
          {writingsCount === 0 
            ? "Para comenzar, primero debes agregar algunos de tus escritos anteriores en la pestaña 'Mis Escritos'." 
            : `Tienes ${writingsCount} escrito(s) listos. Presiona el botón para entrenar a la IA y generar tu Perfil de Estilo Personal.`}
        </p>

        {writingsCount > 0 && (
          <button
            id="generate-profile-dashboard-btn"
            disabled={isGeneratingProfile}
            onClick={onGenerateProfile}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-stone-950 font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
          >
            {isGeneratingProfile ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analizando escritos...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generar Perfil de Estilo
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Style Score Card */}
        <div className="lg:col-span-1 bg-white border border-stone-200 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Métricas de Diversidad</h3>
          {renderScoreRing(profile.vocabularyRichness)}
          
          <div className="mt-4 space-y-2 text-center">
            <h4 className="text-base font-serif font-semibold text-stone-800">
              Riqueza de Vocabulario
            </h4>
            <p className="text-stone-500 text-xs leading-relaxed max-w-xs">
              Mide la diversidad léxica e infrecuencia de vocablos complejos o poéticos en tus escritos anteriores.
            </p>
          </div>

          <div className="w-full border-t border-stone-100 pt-4 mt-5 flex justify-around text-center">
            <div>
              <span className="block text-xl font-mono font-bold text-stone-800">
                {profile.totalWritingsAnalyzed}
              </span>
              <span className="text-[10px] text-stone-400 font-semibold uppercase">Escritos</span>
            </div>
            <div className="border-r border-stone-100" />
            <div>
              <span className="block text-xs font-mono font-medium text-stone-800 bg-stone-100 px-2 py-1 rounded-md mt-1">
                {new Date(profile.lastUpdated).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short"
                })}
              </span>
              <span className="text-[10px] text-stone-400 font-semibold uppercase block mt-1">Actualizado</span>
            </div>
          </div>
        </div>

        {/* Tone and sentence structure */}
        <div className="lg:col-span-2 bg-white border border-stone-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Identidad Narrativa</h3>
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                Perfil Activo
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5 mb-1">
                  <Bookmark className="w-3.5 h-3.5 text-stone-500" />
                  Tono Dominante
                </span>
                <p className="text-stone-800 font-serif text-lg font-medium italic">
                  "{profile.tone}"
                </p>
              </div>

              <hr className="border-stone-100" />

              <div>
                <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                  Estructura y Sintaxis
                </span>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {profile.sentenceStructure}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4 mt-6 flex justify-end">
            <button
              id="regenerate-profile-btn"
              disabled={isGeneratingProfile}
              onClick={onGenerateProfile}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-all cursor-pointer"
            >
              {isGeneratingProfile ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Recalculando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Recalcular huella de estilo
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Voice Patterns & Fillers list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voice Patterns */}
        <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-stone-600" />
            Patrones de Voz Identificados
          </h3>
          <ul className="space-y-3">
            {profile.voicePatterns.map((pattern, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100"
              >
                <div className="w-5 h-5 bg-stone-900 text-white rounded-full flex items-center justify-center font-mono text-xs shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-stone-700 text-sm font-medium leading-relaxed">
                  {pattern}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Filler words / Muletillas to avoid */}
        <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Muletillas y Muletas Recurrentes
          </h3>
          <p className="text-stone-500 text-xs leading-relaxed mb-4">
            Palabras o conectores que el sistema ha detectado que utilizas en exceso. Al evaluar nuevos textos, te advertiremos si las empleas para sugerirte alternativas.
          </p>

          {profile.fillers.length === 0 ? (
            <div className="flex items-center gap-2 text-stone-500 text-sm italic bg-stone-50 p-4 rounded-xl border border-stone-100">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              ¡Excelente! No se detectaron muletillas sistemáticas en tus textos.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.fillers.map((filler, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 font-mono text-xs rounded-xl font-medium"
                >
                  "{filler}"
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rhetorical Figures Section */}
      <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
        <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-stone-600" />
          Figuras Retóricas Preferidas
        </h3>
        
        {profile.rhetoricalFigures.length === 0 ? (
          <p className="text-stone-400 text-xs italic">
            No se identificaron figuras retóricas marcadas en tus textos. Prueba agregando escritos más literarios, descriptivos o poéticos.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.rhetoricalFigures.map((fig, idx) => (
              <div
                key={idx}
                className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-serif font-bold text-stone-800 text-sm">
                      {fig.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-200/60 text-stone-600 rounded-full">
                      Uso frecuente ({fig.count})
                    </span>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <span className="text-[9px] font-mono font-semibold text-stone-400 uppercase tracking-wider">
                      Ejemplos de tus textos:
                    </span>
                    {fig.examples.map((ex, exIdx) => (
                      <p
                        key={exIdx}
                        className="text-stone-600 text-xs italic font-serif pl-2 border-l border-stone-300 py-0.5"
                      >
                        "{ex}"
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
