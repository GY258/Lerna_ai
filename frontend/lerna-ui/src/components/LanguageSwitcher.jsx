import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { currentLanguage, switchLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          currentLanguage === 'en'
            ? 'bg-sky-100 text-sky-700 border border-sky-200'
            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
        }`}
      >
        🇺🇸 English
      </button>
      <button
        onClick={() => switchLanguage('zh')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          currentLanguage === 'zh'
            ? 'bg-sky-100 text-sky-700 border border-sky-200'
            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
        }`}
      >
        🇨🇳 中文
      </button>
    </div>
  );
};

export default LanguageSwitcher;
