export class LocalStorageService {
  private prefix: string;

  constructor(prefix: string = 'tamyla_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error(`Failed to save to localStorage:`, error);
    }
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Failed to read from localStorage:`, error);
      return defaultValue;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  clear(pattern?: string): void {
    if (pattern) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.getKey(pattern))) {
          localStorage.removeItem(key);
        }
      });
    } else {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
