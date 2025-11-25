# Internationalization - Locale Management

> **Focus**: Managing language codes, region codes, and fallback mechanisms

---

## Question 1: How do you manage locales (language and region codes) in a web application?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Amazon, Airbnb, Stripe

### Question
Explain locale management strategies including language/region codes, fallback mechanisms, and best practices.

### Answer

**Locale** = Language + Region (e.g., `en-US`, `fr-FR`, `zh-CN`)

**Core Components:**
1. **Language Code**: ISO 639-1 (2-letter) or 639-2 (3-letter)
2. **Region Code**: ISO 3166-1 alpha-2 (2-letter country code)
3. **Script** (optional): ISO 15924 (e.g., `zh-Hans-CN` for Simplified Chinese)

**Common Patterns:**
- `en-US` - English (United States)
- `en-GB` - English (United Kingdom)
- `fr-FR` - French (France)
- `es-MX` - Spanish (Mexico)
- `zh-CN` - Chinese (China - Simplified)
- `zh-TW` - Chinese (Taiwan - Traditional)

### Code Example

**1. Basic Locale Detection:**

```javascript
// Detect user's preferred locale
function detectUserLocale() {
  // Priority order:
  // 1. URL parameter (?lang=fr-FR)
  // 2. localStorage/cookie
  // 3. Browser navigator
  // 4. Default fallback

  const urlParams = new URLSearchParams(window.location.search);
  const urlLocale = urlParams.get('lang');

  const storedLocale = localStorage.getItem('userLocale');

  const browserLocales = navigator.languages || [navigator.language];

  const defaultLocale = 'en-US';

  return urlLocale || storedLocale || browserLocales[0] || defaultLocale;
}

const currentLocale = detectUserLocale();
console.log(currentLocale); // "en-US"
```

**2. Locale Fallback Chain:**

```javascript
// ✅ Robust locale resolver with fallback
class LocaleManager {
  constructor(supportedLocales, defaultLocale = 'en-US') {
    this.supportedLocales = new Set(supportedLocales);
    this.defaultLocale = defaultLocale;
  }

  // Resolve locale with fallback chain
  resolveLocale(requestedLocale) {
    // 1. Try exact match (en-US)
    if (this.supportedLocales.has(requestedLocale)) {
      return requestedLocale;
    }

    // 2. Try language-only fallback (en)
    const languageCode = requestedLocale.split('-')[0];
    const languageMatch = [...this.supportedLocales]
      .find(locale => locale.startsWith(languageCode));

    if (languageMatch) {
      return languageMatch;
    }

    // 3. Try regional variants (en-US → en-GB)
    const regionalVariants = [...this.supportedLocales]
      .filter(locale => locale.startsWith(languageCode + '-'));

    if (regionalVariants.length > 0) {
      return regionalVariants[0]; // Return first regional variant
    }

    // 4. Fallback to default
    return this.defaultLocale;
  }

  // Get all fallback candidates
  getFallbackChain(locale) {
    const chain = [];

    // Add exact locale
    chain.push(locale);

    // Add language-only variant
    const lang = locale.split('-')[0];
    if (lang !== locale) {
      chain.push(lang);
    }

    // Add default locale if not already included
    if (!chain.includes(this.defaultLocale)) {
      chain.push(this.defaultLocale);
    }

    return chain;
  }

  // Parse complex locale strings
  parseLocale(localeString) {
    // Format: language[-script][-region]
    // Example: zh-Hans-CN

    const parts = localeString.split('-');
    const result = {
      language: parts[0].toLowerCase(),
      script: null,
      region: null,
      full: localeString
    };

    if (parts.length === 2) {
      // Could be language-region or language-script
      if (parts[1].length === 2) {
        result.region = parts[1].toUpperCase();
      } else {
        result.script = parts[1];
      }
    } else if (parts.length === 3) {
      result.script = parts[1];
      result.region = parts[2].toUpperCase();
    }

    return result;
  }

  // Normalize locale format
  normalizeLocale(locale) {
    const parsed = this.parseLocale(locale);
    let normalized = parsed.language;

    if (parsed.script) {
      normalized += `-${parsed.script}`;
    }

    if (parsed.region) {
      normalized += `-${parsed.region}`;
    }

    return normalized;
  }
}

// Usage
const manager = new LocaleManager([
  'en-US',
  'en-GB',
  'fr-FR',
  'es-ES',
  'es-MX',
  'zh-CN',
  'zh-TW'
]);

console.log(manager.resolveLocale('en-AU')); // 'en-US' (fallback to first en-*)
console.log(manager.resolveLocale('fr-CA')); // 'fr-FR' (fallback to fr)
console.log(manager.resolveLocale('de-DE')); // 'en-US' (default fallback)
console.log(manager.resolveLocale('es-AR')); // 'es-ES' (first regional variant)

console.log(manager.getFallbackChain('fr-CA'));
// ['fr-CA', 'fr', 'en-US']

console.log(manager.parseLocale('zh-Hans-CN'));
// { language: 'zh', script: 'Hans', region: 'CN', full: 'zh-Hans-CN' }
```

**3. React Implementation:**

```javascript
// React context for locale management
import React, { createContext, useState, useContext, useEffect } from 'react';

const LocaleContext = createContext();

export function LocaleProvider({ children, supportedLocales, defaultLocale = 'en-US' }) {
  const [locale, setLocale] = useState(() => {
    // Initialize from localStorage or browser
    return localStorage.getItem('locale') ||
           navigator.language ||
           defaultLocale;
  });

  const manager = new LocaleManager(supportedLocales, defaultLocale);

  // Resolve and persist locale changes
  const changeLocale = (newLocale) => {
    const resolved = manager.resolveLocale(newLocale);
    setLocale(resolved);
    localStorage.setItem('locale', resolved);

    // Update HTML lang attribute
    document.documentElement.lang = resolved;

    // Update dir for RTL languages
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    const isRTL = rtlLanguages.includes(resolved.split('-')[0]);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  };

  // Set initial HTML attributes
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = {
    locale,
    changeLocale,
    supportedLocales,
    defaultLocale,
    getFallbackChain: (loc) => manager.getFallbackChain(loc)
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

// Usage in components
function LanguageSwitcher() {
  const { locale, changeLocale, supportedLocales } = useLocale();

  return (
    <select value={locale} onChange={(e) => changeLocale(e.target.value)}>
      {Array.from(supportedLocales).map(loc => (
        <option key={loc} value={loc}>
          {new Intl.DisplayNames([locale], { type: 'language' }).of(loc.split('-')[0])}
          {' '}
          ({loc})
        </option>
      ))}
    </select>
  );
}
```

**4. Next.js Implementation:**

```javascript
// next-i18next configuration
// i18n.config.js
module.exports = {
  i18n: {
    defaultLocale: 'en-US',
    locales: ['en-US', 'en-GB', 'fr-FR', 'es-ES', 'de-DE'],
    localeDetection: true, // Auto-detect from Accept-Language header
  },
  fallbackLng: {
    'en-AU': ['en-US'],
    'en-NZ': ['en-GB'],
    'fr-CA': ['fr-FR'],
    'es-MX': ['es-ES'],
    default: ['en-US']
  }
};

// next.config.js
const { i18n } = require('./i18n.config');

module.exports = {
  i18n,
  // Locale-specific domains
  domains: [
    {
      domain: 'example.com',
      defaultLocale: 'en-US',
    },
    {
      domain: 'example.fr',
      defaultLocale: 'fr-FR',
    },
  ],
};

// pages/index.js
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const { locale, locales, defaultLocale } = router;

  const changeLanguage = (newLocale) => {
    router.push(router.pathname, router.asPath, { locale: newLocale });
  };

  return (
    <div>
      <h1>Current Locale: {locale}</h1>
      <select value={locale} onChange={(e) => changeLanguage(e.target.value)}>
        {locales.map(loc => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'footer'])),
    },
  };
}
```

**5. Intl API for Locale-Aware Formatting:**

```javascript
// Format dates, numbers, currencies based on locale
function LocaleAwareFormatting({ locale }) {
  const date = new Date('2024-01-15');
  const number = 123456.789;
  const currency = 1234.56;

  // Date formatting
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Number formatting
  const numberFormatter = new Intl.NumberFormat(locale);

  // Currency formatting
  const currencyMap = {
    'en-US': 'USD',
    'en-GB': 'GBP',
    'fr-FR': 'EUR',
    'ja-JP': 'JPY',
    'zh-CN': 'CNY'
  };

  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyMap[locale] || 'USD'
  });

  console.log(`Date (${locale}):`, dateFormatter.format(date));
  // en-US: "January 15, 2024"
  // fr-FR: "15 janvier 2024"
  // ja-JP: "2024年1月15日"

  console.log(`Number (${locale}):`, numberFormatter.format(number));
  // en-US: "123,456.789"
  // fr-FR: "123 456,789"
  // de-DE: "123.456,789"

  console.log(`Currency (${locale}):`, currencyFormatter.format(currency));
  // en-US: "$1,234.56"
  // en-GB: "£1,234.56"
  // fr-FR: "1 234,56 €"
}

LocaleAwareFormatting({ locale: 'en-US' });
LocaleAwareFormatting({ locale: 'fr-FR' });
LocaleAwareFormatting({ locale: 'de-DE' });
```

<details>
<summary><strong>🔍 Deep Dive: Browser Locale Detection & Standards</strong></summary>

**How Browsers Determine Locale:**

1. **HTTP Accept-Language Header:**
```javascript
// Server-side (Node.js/Express)
app.get('/api/locale', (req, res) => {
  const acceptLanguage = req.headers['accept-language'];
  // Example: "en-US,en;q=0.9,fr;q=0.8,de;q=0.7"

  // Parse quality values (q parameter)
  const locales = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, q = 'q=1.0'] = lang.trim().split(';');
      const quality = parseFloat(q.split('=')[1]) || 1.0;
      return { locale, quality };
    })
    .sort((a, b) => b.quality - a.quality);

  console.log(locales);
  // [
  //   { locale: 'en-US', quality: 1.0 },
  //   { locale: 'en', quality: 0.9 },
  //   { locale: 'fr', quality: 0.8 },
  //   { locale: 'de', quality: 0.7 }
  // ]

  res.json({ preferredLocale: locales[0].locale });
});
```

2. **Navigator API (Client-side):**
```javascript
// Modern approach: navigator.languages (array of preferences)
console.log(navigator.languages);
// ["en-US", "en", "fr-FR", "fr"]

// Legacy: navigator.language (single value)
console.log(navigator.language); // "en-US"

// Some browsers: navigator.userLanguage (IE)
console.log(navigator.userLanguage); // "en-US" (IE only)

// Comprehensive detection
function getBrowserLocales() {
  const languages = navigator.languages ||
                    [navigator.language || navigator.userLanguage];

  return languages.map(lang => normalizeLocale(lang));
}

function normalizeLocale(locale) {
  // Handle various formats: en, en-us, en_US
  return locale
    .replace(/_/g, '-')
    .split('-')
    .map((part, i) => i === 0 ? part.toLowerCase() : part.toUpperCase())
    .join('-');
}

console.log(getBrowserLocales());
// ["en-US", "en-GB", "fr-FR"]
```

3. **Locale Negotiation Algorithm (RFC 4647):**
```javascript
// Implement BCP 47 locale matching
class LocaleNegotiator {
  constructor(supportedLocales) {
    this.supportedLocales = supportedLocales;
  }

  // Basic filtering (lookup)
  basicFilter(requestedLocales) {
    const matches = [];

    for (const requested of requestedLocales) {
      for (const supported of this.supportedLocales) {
        if (this.basicMatch(requested, supported)) {
          matches.push(supported);
        }
      }
    }

    return matches;
  }

  basicMatch(requested, supported) {
    const reqParts = requested.toLowerCase().split('-');
    const supParts = supported.toLowerCase().split('-');

    // Must match language code
    if (reqParts[0] !== supParts[0]) return false;

    // Check additional tags
    for (let i = 1; i < reqParts.length; i++) {
      if (reqParts[i] !== supParts[i]) return false;
    }

    return true;
  }

  // Extended filtering (best fit)
  extendedFilter(requestedLocales) {
    const scoredMatches = [];

    for (const requested of requestedLocales) {
      for (const supported of this.supportedLocales) {
        const score = this.calculateMatchScore(requested, supported);
        if (score > 0) {
          scoredMatches.push({ locale: supported, score });
        }
      }
    }

    // Sort by score (highest first)
    return scoredMatches
      .sort((a, b) => b.score - a.score)
      .map(m => m.locale);
  }

  calculateMatchScore(requested, supported) {
    const reqParts = requested.toLowerCase().split('-');
    const supParts = supported.toLowerCase().split('-');

    let score = 0;

    // Language match (most important)
    if (reqParts[0] === supParts[0]) {
      score += 100;
    } else {
      return 0; // No match if language differs
    }

    // Script match
    if (reqParts.length > 1 && supParts.length > 1) {
      if (reqParts[1] === supParts[1]) {
        score += 50;
      }
    }

    // Region match
    const reqRegion = reqParts[reqParts.length - 1];
    const supRegion = supParts[supParts.length - 1];
    if (reqRegion === supRegion) {
      score += 25;
    }

    return score;
  }

  // Lookup (best single match)
  lookup(requestedLocales) {
    for (const requested of requestedLocales) {
      // Try exact match
      if (this.supportedLocales.includes(requested)) {
        return requested;
      }

      // Try language-only fallback
      const lang = requested.split('-')[0];
      const langMatch = this.supportedLocales.find(s => s.startsWith(lang));
      if (langMatch) return langMatch;
    }

    return this.supportedLocales[0]; // Default fallback
  }
}

// Usage
const negotiator = new LocaleNegotiator([
  'en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'zh-CN'
]);

const userPreferences = ['fr-CA', 'en-AU', 'de'];

console.log(negotiator.basicFilter(userPreferences));
// ['fr-FR', 'de-DE'] (basic match)

console.log(negotiator.extendedFilter(userPreferences));
// ['fr-FR', 'de-DE', 'en-US'] (best-fit match)

console.log(negotiator.lookup(userPreferences));
// 'fr-FR' (best single match)
```

**Unicode CLDR (Common Locale Data Repository):**

```javascript
// CLDR provides standardized locale data
// Used by Intl API internally

// Locale display names
const displayNames = new Intl.DisplayNames(['en-US'], { type: 'language' });
console.log(displayNames.of('fr')); // "French"
console.log(displayNames.of('zh')); // "Chinese"

const regionNames = new Intl.DisplayNames(['en-US'], { type: 'region' });
console.log(regionNames.of('US')); // "United States"
console.log(regionNames.of('FR')); // "France"

// Localized display names
const frenchNames = new Intl.DisplayNames(['fr-FR'], { type: 'language' });
console.log(frenchNames.of('en')); // "anglais"
console.log(frenchNames.of('de')); // "allemand"

// Script names
const scriptNames = new Intl.DisplayNames(['en-US'], { type: 'script' });
console.log(scriptNames.of('Hans')); // "Simplified"
console.log(scriptNames.of('Hant')); // "Traditional"

// Currency names
const currencyNames = new Intl.DisplayNames(['en-US'], { type: 'currency' });
console.log(currencyNames.of('USD')); // "US Dollar"
console.log(currencyNames.of('EUR')); // "Euro"
```

**Locale Data Loading Strategies:**

```javascript
// Strategy 1: Lazy load locale data on demand
class LocaleDataLoader {
  constructor() {
    this.loadedLocales = new Map();
    this.loadingPromises = new Map();
  }

  async loadLocale(locale) {
    // Return cached data if available
    if (this.loadedLocales.has(locale)) {
      return this.loadedLocales.get(locale);
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(locale)) {
      return this.loadingPromises.get(locale);
    }

    // Start loading
    const loadPromise = this._fetchLocaleData(locale);
    this.loadingPromises.set(locale, loadPromise);

    try {
      const data = await loadPromise;
      this.loadedLocales.set(locale, data);
      this.loadingPromises.delete(locale);
      return data;
    } catch (error) {
      this.loadingPromises.delete(locale);
      throw error;
    }
  }

  async _fetchLocaleData(locale) {
    // Fetch from CDN or local files
    const response = await fetch(`/locales/${locale}.json`);

    if (!response.ok) {
      throw new Error(`Failed to load locale: ${locale}`);
    }

    return response.json();
  }

  // Preload multiple locales in parallel
  async preloadLocales(locales) {
    return Promise.all(locales.map(loc => this.loadLocale(loc)));
  }

  // Check if locale is loaded
  isLoaded(locale) {
    return this.loadedLocales.has(locale);
  }

  // Get locale data (sync, throws if not loaded)
  getLocaleData(locale) {
    if (!this.loadedLocales.has(locale)) {
      throw new Error(`Locale not loaded: ${locale}`);
    }
    return this.loadedLocales.get(locale);
  }
}

// Usage
const loader = new LocaleDataLoader();

// Load on demand
async function changeLanguage(locale) {
  try {
    showLoadingSpinner();
    const data = await loader.loadLocale(locale);
    applyTranslations(data);
    hideLoadingSpinner();
  } catch (error) {
    console.error('Failed to load locale:', error);
    showErrorMessage('Failed to load language');
  }
}

// Preload on page load
window.addEventListener('DOMContentLoaded', async () => {
  const userLocale = detectUserLocale();
  const fallbackChain = getFallbackChain(userLocale);

  // Load primary locale immediately
  await loader.loadLocale(userLocale);

  // Preload fallbacks in background
  loader.preloadLocales(fallbackChain.slice(1));
});
```

**Locale Storage & Persistence:**

```javascript
// Multi-layer persistence strategy
class LocalePersistence {
  constructor() {
    this.storageKey = 'app_locale';
  }

  // Save locale with multiple fallbacks
  save(locale) {
    // 1. localStorage (persistent, cross-tab)
    try {
      localStorage.setItem(this.storageKey, locale);
    } catch (e) {
      console.warn('localStorage unavailable:', e);
    }

    // 2. sessionStorage (tab-specific, fallback)
    try {
      sessionStorage.setItem(this.storageKey, locale);
    } catch (e) {
      console.warn('sessionStorage unavailable:', e);
    }

    // 3. Cookie (server-accessible, cross-domain)
    this.setCookie(this.storageKey, locale, 365);

    // 4. URL parameter (shareable, bookmarkable)
    this.updateURL(locale);
  }

  // Load locale with fallback chain
  load() {
    // 1. Try URL parameter first (highest priority)
    const urlLocale = this.getURLParam('lang');
    if (urlLocale) return urlLocale;

    // 2. Try localStorage
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) return stored;
    } catch (e) {
      console.warn('localStorage unavailable:', e);
    }

    // 3. Try sessionStorage
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) return stored;
    } catch (e) {
      console.warn('sessionStorage unavailable:', e);
    }

    // 4. Try cookie
    const cookieLocale = this.getCookie(this.storageKey);
    if (cookieLocale) return cookieLocale;

    // 5. Browser preference
    return navigator.language || 'en-US';
  }

  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  }

  getURLParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  }

  updateURL(locale) {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', locale);
    window.history.replaceState({}, '', url);
  }
}
```

**Performance Considerations:**

```javascript
// Benchmark locale detection methods
console.time('localStorage');
for (let i = 0; i < 10000; i++) {
  localStorage.getItem('locale');
}
console.timeEnd('localStorage'); // ~2ms

console.time('cookie');
for (let i = 0; i < 10000; i++) {
  document.cookie; // Parse cookies
}
console.timeEnd('cookie'); // ~15ms (slower!)

console.time('navigator');
for (let i = 0; i < 10000; i++) {
  navigator.language;
}
console.timeEnd('navigator'); // ~0.5ms (fastest!)

// Recommendation: Cache in memory after first read
let cachedLocale = null;

function getLocale() {
  if (cachedLocale) return cachedLocale;

  cachedLocale = localStorage.getItem('locale') ||
                 navigator.language ||
                 'en-US';

  return cachedLocale;
}
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Fixing Locale Fallback Issues in Production</strong></summary>

**Scenario:** Your e-commerce platform operates in 20 countries. Users from Canada (en-CA, fr-CA) are seeing broken translations and incorrect currency formatting. Customer support reports 150+ complaints per day about "website showing wrong language" and "prices in wrong currency."

**Production Metrics (Before Fix):**
- Translation errors: 23% of Canadian users
- Currency mismatches: 31% of transactions
- Customer complaints: 150/day
- Cart abandonment rate (Canada): 58%
- Support tickets: 200/week
- Revenue impact: -$45,000/month (lost Canadian sales)

**The Problem Code:**

```javascript
// ❌ BAD: No fallback logic, crashes on unsupported locales
function getTranslations(locale) {
  // Only has en-US, fr-FR, de-DE
  const translations = {
    'en-US': { welcome: 'Welcome' },
    'fr-FR': { welcome: 'Bienvenue' },
    'de-DE': { welcome: 'Willkommen' }
  };

  // ❌ CRASHES for en-CA, fr-CA, en-GB, etc.
  return translations[locale].welcome;
}

// ❌ BAD: Hardcoded currency mapping, no regional support
function formatPrice(amount, locale) {
  const currencies = {
    'en-US': 'USD',
    'fr-FR': 'EUR',
    'de-DE': 'EUR'
  };

  // ❌ Returns undefined for en-CA, shows "$undefined"
  const currency = currencies[locale];

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// User from Canada (en-CA)
console.log(getTranslations('en-CA'));
// ❌ TypeError: Cannot read property 'welcome' of undefined

console.log(formatPrice(99.99, 'en-CA'));
// ❌ RangeError: Invalid currency code: undefined
```

**Debugging Process:**

**Step 1: Identify Scope of Issue**

```javascript
// Add logging to capture affected locales
const unsupportedLocales = new Set();

function trackUnsupportedLocale(locale) {
  unsupportedLocales.add(locale);

  // Send to analytics
  analytics.track('unsupported_locale', {
    locale,
    timestamp: Date.now(),
    userAgent: navigator.userAgent
  });
}

// After 24 hours of logging:
console.log([...unsupportedLocales]);
// [
//   'en-CA', 'fr-CA', 'en-GB', 'en-AU', 'en-NZ',
//   'fr-BE', 'fr-CH', 'de-AT', 'de-CH', 'es-MX',
//   'es-AR', 'pt-BR'
// ]
// Affecting 35% of total users!
```

**Step 2: Implement Robust Fallback System**

```javascript
// ✅ FIXED: Comprehensive fallback logic
class TranslationManager {
  constructor() {
    // Define supported locales
    this.supportedLocales = new Set(['en-US', 'fr-FR', 'de-DE', 'es-ES']);

    // Define fallback rules
    this.fallbackMap = {
      // English variants → en-US
      'en-CA': 'en-US',
      'en-GB': 'en-US',
      'en-AU': 'en-US',
      'en-NZ': 'en-US',
      'en-IN': 'en-US',

      // French variants → fr-FR
      'fr-CA': 'fr-FR',
      'fr-BE': 'fr-FR',
      'fr-CH': 'fr-FR',

      // German variants → de-DE
      'de-AT': 'de-DE',
      'de-CH': 'de-DE',

      // Spanish variants → es-ES
      'es-MX': 'es-ES',
      'es-AR': 'es-ES',
      'es-CO': 'es-ES'
    };

    this.translations = {
      'en-US': { welcome: 'Welcome', cart: 'Shopping Cart', checkout: 'Checkout' },
      'fr-FR': { welcome: 'Bienvenue', cart: 'Panier', checkout: 'Commander' },
      'de-DE': { welcome: 'Willkommen', cart: 'Warenkorb', checkout: 'Zur Kasse' },
      'es-ES': { welcome: 'Bienvenido', cart: 'Carrito', checkout: 'Pagar' }
    };
  }

  resolveLocale(requestedLocale) {
    // 1. Exact match
    if (this.supportedLocales.has(requestedLocale)) {
      return requestedLocale;
    }

    // 2. Explicit fallback mapping
    if (this.fallbackMap[requestedLocale]) {
      return this.fallbackMap[requestedLocale];
    }

    // 3. Language-only fallback
    const language = requestedLocale.split('-')[0];
    for (const supported of this.supportedLocales) {
      if (supported.startsWith(language)) {
        return supported;
      }
    }

    // 4. Default fallback
    return 'en-US';
  }

  getTranslation(locale, key) {
    const resolvedLocale = this.resolveLocale(locale);
    const translations = this.translations[resolvedLocale];

    if (!translations || !translations[key]) {
      console.warn(`Missing translation: ${key} for locale ${resolvedLocale}`);
      return key; // Return key as fallback
    }

    return translations[key];
  }
}

const tm = new TranslationManager();

// Now works for all locales!
console.log(tm.getTranslation('en-CA', 'welcome')); // "Welcome" (fallback to en-US)
console.log(tm.getTranslation('fr-CA', 'welcome')); // "Bienvenue" (fallback to fr-FR)
console.log(tm.getTranslation('de-AT', 'cart')); // "Warenkorb" (fallback to de-DE)
```

**Step 3: Fix Currency and Number Formatting**

```javascript
// ✅ FIXED: Comprehensive currency mapping with regional support
class CurrencyManager {
  constructor() {
    // Map locale to currency
    this.currencyMap = {
      // North America
      'en-US': 'USD', 'en-CA': 'CAD', 'es-MX': 'MXN',

      // Europe
      'en-GB': 'GBP', 'fr-FR': 'EUR', 'de-DE': 'EUR',
      'es-ES': 'EUR', 'it-IT': 'EUR', 'nl-NL': 'EUR',
      'fr-BE': 'EUR', 'de-AT': 'EUR', 'fr-CH': 'CHF',
      'de-CH': 'CHF',

      // Asia-Pacific
      'en-AU': 'AUD', 'en-NZ': 'NZD', 'en-IN': 'INR',
      'ja-JP': 'JPY', 'zh-CN': 'CNY', 'ko-KR': 'KRW',

      // South America
      'es-AR': 'ARS', 'pt-BR': 'BRL', 'es-CO': 'COP'
    };

    // Define which regions use which currency despite language
    this.regionCurrency = {
      'CA': 'CAD', // Canada uses CAD for both en-CA and fr-CA
      'CH': 'CHF', // Switzerland uses CHF for de-CH, fr-CH, it-CH
      'BE': 'EUR'  // Belgium uses EUR for fr-BE, nl-BE
    };
  }

  getCurrency(locale) {
    // 1. Try exact locale match
    if (this.currencyMap[locale]) {
      return this.currencyMap[locale];
    }

    // 2. Extract region and try region-based lookup
    const region = locale.split('-')[1];
    if (region && this.regionCurrency[region]) {
      return this.regionCurrency[region];
    }

    // 3. Try language-only fallback
    const language = locale.split('-')[0];
    for (const [loc, currency] of Object.entries(this.currencyMap)) {
      if (loc.startsWith(language)) {
        return currency;
      }
    }

    // 4. Default to USD
    return 'USD';
  }

  formatPrice(amount, locale) {
    const currency = this.getCurrency(locale);

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Format with locale-specific rounding rules
  formatWithRounding(amount, locale) {
    const currency = this.getCurrency(locale);

    // Some currencies don't use decimal places
    const noDecimalCurrencies = ['JPY', 'KRW', 'VND'];
    const decimals = noDecimalCurrencies.includes(currency) ? 0 : 2;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  }
}

const cm = new CurrencyManager();

// Now works correctly for all locales!
console.log(cm.formatPrice(99.99, 'en-CA')); // "CA$99.99"
console.log(cm.formatPrice(99.99, 'fr-CA')); // "99,99 $ CA"
console.log(cm.formatPrice(99.99, 'en-GB')); // "£99.99"
console.log(cm.formatPrice(99.99, 'de-CH')); // "CHF 99.99"
console.log(cm.formatPrice(10000, 'ja-JP')); // "¥10,000" (no decimals)
```

**Step 4: Production Implementation with Monitoring**

```javascript
// Complete production-ready solution
class I18nManager {
  constructor(config) {
    this.translationManager = new TranslationManager();
    this.currencyManager = new CurrencyManager();
    this.currentLocale = this.detectLocale();

    // Monitoring
    this.metrics = {
      fallbacksUsed: 0,
      missingTranslations: new Set(),
      unsupportedLocales: new Set()
    };
  }

  detectLocale() {
    // Priority: URL → localStorage → Cookie → Browser → Default
    const urlLocale = new URLSearchParams(window.location.search).get('lang');
    const storedLocale = localStorage.getItem('locale');
    const browserLocale = navigator.language;

    return urlLocale || storedLocale || browserLocale || 'en-US';
  }

  setLocale(locale) {
    const resolved = this.translationManager.resolveLocale(locale);

    // Track if fallback was used
    if (resolved !== locale) {
      this.metrics.fallbacksUsed++;
      this.metrics.unsupportedLocales.add(locale);

      // Send to analytics
      this.trackFallback(locale, resolved);
    }

    this.currentLocale = resolved;
    localStorage.setItem('locale', resolved);
    document.documentElement.lang = resolved;

    // Dispatch event for components to react
    window.dispatchEvent(new CustomEvent('localechange', {
      detail: { locale: resolved, original: locale }
    }));
  }

  t(key) {
    const translation = this.translationManager.getTranslation(
      this.currentLocale,
      key
    );

    // Track missing translations
    if (translation === key) {
      this.metrics.missingTranslations.add(`${this.currentLocale}:${key}`);
    }

    return translation;
  }

  formatPrice(amount) {
    return this.currencyManager.formatPrice(amount, this.currentLocale);
  }

  formatDate(date, options = {}) {
    return new Intl.DateTimeFormat(this.currentLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }).format(date);
  }

  formatNumber(number, options = {}) {
    return new Intl.NumberFormat(this.currentLocale, options).format(number);
  }

  trackFallback(requested, resolved) {
    fetch('/api/analytics/locale-fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requested,
        resolved,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      })
    });
  }

  // Get metrics for debugging
  getMetrics() {
    return {
      ...this.metrics,
      missingTranslations: [...this.metrics.missingTranslations],
      unsupportedLocales: [...this.metrics.unsupportedLocales]
    };
  }
}

// Initialize globally
window.i18n = new I18nManager();

// Usage in app
document.querySelector('#welcome').textContent = i18n.t('welcome');
document.querySelector('#price').textContent = i18n.formatPrice(99.99);
document.querySelector('#date').textContent = i18n.formatDate(new Date());

// Language switcher
document.querySelector('#lang-select').addEventListener('change', (e) => {
  i18n.setLocale(e.target.value);
  location.reload(); // Or update UI dynamically
});

// Monitor metrics in console (dev mode)
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    console.log('i18n Metrics:', i18n.getMetrics());
  }, 30000); // Every 30 seconds
}
```

**Production Metrics (After Fix):**

```javascript
// Before:
// - Translation errors: 23% of Canadian users
// - Currency mismatches: 31% of transactions
// - Customer complaints: 150/day
// - Cart abandonment (Canada): 58%
// - Revenue impact: -$45,000/month

// After:
// - Translation errors: 0% ✅
// - Currency mismatches: 0% ✅
// - Customer complaints: 3/day (98% reduction) ✅
// - Cart abandonment (Canada): 24% (59% improvement) ✅
// - Revenue impact: +$38,000/month (recovered sales + growth) ✅

// Additional benefits:
// - Supports 50+ locale variants automatically
// - Fallback chain prevents crashes
// - Monitoring helps identify missing translations
// - User satisfaction: +87% in Canada
// - Support ticket reduction: 95%
```

**Key Lessons Learned:**

```javascript
// ❌ NEVER assume exact locale match exists
const data = localeData[locale]; // Crashes if locale missing

// ✅ ALWAYS use fallback resolution
const data = localeData[resolveLocale(locale)]; // Safe

// ❌ NEVER hardcode currency mappings
const currency = locale === 'en-US' ? 'USD' : 'EUR'; // Wrong for en-CA!

// ✅ ALWAYS use comprehensive mapping with regional logic
const currency = getCurrencyForLocale(locale); // Handles all cases

// ❌ NEVER assume language === currency
if (locale.startsWith('fr')) return 'EUR'; // Wrong for fr-CA (CAD)!

// ✅ ALWAYS consider region for currency
const region = locale.split('-')[1];
return getRegionalCurrency(region); // Correct

// ❌ NEVER fail silently on missing translations
return translations[key]; // Returns undefined, breaks UI

// ✅ ALWAYS provide fallback and log missing keys
return translations[key] || key; // Shows key, logs for fixing
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Locale Detection Strategies</strong></summary>

| Strategy | Pros | Cons | Best For |
|----------|------|------|----------|
| **Browser Language** | Automatic, no setup | May not reflect user preference | Default/initial detection |
| **URL Parameter** | Shareable, bookmarkable | Visible, manual to set | Multi-language campaigns |
| **localStorage** | Persistent, fast | Not server-accessible | SPA, client-side apps |
| **Cookie** | Server-accessible, persistent | Privacy concerns, size limits | SSR, authentication |
| **Accept-Language Header** | Automatic, server-side | Can't override client-side | SSR initial render |
| **User Profile** | Most accurate | Requires authentication | Logged-in users |
| **IP Geolocation** | Automatic by location | May be inaccurate, privacy | Region-specific content |
| **Domain (.fr, .de)** | Clear, SEO-friendly | Requires multiple domains | Large international sites |

**Comparison:**

```javascript
// Speed (10,000 reads)
navigator.language: 0.5ms (fastest)
localStorage: 2ms
sessionStorage: 2ms
cookie: 15ms (slowest - parsing overhead)

// Persistence
navigator.language: No
localStorage: Yes (permanent)
sessionStorage: Yes (session only)
cookie: Yes (with expiry)

// Server access
navigator.language: No
localStorage: No
sessionStorage: No
cookie: Yes

// Privacy
navigator.language: Good (browser setting)
localStorage: Fair (client-only)
sessionStorage: Fair (client-only)
cookie: Poor (tracking concerns)
```

**Recommendation by App Type:**

```javascript
// SPA (React, Vue): localStorage + navigator fallback
const locale = localStorage.getItem('locale') || navigator.language;

// SSR (Next.js): Cookie + Accept-Language
const locale = req.cookies.locale ||
               req.headers['accept-language'].split(',')[0];

// Static Site: URL parameter + localStorage
const urlLocale = new URLSearchParams(location.search).get('lang');
const locale = urlLocale || localStorage.getItem('locale') || 'en-US';

// E-commerce: User profile + cookie fallback
const locale = user.preferences.locale ||
               req.cookies.locale ||
               'en-US';
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Locale Management</strong></summary>

**Simple Explanation:**

Think of a **locale** like an address for a language:

**Language** = "English"
**Region** = "United States"
**Locale** = "en-US" (the full address)

**Why both matter:**

English in USA: "en-US"
- Date: 12/25/2024 (month/day/year)
- Currency: $99.99
- "color", "favorite"

English in UK: "en-GB"
- Date: 25/12/2024 (day/month/year)
- Currency: £99.99
- "colour", "favourite"

**Analogy for a PM:**

"Locale is like a restaurant menu:
- Language = Which language the menu is in (English, French)
- Region = What items are available (US menu has burgers, Japanese menu has sushi)
- Both matter: An English menu in Japan still shows sushi, not burgers!"

**Visual Example:**

```javascript
const price = 1234.56;

// Same language, different regions:
console.log(formatPrice(price, 'en-US')); // "$1,234.56"
console.log(formatPrice(price, 'en-GB')); // "£1,234.56"
console.log(formatPrice(price, 'en-CA')); // "CA$1,234.56"

// Same region, different languages:
console.log(formatPrice(price, 'en-CA')); // "CA$1,234.56"
console.log(formatPrice(price, 'fr-CA')); // "1 234,56 $ CA"

// Both parts matter!
```

**Common Mistake to Avoid:**

```javascript
// ❌ DON'T assume language = currency
if (language === 'en') {
  return 'USD'; // Wrong! UK uses GBP, Canada uses CAD
}

// ✅ DO check the full locale
if (locale === 'en-US') return 'USD';
if (locale === 'en-GB') return 'GBP';
if (locale === 'en-CA') return 'CAD';
```

**Why Fallbacks Matter:**

Imagine asking for a "Canadian English menu" (en-CA) but the restaurant only has "American English" (en-US).

**Bad approach:** "Sorry, we don't have that." (Error!)

**Good approach:** "We don't have Canadian English, but here's American English - it's close!" (Fallback!)

```javascript
// User requests: en-CA
// App has: en-US, fr-FR, de-DE

// With fallback:
resolveLocale('en-CA') → 'en-US' (close enough!)

// Without fallback:
getTranslations('en-CA') → Error! (app crashes)
```

</details>

### Resources

- [MDN: Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [BCP 47 Language Tags](https://tools.ietf.org/html/bcp47)
- [Unicode CLDR](https://cldr.unicode.org/)
- [ISO 639 Language Codes](https://www.loc.gov/standards/iso639-2/php/code_list.php)
- [ISO 3166 Country Codes](https://www.iso.org/iso-3166-country-codes.html)

---
