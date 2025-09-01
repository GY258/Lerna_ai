import { useLanguage } from '../contexts/LanguageContext';
import { en } from '../translations/en';
import { zh } from '../translations/zh';

export const useTranslation = () => {
  const { currentLanguage } = useLanguage();
  
  const t = (key) => {
    const keys = key.split('.');
    let value = currentLanguage === 'zh' ? zh : en;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return the key if translation not found
      }
    }
    
    return value || key;
  };

  return { t, currentLanguage };
};
