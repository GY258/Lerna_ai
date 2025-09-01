# Lerna Training System - Frontend

A React-based training system with English/Chinese language support.

## Features

- **Bilingual Support**: English and Chinese language switching
- **Language Persistence**: Remembers user's language preference
- **Responsive Design**: Built with Tailwind CSS
- **AI Training**: AI-powered role-play and testing scenarios
- **Quiz Management**: SOP-based quiz generation and management

## Language Switching

The application supports two languages:
- 🇺🇸 **English** (default)
- 🇨🇳 **中文** (Chinese)

### How to Switch Languages

1. **Language Switcher**: Located in the header navigation
2. **Click the language buttons** to switch between English and Chinese
3. **Automatic persistence**: Your language choice is saved in localStorage

### Language Context

The language system is built using React Context API:

- `LanguageContext`: Manages current language state
- `useLanguage`: Hook to access language context
- `useTranslation`: Hook to get translated text

### Adding New Translations

To add new text that supports both languages:

1. **Add to English translations** (`src/translations/en.js`):
```javascript
export const en = {
  newSection: {
    title: "New Section Title",
    description: "New section description"
  }
};
```

2. **Add to Chinese translations** (`src/translations/zh.js`):
```javascript
export const zh = {
  newSection: {
    title: "新章节标题",
    description: "新章节描述"
  }
};
```

3. **Use in components**:
```javascript
import { useTranslation } from './hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('newSection.title')}</h1>
      <p>{t('newSection.description')}</p>
    </div>
  );
}
```

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd frontend/lerna-ui
npm install
```

### Running the App
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   └── LanguageSwitcher.jsx    # Language switching component
├── contexts/
│   └── LanguageContext.jsx     # Language context provider
├── hooks/
│   └── useTranslation.js       # Translation hook
├── translations/
│   ├── en.js                   # English translations
│   └── zh.js                   # Chinese translations
└── App.jsx                     # Main application component
```

## Backend Integration

The frontend connects to a FastAPI backend running at `http://localhost:8000`. Make sure the backend is running before testing the frontend.

## Contributing

When adding new features:
1. Always include translations for both English and Chinese
2. Use the `useTranslation` hook for all user-facing text
3. Test language switching functionality
4. Update this README if adding new language-related features
