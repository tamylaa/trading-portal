// JS shim for themeSlice to ensure runtime resolution when TS resolution fails
const initialState = { mode: 'dark', primaryColor: '#4f8cff', fontSize: 'md', animations: true };

export const setThemeMode = (payload) => ({ type: 'theme/setThemeMode', payload });
export const setPrimaryColor = (payload) => ({ type: 'theme/setPrimaryColor', payload });
export const setFontSize = (payload) => ({ type: 'theme/setFontSize', payload });
export const setAnimations = (payload) => ({ type: 'theme/setAnimations', payload });
export const syncWithUITheme = (payload) => ({ type: 'theme/syncWithUITheme', payload });

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'theme/setThemeMode':
      return { ...state, mode: action.payload };
    case 'theme/setPrimaryColor':
      return { ...state, primaryColor: action.payload };
    case 'theme/setFontSize':
      return { ...state, fontSize: action.payload };
    case 'theme/setAnimations':
      return { ...state, animations: action.payload };
    case 'theme/syncWithUITheme':
      return { ...action.payload };
    default:
      return state;
  }
}
