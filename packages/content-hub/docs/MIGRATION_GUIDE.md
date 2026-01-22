# Content Hub Migration Guide

This guide demonstrates how to migrate from legacy content-hub services to the shared infrastructure in `@tamyla/shared`.

## Migration Examples

### Replace Legacy Event Management

**OLD:** Custom event management
```javascript
const eventManager = new ContentHubEventManager();
eventManager.publish('search:started', { query });
eventManager.subscribe('search:completed', handleResults);
```

**NEW:** Use SharedContentHubService (which uses shared EventBus)
```javascript
const contentService = new SharedContentHubService();
contentService.on('search:completed', handleResults);
```

### Replace Legacy Search Service

**OLD:** Custom search service
```javascript
const searchService = new ContentSearchService();
const results = await searchService.search({ query, filters });
```

**NEW:** Use SharedContentHubService search
```javascript
const results = await contentService.search(query, filters);
```

### Replace Custom Upload Handling

**OLD:** Manual fetch with FormData
```javascript
const formData = new FormData();
files.forEach(file => formData.append('file', file));
const response = await fetch('/api/upload', { 
  method: 'POST', 
  body: formData 
});
```

**NEW:** Use SharedContentHubService upload
```javascript
const uploadResults = await contentService.upload(files, {
  metadata: { source: 'content-hub' }
});
```

### Replace Manual localStorage Access

**OLD:** Direct localStorage calls
```javascript
const stored = localStorage.getItem('recent-searches');
localStorage.setItem('recent-searches', JSON.stringify(searches));
```

**NEW:** Use shared AuthService through contentService
```javascript
// The SharedContentHubService uses AuthService internally for storage
// No direct storage access needed
```

### Replace Custom Health Checks

**OLD:** Manual health check
```javascript
const response = await fetch(`${baseUrl}/health`);
const health = await response.json();
```

**NEW:** Use SharedContentHubService health check
```javascript
const health = await contentService.checkHealth();
```

### Replace Manual Console Logging

**OLD:** Direct console calls
```javascript
console.log('Search started:', query);
console.error('Upload failed:', error);
```

**NEW:** Use shared Logger (imported in SharedContentHubService)
```javascript
// Logging is handled automatically by the shared service
```

## Component Migration Examples

### useContentSearch Hook Migration

**OLD:** useContentSearch with legacy service
```javascript
export const useContentSearch = (config) => {
  const [results, setResults] = useState([]);
  const searchService = new ContentSearchService();
  
  const search = async (query) => {
    const response = await searchService.search({ query });
    setResults(response.results);
  };
  
  return { results, search };
};
```

**NEW:** Use SharedContentHubService in hooks
```javascript
export const useContentSearch = (config) => {
  const [results, setResults] = useState([]);
  const contentService = new SharedContentHubService();
  
  useEffect(() => {
    const unsubscribe = contentService.on('search:completed', (event) => {
      setResults(event.results);
    });
    return unsubscribe;
  }, []);
  
  const search = async (query) => {
    await contentService.search(query, config.filters || {});
  };
  
  return { results, search };
};
```

### Component Migration

**OLD:** Component with legacy event management
```javascript
const ContentHub = () => {
  const [eventManager] = useState(() => new ContentHubEventManager());
  
  useEffect(() => {
    const unsubscribe = eventManager.subscribe('upload:progress', (event) => {
      setUploadProgress(event.progress);
    });
    return unsubscribe;
  }, []);
  
  const handleUpload = async (files) => {
    // Custom upload logic
  };
  
  return <div>...</div>;
};
```

**NEW:** Component using SharedContentHubService
```javascript
const ContentHub = () => {
  const [contentService] = useState(() => new SharedContentHubService());
  const [uploadProgress, setUploadProgress] = useState(0);
  
  useEffect(() => {
    const unsubscribe = contentService.on('upload:progress', (event) => {
      setUploadProgress(event.progress);
    });
    return unsubscribe;
  }, []);
  
  const handleUpload = async (files) => {
    await contentService.upload(files);
  };
  
  return <div>...</div>;
};
```

## Benefits of Migration

### ✅ Code Deduplication
- Eliminates 400+ lines of duplicate service code
- Single source of truth for API interactions

### ✅ Consistent Error Handling
- Standardized error responses
- Centralized error logging

### ✅ Unified Event System
- Consistent event naming and structure
- Cross-component communication

### ✅ Improved Performance
- Built-in caching
- Request deduplication  
- Circuit breaker patterns

### ✅ Better Developer Experience
- Type safety (when using TypeScript)
- Consistent API surface
- Comprehensive logging and debugging

## Migration Checklist

- [ ] Replace `ContentHubEventManager` with `SharedContentHubService`
- [ ] Replace `ContentSearchService` with `contentService.search()`
- [ ] Replace `EnhancedServiceAdapter` with `SharedContentHubService`  
- [ ] Replace direct `fetch()` calls with shared ApiClient methods
- [ ] Replace `localStorage` access with shared AuthService
- [ ] Replace `console.*` calls with shared Logger
- [ ] Update error handling to use shared ErrorHandler
- [ ] Test event subscriptions and API calls
- [ ] Remove legacy service files after migration