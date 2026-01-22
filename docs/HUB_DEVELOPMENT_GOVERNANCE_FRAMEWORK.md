# 🏗️ HUB DEVELOPMENT GOVERNANCE FRAMEWORK

## **STRATEGIC PRINCIPLE**
> "Content-Hub as the Reference Architecture for ALL Hubs"

Every new hub (campaign-hub, contact-hub, service-hub, etc.) MUST follow the content-hub pattern to ensure **highly repeatable and modular system** that delivers **consistent value** and **maintains state** across the ecosystem.

---

## 📋 **HUB ARCHITECTURE STANDARDS**

### **1. SHARED-FIRST DEVELOPMENT MANDATE** 🎯

#### **Before Building ANY Hub Feature:**
```bash
1. ✅ CHECK: Does this exist in @tamyla/shared?
2. ✅ EVALUATE: Can shared infrastructure handle this?
3. ✅ EXTEND: Enhance shared if needed (benefits ALL hubs)
4. ❌ DUPLICATE: Never recreate what exists in shared
```

#### **Mandatory Shared Infrastructure Usage:**
```javascript
// EVERY HUB MUST USE:
import { EventBus } from '@tamyla/shared/events';        // Event handling
import { ApiClient } from '@tamyla/shared/api';          // HTTP requests
import { AuthService } from '@tamyla/shared/auth';       // Authentication
import { ConfigManager } from '@tamyla/shared/config';   // Configuration
import { ErrorHandler, Logger } from '@tamyla/shared/utils'; // Error/logging

// NO HUB SHALL:
// ❌ Create custom HTTP clients
// ❌ Create custom event systems  
// ❌ Create custom authentication
// ❌ Create custom configuration management
// ❌ Create custom error handling
```

### **2. CONTENT-HUB REFERENCE ARCHITECTURE** 📐

All hubs MUST follow this proven pattern from content-hub:

#### **A. Package Structure (MANDATORY)**
```
packages/{hub-name}/
├── package.json              ✅ Shared dependency declared
├── src/
│   ├── Hyper{HubName}.jsx    ✅ Main component (like HyperContentHub)
│   ├── services/
│   │   └── Shared{HubName}Service.js  ✅ Uses @tamyla/shared (like SharedContentHubService)
│   ├── layouts/              ✅ Tabbed, Sidebar, SingleView layouts
│   ├── components/           ✅ Hub-specific UI components
│   ├── types/               ✅ Hub-specific types
│   └── styles/              ✅ Hub-specific styles
├── api/                     ✅ API integration layer
├── config/                  ✅ Hub-specific configuration
└── index.js                 ✅ Clean export interface
```

#### **B. Service Architecture Pattern (MANDATORY)**
```javascript
// Every hub MUST have a SharedXxxService following this pattern:

import { ApiClient, EventBus, AuthService, ConfigManager } from '@tamyla/shared';

export class Shared{HubName}Service {
  constructor(config = {}) {
    // ✅ REQUIRED: Use shared infrastructure
    this.config = new ConfigManager({ ...DEFAULT_CONFIG, ...config });
    this.eventBus = new EventBus();
    this.apiClient = new ApiClient(this.config);
    this.authService = new AuthService(this.config);
    this.errorHandler = new ErrorHandler(this.config);
    this.logger = new Logger(`${HubName}Service`);
    
    // ✅ REQUIRED: Setup interceptors and middleware
    this.setupApiInterceptors();
    this.setupEventMiddleware();
  }

  // ✅ REQUIRED: Hub-specific business methods
  async {primaryAction}(params) {
    this.eventBus.emit('{action}:started', params);
    try {
      const result = await this.apiClient.post('/api/{hub}/{action}', params);
      this.eventBus.emit('{action}:completed', { params, result });
      return result;
    } catch (error) {
      const handledError = this.errorHandler.handle(error);
      this.eventBus.emit('{action}:failed', { params, error: handledError });
      throw handledError;
    }
  }
}
```

#### **C. Component Architecture Pattern (MANDATORY)**
```javascript
// Every hub MUST have a HyperXxxHub component following this pattern:

export const {HubName} = ({
  // ✅ REQUIRED: Core capabilities
  capabilities = ['{primary}', '{secondary}', '{tertiary}'],
  
  // ✅ REQUIRED: UI/UX options  
  layout = 'tabbed',
  theme = 'auto',
  defaultView = '{primary}',
  
  // ✅ REQUIRED: Service integration
  serviceAdapter,
  
  // ✅ REQUIRED: Styling & theming
  customTheme = {},
  brandColors = {},
  
  // ✅ REQUIRED: State & data flow
  initialState = {},
  onStateChange,
  
  // ✅ REQUIRED: Traditional integration
  authToken,
  currentUser,
  
  // Hub-specific props...
  ...props
}) => {
  
  // ✅ REQUIRED: Use shared services hook
  const services = useSharedServices(serviceAdapter, {
    authToken,
    currentUser,
    config: { ...initialState }
  });
  
  // ✅ REQUIRED: Theme resolution
  const resolvedTheme = useThemeResolver({ theme, customTheme, brandColors });
  
  // ✅ REQUIRED: Capability injection
  const activeCapabilities = useCapabilityInjection(capabilities, {
    services,
    // ... state management
  });
  
  return (
    <{HubName}Container theme={resolvedTheme} {...props}>
      <{HubName}UI
        layout={layout}
        activeView={activeView}
        capabilities={activeCapabilities}
      />
    </{HubName}Container>
  );
};
```

---

## 🚀 **HUB DEVELOPMENT CHECKLIST**

### **PRE-DEVELOPMENT REQUIREMENTS** ✅

Before starting any new hub:

- [ ] **Audit @tamyla/shared** - Identify existing infrastructure that can be reused
- [ ] **Extend shared if needed** - Add missing infrastructure to shared (not hub)
- [ ] **Define hub-specific config** - Extend shared ConfigManager defaults
- [ ] **Plan event architecture** - Define hub-specific events using shared EventBus
- [ ] **Design API patterns** - Define endpoints that will use shared ApiClient

### **DEVELOPMENT PHASE CHECKLIST** ✅

During hub development:

- [ ] **Package.json setup** - Add `"@tamyla/shared": "file:../shared"` dependency
- [ ] **Service layer** - Create SharedXxxService using shared infrastructure  
- [ ] **Component layer** - Create HyperXxxHub following content-hub pattern
- [ ] **Layout components** - Implement tabbed, sidebar, single-view layouts
- [ ] **Configuration** - Define hub-specific config extending shared defaults
- [ ] **API integration** - Use shared ApiClient with hub-specific interceptors
- [ ] **Event integration** - Use shared EventBus with hub-specific events
- [ ] **Error handling** - Use shared ErrorHandler with hub-specific context
- [ ] **Testing** - Verify functionality preserved while using shared infrastructure

### **POST-DEVELOPMENT VALIDATION** ✅

After hub completion:

- [ ] **Zero duplication** - No custom HTTP, event, auth, config, or error code
- [ ] **Shared usage** - All infrastructure goes through @tamyla/shared
- [ ] **API compatibility** - Hub can be used by any application
- [ ] **Customization support** - Service adapters, themes, configs work
- [ ] **Extension points** - Hook architecture enables custom functionality
- [ ] **State management** - Hub maintains state and integrates with external state
- [ ] **Documentation** - Hub follows content-hub documentation patterns

---

## 🎯 **HUB CAPABILITY & FLEXIBILITY STANDARDS**

### **Required Capabilities (Every Hub)**

#### **1. Service Endpoints & API Integration** 
```javascript
// MANDATORY: Every hub MUST support custom service integration
const customServiceAdapter = {
  {primaryAction}: async (params) => await customAPI.{action}(params),
  {secondaryAction}: async (params) => await customAPI.{action}(params),
  // ... custom implementations
};

<{HubName}
  serviceAdapter={customServiceAdapter}  // ✅ REQUIRED
/>
```

#### **2. Configuration Endpoints**
```javascript
// MANDATORY: Every hub MUST support configuration customization
const customConfig = {
  api: { baseURL: 'https://custom-api.company.com' },
  {hub}: {
    {feature1}: { enabled: true, customSettings: {} },
    {feature2}: { provider: 'custom', integration: {} }
  }
};

<{HubName}
  initialState={customConfig}  // ✅ REQUIRED
/>
```

#### **3. State Management Integration**
```javascript
// MANDATORY: Every hub MUST support external state management
const [hubState, setHubState] = useState();

<{HubName}
  initialState={hubState}
  onStateChange={setHubState}  // ✅ REQUIRED
/>
```

#### **4. Event-Driven Architecture**
```javascript
// MANDATORY: Every hub MUST emit comprehensive events
<{HubName}
  on{Action1}={(data) => handleAction1(data)}    // ✅ REQUIRED
  on{Action2}={(data) => handleAction2(data)}    // ✅ REQUIRED
  onError={(error) => handleError(error)}        // ✅ REQUIRED
/>
```

#### **5. Theme & Branding Flexibility**
```javascript
// MANDATORY: Every hub MUST support theming
<{HubName}
  theme="custom"                    // ✅ REQUIRED
  customTheme={enterpriseTheme}     // ✅ REQUIRED
  brandColors={companyColors}       // ✅ REQUIRED
/>
```

#### **6. Modular Capabilities**
```javascript
// MANDATORY: Every hub MUST support capability toggling
<{HubName}
  capabilities={['{feature1}', '{feature2}']}  // ✅ REQUIRED
  layout="sidebar"                              // ✅ REQUIRED
  defaultView="{feature1}"                      // ✅ REQUIRED
/>
```

---

## 📊 **SHARED INFRASTRUCTURE GOVERNANCE**

### **When to Add to @tamyla/shared**

#### **PROMOTE TO SHARED IF:**
- ✅ **Multiple hubs need it** - 2+ hubs would use this functionality
- ✅ **Infrastructure-level** - HTTP, events, auth, config, logging, caching
- ✅ **Cross-cutting concern** - Error handling, performance monitoring, validation
- ✅ **Reusable pattern** - Other hubs could benefit from this pattern

#### **KEEP IN HUB IF:**
- ❌ **Hub-specific business logic** - Domain-specific functionality
- ❌ **UI components** - Hub-specific user interface elements  
- ❌ **Single-use utility** - Only one hub needs this functionality
- ❌ **Experimental feature** - Not yet proven for general use

### **Shared Package Enhancement Process**

```bash
1. Identify common pattern across 2+ hubs
2. Design generic interface that works for all hubs  
3. Add to @tamyla/shared with comprehensive tests
4. Update ALL existing hubs to use new shared infrastructure
5. Document pattern for future hub development
```

---

## 🔄 **DATA FLOW & API INTEGRATION STANDARDS**

### **Hub-to-API Communication Pattern**

```javascript
// STANDARD: Every hub MUST follow this API interaction pattern

class Shared{HubName}Service {
  // ✅ MANDATORY: Use shared ApiClient for all HTTP requests
  async {action}(params) {
    // Event: Action started
    this.eventBus.emit('{hub}:{action}:started', { params, timestamp: new Date() });
    
    try {
      // API call via shared client
      const response = await this.apiClient.post('/api/{hub}/{action}', {
        ...params,
        userId: this.authService.getUser()?.id,
        domain: this.config.get('{hub}.domain')
      });
      
      // Transform response if needed
      const result = this.transformResponse(response.data);
      
      // Event: Action completed
      this.eventBus.emit('{hub}:{action}:completed', { 
        params, 
        result, 
        timestamp: new Date() 
      });
      
      return result;
      
    } catch (error) {
      // Handle error via shared handler
      const handledError = this.errorHandler.handle(error, { params });
      
      // Event: Action failed
      this.eventBus.emit('{hub}:{action}:failed', { 
        params, 
        error: handledError, 
        timestamp: new Date() 
      });
      
      throw handledError;
    }
  }
}
```

### **State Management Pattern**

```javascript
// STANDARD: Every hub MUST support this state management pattern

export const {HubName} = ({ initialState, onStateChange }) => {
  const [internalState, setInternalState] = useState(initialState);
  
  // ✅ REQUIRED: Sync internal state with external state
  const updateState = useCallback((newState) => {
    setInternalState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);
  
  // ✅ REQUIRED: Expose state management to parent
  const stateManager = {
    getState: () => internalState,
    setState: updateState,
    resetState: () => updateState(initialState)
  };
  
  return (
    <{HubName}Provider value={{ ...services, ...stateManager }}>
      <{HubName}UI />
    </{HubName}Provider>
  );
};
```

---

## 🎯 **HUB DEVELOPMENT ROADMAP**

### **Phase 1: Establish Standards** ✅ 
- [x] Content-hub as reference architecture
- [x] Shared infrastructure foundation
- [x] Service duplication elimination
- [x] Pattern documentation

### **Phase 2: Hub Standardization** 🚀
- [ ] **Campaign-hub** - Align with content-hub pattern
- [ ] **Contact-hub** - Align with content-hub pattern  
- [ ] **Service-hub** - Build following content-hub pattern

### **Phase 3: Ecosystem Optimization** 🔮
- [ ] Cross-hub data synchronization
- [ ] Shared analytics and monitoring
- [ ] Hub discovery and orchestration
- [ ] Enterprise customization framework

---

## ✅ **SUCCESS METRICS**

| Metric | Target | Measurement |
|--------|---------|-------------|
| **Shared Infrastructure Usage** | 100% of hubs use @tamyla/shared | Dependency analysis |
| **Code Duplication** | 0 duplicate infrastructure code | Static analysis |
| **Development Velocity** | New hub in 2 weeks | Time tracking |
| **API Consistency** | Same patterns across all hubs | API documentation review |
| **Customization Support** | All hubs support service adapters | Integration testing |
| **State Management** | All hubs integrate with external state | Functional testing |

---

## 🏆 **GOVERNANCE ENFORCEMENT**

### **Pre-Merge Requirements**
- ✅ **Shared dependency check** - Hub package.json includes @tamyla/shared
- ✅ **Duplication scan** - No custom HTTP, event, auth, config code
- ✅ **Pattern compliance** - Follows content-hub architecture pattern
- ✅ **API consistency** - Service adapters, configuration, state management work
- ✅ **Documentation** - Hub capabilities and integration documented

### **Continuous Monitoring**
- 📊 **Weekly duplication reports** - Scan for infrastructure code in hubs
- 🔍 **Architecture reviews** - Ensure new hubs follow standards
- 📈 **Shared utilization metrics** - Track @tamyla/shared usage across hubs
- 🚀 **Performance monitoring** - Ensure shared infrastructure performs well

---

## 🎉 **OUTCOME: HIGHLY REPEATABLE & MODULAR SYSTEM**

This governance framework ensures:

1. **✅ Consistent Architecture** - All hubs follow proven content-hub pattern
2. **✅ Shared Infrastructure** - Zero duplication, maximum reuse of @tamyla/shared
3. **✅ Rapid Development** - New hubs developed in weeks, not months
4. **✅ Enterprise Flexibility** - Every hub supports deep customization
5. **✅ Maintainable Ecosystem** - Single source of truth for all infrastructure
6. **✅ Predictable Quality** - Well-tested shared foundation ensures reliability

**Result: Every hub becomes a highly repeatable, modular business capability that can deliver value to any application while maintaining consistent state and data flow patterns.** 🚀