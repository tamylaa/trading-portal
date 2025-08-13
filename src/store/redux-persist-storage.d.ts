// TypeScript module declaration for redux-persist storage
// This allows importing 'redux-persist/lib/storage' without type errors

declare module 'redux-persist/lib/storage' {
  const storage: any;
  export default storage;
}
