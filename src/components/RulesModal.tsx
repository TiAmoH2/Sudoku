import React from 'react';
import { BookOpen, Check, Keyboard, Sparkles, X } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">{t.howToPlay}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Section 1: The Core Objective */}
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              {t.coreObjective}
            </h3>
            <p className="text-slate-300 mb-3">
              {t.coreObjectiveDesc}
            </p>
            <ul className="space-y-2 pl-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t.ruleRow}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t.ruleCol}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t.ruleBlock}</span>
              </li>
            </ul>
          </div>

          {/* Section 2: Symbol Sets */}
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              {t.symbolNotation}
            </h3>
            <p className="text-slate-300 mb-2">
              {t.symbolNotationDesc}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="font-semibold text-white mb-1">1-9 & A-G ({language === 'zh' ? '经典推荐' : 'Default'})</div>
                <div className="font-mono text-indigo-300">1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, F, G</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="font-semibold text-white mb-1">十六进制 (Hex 0-F)</div>
                <div className="font-mono text-indigo-300">0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, F</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="font-semibold text-white mb-1">数字 (1 to 16)</div>
                <div className="font-mono text-indigo-300">1, 2, 3, ..., 14, 15, 16</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="font-semibold text-white mb-1">字母 (A to P)</div>
                <div className="font-mono text-indigo-300">A, B, C, D, ..., M, N, O, P</div>
              </div>
            </div>
          </div>

          {/* Section 3: Keyboard Shortcuts */}
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-indigo-400" />
              {t.keyboardGuide}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">{language === 'zh' ? '输入符号' : 'Insert Symbol'}</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">1-9, A-G</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">{language === 'zh' ? '移动光标' : 'Move Focus'}</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">方向键</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">{language === 'zh' ? '切换笔记' : 'Toggle Notes'}</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">N</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">{language === 'zh' ? '擦除格' : 'Erase Cell'}</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Backspace / Del</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">{t.undo}</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Ctrl + Z</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">{t.redo}</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Ctrl + Y</kbd>
              </div>
            </div>
          </div>

          {/* Section 4: Solving Tips */}
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {t.proTips}
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li>{t.tipNotes}</li>
              <li>{t.tipBlocks}</li>
              <li>{t.tipHints}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors cursor-pointer text-xs"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};
