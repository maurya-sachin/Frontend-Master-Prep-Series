# Internationalization - Translation Loading

> **Focus**: Dynamic translation loading, code splitting, lazy loading strategies

---

## Question 1: How do you efficiently load translations in a multi-language application?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Amazon, Airbnb, Stripe, Netflix

### Question
Explain translation loading strategies including lazy loading, code splitting, caching, and performance optimization.

### Answer

**Key Challenges:**
1. **Large translation files** (100KB+ per language)
2. **Multiple languages** (20-50+ locales)
3. **Initial load performance** (LCP, TTI)
4. **Bundle size optimization**
5. **Dynamic language switching**

**Loading Strategies:**
1. **Eager Loading**: Load all translations upfront (small apps)
2. **Lazy Loading**: Load on-demand when language changes (medium apps)
3. **Code Splitting**: Split by route/component (large apps)
4. **Hybrid**: Load critical + lazy load rest (recommended)

### Code Example

**1. Basic Translation Structure:**

```javascript
// locales/en-US.json
{
  "common": {
    "welcome": "Welcome",
    "login": "Log In",
    "logout": "Log Out"
  },
  "home": {
    "hero": "Welcome to our platform",
    "cta": "Get Started"
  },
  "product": {
    "title": "Products",
    "addToCart": "Add to Cart",
    "price": "Price"
  }
}

// locales/fr-FR.json
{
  "common": {
    "welcome": "Bienvenue",
    "login": "Se connecter",
    "logout": "Se déconnecter"
  },
  "home": {
    "hero": "Bienvenue sur notre plateforme",
    "cta": "Commencer"
  },
  "product": {
    "title": "Produits",
    "addToCart": "Ajouter au panier",
    "price": "Prix"
  }
}
```

**2. Lazy Loading with Dynamic Imports:**

```javascript
// i18n/loader.js
class TranslationLoader {
  constructor() {
    this.translations = new Map();
    this.currentLocale = null;
    this.loadingPromises = new Map();
  }

  async loadLocale(locale) {
    // Return cached if available
    if (this.translations.has(locale)) {
      return this.translations.get(locale);
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(locale)) {
      return this.loadingPromises.get(locale);
    }

    // Start loading
    const loadPromise = this._fetchTranslations(locale);
    this.loadingPromises.set(locale, loadPromise);

    try {
      const translations = await loadPromise;
      this.translations.set(locale, translations);
      this.loadingPromises.delete(locale);
      this.currentLocale = locale;
      return translations;
    } catch (error) {
      this.loadingPromises.delete(locale);
      throw error;
    }
  }

  async _fetchTranslations(locale) {
    // Dynamic import (code splitting)
    try {
      const module = await import(`../locales/${locale}.json`);
      return module.default;
    } catch (error) {
      console.error(`Failed to load locale: ${locale}`, error);

      // Fallback to default locale
      if (locale !== 'en-US') {
        return this.loadLocale('en-US');
      }

      throw error;
    }
  }

  // Preload multiple locales
  async preloadLocales(locales) {
    return Promise.all(locales.map(loc => this.loadLocale(loc)));
  }

  // Get translation (sync - must be preloaded)
  t(key, locale = this.currentLocale) {
    const translations = this.translations.get(locale);

    if (!translations) {
      console.warn(`Locale not loaded: ${locale}`);
      return key;
    }

    // Support nested keys: "common.welcome"
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation missing: ${key} for locale ${locale}`);
        return key;
      }
    }

    return value;
  }
}

export const i18n = new TranslationLoader();

// Usage
async function changeLanguage(locale) {
  showLoadingSpinner();
  try {
    await i18n.loadLocale(locale);
    updateUI();
  } catch (error) {
    showError('Failed to load language');
  } finally {
    hideLoadingSpinner();
  }
}
```

**3. Code Splitting by Route (Next.js):**

```javascript
// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'en-US',
    locales: ['en-US', 'fr-FR', 'de-DE', 'es-ES'],
  },
  // Namespace per page
  ns: ['common', 'footer', 'header'],
  defaultNS: 'common',
  // Only load namespaces for current page
  react: {
    useSuspense: false,
  },
  // Lazy load namespaces
  partialBundledLanguages: true,
};

// pages/index.js
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export default function Home() {
  const { t } = useTranslation(['common', 'home']);

  return (
    <div>
      <h1>{t('home:hero')}</h1>
      <button>{t('common:login')}</button>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      // Only load namespaces needed for this page
      ...(await serverSideTranslations(locale, ['common', 'home'])),
    },
  };
}

// pages/products/[id].js
export async function getStaticProps({ locale }) {
  return {
    props: {
      // Different namespaces for this page
      ...(await serverSideTranslations(locale, ['common', 'product'])),
    },
  };
}
```

**4. React Suspense for Loading States:**

```javascript
import React, { Suspense, lazy } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// Lazy load translation provider
const LazyTranslationProvider = lazy(() => import('./TranslationProvider'));

function App() {
  const [locale, setLocale] = React.useState('en-US');

  React.useEffect(() => {
    // Load translations for current locale
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <I18nextProvider i18n={i18n}>
        <div>
          <LanguageSwitcher onLocaleChange={setLocale} />
          <AppContent />
        </div>
      </I18nextProvider>
    </Suspense>
  );
}

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading translations...</p>
    </div>
  );
}
```

**5. Namespace-based Code Splitting:**

```javascript
// Split translations into namespaces
// locales/en-US/common.json
{
  "welcome": "Welcome",
  "login": "Log In"
}

// locales/en-US/product.json
{
  "title": "Products",
  "addToCart": "Add to Cart"
}

// locales/en-US/checkout.json
{
  "payment": "Payment",
  "confirm": "Confirm Order"
}

// Advanced loader with namespace support
class NamespacedTranslationLoader {
  constructor() {
    this.cache = new Map(); // locale:namespace -> translations
  }

  getCacheKey(locale, namespace) {
    return `${locale}:${namespace}`;
  }

  async loadNamespace(locale, namespace) {
    const cacheKey = this.getCacheKey(locale, namespace);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Dynamic import with namespace
      const module = await import(`../locales/${locale}/${namespace}.json`);
      const translations = module.default;

      this.cache.set(cacheKey, translations);
      return translations;
    } catch (error) {
      console.error(`Failed to load ${namespace} for ${locale}`, error);
      throw error;
    }
  }

  async loadNamespaces(locale, namespaces) {
    // Load multiple namespaces in parallel
    const promises = namespaces.map(ns => this.loadNamespace(locale, ns));
    const results = await Promise.all(promises);

    // Merge namespaces
    return namespaces.reduce((acc, ns, index) => {
      acc[ns] = results[index];
      return acc;
    }, {});
  }

  t(namespace, key, locale) {
    const cacheKey = this.getCacheKey(locale, namespace);
    const translations = this.cache.get(cacheKey);

    if (!translations) {
      console.warn(`Namespace not loaded: ${namespace} for ${locale}`);
      return key;
    }

    const value = translations[key];
    if (!value) {
      console.warn(`Translation missing: ${namespace}.${key} for ${locale}`);
      return key;
    }

    return value;
  }
}

export const i18n = new NamespacedTranslationLoader();

// Usage in components
async function ProductPage({ locale }) {
  // Only load namespaces needed for this page
  await i18n.loadNamespaces(locale, ['common', 'product']);

  return (
    <div>
      <h1>{i18n.t('product', 'title', locale)}</h1>
      <button>{i18n.t('product', 'addToCart', locale)}</button>
    </div>
  );
}
```

**6. Caching Strategy with Service Worker:**

```javascript
// service-worker.js
const CACHE_NAME = 'translations-v1';
const TRANSLATION_URLS = [
  '/locales/en-US.json',
  '/locales/fr-FR.json',
  '/locales/de-DE.json',
  '/locales/es-ES.json',
];

// Install: Preload default locale
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Only cache default locale on install
      return cache.add('/locales/en-US.json');
    })
  );
});

// Fetch: Cache-first strategy for translations
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle translation requests
  if (url.pathname.startsWith('/locales/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached, update in background
          event.waitUntil(updateCache(event.request));
          return cachedResponse;
        }

        // Fetch and cache
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});

async function updateCache(request) {
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response);
  }
}
```

**7. Progressive Loading (Critical First):**

```javascript
// Load critical translations immediately, lazy load rest
class ProgressiveTranslationLoader {
  constructor() {
    this.cache = new Map();
    this.criticalKeys = new Set([
      'common.welcome',
      'common.login',
      'common.logout',
      'common.loading',
      'common.error'
    ]);
  }

  async loadCritical(locale) {
    // Load only critical translations
    const fullTranslations = await this.loadFull(locale);
    const critical = this.extractCritical(fullTranslations);

    this.cache.set(`${locale}:critical`, critical);
    return critical;
  }

  async loadFull(locale) {
    if (this.cache.has(`${locale}:full`)) {
      return this.cache.get(`${locale}:full`);
    }

    const translations = await import(`../locales/${locale}.json`);
    this.cache.set(`${locale}:full`, translations.default);
    return translations.default;
  }

  extractCritical(translations) {
    const critical = {};

    for (const key of this.criticalKeys) {
      const [namespace, prop] = key.split('.');
      if (!critical[namespace]) critical[namespace] = {};
      critical[namespace][prop] = translations[namespace]?.[prop];
    }

    return critical;
  }

  // Get translation with progressive enhancement
  t(key, locale) {
    const [namespace, prop] = key.split('.');

    // Try full translations first
    const full = this.cache.get(`${locale}:full`);
    if (full?.[namespace]?.[prop]) {
      return full[namespace][prop];
    }

    // Fallback to critical
    const critical = this.cache.get(`${locale}:critical`);
    if (critical?.[namespace]?.[prop]) {
      return critical[namespace][prop];
    }

    return key;
  }
}

// Usage: Load critical first, full in background
const i18n = new ProgressiveTranslationLoader();

async function initializeApp(locale) {
  // 1. Load critical translations (fast - ~5KB)
  const critical = await i18n.loadCritical(locale);
  renderApp(critical); // Render immediately with critical translations

  // 2. Load full translations in background (~50KB)
  i18n.loadFull(locale).then(() => {
    console.log('Full translations loaded');
    // Update UI if needed
  });
}
```

**8. Webpack Configuration for Code Splitting:**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.json$/,
        type: 'javascript/auto',
        loader: 'json-loader',
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        // Split each locale into separate chunk
        translations: {
          test: /[\\/]locales[\\/]/,
          name(module) {
            // Extract locale from path: locales/en-US.json
            const match = module.context.match(/locales[\\/](.*?)\.json/);
            return match ? `locale-${match[1]}` : 'locale-unknown';
          },
          chunks: 'async',
          priority: 10,
        },
      },
    },
  },
};

// This generates:
// - locale-en-US.chunk.js (~20KB)
// - locale-fr-FR.chunk.js (~20KB)
// - locale-de-DE.chunk.js (~20KB)
// Each loaded on-demand when language changes
```

**9. Preloading Strategy:**

```javascript
// Intelligent preloading based on user behavior
class SmartTranslationPreloader {
  constructor(loader) {
    this.loader = loader;
    this.preloadQueue = [];
    this.idleCallbackId = null;
  }

  // Preload during browser idle time
  preloadDuringIdle(locales) {
    this.preloadQueue = [...locales];

    if ('requestIdleCallback' in window) {
      this.scheduleIdlePreload();
    } else {
      // Fallback: Use setTimeout
      setTimeout(() => this.preloadNext(), 1000);
    }
  }

  scheduleIdlePreload() {
    this.idleCallbackId = requestIdleCallback(
      (deadline) => {
        while (deadline.timeRemaining() > 0 && this.preloadQueue.length > 0) {
          const locale = this.preloadQueue.shift();
          this.loader.loadLocale(locale);
        }

        if (this.preloadQueue.length > 0) {
          this.scheduleIdlePreload();
        }
      },
      { timeout: 2000 }
    );
  }

  preloadNext() {
    if (this.preloadQueue.length === 0) return;

    const locale = this.preloadQueue.shift();
    this.loader.loadLocale(locale).then(() => {
      if (this.preloadQueue.length > 0) {
        setTimeout(() => this.preloadNext(), 500);
      }
    });
  }

  // Preload on link hover (anticipate language change)
  setupHoverPreload() {
    document.querySelectorAll('[data-locale]').forEach(link => {
      let timeout;

      link.addEventListener('mouseenter', () => {
        const locale = link.dataset.locale;
        timeout = setTimeout(() => {
          this.loader.loadLocale(locale);
        }, 100); // Preload after 100ms hover
      });

      link.addEventListener('mouseleave', () => {
        clearTimeout(timeout);
      });
    });
  }

  // Preload based on user preferences
  async preloadByPreference() {
    // Check browser languages
    const browserLocales = navigator.languages || [navigator.language];

    // Filter to supported locales
    const supported = this.getSupportedLocales();
    const toPreload = browserLocales.filter(loc =>
      supported.some(s => s.startsWith(loc.split('-')[0]))
    );

    // Preload during idle
    this.preloadDuringIdle(toPreload);
  }

  getSupportedLocales() {
    return ['en-US', 'fr-FR', 'de-DE', 'es-ES', 'ja-JP'];
  }
}

// Usage
const preloader = new SmartTranslationPreloader(i18n);

// Preload on page load (idle time)
window.addEventListener('load', () => {
  preloader.preloadByPreference();
});

// Preload on hover
preloader.setupHoverPreload();
```

<details>
<summary><strong>🔍 Deep Dive: Translation Bundle Optimization Techniques</strong></summary>

**1. Bundle Size Analysis:**

```javascript
// Analyze translation file sizes
const fs = require('fs');
const path = require('path');

function analyzeTranslations(localesDir) {
  const locales = fs.readdirSync(localesDir);
  const analysis = {};

  locales.forEach(locale => {
    const filePath = path.join(localesDir, locale);
    const stats = fs.statSync(filePath);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const keys = countKeys(content);

    analysis[locale] = {
      size: stats.size,
      sizeKB: (stats.size / 1024).toFixed(2),
      keys: keys,
      avgBytesPerKey: (stats.size / keys).toFixed(2)
    };
  });

  return analysis;
}

function countKeys(obj, prefix = '') {
  let count = 0;

  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      count += countKeys(obj[key], `${prefix}${key}.`);
    } else {
      count++;
    }
  }

  return count;
}

// Example output:
const analysis = analyzeTranslations('./locales');
console.log(analysis);
/*
{
  'en-US.json': { size: 52341, sizeKB: '51.11', keys: 847, avgBytesPerKey: '61.79' },
  'fr-FR.json': { size: 58923, sizeKB: '57.54', keys: 847, avgBytesPerKey: '69.56' },
  'de-DE.json': { size: 61234, sizeKB: '59.80', keys: 847, avgBytesPerKey: '72.30' },
  'ja-JP.json': { size: 73456, sizeKB: '71.73', keys: 847, avgBytesPerKey: '86.73' }
}

// Insights:
// - Japanese translations are 40% larger (multi-byte chars)
// - Consider splitting large files (>50KB)
// - Namespace splitting recommended
*/
```

**2. Compression Strategies:**

```javascript
// Server-side: Enable gzip/brotli for JSON
// Express.js example
const compression = require('compression');
const express = require('express');

const app = express();

// Enable compression for all responses
app.use(compression({
  filter: (req, res) => {
    // Compress JSON translation files
    if (req.url.startsWith('/locales/')) {
      return true;
    }
    return compression.filter(req, res);
  },
  level: 9, // Maximum compression
}));

// Serve translations
app.use('/locales', express.static('locales', {
  maxAge: '1y', // Cache for 1 year
  setHeaders: (res, path) => {
    // Set proper headers for caching
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
}));

// Benchmark compression:
// Original: 52KB (en-US.json)
// Gzip: 12KB (77% reduction)
// Brotli: 9KB (83% reduction) ✅ Best
```

**3. Tree Shaking Unused Translations:**

```javascript
// Build-time optimization: Remove unused keys
const fs = require('fs');
const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;

function findUsedTranslationKeys(sourceDir) {
  const usedKeys = new Set();

  // Parse all source files
  const files = getAllFiles(sourceDir, '.js');

  files.forEach(file => {
    const code = fs.readFileSync(file, 'utf-8');
    const ast = babel.parseSync(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    // Find t('key') calls
    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;

        // Match: t('common.welcome')
        if (callee.name === 't' || callee.property?.name === 't') {
          const firstArg = path.node.arguments[0];
          if (firstArg && firstArg.type === 'StringLiteral') {
            usedKeys.add(firstArg.value);
          }
        }

        // Match: useTranslation(['common', 'home'])
        if (callee.name === 'useTranslation') {
          const firstArg = path.node.arguments[0];
          if (firstArg && firstArg.type === 'ArrayExpression') {
            firstArg.elements.forEach(el => {
              if (el.type === 'StringLiteral') {
                usedKeys.add(el.value);
              }
            });
          }
        }
      }
    });
  });

  return usedKeys;
}

function removeUnusedKeys(translations, usedKeys) {
  const optimized = {};

  for (const key of usedKeys) {
    const parts = key.split('.');
    let source = translations;
    let target = optimized;

    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        target[part] = source[part];
      } else {
        if (!target[part]) target[part] = {};
        target = target[part];
        source = source[part];
      }
    });
  }

  return optimized;
}

// Usage in build script
const usedKeys = findUsedTranslationKeys('./src');
const fullTranslations = require('./locales/en-US.json');
const optimized = removeUnusedKeys(fullTranslations, usedKeys);

console.log('Original keys:', countKeys(fullTranslations)); // 847
console.log('Used keys:', usedKeys.size); // 423
console.log('Removed:', 847 - 423); // 424 (50% reduction!)

// Write optimized file
fs.writeFileSync(
  './dist/locales/en-US.json',
  JSON.stringify(optimized, null, 2)
);
```

**4. Differential Loading (Only Load Changes):**

```javascript
// Load only translation differences from base locale
class DifferentialTranslationLoader {
  constructor(baseLocale = 'en-US') {
    this.baseLocale = baseLocale;
    this.baseTranslations = null;
    this.localeOverrides = new Map();
  }

  async loadBase() {
    if (!this.baseTranslations) {
      this.baseTranslations = await import(`../locales/${this.baseLocale}.json`);
    }
    return this.baseTranslations;
  }

  async loadLocale(locale) {
    if (locale === this.baseLocale) {
      return this.loadBase();
    }

    // Load base first
    const base = await this.loadBase();

    // Load only differences
    const diff = await this.loadDiff(locale);

    // Merge base + diff
    return this.merge(base, diff);
  }

  async loadDiff(locale) {
    if (this.localeOverrides.has(locale)) {
      return this.localeOverrides.get(locale);
    }

    try {
      // Load diff file (only changed keys)
      const diff = await import(`../locales/diffs/${locale}.diff.json`);
      this.localeOverrides.set(locale, diff.default);
      return diff.default;
    } catch {
      console.warn(`No diff file for ${locale}, loading full`);
      return import(`../locales/${locale}.json`);
    }
  }

  merge(base, diff) {
    return this.deepMerge(base, diff);
  }

  deepMerge(target, source) {
    const output = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object') {
        output[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }

    return output;
  }
}

// Build script to generate diff files:
function generateDiff(base, target) {
  const diff = {};

  function findDifferences(baseObj, targetObj, path = '') {
    for (const key in targetObj) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof targetObj[key] === 'object') {
        findDifferences(baseObj[key] || {}, targetObj[key], currentPath);
      } else {
        // Only include if different from base
        if (baseObj[key] !== targetObj[key]) {
          setNestedValue(diff, currentPath, targetObj[key]);
        }
      }
    }
  }

  function setNestedValue(obj, path, value) {
    const parts = path.split('.');
    let current = obj;

    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        current[part] = value;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  }

  findDifferences(base, target);
  return diff;
}

// Example:
const enUS = require('./locales/en-US.json');
const frFR = require('./locales/fr-FR.json');

const diff = generateDiff(enUS, frFR);
fs.writeFileSync('./locales/diffs/fr-FR.diff.json', JSON.stringify(diff));

// Result:
// en-US.json: 52KB (full)
// fr-FR.diff.json: 48KB (only different keys - ~8% savings)
// Good for minor regional variants (en-US vs en-GB)
```

**5. Runtime Performance Optimization:**

```javascript
// Memoize translation lookups
class MemoizedTranslationLoader {
  constructor() {
    this.translations = new Map();
    this.lookupCache = new Map(); // locale:key -> value
    this.cacheStats = {
      hits: 0,
      misses: 0
    };
  }

  t(key, locale) {
    const cacheKey = `${locale}:${key}`;

    // Check cache first
    if (this.lookupCache.has(cacheKey)) {
      this.cacheStats.hits++;
      return this.lookupCache.get(cacheKey);
    }

    this.cacheStats.misses++;

    // Lookup translation
    const value = this.lookup(key, locale);

    // Cache result
    this.lookupCache.set(cacheKey, value);

    return value;
  }

  lookup(key, locale) {
    const translations = this.translations.get(locale);
    if (!translations) return key;

    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }

    return value;
  }

  getCacheEfficiency() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = (this.cacheStats.hits / total * 100).toFixed(2);
    return {
      ...this.cacheStats,
      total,
      hitRate: `${hitRate}%`
    };
  }
}

// Benchmark:
const i18n = new MemoizedTranslationLoader();

console.time('Without cache');
for (let i = 0; i < 10000; i++) {
  i18n.lookup('common.welcome', 'en-US');
}
console.timeEnd('Without cache'); // ~45ms

console.time('With cache');
for (let i = 0; i < 10000; i++) {
  i18n.t('common.welcome', 'en-US');
}
console.timeEnd('With cache'); // ~8ms (5.6x faster!)

console.log(i18n.getCacheEfficiency());
// { hits: 9999, misses: 1, total: 10000, hitRate: '99.99%' }
```

**6. HTTP/2 Server Push for Translations:**

```javascript
// Node.js HTTP/2 server
const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
});

server.on('stream', (stream, headers) => {
  const path = headers[':path'];

  if (path === '/') {
    // Detect user's preferred locale
    const acceptLanguage = headers['accept-language'];
    const locale = parseAcceptLanguage(acceptLanguage);

    // Push translation file before it's requested!
    stream.pushStream({ ':path': `/locales/${locale}.json` }, (err, pushStream) => {
      if (err) {
        console.error('Push stream error:', err);
        return;
      }

      const translation = fs.readFileSync(`./locales/${locale}.json`);

      pushStream.respond({
        ':status': 200,
        'content-type': 'application/json',
        'cache-control': 'public, max-age=31536000'
      });

      pushStream.end(translation);
    });

    // Serve main HTML
    stream.respond({ ':status': 200 });
    stream.end('<html>...</html>');
  }
});

// Result: Translation file arrives BEFORE JavaScript requests it!
// Saves 1 RTT (round-trip time) - ~50-100ms improvement
```

**7. IndexedDB for Offline Caching:**

```javascript
// Store translations in IndexedDB for offline access
class IndexedDBTranslationCache {
  constructor(dbName = 'translations', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store
        if (!db.objectStoreNames.contains('locales')) {
          const store = db.createObjectStore('locales', { keyPath: 'locale' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async get(locale) {
    const db = await this.ensureOpen();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('locales', 'readonly');
      const store = tx.objectStore('locales');
      const request = store.get(locale);

      request.onsuccess = () => resolve(request.result?.data);
      request.onerror = () => reject(request.error);
    });
  }

  async set(locale, data) {
    const db = await this.ensureOpen();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('locales', 'readwrite');
      const store = tx.objectStore('locales');

      const record = {
        locale,
        data,
        timestamp: Date.now()
      };

      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async ensureOpen() {
    if (!this.db) {
      await this.open();
    }
    return this.db;
  }

  // Load with cache fallback
  async loadLocale(locale, fetchFn) {
    // Try cache first
    const cached = await this.get(locale);

    if (cached) {
      console.log(`Loaded ${locale} from IndexedDB cache`);

      // Update in background
      fetchFn(locale).then(data => this.set(locale, data));

      return cached;
    }

    // Fetch and cache
    const data = await fetchFn(locale);
    await this.set(locale, data);

    return data;
  }
}

// Usage
const cache = new IndexedDBTranslationCache();

async function loadTranslations(locale) {
  return cache.loadLocale(locale, async (loc) => {
    const response = await fetch(`/locales/${loc}.json`);
    return response.json();
  });
}

// Benefits:
// - Works offline
// - Faster than network (0.5ms vs 50-200ms)
// - No size limits (unlike localStorage 5MB limit)
// - Can store 50+ locales easily
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Optimizing Translation Loading Performance</strong></summary>

**Scenario:** Your SaaS platform supports 30 languages. Users complain about "slow initial load" and "laggy language switching." Your Lighthouse performance score drops from 95 to 62 after adding internationalization. Bundle size increased from 250KB to 2.1MB.

**Production Metrics (Before Fix):**
- Bundle size: 2.1MB (translation files)
- Initial load time: 4.8s
- LCP (Largest Contentful Paint): 3.2s
- TTI (Time to Interactive): 5.1s
- Language switch time: 1.2s (UI freeze)
- Lighthouse score: 62/100
- Bounce rate: 38%
- User complaints: 80/day

**The Problem Code:**

```javascript
// ❌ BAD: Loading ALL locales upfront
import enUS from './locales/en-US.json';  // 52KB
import frFR from './locales/fr-FR.json';  // 59KB
import deDE from './locales/de-DE.json';  // 61KB
import esES from './locales/es-ES.json';  // 58KB
// ... 26 more locales! (Total: ~1.8MB uncompressed)

const translations = {
  'en-US': enUS,
  'fr-FR': frFR,
  'de-DE': deDE,
  'es-ES': esES,
  // ... all 30 locales loaded immediately
};

// Main bundle includes ALL translations!
// Even if user only uses English
```

**Debugging Process:**

**Step 1: Analyze Bundle Composition**

```javascript
// webpack-bundle-analyzer output:

/*
dist/main.js (2.3MB total)
├── src/ (300KB)
├── node_modules/ (200KB)
└── locales/ (1.8MB) ⚠️ 78% of bundle!
    ├── en-US.json (52KB)
    ├── fr-FR.json (59KB)
    ├── de-DE.json (61KB)
    ├── es-ES.json (58KB)
    └── ... 26 more
*/

// Insight: Translations dominate bundle size
// Only 10-15% of users change language from default
// We're loading 29 unused locales for 90% of users!
```

**Step 2: Implement Code Splitting**

```javascript
// ✅ FIXED: Lazy load translations
class LazyTranslationLoader {
  constructor(defaultLocale = 'en-US') {
    this.defaultLocale = defaultLocale;
    this.loaded = new Map();
    this.currentLocale = defaultLocale;
  }

  async loadLocale(locale) {
    // Return cached if available
    if (this.loaded.has(locale)) {
      return this.loaded.get(locale);
    }

    // Dynamic import (creates separate chunk)
    const module = await import(
      /* webpackChunkName: "locale-[request]" */
      `./locales/${locale}.json`
    );

    this.loaded.set(locale, module.default);
    this.currentLocale = locale;

    return module.default;
  }

  t(key, locale = this.currentLocale) {
    const translations = this.loaded.get(locale);

    if (!translations) {
      console.warn(`Locale not loaded: ${locale}`);
      return key;
    }

    return this.lookup(key, translations);
  }

  lookup(key, translations) {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }

    return value;
  }
}

// Now webpack creates separate chunks:
// - main.js (500KB - 78% reduction!) ✅
// - locale-en-US.chunk.js (52KB)
// - locale-fr-FR.chunk.js (59KB)
// - locale-de-DE.chunk.js (61KB)
// - ... (loaded on-demand)
```

**Step 3: Implement Namespace Splitting**

```javascript
// Split large translation files into namespaces

// Before: en-US.json (52KB single file)
// After:
// - en-US/common.json (8KB)
// - en-US/home.json (5KB)
// - en-US/product.json (12KB)
// - en-US/checkout.json (10KB)
// - en-US/dashboard.json (17KB)

class NamespacedLoader {
  constructor() {
    this.cache = new Map();
  }

  async loadNamespace(locale, namespace) {
    const key = `${locale}:${namespace}`;

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    try {
      const module = await import(
        /* webpackChunkName: "locale-[request]" */
        `./locales/${locale}/${namespace}.json`
      );

      this.cache.set(key, module.default);
      return module.default;
    } catch (error) {
      console.error(`Failed to load ${namespace} for ${locale}`, error);

      // Fallback to default locale
      if (locale !== 'en-US') {
        return this.loadNamespace('en-US', namespace);
      }

      throw error;
    }
  }

  async loadNamespaces(locale, namespaces) {
    const promises = namespaces.map(ns => this.loadNamespace(locale, ns));
    const results = await Promise.all(promises);

    return namespaces.reduce((acc, ns, i) => {
      acc[ns] = results[i];
      return acc;
    }, {});
  }

  t(namespace, key, locale) {
    const cacheKey = `${locale}:${namespace}`;
    const translations = this.cache.get(cacheKey);

    return translations?.[key] || key;
  }
}

// Usage in pages
async function HomePage({ locale }) {
  // Only load namespaces needed for home page
  await loader.loadNamespaces(locale, ['common', 'home']);

  // Initial load: 8KB + 5KB = 13KB (vs 52KB before!)
  return <HomePageContent />;
}

async function CheckoutPage({ locale }) {
  // Only load checkout namespace
  await loader.loadNamespaces(locale, ['common', 'checkout']);

  // Load: 8KB + 10KB = 18KB
  return <CheckoutContent />;
}
```

**Step 4: Preload Critical Namespaces**

```javascript
// ✅ Progressive loading strategy
class ProgressiveLoader {
  constructor() {
    this.loader = new NamespacedLoader();
    this.criticalNamespaces = ['common'];
  }

  async initialize(locale) {
    // 1. Load critical namespace immediately (fast)
    await this.loader.loadNamespaces(locale, this.criticalNamespaces);

    // 2. Render app with critical translations
    renderApp();

    // 3. Preload other namespaces in background (idle)
    this.preloadInBackground(locale);
  }

  preloadInBackground(locale) {
    const allNamespaces = ['home', 'product', 'checkout', 'dashboard'];

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loader.loadNamespaces(locale, allNamespaces);
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        this.loader.loadNamespaces(locale, allNamespaces);
      }, 1000);
    }
  }
}

// App loads in stages:
// 1. Load critical (common) - 8KB - 0.2s ✅
// 2. Render app (interactive immediately)
// 3. Load rest in background - 44KB - during idle time
```

**Step 5: Enable Compression & Caching**

```javascript
// Server configuration (Express)
const express = require('express');
const compression = require('compression');
const app = express();

// Enable Brotli/Gzip compression
app.use(compression({
  level: 9,
  threshold: 0
}));

// Serve translations with aggressive caching
app.use('/locales', express.static('locales', {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Vary', 'Accept-Encoding');
  }
}));

// Add ETag for cache validation
app.set('etag', 'strong');

// Results:
// - en-US/common.json (8KB uncompressed)
// - en-US/common.json (1.8KB with Brotli) ✅ 77% reduction
// - Cached on subsequent visits (0 bytes transferred)
```

**Production Metrics (After Fix):**

```javascript
// BEFORE FIX:
// - Bundle size: 2.1MB (all locales)
// - Initial load: 4.8s
// - LCP: 3.2s
// - TTI: 5.1s
// - Language switch: 1.2s
// - Lighthouse: 62/100
// - Bounce rate: 38%

// AFTER FIX:
// - Bundle size: 500KB (no locales in main bundle) ✅
// - Initial load: 1.8s (62% faster) ✅
// - LCP: 1.1s (66% faster) ✅
// - TTI: 2.0s (61% faster) ✅
// - Language switch: 0.3s (75% faster) ✅
// - Lighthouse: 94/100 ✅
// - Bounce rate: 12% (68% improvement) ✅

// Translation Loading Breakdown:
// - Critical namespace (common): 1.8KB (Brotli) - 0.05s
// - Page namespace (home): 1.2KB (Brotli) - 0.04s
// - Background preload: 10KB total - during idle
// - Cache hit (subsequent visits): 0 bytes - 0.001s

// Additional Benefits:
// - 76% reduction in main bundle size
// - 80% faster initial render
// - Works offline (with service worker cache)
// - Scalable to 100+ locales without performance hit
// - User satisfaction: +142%
// - SEO improvement: +28 ranking positions
```

**Key Lessons:**

```javascript
// ❌ NEVER bundle all translations
import * as translations from './locales/*';

// ✅ ALWAYS lazy load
const translations = await import(`./locales/${locale}.json`);

// ❌ NEVER load entire translation file per page
await loadAll(locale); // Loads 52KB for every page

// ✅ ALWAYS split by namespace
await loadNamespaces(locale, ['common', 'home']); // Loads 13KB

// ❌ NEVER block render on full translations
await loadFullTranslations();
render(); // User waits 1.2s

// ✅ ALWAYS load critical first, rest in background
await loadCritical();
render(); // User sees content immediately (0.2s)
loadRest(); // Background loading
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Translation Loading Strategies</strong></summary>

| Strategy | Bundle Size | Initial Load | Lang Switch | Complexity | Best For |
|----------|-------------|--------------|-------------|------------|----------|
| **Eager (All)** | Large (2MB+) | Slow (5s+) | Instant | Low | Tiny apps (<3 locales) |
| **Lazy (On-demand)** | Small (500KB) | Fast (1.5s) | Slow (1s) | Medium | Most apps |
| **Code Split (Route)** | Minimal (300KB) | Very Fast (1s) | Medium (0.5s) | High | Large apps |
| **Hybrid (Critical + Lazy)** | Small (500KB) | Very Fast (0.8s) | Fast (0.3s) | High | Enterprise ✅ |
| **Namespace Split** | Minimal (200KB) | Fastest (0.6s) | Fast (0.2s) | Very High | Complex apps |

**Detailed Comparison:**

```javascript
// App with 30 locales, 50KB each = 1.5MB total

// Strategy 1: Eager (bundle all)
// - Bundle: 1.5MB (main.js includes all locales)
// - Initial: Download 1.5MB → Parse → Render (5-8s)
// - Switch: Instant (already loaded)
// - Use case: Rare, only if <3 locales and frequently switch

// Strategy 2: Lazy (load on-demand)
// - Bundle: 50KB (only default locale initially)
// - Initial: Download 50KB → Parse → Render (1-2s)
// - Switch: Fetch locale → Parse → Update (1-1.5s)
// - Use case: Most common, good balance

// Strategy 3: Code Split (per route)
// - Bundle: 30KB (main) + 8KB (home/common)
// - Initial: Download 38KB → Parse → Render (0.8-1s)
// - Switch: Fetch locale namespace → Update (0.5-0.8s)
// - Use case: Large apps with route-based content

// Strategy 4: Hybrid (critical + lazy)
// - Bundle: 30KB (main) + 5KB (critical)
// - Initial: Download 35KB → Parse → Render (0.6-0.8s)
//           Then load rest in background
// - Switch: Fetch namespace → Update (0.3-0.5s)
// - Use case: Best overall, recommended ✅

// Strategy 5: Namespace Split
// - Bundle: 30KB (main) + 3KB (critical common)
// - Initial: Download 33KB → Parse → Render (0.5-0.7s)
//           Load page namespace (5KB) on route change
// - Switch: Fetch namespace → Update (0.2-0.3s)
// - Use case: Enterprise apps, ultimate performance
```

**Caching Strategy Impact:**

```javascript
// No caching:
// - Every visit: Full download (50KB)
// - Language switch: Full download (50KB)

// With Service Worker cache:
// - First visit: Download (50KB)
// - Subsequent visits: Cache (0.1KB, validation only)
// - Language switch: Download if new, cache if used before

// With IndexedDB:
// - First visit: Download + Store (50KB)
// - Subsequent visits: IndexedDB read (0.5ms vs 200ms network!)
// - Offline: Works perfectly

// Recommendation: Service Worker + IndexedDB
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Translation Loading</strong></summary>

**Simple Explanation:**

Imagine you have a library with 30 language books (English, French, German, etc.).

**Bad approach:** Carry ALL 30 books in your backpack everywhere you go
- **Heavy!** (your backpack weighs 50 pounds)
- **Slow!** (takes 5 minutes to put on backpack)
- **Wasteful!** (you only read 1 book at a time)

**Good approach:** Take only the book you need right now
- **Light!** (backpack weighs 2 pounds)
- **Fast!** (takes 10 seconds to grab a book)
- **Smart!** (grab a different book when you switch languages)

**Analogy for PM:**

"Translation loading is like Netflix downloads:

- **Bad:** Download ALL movies before watching anything (500GB! Takes hours!)
- **Good:** Download only what you're watching right now (2GB, starts in 30 seconds)

We lazy load translations the same way - download only the language user needs, when they need it!"

**Visual Example:**

```javascript
// ❌ BAD: Load everything upfront
const allBooks = [
  englishBook,     // 50KB
  frenchBook,      // 50KB
  germanBook,      // 50KB
  // ... 27 more books
];
// Total: 1.5MB loaded, but user only needs English!

// ✅ GOOD: Load on-demand
let currentBook = null;

function switchLanguage(language) {
  currentBook = await loadBook(language); // Load 50KB only when needed
}

switchLanguage('english'); // Loads 50KB
// User happy! App loads fast! ✅
```

**Progressive Loading (Even Smarter):**

```javascript
// Like reading a book:
// 1. First, load the table of contents (critical - 2KB)
// 2. Start reading immediately! ✅
// 3. Load chapters in background while you read (lazy - 48KB)

// Step 1: Load critical (fast!)
const critical = await loadCritical(); // 2KB, 0.1s
showApp(); // User sees app immediately!

// Step 2: Load rest in background
loadFullBook(); // 48KB, loads while user interacts
```

**Real Example:**

```javascript
// Your app:
// - Homepage: Needs "Welcome", "Login", "Sign Up" (8KB)
// - Product page: Needs "Add to Cart", "Price", etc. (12KB)
// - Checkout: Needs "Payment", "Confirm" (10KB)

// Smart loading:
// 1. On homepage: Load 8KB only
// 2. On product page: Load 12KB (when user clicks)
// 3. On checkout: Load 10KB (when user starts checkout)

// Total loaded: Only what's needed (8-30KB)
// vs. Loading everything upfront (50KB)
// 62% faster! ✅
```

</details>

### Resources

- [MDN: Dynamic Imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports)
- [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [next-i18next](https://github.com/i18next/next-i18next)
- [React i18next](https://react.i18next.com/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---
