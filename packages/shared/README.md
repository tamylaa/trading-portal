# Shared Package

Core utilities and services for the Trading Portal hub ecosystem. This package provides shared capabilities that can be used across all hubs and by external applications integrating with the hub system.

## Features

- **Configuration Management**: Centralized configuration with environment variables, localStorage, and external service support
- **Authentication Service**: Token-based authentication with automatic refresh
- **Event Bus**: Cross-hub communication and external integration events
- **API Client**: Consistent API behavior with interceptors and error handling
- **Type Definitions**: TypeScript interfaces for hub interoperability
- **Utility Functions**: Error handling, logging, validation, and common utilities

## Installation

```bash
npm install @tamyla/shared
```

## Quick Start

### Basic Usage

```javascript
import { getConfig, authService, eventBus, apiClient } from '@tamyla/shared';

// Access configuration
const config = getConfig();
console.log(config.api.baseURL);

// Use authentication
await authService.login({ email: 'user@example.com', password: 'password' });

// Listen to events
const unsubscribe = eventBus.on('hub:ready', (event) => {
  console.log('Hub is ready:', event.data);
});

// Make API calls
const response = await apiClient.get('/api/data');
```

### Hub-Specific Usage

```javascript
import {
  createHubConfigManager,
  createHubAuthService,
  createHubEventBus,
  createHubApiClient
} from '@tamyla/shared';

// Create hub-specific instances
const configManager = createHubConfigManager('content-hub', {
  api: { baseURL: 'https://content-api.example.com' }
});

const authService = createHubAuthService(configManager);
const eventBus = createHubEventBus('content-hub');
const apiClient = createHubApiClient(configManager);
```

## Modules

### Configuration

```javascript
import { getConfig, updateConfig, subscribeToConfig } from '@tamyla/shared/config';

// Get current configuration
const config = getConfig();

// Update configuration
updateConfig({
  api: { timeout: 10000 },
  ui: { theme: 'dark' }
});

// Subscribe to changes
const unsubscribe = subscribeToConfig((newConfig) => {
  console.log('Config updated:', newConfig);
});
```

### Authentication

```javascript
import { authService, login, logout, isAuthenticated } from '@tamyla/shared/auth';

// Login
const result = await login({
  email: 'user@example.com',
  password: 'password'
});

// Check authentication status
if (isAuthenticated()) {
  const user = authService.getCurrentUser();
  console.log('Logged in as:', user.name);
}

// Logout
await logout();
```

### Event Bus

```javascript
import { eventBus, on, once, emit, EVENT_TYPES } from '@tamyla/shared/events';

// Listen to events
const unsubscribe = on(EVENT_TYPES.AUTH_LOGIN, (event) => {
  console.log('User logged in:', event.data);
});

// Listen once
once('custom:event', (event) => {
  console.log('Custom event:', event);
});

// Emit events
await emit('my:event', { data: 'value' }, {
  source: 'my-hub',
  metadata: { priority: 'high' }
});
```

### API Client

```javascript
import { apiClient, get, post, upload, download } from '@tamyla/shared/api';

// GET request
const data = await get('/api/items');

// POST request
const result = await post('/api/items', { name: 'New Item' });

// File upload
await upload('/api/upload', file, (progress) => {
  console.log('Upload progress:', progress);
});

// File download
await download('/api/file.pdf', 'document.pdf');
```

### Utilities

```javascript
import { errorHandler, logger, Validator, utils } from '@tamyla/shared/utils';

// Error handling
try {
  // Some operation
} catch (error) {
  const message = errorHandler.handle(error, { context: 'operation' });
  console.error(message);
}

// Logging
logger.info('Operation completed', { duration: 100 });
logger.error('Operation failed', error);

// Validation
const errors = Validator.validateField(email, { required: true, type: 'email' }, 'Email');
if (errors.length > 0) {
  console.log('Validation errors:', errors);
}

// Utility functions
const id = utils.generateId();
const debouncedFn = utils.debounce(myFunction, 300);
const fileSize = utils.formatFileSize(1024); // "1 KB"
```

## Configuration

The shared package supports multiple configuration sources with this priority:

1. **Hub-specific overrides** (highest priority)
2. **Props passed to components**
3. **Environment variables** (`REACT_APP_*` prefixed)
4. **localStorage** (user preferences)
5. **External configuration service**
6. **Defaults** (lowest priority)

### Environment Variables

```bash
# API Configuration
REACT_APP_API_BASE_URL=https://api.example.com
REACT_APP_API_TIMEOUT=30000
REACT_APP_API_RETRIES=3

# Authentication
REACT_APP_AUTH_STORAGE=localStorage
REACT_APP_AUTH_AUTO_REFRESH=true

# UI
REACT_APP_THEME=default
REACT_APP_LANGUAGE=en

# Features
REACT_APP_ANALYTICS_ENABLED=true
REACT_APP_NOTIFICATIONS_ENABLED=true

# Error Handling
REACT_APP_USER_FRIENDLY_ERRORS=true
REACT_APP_LOG_ERRORS=true
REACT_APP_REPORT_ERRORS=false
```

## Type Definitions

For TypeScript users, the package provides comprehensive type definitions:

```typescript
import type {
  Config,
  User,
  Event,
  ApiResponse,
  Hub,
  HubContext
} from '@tamyla/shared/types';

interface MyHubProps extends HubComponentProps {
  customProp: string;
}
```

## Event Types

The package defines common event types for consistency across hubs:

- `hub:init` - Hub initialization
- `hub:ready` - Hub ready for use
- `hub:destroy` - Hub destruction
- `auth:login` - User login
- `auth:logout` - User logout
- `auth:error` - Authentication error
- `data:load` - Data loading
- `data:update` - Data update
- `data:delete` - Data deletion
- `ui:navigate` - UI navigation
- `hub:error` - General hub error
- `api:error` - API error

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

## Dependencies

This package depends on:
- `axios` - HTTP client
- `lodash` - Utility functions
- `uuid` - ID generation

## License

MIT