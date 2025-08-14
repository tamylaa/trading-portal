// persistor.ts - Redux Persistor for Tamyla Trading Portal
import { persistStore } from 'redux-persist';
import { store } from './index';

export const persistor = persistStore(store);
