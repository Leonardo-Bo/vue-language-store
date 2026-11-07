import { useLanguageStore } from './languageStore';
import type { TranslationParams } from './languageStore';

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
