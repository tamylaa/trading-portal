// 🎨 Theme Slice - Dedicated theme state for package compatibility
// Mirrors ui.theme for @tamyla/ui-components-react compatibility

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 📝 Theme State Interface (matches package expectations)
export interface ThemeState {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontSize?: 'sm' | 'md' | 'lg';
  animations?: boolean;
}

// 🎯 Initial State (matches ui.theme defaults)
const initialState: ThemeState = {
  mode: 'dark',
  primaryColor: '#4f8cff',
  fontSize: 'md',
  animations: true,
};

// 🔧 Theme Slice
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.mode = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
    setFontSize: (state, action: PayloadAction<'sm' | 'md' | 'lg'>) => {
      state.fontSize = action.payload;
    },
    setAnimations: (state, action: PayloadAction<boolean>) => {
      state.animations = action.payload;
    },
    // 🔄 Sync with ui.theme changes
    syncWithUITheme: (state, action: PayloadAction<ThemeState>) => {
      return { ...action.payload };
    },
  },
});

export const { setThemeMode, setPrimaryColor, setFontSize, setAnimations, syncWithUITheme } = themeSlice.actions;
export default themeSlice.reducer;