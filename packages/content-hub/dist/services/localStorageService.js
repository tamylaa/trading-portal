export class LocalStorageService {
    constructor(prefix = 'tamyla_') {
        this.prefix = prefix;
    }
    getKey(key) {
        return `${this.prefix}${key}`;
    }
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.getKey(key), serialized);
        }
        catch (error) {
            console.error(`Failed to save to localStorage:`, error);
        }
    }
    get(key, defaultValue) {
        try {
            const item = localStorage.getItem(this.getKey(key));
            if (item === null)
                return defaultValue;
            return JSON.parse(item);
        }
        catch (error) {
            console.error(`Failed to read from localStorage:`, error);
            return defaultValue;
        }
    }
    remove(key) {
        localStorage.removeItem(this.getKey(key));
    }
    clear(pattern) {
        if (pattern) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.getKey(pattern))) {
                    localStorage.removeItem(key);
                }
            });
        }
        else {
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
