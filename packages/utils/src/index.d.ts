export declare function slugify(text: string): string;
export declare function capitalize(str: string): string;
export declare function truncate(str: string, length: number): string;
export declare function formatRelativeTime(date: Date | string): string;
export declare function formatDuration(ms: number): string;
export declare function cn(...classes: Array<string | undefined | null | boolean>): string;
export declare function isValidEmail(email: string): boolean;
export declare function isValidCron(cron: string): boolean;
export declare function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
export declare function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
export declare function formatNumber(num: number): string;
export declare function clamp(value: number, min: number, max: number): number;
export declare function getErrorMessage(error: unknown): string;
//# sourceMappingURL=index.d.ts.map