import { defineStore } from 'pinia';
import { ref } from 'vue';

export type TranslationParams = Record<string, string | number>;

export type TranslationLoader = (
    language: string,
) => Promise<Record<string, unknown>>;

export interface LanguageStoreOptions {
    languages: string[];
    defaultLanguage: string;
    storageKey?: string;
    loader: TranslationLoader;
}

let configuration: LanguageStoreOptions | null = null;

/**
 * Pick the plural form for `count`: an explicit "zero" form when count is 0,
 * otherwise the CLDR category of the language ("one", "few", "many", "other", ...),
 * falling back to "other".
 */
const selectPlural = (
    forms: Record<string, unknown>,
    count: number,
    language: string,
): unknown => {
    if (count === 0 && 'zero' in forms) {
        return forms.zero;
    }

    const category = new Intl.PluralRules(language || undefined).select(count);

    return category in forms
        ? forms[category]
        : forms.other;
};

/** Replace `{name}` placeholders with params; unknown placeholders are left as they are. */
const interpolate = (
    text: string,
    params?: TranslationParams,
): string => {
    if (!params) {
        return text;
    }

    return text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
        name in params
            ? String(params[name])
            : placeholder,
    );
};

export const configureLanguage = (
    options: LanguageStoreOptions,
) => {
    if (!options.languages.includes(options.defaultLanguage)) {
        throw new Error(
            `Default language "${options.defaultLanguage}" is not included in languages.`,
        );
    }

    configuration = options;
};

export const useLanguageStore = defineStore('language', () => {
    const currentLanguage = ref('');
    const translations = ref<Record<string, unknown>>({});
    const isLoading = ref(false);

    const loadTranslations = async (language: string) => {
        if (!configuration) {
            throw new Error(
                'Language store is not configured. Call configureLanguage() first.',
            );
        }

        if (!configuration.languages.includes(language)) {
            throw new Error(
                `Language "${language}" is not configured.`,
            );
        }

        isLoading.value = true;

        try {
            translations.value = await configuration.loader(language);
            currentLanguage.value = language;
        } finally {
            isLoading.value = false;
        }
    };

    const setLanguage = async (language: string) => {
        if (!configuration) {
            throw new Error(
                'Language store is not configured. Call configureLanguage() first.',
            );
        }

        await loadTranslations(language);

        localStorage.setItem(
            configuration.storageKey ?? 'language',
            language,
        );
    };

    const loadLanguagePreference = async () => {
        if (!configuration) {
            throw new Error(
                'Language store is not configured. Call configureLanguage() first.',
            );
        }

        const storageKey = configuration.storageKey ?? 'language';
        const savedLanguage = localStorage.getItem(storageKey);

        const language =
            savedLanguage &&
            configuration.languages.includes(savedLanguage)
                ? savedLanguage
                : configuration.defaultLanguage;

        await loadTranslations(language);
    };

    const t = (key: string, params?: TranslationParams): string => {
        const keys = key.split('.');
        let result: unknown = translations.value;

        for (const part of keys) {
            if (
                result &&
                typeof result === 'object' &&
                part in result
            ) {
                result = (result as Record<string, unknown>)[part];
            } else {
                return key;
            }
        }

        if (
            result &&
            typeof result === 'object' &&
            typeof params?.count === 'number'
        ) {
            result = selectPlural(
                result as Record<string, unknown>,
                params.count,
                currentLanguage.value,
            );
        }

        return typeof result === 'string'
            ? interpolate(result, params)
            : key;
    };

    return {
        currentLanguage,
        translations,
        isLoading,
        setLanguage,
        loadTranslations,
        loadLanguagePreference,
        t,
    };
});
