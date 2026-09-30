import React from 'react';
import { Check, Globe, Music, Settings as SettingsIcon, Volume2, VolumeX, X } from 'lucide-react';
import { GameSettings, SymbolSetId } from '../types/sudoku';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { SYMBOL_CONFIGS } from '../utils/symbols';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[settings.language];
  const symbolSets: SymbolSetId[] = ['alpha', 'hex', 'numbers', 'letters'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">{t.gameSettings}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm">
          {/* Language Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t.interfaceLang}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onUpdateSettings({ language: 'zh' })}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  settings.language === 'zh'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-xs">简体中文 (fnOS 默认)</span>
                </div>
                {settings.language === 'zh' && <Check className="w-4 h-4 text-indigo-400" />}
              </button>

              <button
                onClick={() => onUpdateSettings({ language: 'en' })}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  settings.language === 'en'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-xs">English</span>
                </div>
                {settings.language === 'en' && <Check className="w-4 h-4 text-indigo-400" />}
              </button>
            </div>
          </div>

          {/* Symbol Sets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t.symbolNotation}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {symbolSets.map((id) => {
                const conf = SYMBOL_CONFIGS[id];
                const isSelected = settings.symbolSet === id;

                return (
                  <button
                    key={id}
                    onClick={() => onUpdateSettings({ symbolSet: id })}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs">{conf.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 truncate">
                      {conf.symbols.slice(0, 8).join(' ')} ... {conf.symbols.slice(-3).join(' ')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio & Background Music */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              {t.audioAndMusic}
            </label>
            <div className="space-y-3">
              {/* Background Music Toggle */}
              <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Music className={`w-4 h-4 ${settings.musicEnabled ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-medium text-white text-xs">{t.bgMusic}</div>
                      <div className="text-[11px] text-slate-400">{t.bgMusicDesc}</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.musicEnabled}
                    onChange={(e) => onUpdateSettings({ musicEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                  />
                </div>

                {settings.musicEnabled && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-400 text-[11px]">{t.musicVolume}</span>
                    <div className="flex items-center gap-3 flex-1 max-w-[200px]">
                      <input
                        type="range"
                        min="0.05"
                        max="1"
                        step="0.05"
                        value={settings.musicVolume}
                        onChange={(e) =>
                          onUpdateSettings({ musicVolume: parseFloat(e.target.value) })
                        }
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <span className="font-mono text-[11px] text-slate-300 w-8 text-right">
                        {Math.round(settings.musicVolume * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                  <div>
                    <div className="font-medium text-white text-xs">{t.soundFx}</div>
                    <div className="text-[11px] text-slate-400">{t.soundFxDesc}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Board Preferences */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              {t.boardAssist}
            </label>
            <div className="space-y-3">
              {/* Highlight Matching Numbers */}
              <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <div>
                  <div className="font-medium text-white text-xs">{t.highlightMatching}</div>
                  <div className="text-[11px] text-slate-400">{t.highlightMatchingDesc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highlightMatchingNumbers}
                  onChange={(e) =>
                    onUpdateSettings({ highlightMatchingNumbers: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Highlight Row / Col / Box Peers */}
              <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <div>
                  <div className="font-medium text-white text-xs">{t.highlightPeers}</div>
                  <div className="text-[11px] text-slate-400">{t.highlightPeersDesc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highlightPeers}
                  onChange={(e) => onUpdateSettings({ highlightPeers: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Highlight Duplicate Conflicts */}
              <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <div>
                  <div className="font-medium text-white text-xs">{t.conflictCheck}</div>
                  <div className="text-[11px] text-slate-400">{t.conflictCheckDesc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highlightErrors}
                  onChange={(e) => onUpdateSettings({ highlightErrors: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Auto-Remove Notes */}
              <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <div>
                  <div className="font-medium text-white text-xs">{t.autoRemoveNotes}</div>
                  <div className="text-[11px] text-slate-400">{t.autoRemoveNotesDesc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoRemoveNotes}
                  onChange={(e) => onUpdateSettings({ autoRemoveNotes: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>

              {/* 4x4 Block Shading */}
              <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <div>
                  <div className="font-medium text-white text-xs">{t.blockShading}</div>
                  <div className="text-[11px] text-slate-400">{t.blockShadingDesc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.blockShading}
                  onChange={(e) => onUpdateSettings({ blockShading: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
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
