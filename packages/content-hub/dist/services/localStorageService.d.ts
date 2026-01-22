export declare class LocalStorageService {
    private prefix;
    constructor(prefix?: string);
    private getKey;
    set<T>(key: string, value: T): void;
    get<T>(key: string, defaultValue?: T): T | undefined;
    remove(key: string): void;
    clear(pattern?: string): void;
}
export declare const localStorageService: LocalStorageService;
//# sourceMappingURL=localStorageService.d.ts.map