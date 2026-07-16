// ─── String Utilities ─────────────────────────────────────────────────────────
export function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
export function truncate(str, length) {
    return str.length > length ? `${str.slice(0, length)}...` : str;
}
// ─── Date Utilities ───────────────────────────────────────────────────────────
export function formatRelativeTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const diff = Date.now() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60)
        return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
        return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30)
        return `${days}d ago`;
    return d.toLocaleDateString();
}
export function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(1)}s`;
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}m ${secs}s`;
}
// ─── Class Utilities ──────────────────────────────────────────────────────────
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
// ─── Validation Utilities ─────────────────────────────────────────────────────
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export function isValidCron(cron) {
    const parts = cron.trim().split(/\s+/);
    return parts.length === 5 || parts.length === 6;
}
// ─── Object Utilities ─────────────────────────────────────────────────────────
export function omit(obj, keys) {
    const result = { ...obj };
    for (const key of keys)
        delete result[key];
    return result;
}
export function pick(obj, keys) {
    const result = {};
    for (const key of keys)
        result[key] = obj[key];
    return result;
}
// ─── Number Utilities ─────────────────────────────────────────────────────────
export function formatNumber(num) {
    if (num >= 1_000_000)
        return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000)
        return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
}
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
// ─── Error Utilities ──────────────────────────────────────────────────────────
export function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'string')
        return error;
    return 'An unknown error occurred';
}
//# sourceMappingURL=index.js.map