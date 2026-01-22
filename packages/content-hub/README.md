# Content Hub

Intelligent content management and processing hub for the Trading Portal ecosystem. This package provides a reusable Content Hub component that can be configured externally by parent applications.

## Features

- **External Configuration**: Fully configurable via environment variables, localStorage, or external services
- **Configuration API**: Programmatic access to configuration for external applications
- **React Component**: Drop-in Content Hub component with customizable UI and behavior
- **API Client**: Axios-based client for content management operations
- **Web Component Support**: Can be used as a web component in non-React applications
- **MeiliSearch Integration**: Built-in search and indexing capabilities
- **Event System**: Comprehensive event handling for content operations

## Installation

```bash
npm install @tamyla/content-hub
```

## Quick Start

### Basic Usage

```jsx
import { ContentHub } from '@tamyla/content-hub';

function App() {
  return (
    <ContentHub
      apiBaseUrl="https://api.example.com"
      authToken="your-token"
    />
  );
}
```

### Using Configuration API

```javascript
import {
  getConfiguration,
  updateConfiguration,
  subscribeToConfigurationChanges
} from '@tamyla/content-hub/config-api';

// Get current configuration
const config = getConfiguration();
console.log(config.api.baseURL);

// Update configuration
updateConfiguration({
  api: {
    baseURL: 'https://new-api.example.com',
    timeout: 10000
  }
});

// Subscribe to configuration changes
const unsubscribe = subscribeToConfigurationChanges((newConfig) => {
  console.log('Configuration updated:', newConfig);
});
```

## Configuration

The Content Hub supports multiple configuration sources with the following priority:

1. **Props** (highest priority) - Passed directly to the component
2. **Environment Variables** - `CONTENT_HUB_*` prefixed variables
3. **localStorage** - Persisted configuration under `contentHubConfig` key
4. **External Service** - Loaded from a configurable URL
5. **Defaults** (lowest priority) - Built-in default values

### Configuration Sections

#### API Configuration
```javascript
{
  api: {
    baseURL: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
    retryDelay: 1000,
    headers: {}
  }
}
```

#### Authentication Configuration
```javascript
{
  auth: {
    tokenStorage: 'localStorage', // or 'sessionStorage'
    tokenKey: 'authToken',
    refreshTokenKey: 'refreshToken',
    autoRefresh: true,
    refreshThreshold: 300000 // 5 minutes
  }
}
```

#### UI Configuration
```javascript
{
  ui: {
    showUpload: true,
    showGallery: true,
    showSearch: true,
    showSharing: true,
    showFilters: true,
    showBulkActions: true,
    enableDragDrop: true,
    enableKeyboardShortcuts: true
  }
}
```

#### Behavior Configuration
```javascript
{
  behavior: {
    selectionMode: true,
    multiSelect: true,
    maxFileSize: 10485760, // 10MB
    allowedFileTypes: ['image/*', 'video/*', 'application/pdf'],
    maxFilesPerUpload: 10,
    enableFilePreview: true,
    autoProcessUploads: true
  }
}
```

#### Feature Flags
```javascript
{
  features: {
    contentSkimming: true,
    aiMetadata: true,
    versionControl: true,
    collaboration: true,
    analytics: true,
    notifications: true
  }
}
```

#### Styling Configuration
```javascript
{
  styling: {
    theme: 'default',
    customCSS: '',
    componentClassName: 'content-hub',
    buttonClassName: 'btn',
    notificationClassName: 'notification'
  }
}
```

#### Event Configuration
```javascript
{
  events: {
    enableContentUploaded: true,
    enableAuthRequired: true,
    enableError: true,
    enableSearchChanged: true,
    enableFilterChanged: true,
    enableSelectionChanged: true,
    enableContentShared: true
  }
}
```

#### Performance Configuration
```javascript
{
  performance: {
    lazyLoadImages: true,
    virtualizationThreshold: 100,
    cacheEnabled: true,
    cacheTTL: 3600000, // 1 hour
    preloadAdjacent: true
  }
}
```

#### Integrations
```javascript
{
  integrations: {
    meiliSearch: {
      enabled: true,
      host: 'https://search.example.com',
      apiKey: 'your-api-key',
      indexName: 'content'
    },
    webComponent: {
      enabled: false,
      scriptUrl: '',
      elementName: 'content-hub'
    }
  }
}
```

#### Notifications
```javascript
{
  notifications: {
    enabled: true,
    duration: 5000,
    position: 'top-right',
    maxNotifications: 5
  }
}
```

#### Error Handling
```javascript
{
  errorHandling: {
    showUserFriendlyMessages: true,
    logErrors: true,
    reportErrors: false,
    errorReportingUrl: ''
  }
}
```

## Environment Variables

Set configuration via environment variables using the `CONTENT_HUB_` prefix:

```bash
CONTENT_HUB_API_BASE_URL=https://api.example.com
CONTENT_HUB_API_TIMEOUT=5000
CONTENT_HUB_AUTH_TOKEN_STORAGE=localStorage
CONTENT_HUB_UI_SHOW_UPLOAD=true
CONTENT_HUB_BEHAVIOR_MAX_FILE_SIZE=10485760
```

## Configuration API

### Functions

#### `getConfiguration()`
Returns the current merged configuration object.

#### `updateConfiguration(updates)`
Updates configuration with new values. Merges with existing configuration.

#### `resetConfiguration()`
Resets configuration to default values.

#### `getConfigurationSection(section)`
Returns configuration for a specific section (e.g., 'api', 'ui').

#### `updateConfigurationSection(section, updates)`
Updates a specific configuration section.

#### `validateConfiguration(updates)`
Validates configuration updates and returns validation result.

#### `exportConfiguration()`
Exports current configuration as JSON string.

#### `importConfiguration(jsonConfig)`
Imports configuration from JSON string with validation.

#### `subscribeToConfigurationChanges(callback)`
Subscribes to configuration changes. Returns unsubscribe function.

#### `getConfigurationSchema()`
Returns JSON schema for configuration validation.

## Component Props

The ContentHub component accepts the following props:

```jsx
<ContentHub
  // API Configuration
  apiBaseUrl="https://api.example.com"
  apiTimeout={5000}
  authToken="your-token"

  // UI Configuration
  showUpload={true}
  showGallery={true}
  showSearch={true}

  // Behavior Configuration
  maxFileSize={10485760}
  allowedFileTypes={['image/*', 'video/*']}

  // Event Handlers
  onContentUploaded={(content) => console.log('Uploaded:', content)}
  onAuthRequired={() => console.log('Auth required')}
  onError={(error) => console.error('Error:', error)}

  // Styling
  className="custom-content-hub"
  theme="dark"
/>
```

## Events

The Content Hub emits the following events:

- `contentUploaded`: Fired when content is successfully uploaded
- `authRequired`: Fired when authentication is required
- `error`: Fired when an error occurs
- `searchChanged`: Fired when search query changes
- `filterChanged`: Fired when filters are applied
- `selectionChanged`: Fired when content selection changes
- `contentShared`: Fired when content is shared

## Web Component Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script src="path/to/content-hub-web-component.js"></script>
</head>
<body>
  <content-hub
    api-base-url="https://api.example.com"
    auth-token="your-token"
    show-upload="true"
    max-file-size="10485760">
  </content-hub>
</body>
</html>
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Development Server

```bash
npm run dev
```

## License

MIT