/**
 * Shared Utility Functions
 *
 * Common utilities for error handling, logging, validation, and other shared functionality.
 */

import { getConfig } from '../config';
import { eventBus, EVENT_TYPES } from '../events';

// Error Handling Utilities
export class ErrorHandler {
  constructor(configManager = null) {
    this.configManager = configManager;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return this.configManager ? this.configManager.getConfiguration() : getConfig();
  }

  /**
   * Handle error consistently
   */
  handle(error, context = {}) {
    const config = this.getConfig();

    // Log error if enabled
    if (config.errorHandling.logErrors) {
      console.error('Error handled:', error, context);
    }

    // Report error if enabled
    if (config.errorHandling.reportErrors && config.errorHandling.errorReportingUrl) {
      this.reportError(error, context);
    }

    // Emit error event
    eventBus.emit(EVENT_TYPES.HUB_ERROR, {
      error: error.message || error,
      context,
      stack: error.stack
    });

    // Return user-friendly message if enabled
    if (config.errorHandling.showUserFriendlyMessages) {
      return this.getUserFriendlyMessage(error);
    }

    return error.message || 'An error occurred';
  }

  /**
   * Report error to external service
   */
  async reportError(error, context = {}) {
    try {
      const config = this.getConfig();
      await fetch(config.errorHandling.errorReportingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: error.message || error,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (reportError) {
      console.warn('Failed to report error:', reportError);
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error) {
    // Map technical errors to user-friendly messages
    const errorMappings = {
      'Network Error': 'Unable to connect to the server. Please check your internet connection.',
      '401': 'Your session has expired. Please log in again.',
      '403': 'You don\'t have permission to perform this action.',
      '404': 'The requested resource was not found.',
      '500': 'A server error occurred. Please try again later.',
      'Timeout': 'The request timed out. Please try again.'
    };

    const message = error.message || error.toString();
    return errorMappings[message] || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Create error object with additional context
   */
  createError(message, code = null, context = {}) {
    const error = new Error(message);
    error.code = code;
    error.context = context;
    return error;
  }
}

// Create shared error handler instance
export const errorHandler = new ErrorHandler();

// Logging Utilities
export class Logger {
  constructor(configManager = null, prefix = '') {
    this.configManager = configManager;
    this.prefix = prefix;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return this.configManager ? this.configManager.getConfiguration() : getConfig();
  }

  /**
   * Format log message
   */
  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const prefix = this.prefix ? `[${this.prefix}]` : '';
    return {
      timestamp,
      level,
      message: `${prefix} ${message}`,
      context
    };
  }

  /**
   * Log debug message
   */
  debug(message, context = {}) {
    if (this.getConfig().features.logging) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Log info message
   */
  info(message, context = {}) {
    if (this.getConfig().features.logging) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  /**
   * Log warning message
   */
  warn(message, context = {}) {
    if (this.getConfig().features.logging) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  /**
   * Log error message
   */
  error(message, error = null, context = {}) {
    const config = this.getConfig();
    if (config.features.logging) {
      const logData = this.formatMessage('error', message, {
        ...context,
        error: error ? {
          message: error.message,
          stack: error.stack
        } : null
      });
      console.error(logData);
    }

    // Handle error if error object provided
    if (error && config.errorHandling.logErrors) {
      errorHandler.handle(error, context);
    }
  }
}

// Create shared logger instance
export const logger = new Logger();

// Validation Utilities
export class Validator {
  /**
   * Validate email address
   */
  static isEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL
   */
  static isUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate required fields
   */
  static required(value, fieldName) {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  }

  /**
   * Validate string length
   */
  static length(value, min = 0, max = Infinity, fieldName = 'field') {
    if (typeof value !== 'string') {
      return `${fieldName} must be a string`;
    }
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    if (value.length > max) {
      return `${fieldName} must be no more than ${max} characters`;
    }
    return null;
  }

  /**
   * Validate number range
   */
  static range(value, min = -Infinity, max = Infinity, fieldName = 'field') {
    const num = Number(value);
    if (isNaN(num)) {
      return `${fieldName} must be a number`;
    }
    if (num < min) {
      return `${fieldName} must be at least ${min}`;
    }
    if (num > max) {
      return `${fieldName} must be no more than ${max}`;
    }
    return null;
  }

  /**
   * Validate against pattern
   */
  static pattern(value, regex, fieldName = 'field') {
    if (!regex.test(value)) {
      return `${fieldName} format is invalid`;
    }
    return null;
  }

  /**
   * Validate object against schema
   */
  static validateObject(obj, schema, fieldName = 'object') {
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key];
      const fieldErrors = this.validateField(value, rules, key);
      errors.push(...fieldErrors);
    }

    return errors;
  }

  /**
   * Validate single field
   */
  static validateField(value, rules, fieldName) {
    const errors = [];

    if (rules.required && this.required(value, fieldName)) {
      errors.push(this.required(value, fieldName));
      return errors; // Don't validate further if required field is missing
    }

    if (value !== null && value !== undefined && value !== '') {
      if (rules.type) {
        if (rules.type === 'email' && !this.isEmail(value)) {
          errors.push(`${fieldName} must be a valid email address`);
        } else if (rules.type === 'url' && !this.isUrl(value)) {
          errors.push(`${fieldName} must be a valid URL`);
        } else if (typeof value !== rules.type) {
          errors.push(`${fieldName} must be of type ${rules.type}`);
        }
      }

      if (rules.min !== undefined || rules.max !== undefined) {
        const lengthError = this.length(value, rules.min, rules.max, fieldName);
        if (lengthError) errors.push(lengthError);
      }

      if (rules.minValue !== undefined || rules.maxValue !== undefined) {
        const rangeError = this.range(value, rules.minValue, rules.maxValue, fieldName);
        if (rangeError) errors.push(rangeError);
      }

      if (rules.pattern) {
        const patternError = this.pattern(value, rules.pattern, fieldName);
        if (patternError) errors.push(patternError);
      }

      if (rules.custom) {
        const customError = rules.custom(value, fieldName);
        if (customError) errors.push(customError);
      }
    }

    return errors;
  }

  /**
   * Validate configuration object
   */
  static validateConfig(config, customValidators = []) {
    const errors = [];

    // Run custom validators
    customValidators.forEach(validator => {
      const result = validator(config);
      if (result && result.errors) {
        errors.push(...result.errors);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Utility Functions
export const utils = {
  /**
   * Deep clone object
   */
  deepClone: (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => utils.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = utils.deepClone(obj[key]);
      });
      return cloned;
    }
  },

  /**
   * Deep merge objects
   */
  deepMerge: (target, ...sources) => {
    const merge = (target, source) => {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          target[key] = target[key] || {};
          merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    sources.forEach(source => merge(target, source));
    return target;
  },

  /**
   * Generate UUID
   */
  generateId: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  /**
   * Debounce function
   */
  debounce: (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  /**
   * Throttle function
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get file extension
   */
  getFileExtension: (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  /**
   * Check if file type is allowed
   */
  isFileTypeAllowed: (filename, allowedTypes) => {
    const extension = utils.getFileExtension(filename).toLowerCase();
    return allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return extension === type.slice(1).toLowerCase();
      }
      return type.toLowerCase().includes(extension);
    });
  },

  /**
   * Sanitize string for HTML
   */
  sanitizeHtml: (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Capitalize first letter
   */
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Convert to camelCase
   */
  camelCase: (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  },

  /**
   * Convert to kebab-case
   */
  kebabCase: (str) => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }
};

// Export convenience functions
export const handleError = (error, context) => errorHandler.handle(error, context);
export const log = logger;
export const validate = Validator;