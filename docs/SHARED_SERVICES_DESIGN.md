# Shared Services Infrastructure Design

## Overview
The shared services layer provides common functionality across all hubs while maintaining loose coupling and independent deployment capabilities.

## Core Services

### 1. Authentication Service (`@tamyla/auth-service`)
**Purpose:** Centralized authentication and authorization across all hubs

**API Endpoints:**
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/verify
POST   /api/auth/refresh
GET    /api/auth/user
```

**Responsibilities:**
- JWT token management
- User session handling
- Cross-hub authentication
- Role-based access control

### 2. Event Bus Service (`@tamyla/event-bus`)
**Purpose:** Asynchronous communication between hubs

**Features:**
- Event publishing/subscription
- Message queuing (Redis/Kafka)
- Event replay capabilities
- Hub discovery and registration

**Event Types:**
- `content.uploaded` - New content uploaded
- `contact.created` - New contact added
- `campaign.sent` - Campaign dispatched
- `user.authenticated` - User login events

### 3. Data Synchronization Service (`@tamyla/data-sync`)
**Purpose:** Synchronize data across hubs without tight coupling

**Features:**
- Change data capture
- Conflict resolution
- Data validation
- Audit logging

**Sync Patterns:**
- Hub-specific databases with shared schemas
- Eventual consistency model
- Read-through caching
- Write-through replication

### 4. Configuration Service (`@tamyla/config-service`)
**Purpose:** Centralized configuration management

**Features:**
- Environment-specific configs
- Feature flags
- Hub activation settings
- Runtime configuration updates

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Content Hub   │    │   Contact Hub   │
│                 │    │                 │
│ • Content DB    │    │ • Contact DB    │
│ • Upload API    │    │ • Contact API   │
│ • Search API    │    │ • Segment API   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌─────────────────────┐
          │  Shared Services    │
          │                     │
          │ • Auth Service      │
          │ • Event Bus         │
          │ • Data Sync         │
          │ • Config Service    │
          └─────────────────────┘
                     │
          ┌─────────────────────┐
          │   Core Hub          │
          │                     │
          │ • Hub Orchestrator  │
          │ • Unified UI        │
          │ • Cross-Hub Search  │
          └─────────────────────┘
```

## Implementation Strategy

### Phase 1: Service Extraction
1. Extract authentication logic into shared service
2. Implement basic event bus for hub communication
3. Create configuration management system

### Phase 2: Data Layer
1. Design shared database schemas
2. Implement data synchronization patterns
3. Add conflict resolution mechanisms

### Phase 3: Integration
1. Connect all hubs to shared services
2. Implement cross-hub workflows
3. Add monitoring and observability

## Benefits

### For Development
- **Independent Deployment:** Hubs can be updated separately
- **Technology Flexibility:** Each hub can use optimal tech stack
- **Scalability:** Services scale based on usage patterns

### For Operations
- **Fault Isolation:** Issues in one hub don't affect others
- **Monitoring:** Centralized logging and alerting
- **Configuration:** Single source of truth for all settings

### For Users
- **Seamless Experience:** Unified interface across all hubs
- **Data Consistency:** Changes sync automatically across hubs
- **Reliability:** Better uptime through independent scaling