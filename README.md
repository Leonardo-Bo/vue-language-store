# vue-language-store

Lightweight language store for Vue 3 + Pinia applications.

Provides:

- multiple language support
- JSON translation dictionaries
- persistent language preference
- language switching
- nested translation keys
- simple `tKey()` helper


## Requirements

- Vue 3
- Pinia 3
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

The compiled package is generated in `dist/`.

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
npm install github:Leonardo-Bo/vue-language-store#v1.0.0
```

---

## License

MIT
