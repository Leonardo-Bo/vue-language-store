import { useLanguageStore } from './languageStore.js';
import type { TranslationParams } from './languageStore.js';

export function tKey(
    prefix: string,
): (key: string, params?: TranslationParams) => string {
    const languageStore = useLanguageStore();

    return (key: string, params?: TranslationParams): string => {
        const fullKey = prefix
            ? `${prefix}.${key}`
            : key;

        return languageStore.t(fullKey, params);
    };
}
