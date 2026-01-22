/**
 * Shared Event Bus System
 *
 * Provides a centralized event system for cross-hub communication and external integration.
 * Supports event publishing, subscribing, and middleware for event processing.
 */

import { v4 as uuidv4 } from 'uuid';
export class EventBus {
  constructor() {
    this.listeners = new Map();
    this.middlewares = [];
    this.eventHistory = [];
    this.maxHistorySize = 1000;
  }

  /**
   * Subscribe to an event
   */
  on(event, listener, options = {}) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const listenerId = options.id || uuidv4();
    const listenerWrapper = {
      id: listenerId,
      callback: listener,
      once: options.once || false,
      priority: options.priority || 0,
      context: options.context
    };
    this.listeners.get(event).add(listenerWrapper);
    return () => this.off(event, listenerId);
  }

  /**
   * Subscribe to an event once
   */
  once(event, listener, options = {}) {
    return this.on(event, listener, {
      ...options,
      once: true
    });
  }

  /**
   * Unsubscribe from an event
   */
  off(event, listenerId) {
    if (!this.listeners.has(event)) {
      return false;
    }
    const listeners = this.listeners.get(event);
    const listenerToRemove = Array.from(listeners).find(l => l.id === listenerId);
    if (listenerToRemove) {
      listeners.delete(listenerToRemove);
      return true;
    }
    return false;
  }

  /**
   * Emit an event
   */
  async emit(event, data = {}, options = {}) {
    if (!this.listeners.has(event)) {
      return;
    }

    // Create event object
    const eventObject = {
      id: uuidv4(),
      type: event,
      data,
      timestamp: new Date().toISOString(),
      source: options.source || 'unknown',
      target: options.target,
      metadata: options.metadata || {}
    };

    // Add to history
    this.addToHistory(eventObject);

    // Apply middlewares
    let processedEvent = eventObject;
    for (const middleware of this.middlewares) {
      try {
        processedEvent = await middleware(processedEvent);
        if (!processedEvent) {
          // Middleware cancelled the event
          return;
        }
      } catch (error) {
        console.warn('Event middleware error:', error);
      }
    }

    // Get listeners sorted by priority
    const listeners = Array.from(this.listeners.get(event)).sort((a, b) => b.priority - a.priority);

    // Notify listeners
    const promises = listeners.map(async listener => {
      try {
        if (listener.context) {
          await listener.callback.call(listener.context, processedEvent);
        } else {
          await listener.callback(processedEvent);
        }

        // Remove one-time listeners
        if (listener.once) {
          this.listeners.get(event).delete(listener);
        }
      } catch (error) {
        console.error(`Event listener error for ${event}:`, error);
      }
    });
    await Promise.all(promises);
  }

  /**
   * Add middleware to the event bus
   */
  use(middleware) {
    this.middlewares.push(middleware);
    return () => {
      const index = this.middlewares.indexOf(middleware);
      if (index > -1) {
        this.middlewares.splice(index, 1);
      }
    };
  }

  /**
   * Get all listeners for an event
   */
  getListeners(event) {
    if (!this.listeners.has(event)) {
      return [];
    }
    return Array.from(this.listeners.get(event));
  }

  /**
   * Get all event types
   */
  getEventTypes() {
    return Array.from(this.listeners.keys());
  }

  /**
   * Clear all listeners for an event or all events
   */
  clear(event = null) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Add event to history
   */
  addToHistory(event) {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Get event history
   */
  getHistory(filter = {}) {
    let history = [...this.eventHistory];
    if (filter.type) {
      history = history.filter(e => e.type === filter.type);
    }
    if (filter.source) {
      history = history.filter(e => e.source === filter.source);
    }
    if (filter.since) {
      history = history.filter(e => new Date(e.timestamp) >= new Date(filter.since));
    }
    if (filter.limit) {
      history = history.slice(-filter.limit);
    }
    return history;
  }

  /**
   * Wait for an event
   */
  waitFor(event, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Timeout waiting for event: ${event}`));
      }, timeout);
      const unsubscribe = this.once(event, eventData => {
        clearTimeout(timer);
        resolve(eventData);
      });
    });
  }

  /**
   * Create a namespaced event bus
   */
  namespace(prefix) {
    const namespacedBus = {
      on: (event, listener, options = {}) => this.on(`${prefix}:${event}`, listener, options),
      once: (event, listener, options = {}) => this.once(`${prefix}:${event}`, listener, options),
      off: (event, listenerId) => this.off(`${prefix}:${event}`, listenerId),
      emit: (event, data, options = {}) => this.emit(`${prefix}:${event}`, data, options),
      waitFor: (event, timeout) => this.waitFor(`${prefix}:${event}`, timeout)
    };
    return namespacedBus;
  }
}

// Create shared event bus instance
export const eventBus = new EventBus();

// Export convenience functions
export const on = (event, listener, options) => eventBus.on(event, listener, options);
export const once = (event, listener, options) => eventBus.once(event, listener, options);
export const off = (event, listenerId) => eventBus.off(event, listenerId);
export const emit = (event, data, options) => eventBus.emit(event, data, options);
export const waitFor = (event, timeout) => eventBus.waitFor(event, timeout);

/**
 * Create hub-specific event bus
 */
export const createHubEventBus = hubName => {
  return eventBus.namespace(hubName);
};

/**
 * Common event types
 */
export const EVENT_TYPES = {
  // Authentication events
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_ERROR: 'auth:error',
  AUTH_TOKEN_REFRESH: 'auth:tokenRefresh',
  // Hub lifecycle events
  HUB_INIT: 'hub:init',
  HUB_READY: 'hub:ready',
  HUB_ERROR: 'hub:error',
  HUB_DESTROY: 'hub:destroy',
  // Data events
  DATA_LOAD: 'data:load',
  DATA_UPDATE: 'data:update',
  DATA_DELETE: 'data:delete',
  DATA_SYNC: 'data:sync',
  // UI events
  UI_NAVIGATE: 'ui:navigate',
  UI_MODAL_OPEN: 'ui:modalOpen',
  UI_MODAL_CLOSE: 'ui:modalClose',
  UI_NOTIFICATION: 'ui:notification',
  // Integration events
  INTEGRATION_CONNECT: 'integration:connect',
  INTEGRATION_DISCONNECT: 'integration:disconnect',
  INTEGRATION_ERROR: 'integration:error'
};