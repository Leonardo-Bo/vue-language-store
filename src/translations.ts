import { useLanguageStore } from './languageStore';

export function tKey(prefix: string): (key: string) => string {
    const languageStore = useLanguageStore();

    return (key: string): string => {
        const fullKey = prefix
            ? `${prefix}.${key}`
            : key;

        return languageStore.t(fullKey);
    };
}
