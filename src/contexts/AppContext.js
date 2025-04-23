import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);
const AppDispatchContext = createContext(null);

const initialState = {
    isLoading: false,
    error: null,
    user: null,
    theme: 'light'
};

function appReducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'SET_THEME':
            return { ...state, theme: action.payload };
        default:
            return state;
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    return (
        <AppContext.Provider value={state}>
            <AppDispatchContext.Provider value={dispatch}>
                {children}
            </AppDispatchContext.Provider>
        </AppContext.Provider>
    );
}

export function useAppState() {
    return useContext(AppContext);
}

export function useAppDispatch() {
    return useContext(AppDispatchContext);
}