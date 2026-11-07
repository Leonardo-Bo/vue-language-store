import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { configureLanguage, tKey, useLanguageStore } from '../src';

const dictionaries: Record<string, Record<string, unknown>> = {
    en: {
        navbar: { logout: 'Logout' },
        greeting: 'Hello {name}',
        requests: {
            zero: 'No open requests',
            one: '{count} open request',
            other: '{count} open requests',
        },
        files: { one: '{count} file', other: '{count} files' },
    },
    it: {
        navbar: { logout: 'Esci' },
        greeting: 'Ciao {name}',
        requests: {
            zero: 'Nessuna richiesta aperta',
            one: '{count} richiesta aperta',
            other: '{count} richieste aperte',
        },
    },
};

beforeEach(async () => {
    localStorage.clear();
    setActivePinia(createPinia());
    configureLanguage({
        languages: ['en', 'it'],
        defaultLanguage: 'en',
        loader: async (language) => dictionaries[language],
    });
    await useLanguageStore().loadLanguagePreference();
});

describe('t', () => {
    it('resolves nested keys as before', () => {
        expect(useLanguageStore().t('navbar.logout')).toBe('Logout');
    });

    it('returns the key when it is missing or not a string', () => {
        const store = useLanguageStore();
        expect(store.t('navbar.missing')).toBe('navbar.missing');
        expect(store.t('navbar')).toBe('navbar');
        expect(store.t('requests')).toBe('requests');
    });

    it('replaces placeholders and leaves unknown ones', () => {
        const store = useLanguageStore();
        expect(store.t('greeting', { name: 'Ada' })).toBe('Hello Ada');
        expect(store.t('greeting')).toBe('Hello {name}');
        expect(store.t('greeting', { other: 1 })).toBe('Hello {name}');
    });

    it('chooses the plural form for the current language', async () => {
        const store = useLanguageStore();
        expect(store.t('requests', { count: 0 })).toBe('No open requests');
        expect(store.t('requests', { count: 1 })).toBe('1 open request');
        expect(store.t('requests', { count: 3 })).toBe('3 open requests');
        expect(store.t('files', { count: 0 })).toBe('0 files');

        await store.setLanguage('it');
        expect(store.t('requests', { count: 1 })).toBe('1 richiesta aperta');
        expect(store.t('requests', { count: 2 })).toBe('2 richieste aperte');
    });
});

describe('tKey', () => {
    it('prefixes keys and passes params through', () => {
        const t = tKey('');
        expect(tKey('navbar')('logout')).toBe('Logout');
        expect(t('greeting', { name: 'Ada' })).toBe('Hello Ada');
    });
});
