import React from 'react';
import { Globe, HelpCircle, Music, Plus, Settings, Trophy, Upload } from 'lucide-react';
import { Difficulty } from '../types/sudoku';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface HeaderProps {
  difficulty: Difficulty;
  onSelectDifficulty: (d: Difficulty) => void;
  onNewGame: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenCustom: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  difficulty,
  onSelectDifficulty,
  onNewGame,
  onOpenRules,
  onOpenStats,
  onOpenSettings,
  onOpenCustom,
  musicEnabled,
  onToggleMusic,
  language,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single brand wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 text-sm tracking-wider">
              16
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-sans">
              HexaGrid
            </span>
          </div>
          <span className="hidden sm:inline text-xs text-slate-500 tracking-wide font-medium">
            {t.appSubTitle}
          </span>
        </div>

        {/* Zone 2: Navigation & Quick Actions */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Difficulty Segmented Selector */}
          <div className="hidden md:flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
            {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => onSelectDifficulty(d)}
                className={`px-2.5 py-1 rounded transition-all whitespace-nowrap cursor-pointer ${
                  difficulty === d
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {t[d]}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenCustom}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800 whitespace-nowrap cursor-pointer"
            title={t.custom}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.custom}</span>
          </button>

          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800 whitespace-nowrap cursor-pointer"
            title={t.stats}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.stats}</span>
          </button>

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800 whitespace-nowrap cursor-pointer"
            title={t.rules}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.rules}</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
            title="切换语言 / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'zh' ? '中' : 'EN'}</span>
          </button>

          {/* Background Music Toggle Button */}
          <button
            onClick={onToggleMusic}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              musicEnabled
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={musicEnabled ? t.musicOff : t.musicOn}
            aria-label="Toggle Background Music"
          >
            <Music className={`w-3.5 h-3.5 ${musicEnabled ? 'text-indigo-400 animate-pulse' : ''}`} />
            <span className="hidden sm:inline">
              {musicEnabled ? t.musicOn : t.musicOff}
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            title={t.settings}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onNewGame}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.newGame}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
