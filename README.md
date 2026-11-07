# vue-language-store

Lightweight language store for Vue 3 + Pinia applications.

Provides:

- multiple language support
- JSON translation dictionaries
- persistent language preference
- language switching
- nested translation keys
- placeholders (`{name}`) and plural forms
- simple `tKey()` helper


## Requirements

- Vue 3
- Pinia 3 or 4
- Vite

## Installation

From GitHub:

```bash
npm install github:Leonardo-Bo/vue-language-store
```


## Project structure

Translation dictionaries belong to the application:

```text
src/
├── locales/
│   ├── en.json
│   ├── it.json
│   └── ...
├── main.ts
└── ...
```

The package itself does not contain application-specific translations.


## Configuration

Configure the package once in `main.ts`:

```ts
import {
    configureLanguage,
    useLanguageStore,
} from 'vue-language-store';

const localeFiles = import.meta.glob(
    '../locales/*.json',
    {
        eager: true,
        import: 'default',
    },
);

configureLanguage({
    languages: ['en', 'it'],
    defaultLanguage: 'en',

    loader: async (language) => {
        return localeFiles[
            `../locales/${language}.json`
        ] as Record<string, unknown>;
    },
});
```

Initialize the language before mounting the application:

```ts
const app = createApp(App);

app.use(createPinia());
app.use(router);

const languageStore = useLanguageStore();

await languageStore.loadLanguagePreference();

app.mount('#app');
```

`localStorage` is used automatically to remember the selected language.


## Dictionaries

Example `en.json`:

```json
{
    "navbar": {
        "logout": "Logout"
    }
}
```

Example `it.json`:

```json
{
    "navbar": {
        "logout": "Esci"
    }
}
```

Any number of languages can be added:

```text
src/locales/
├── en.json
├── it.json
├── de.json
└── fr.json
```

Then add them to `languages`:

```ts
languages: ['en', 'it', 'de', 'fr']
```

---

## Usage

Create a translation helper with a prefix:

```ts
import { tKey } from 'vue-language-store';

const t = tKey('navbar');
```

Use it in the component:

```vue
<button>
    {{ t('logout') }}
</button>
```

This resolves to:

```text
navbar.logout
```

### Placeholders

```json
{ "greeting": "Hello {name}" }
```

```ts
t('greeting', { name: 'Ada' }); // Hello Ada
```

Placeholders without a value are left as they are.

### Plurals

Give the plural forms as an object and pass `count`:

```json
{
    "requests": {
        "zero": "No open requests",
        "one": "{count} open request",
        "other": "{count} open requests"
    }
}
```

```ts
t('requests', { count: 0 }); // No open requests
t('requests', { count: 1 }); // 1 open request
t('requests', { count: 3 }); // 3 open requests
```

The form is chosen with the standard `Intl.PluralRules` of the current language
(`one`, `few`, `many`, `other`, ...); `zero` is optional and used only for 0; `other`
is the fallback. Without `count`, a key that holds plural forms returns the key itself.

---

## Changing language

```ts
import { useLanguageStore } from 'vue-language-store';

const languageStore = useLanguageStore();

await languageStore.setLanguage('it');
```

The selected language is automatically saved in `localStorage`.


## Build

Install dependencies:

```bash
npm install
```

Build:

```bash
npm run build
```

The compiled package is generated in `dist/`. Installing from GitHub builds it
automatically (`prepare` script).

Tests:

```bash
npm test
```

---

## Update

After changing the source:

```bash
npm run build
git add .
git commit -m "Update vue-language-store"
git push
```

Applications can update the package with:

```bash
npm install github:Leonardo-Bo/vue-language-store
```

For a specific release:

```bash
npm install github:Leonardo-Bo/vue-language-store#v1.1.1
```

---

## License

MIT
