# Language Switching Demo

## How to Test the Language Switching Feature

### 1. Start the Application
```bash
npm run dev
```

### 2. Navigate to the App
- Open your browser to `http://localhost:5173`
- You'll see the login page

### 3. Test Language Switching
- **Before Login**: The language switcher is visible in the header
- **Click "🇨🇳 中文"** to switch to Chinese
- **Click "🇺🇸 English"** to switch back to English

### 4. Language Persistence
- Switch to Chinese
- Refresh the page
- The language should remain in Chinese
- Check localStorage in browser dev tools to see the saved preference

### 5. Test Different Pages
After logging in, test the language switching on different pages:

#### Employee Dashboard
- **English**: "Learning Dashboard", "Choose your learning path"
- **Chinese**: "学习仪表板", "选择您的学习路径"

#### AI Testing
- **English**: "AI Testing", "Test your skills with AI-generated scenarios"
- **Chinese**: "AI测试", "通过AI生成的场景和评估来测试您的技能"

#### AI Role Play Training
- **English**: "AI Role Play Training", "Practice real-world scenarios"
- **Chinese**: "AI角色扮演训练", "与AI练习真实场景"

#### Manager View
- **English**: "Assign SOPs & Quizzes", "Paste SOP text to generate smart quizzes"
- **Chinese**: "分配SOP和测验", "粘贴SOP文本以生成智能测验"

### 6. Verify All Text Elements
Check that the following elements change language:
- ✅ Header navigation
- ✅ Page titles and subtitles
- ✅ Button labels
- ✅ Form placeholders
- ✅ Error messages
- ✅ Tab names
- ✅ AI conversation messages
- ✅ Quiz interface text

### 7. Test Edge Cases
- Switch languages while in the middle of an AI conversation
- Switch languages while taking a quiz
- Switch languages in different browser tabs
- Clear localStorage and verify default language (English)

## Expected Behavior

### Language Switcher
- **English Button**: Shows "🇺🇸 English" with blue background when active
- **Chinese Button**: Shows "🇨🇳 中文" with blue background when active
- **Inactive buttons**: Show with gray text and hover effects

### Language Switching
- **Instant**: Language changes immediately without page refresh
- **Persistent**: Language choice is saved and restored on page reload
- **Complete**: All user-facing text changes to the selected language

### Fallback
- If a translation key is missing, the key itself is displayed
- Console warnings are shown for missing translations

## Troubleshooting

### Common Issues
1. **Language not switching**: Check browser console for errors
2. **Text not translated**: Verify translation keys exist in both language files
3. **Build errors**: Run `npm run build` to check for syntax errors

### Debug Mode
- Open browser dev tools
- Check Console tab for translation warnings
- Check Application > Local Storage for saved language preference
- Check Network tab for any failed requests

## Performance Notes

- Language switching is instant (no API calls)
- Translations are loaded at build time
- Language preference is stored locally (no server round-trip)
- No impact on app performance or bundle size
