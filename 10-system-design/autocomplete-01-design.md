# Autocomplete/Typeahead System Design

> **Focus**: Frontend system design and component architecture

---

## Question 1: Design an Autocomplete/Typeahead Component

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 30-45 minutes
**Companies:** Google, Meta, Amazon, Uber, Airbnb, LinkedIn

### Question
Design and implement a production-ready autocomplete/typeahead component with debouncing, keyboard navigation, and accessibility. Consider performance, user experience, and edge cases.

### Answer

An autocomplete component provides real-time search suggestions as users type. Key requirements include:

1. **Debouncing** - Delay API calls until user stops typing
2. **Keyboard Navigation** - Arrow keys, Enter, Escape support
3. **Accessibility** - Screen reader support (ARIA)
4. **Performance** - Handle large datasets efficiently
5. **UX** - Loading states, error handling, highlighting

### Code Example

**Complete Implementation:**

```javascript
import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Production-Ready Autocomplete Component
 * Features:
 * - Debounced search
 * - Keyboard navigation (↑↓ Enter Esc)
 * - Accessibility (ARIA roles, labels, live regions)
 * - Loading/error states
 * - Highlight matching text
 * - Click outside to close
 */
function Autocomplete({
  fetchSuggestions,      // async function to fetch suggestions
  onSelect,              // callback when item is selected
  placeholder = "Search...",
  debounceMs = 300,
  minChars = 2,
  maxResults = 10
}) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(async () => {
      if (query.length < minChars) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      // Create abort controller for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const results = await fetchSuggestions(query, {
          signal: controller.signal,
          maxResults
        });

        setSuggestions(results.slice(0, maxResults));
        setIsOpen(results.length > 0);
        setHighlightedIndex(-1);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to fetch suggestions');
          console.error('Autocomplete error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [fetchSuggestions, debounceMs, minChars, maxResults]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;

      case 'Tab':
        setIsOpen(false);
        break;

      default:
        break;
    }
  };

  // Handle item selection
  const handleSelect = (item) => {
    setInputValue(item.label || item.value);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelect?.(item);
    inputRef.current?.blur();
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      highlightedElement?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        listRef.current &&
        !listRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="autocomplete__highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="autocomplete">
      <div className="autocomplete__input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length >= minChars && setIsOpen(true)}
          placeholder={placeholder}
          className="autocomplete__input"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="autocomplete-listbox"
          aria-activedescendant={
            highlightedIndex >= 0
              ? `autocomplete-item-${highlightedIndex}`
              : undefined
          }
        />

        {isLoading && (
          <span className="autocomplete__spinner" aria-label="Loading">
            ⏳
          </span>
        )}
      </div>

      {/* Live region for screen readers */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading && 'Loading suggestions'}
        {!isLoading && isOpen && `${suggestions.length} suggestions available`}
        {error && `Error: ${error}`}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && (
        <ul
          ref={listRef}
          id="autocomplete-listbox"
          className="autocomplete__list"
          role="listbox"
        >
          {error ? (
            <li className="autocomplete__error" role="alert">
              {error}
            </li>
          ) : suggestions.length > 0 ? (
            suggestions.map((item, index) => (
              <li
                key={item.id || index}
                id={`autocomplete-item-${index}`}
                role="option"
                aria-selected={highlightedIndex === index}
                className={`autocomplete__item ${
                  highlightedIndex === index ? 'autocomplete__item--highlighted' : ''
                }`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {highlightMatch(item.label || item.value, inputValue)}
              </li>
            ))
          ) : (
            <li className="autocomplete__empty">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
}

// Example usage with API
function App() {
  // Mock API call
  const fetchSuggestions = async (query, { signal, maxResults }) => {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(query)}&limit=${maxResults}`,
      { signal }
    );

    if (!response.ok) throw new Error('Search failed');

    const data = await response.json();
    return data.results.map(item => ({
      id: item.id,
      label: item.name,
      value: item.name,
      metadata: item
    }));
  };

  const handleSelect = (item) => {
    console.log('Selected:', item);
    // Navigate, update state, etc.
  };

  return (
    <div className="app">
      <h1>Search Users</h1>
      <Autocomplete
        fetchSuggestions={fetchSuggestions}
        onSelect={handleSelect}
        placeholder="Type to search..."
        debounceMs={300}
        minChars={2}
        maxResults={10}
      />
    </div>
  );
}

// CSS (autocomplete.css)
const styles = `
.autocomplete {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.autocomplete__input-wrapper {
  position: relative;
}

.autocomplete__input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.autocomplete__input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.autocomplete__spinner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}

.autocomplete__list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  list-style: none;
  margin: 0;
  padding: 4px 0;
  z-index: 1000;
}

.autocomplete__item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.autocomplete__item:hover,
.autocomplete__item--highlighted {
  background-color: #f0f8ff;
}

.autocomplete__item:active {
  background-color: #e0f0ff;
}

.autocomplete__highlight {
  background-color: #ffeb3b;
  font-weight: 600;
}

.autocomplete__empty,
.autocomplete__error {
  padding: 12px 16px;
  color: #666;
  text-align: center;
}

.autocomplete__error {
  color: #d32f2f;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;

export default Autocomplete;
```

<details>
<summary><strong>🔍 Deep Dive: Debouncing Implementation & Performance Optimization</strong></summary>

**Why Debouncing is Critical:**

Debouncing prevents excessive API calls and improves performance. Without debouncing, every keystroke triggers a request:

```javascript
// ❌ WITHOUT DEBOUNCING - Performance disaster
function BadAutocomplete() {
  const handleInput = async (e) => {
    const query = e.target.value;

    // User types "react" (5 characters) → 5 API calls!
    // r → API call
    // re → API call
    // rea → API call
    // reac → API call
    // react → API call

    const results = await fetch(`/api/search?q=${query}`);
    setSuggestions(await results.json());
  };

  // PROBLEM: If user types fast (200ms per char):
  // - 5 API calls in 1 second
  // - Network congestion
  // - Race conditions (responses arrive out of order)
  // - Server overload
  // - Wasted bandwidth
}

// ✅ WITH DEBOUNCING - Efficient
function GoodAutocomplete() {
  const debounceTimerRef = useRef(null);

  const handleInput = (e) => {
    const query = e.target.value;

    // Clear previous timer
    clearTimeout(debounceTimerRef.current);

    // Set new timer (wait 300ms)
    debounceTimerRef.current = setTimeout(async () => {
      // Only execute if user stopped typing for 300ms
      const results = await fetch(`/api/search?q=${query}`);
      setSuggestions(await results.json());
    }, 300);
  };

  // BENEFIT: User types "react" → only 1 API call after they stop
  // 80-90% reduction in API calls!
}
```

**Advanced Debounce Implementations:**

**1. Leading Edge Debounce** (execute immediately, then debounce):

```javascript
function useLeadingDebounce(callback, delay) {
  const timeoutRef = useRef(null);
  const isFirstCallRef = useRef(true);

  return useCallback((...args) => {
    // Execute immediately on first call
    if (isFirstCallRef.current) {
      callback(...args);
      isFirstCallRef.current = false;
    }

    // Clear existing timeout
    clearTimeout(timeoutRef.current);

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      isFirstCallRef.current = true; // Reset for next sequence
    }, delay);
  }, [callback, delay]);
}

// Usage: Show results immediately, then debounce
const search = useLeadingDebounce((query) => {
  fetchSuggestions(query);
}, 300);
```

**2. Adaptive Debounce** (adjust delay based on typing speed):

```javascript
function useAdaptiveDebounce(callback, baseDelay = 300) {
  const timeoutRef = useRef(null);
  const lastCallRef = useRef(Date.now());
  const typingSpeedRef = useRef(300); // ms per character

  return useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;

    // Calculate typing speed (exponential moving average)
    typingSpeedRef.current =
      0.7 * typingSpeedRef.current + 0.3 * timeSinceLastCall;

    // Adjust delay based on typing speed
    // Fast typing → longer delay (user still thinking)
    // Slow typing → shorter delay (user ready for results)
    const adaptiveDelay = timeSinceLastCall < 200
      ? baseDelay + 100  // Fast typing: wait longer
      : baseDelay - 100; // Slow typing: wait less

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, Math.max(100, adaptiveDelay)); // Min 100ms

    lastCallRef.current = now;
  }, [callback, baseDelay]);
}
```

**3. Debounce with Request Cancellation** (abort previous requests):

```javascript
function useDebouncedSearch(fetchFn, delay = 300) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const search = useCallback((query) => {
    // Clear previous timeout
    clearTimeout(timeoutRef.current);

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't search empty queries
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    timeoutRef.current = setTimeout(async () => {
      // Create new abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const data = await fetchFn(query, { signal: controller.signal });
        setResults(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Search failed:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, delay);
  }, [fetchFn, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  return { search, results, isLoading };
}

// Usage
const { search, results, isLoading } = useDebouncedSearch(
  async (query, { signal }) => {
    const response = await fetch(`/api/search?q=${query}`, { signal });
    return response.json();
  },
  300
);
```

**Performance Metrics & Optimization:**

**Benchmark: Debouncing Impact**

```javascript
// Test scenario: User types "javascript" (10 characters)

// WITHOUT DEBOUNCING:
// - API calls: 10
// - Data transferred: ~50KB (10 × 5KB per response)
// - Time to final result: 2.5s (last response)
// - Server CPU: 10 × 50ms = 500ms total
// - Race condition risk: HIGH (responses arrive out of order)

console.time('no-debounce');
for (let i = 0; i < 10; i++) {
  await fetch(`/api/search?q=${'javascript'.slice(0, i + 1)}`);
}
console.timeEnd('no-debounce'); // ~2.5s

// WITH DEBOUNCING (300ms):
// - API calls: 1
// - Data transferred: ~5KB
// - Time to final result: 350ms (300ms debounce + 50ms request)
// - Server CPU: 50ms
// - Race condition risk: ZERO

console.time('with-debounce');
// Wait for user to finish typing (300ms)
await new Promise(resolve => setTimeout(resolve, 300));
await fetch('/api/search?q=javascript');
console.timeEnd('with-debounce'); // ~350ms

// IMPROVEMENT:
// - 90% fewer API calls (10 → 1)
// - 90% less data transferred (50KB → 5KB)
// - 85% faster to result (2500ms → 350ms)
// - 90% less server CPU (500ms → 50ms)
// - Zero race conditions
```

**Memory Optimization Techniques:**

```javascript
// ❌ BAD: Memory leak from uncleared timers
function BadComponent() {
  const search = (query) => {
    setTimeout(async () => {
      const results = await fetch(`/api/search?q=${query}`);
      setSuggestions(await results.json());
    }, 300);
  };

  // PROBLEM: If component unmounts, timeout still fires
  // → setState on unmounted component → memory leak
  // → Potential crash in production
}

// ✅ GOOD: Cleanup timers and requests
function GoodComponent() {
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const search = (query) => {
    clearTimeout(timeoutRef.current);
    abortControllerRef.current?.abort();

    timeoutRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const results = await fetch(`/api/search?q=${query}`, {
          signal: controller.signal
        });
        setSuggestions(await results.json());
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      }
    }, 300);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  return <input onChange={(e) => search(e.target.value)} />;
}
```

**Network Optimization with Caching:**

```javascript
class AutocompleteCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 min TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key) {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key, value) {
    // LRU eviction: If cache full, remove oldest
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

// Usage with debounced search
const cache = new AutocompleteCache();

async function fetchWithCache(query, options) {
  // Check cache first
  const cached = cache.get(query);
  if (cached) {
    console.log('Cache hit:', query);
    return cached;
  }

  // Fetch from API
  console.log('Cache miss, fetching:', query);
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}`,
    options
  );

  const data = await response.json();

  // Store in cache
  cache.set(query, data);

  return data;
}

// Performance improvement with caching:
// - First search for "react": 250ms (API call)
// - Second search for "react": 0.5ms (cache hit, 500× faster!)
// - Reduced server load: 70-80% fewer API calls
```

**Browser Performance Profiling:**

```javascript
// Measure autocomplete performance
function AutocompleteWithMetrics() {
  const [metrics, setMetrics] = useState({
    apiCalls: 0,
    cacheHits: 0,
    averageLatency: 0
  });

  const search = async (query) => {
    const startTime = performance.now();

    performance.mark('search-start');

    try {
      const results = await fetchWithCache(query);

      performance.mark('search-end');
      performance.measure('search', 'search-start', 'search-end');

      const measure = performance.getEntriesByName('search')[0];
      const latency = measure.duration;

      setMetrics(prev => ({
        apiCalls: prev.apiCalls + 1,
        cacheHits: results.cached ? prev.cacheHits + 1 : prev.cacheHits,
        averageLatency: (prev.averageLatency * prev.apiCalls + latency) / (prev.apiCalls + 1)
      }));

      console.log(`Search latency: ${latency.toFixed(2)}ms`);
      console.log(`Cache hit rate: ${(metrics.cacheHits / metrics.apiCalls * 100).toFixed(1)}%`);
    } finally {
      performance.clearMarks();
      performance.clearMeasures();
    }
  };

  return (
    <div>
      <Autocomplete onSearch={search} />
      <div className="metrics">
        <p>API Calls: {metrics.apiCalls}</p>
        <p>Cache Hits: {metrics.cacheHits}</p>
        <p>Avg Latency: {metrics.averageLatency.toFixed(2)}ms</p>
      </div>
    </div>
  );
}
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Debugging Autocomplete Race Conditions</strong></summary>

**Scenario**: Your e-commerce site's product search autocomplete is showing incorrect results. Users type "laptop", but see suggestions for "lap" or "lapt" instead of "laptop". Customer support reports 50+ complaints per day about "broken search". The bug only happens when users type quickly.

**Production Metrics (Before Fix):**
- Incorrect results: 23% of searches
- User complaints: 52/day
- Bounce rate after search: 38%
- Conversion rate: 2.1% (expected 4.5%)
- Revenue impact: -$45K/month
- Server load: 250 req/sec (excessive)

**The Problem Code:**

```javascript
// ❌ CRITICAL BUG: Race condition from missing request cancellation
function BrokenAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // DEBOUNCED search (300ms)
  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery) => {
        setIsLoading(true);

        try {
          // API call takes 100-500ms (varies by load)
          const response = await fetch(`/api/search?q=${searchQuery}`);
          const data = await response.json();

          // ❌ BUG: No request cancellation!
          // If user types fast, multiple requests are in-flight
          // Whichever response arrives LAST wins, regardless of order
          setSuggestions(data.results);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsLoading(false);
        }
      }, 300),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div>
      <input value={query} onChange={handleInputChange} />
      {isLoading && <div>Loading...</div>}
      <ul>
        {suggestions.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

// THE RACE CONDITION:
// User types: "laptop" quickly
// Timeline:
// t=0ms:    User types "l" → debounce starts
// t=100ms:  User types "a" → previous debounce cancelled, new one starts
// t=200ms:  User types "p" → previous debounce cancelled, new one starts
// t=300ms:  User types "t" → previous debounce cancelled, new one starts
// t=400ms:  User types "o" → previous debounce cancelled, new one starts
// t=500ms:  User types "p" → previous debounce cancelled, new one starts
// t=800ms:  Debounce fires for "laptop" → Request #1 sent
// t=850ms:  Network glitch causes retry for "lap" → Request #2 sent (old query!)
// t=900ms:  Request #2 ("lap") returns first → Shows laptop accessories
// t=950ms:  Request #1 ("laptop") returns last → Shows laptops (correct)
// t=1000ms: User clicks on laptop accessories (wrong results)

// RESULT: 23% of searches show stale results!
```

**Real Production Timeline (Captured from Sentry):**

```javascript
// Actual bug sequence captured in production logs:
// User: fast-typer-123@example.com
// Session: abc-def-ghi-jkl
// Date: 2024-01-15 14:23:45

14:23:45.000 - User types "l"
14:23:45.120 - User types "la"
14:23:45.240 - User types "lap"
14:23:45.360 - User types "lapt"
14:23:45.480 - User types "lapto"
14:23:45.600 - User types "laptop"

// Debounce waits 300ms after last keystroke
14:23:45.900 - Debounce fires → API call #1: query="laptop"

// Network slowdown causes retry of previous debounce
14:23:46.050 - Retry → API call #2: query="lapt" (stale!)

// Responses arrive out of order
14:23:46.180 - Response #2 arrives: results for "lapt" (keyboards, accessories)
14:23:46.220 - setState(suggestions) → UI shows "lapt" results ❌

14:23:46.320 - Response #1 arrives: results for "laptop" (laptops)
14:23:46.350 - setState(suggestions) → UI shows "laptop" results ✅

// User already clicked on wrong result (keyboards)
14:23:46.400 - User clicks "Logitech Keyboard" (expecting laptops!)
14:23:46.500 - User confused, bounces from site

// Impact:
// - User saw wrong results for 140ms
// - User clicked wrong product
// - Lost sale: $1,200 laptop → $30 keyboard
// - Revenue loss: $1,170
```

**Debugging Process:**

**Step 1: Reproduce the Bug**

```javascript
// Add logging to detect race condition
function DebugAutocomplete() {
  const requestCounterRef = useRef(0);

  const search = async (query) => {
    const requestId = ++requestCounterRef.current;
    const startTime = Date.now();

    console.log(`[Request ${requestId}] Started: query="${query}"`);

    try {
      const response = await fetch(`/api/search?q=${query}`);
      const data = await response.json();
      const endTime = Date.now();

      console.log(
        `[Request ${requestId}] Completed: query="${query}", latency=${endTime - startTime}ms, results=${data.results.length}`
      );

      setSuggestions(data.results);
    } catch (error) {
      console.error(`[Request ${requestId}] Failed:`, error);
    }
  };

  // Test: Type quickly and observe console
  // You'll see requests complete out of order:
  // [Request 1] Started: query="lap"
  // [Request 2] Started: query="lapt"
  // [Request 3] Started: query="laptop"
  // [Request 2] Completed: query="lapt", latency=120ms ← Arrives first
  // [Request 3] Completed: query="laptop", latency=180ms
  // [Request 1] Completed: query="lap", latency=250ms ← Arrives last (WINS!)
  // Result: UI shows "lap" results ❌
}
```

**Step 2: Analyze with Chrome DevTools**

```javascript
// Network tab shows:
// Request | Query | Status | Time | Finish
// #1      | lap   | 200    | 250ms | 14:23:46.450
// #2      | lapt  | 200    | 120ms | 14:23:46.180 ✅ First to finish
// #3      | laptop| 200    | 180ms | 14:23:46.320

// Performance tab shows:
// - Multiple overlapping fetch requests
// - setState called multiple times (thrashing)
// - React re-renders: 5 times in 500ms (excessive)
```

**Step 3: Fix with Request Cancellation**

```javascript
// ✅ FIXED: AbortController cancels stale requests
function FixedAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef(null);
  const requestCounterRef = useRef(0);

  const search = useCallback(async (searchQuery) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('❌ Aborted previous request');
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const requestId = ++requestCounterRef.current;
    const startTime = Date.now();

    console.log(`[Request ${requestId}] Started: query="${searchQuery}"`);

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
        { signal: controller.signal } // ← Pass abort signal
      );

      const data = await response.json();
      const endTime = Date.now();

      console.log(
        `[Request ${requestId}] Completed: query="${searchQuery}", latency=${endTime - startTime}ms`
      );

      // Only update if request wasn't aborted
      setSuggestions(data.results);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`[Request ${requestId}] Aborted (user still typing)`);
      } else {
        console.error(`[Request ${requestId}] Failed:`, error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(search, 300),
    [search]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <div>
      <input value={query} onChange={handleInputChange} />
      {isLoading && <div>Loading...</div>}
      <ul>
        {suggestions.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

// NEW TIMELINE (with AbortController):
// User types "laptop"
// t=800ms:  Request #1: "lap" → SENT
// t=850ms:  Request #2: "lapt" → Request #1 ABORTED ✅
// t=900ms:  Request #3: "laptop" → Request #2 ABORTED ✅
// t=1050ms: Request #3 returns → Shows "laptop" results ✅

// RESULT: Always shows correct results!
```

**Step 4: Add Request ID Validation (Extra Safety)**

```javascript
// ✅ EVEN BETTER: Track request IDs to ignore stale responses
function BulletproofAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef(null);
  const latestRequestIdRef = useRef(0);

  const search = useCallback(async (searchQuery) => {
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Increment request ID
    const requestId = ++latestRequestIdRef.current;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
        { signal: controller.signal }
      );

      const data = await response.json();

      // ✅ CRITICAL: Only update if this is still the latest request
      if (requestId === latestRequestIdRef.current) {
        setSuggestions(data.results);
      } else {
        console.log(`Ignoring stale response for request ${requestId}`);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search failed:', error);

        // Only show error for latest request
        if (requestId === latestRequestIdRef.current) {
          setSuggestions([]);
        }
      }
    } finally {
      // Only stop loading for latest request
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Rest of component...
}
```

**Production Metrics (After Fix):**

```javascript
// Before fix (with race conditions):
// - Incorrect results: 23% of searches
// - User complaints: 52/day
// - Bounce rate: 38%
// - Conversion rate: 2.1%
// - Revenue: Lost $45K/month
// - Server load: 250 req/sec

// After fix (with AbortController + request IDs):
// - Incorrect results: 0.1% (network errors only)
// - User complaints: 1/day (98% reduction ✅)
// - Bounce rate: 12% (68% reduction ✅)
// - Conversion rate: 4.3% (105% increase ✅)
// - Revenue: Recovered $43K/month ✅
// - Server load: 85 req/sec (66% reduction ✅)

// Additional benefits:
// - Reduced server costs: $2.5K/month saved
// - Better user experience: Search feels instant
// - Reduced bandwidth: 70% fewer unnecessary requests
// - Lower error rates: Fewer timeout errors
// - Happier customers: NPS score +18 points
```

**Common Mistakes & Lessons:**

```javascript
// ❌ MISTAKE 1: Debouncing without request cancellation
const search = debounce(async (query) => {
  const response = await fetch(`/api/search?q=${query}`);
  // ❌ Race condition: Multiple requests in-flight
}, 300);

// ✅ FIX: Always use AbortController
const abortController = new AbortController();
const search = debounce(async (query) => {
  const response = await fetch(`/api/search?q=${query}`, {
    signal: abortController.signal
  });
}, 300);

// ❌ MISTAKE 2: Not checking request ID
setSuggestions(data.results); // ❌ Might be stale

// ✅ FIX: Validate request ID
if (requestId === latestRequestId) {
  setSuggestions(data.results);
}

// ❌ MISTAKE 3: Not cleaning up on unmount
// Component unmounts → request completes → setState on unmounted component

// ✅ FIX: Cleanup in useEffect
useEffect(() => {
  return () => {
    abortController?.abort();
  };
}, []);

// ❌ MISTAKE 4: Assuming requests return in order
// Network is unpredictable: Later requests can finish first

// ✅ FIX: Never assume order, always validate
```

**Key Takeaways:**

1. **Always use AbortController** for cancellable fetch requests
2. **Track request IDs** to ignore stale responses
3. **Debouncing alone isn't enough** - you need request cancellation
4. **Test with network throttling** to expose race conditions
5. **Add logging** to debug request ordering issues
6. **Monitor production metrics** to catch race conditions early

</details>

<details>
<summary><strong>⚖️ Trade-offs: Implementation Approaches</strong></summary>

| Approach | Pros | Cons | Use When |
|----------|------|------|----------|
| **Client-side filtering** | Instant results, no network delay, works offline | Limited dataset size, high initial load, no fuzzy search | Small datasets (<1000 items), static data |
| **Server-side search** | Scales to millions of items, advanced search (fuzzy, synonyms), fresh data | Network latency (100-500ms), requires backend, offline won't work | Large datasets, dynamic data, complex search |
| **Hybrid (cache + API)** | Fast for common queries, scales well, reduced server load | Complex implementation, cache invalidation issues | Most production apps |
| **Debounce + throttle** | Balances responsiveness and performance | Slight delay before results | High-traffic apps |

**Performance Comparison:**

```javascript
// Client-side filtering (instant, but limited)
const suggestions = allItems.filter(item =>
  item.name.toLowerCase().includes(query.toLowerCase())
).slice(0, 10);
// Pros: 0ms latency, works offline
// Cons: Max ~10,000 items before slowdown

// Server-side search (scalable, but slower)
const suggestions = await fetch(`/api/search?q=${query}`);
// Pros: Millions of items, advanced search
// Cons: 100-500ms latency, requires network

// Hybrid approach (best of both)
const cached = cache.get(query);
if (cached) return cached; // 0ms
const results = await fetch(`/api/search?q=${query}`); // 100-500ms first time
cache.set(query, results); // Future searches: 0ms
// Pros: Fast + scalable
// Cons: More complex code
```

**When to Use Each Debounce Strategy:**

```javascript
// Standard trailing debounce (most common)
// ✅ Use for: Search, form validation, resize handlers
debounce(fn, 300); // Wait 300ms after last event

// Leading debounce (execute first, ignore rest)
// ✅ Use for: Button clicks, form submissions
debounce(fn, 1000, { leading: true, trailing: false });

// Leading + trailing (execute first and last)
// ✅ Use for: Scroll handlers, analytics tracking
debounce(fn, 500, { leading: true, trailing: true });

// Adaptive debounce (adjust based on usage)
// ✅ Use for: Autocomplete with variable typing speeds
adaptiveDebounce(fn, 300); // Adjusts 100-500ms based on speed
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Autocomplete Component</strong></summary>

**Simple Explanation:**

Think of autocomplete like Google search suggestions:

1. **You type** → Component waits to see if you're still typing
2. **You stop typing** → Component asks server for suggestions
3. **Server responds** → Component shows suggestions
4. **You pick one** → Component fills in your choice

**Why Debouncing Matters:**

Imagine you're typing "javascript" (10 letters). **Without debouncing:**

```
You type: j → Ask server "what matches j?"
You type: a → Ask server "what matches ja?"
You type: v → Ask server "what matches jav?"
...10 times total!
```

**With debouncing (smart waiting):**

```
You type: j → Wait...
You type: a → Wait...
You type: v → Wait...
You type: a → Wait...
...user stops typing for 300ms...
→ NOW ask server "what matches java script?"
Result: 1 request instead of 10!
```

**Analogy for a PM:**

"Think of it like talking to a slow-responding person:
- **Without debouncing**: You ask 'Should I...' → they start answering → you interrupt 'Should I buy...' → they start again → you interrupt 'Should I buy a laptop or phone?'
- **With debouncing**: You wait until you finish your FULL question, then ask once. Much more efficient!"

**Visual Example:**

```javascript
// User experience timeline:

// BAD (no debouncing):
Type "r" → Loading... → Results for "r"
Type "e" → Loading... → Results for "re"
Type "a" → Loading... → Results for "rea"
Type "c" → Loading... → Results for "reac"
Type "t" → Loading... → Results for "react"
// 5 loading spinners, confusing!

// GOOD (with debouncing):
Type "r" → (waiting)
Type "e" → (waiting)
Type "a" → (waiting)
Type "c" → (waiting)
Type "t" → (waiting 300ms) → Loading... → Results for "react"
// 1 loading spinner, smooth!
```

**Key Concepts Simplified:**

1. **Debouncing** = "Wait until user stops typing before searching"
2. **Keyboard navigation** = "Use arrow keys to select, Enter to confirm"
3. **Accessibility** = "Works with screen readers for blind users"
4. **Race condition** = "Old results showing up after new results (bug!)"

**Interview Answer Template:**

"An autocomplete component needs three key features:

1. **Debouncing** to avoid excessive API calls - wait 300ms after user stops typing
2. **Keyboard navigation** for accessibility - arrow keys, Enter, Escape
3. **Request cancellation** to prevent race conditions - abort old requests when new ones start

For example, if a user types 'laptop', we debounce to avoid 6 API calls (one per letter). We also cancel the request for 'lapto' when they type the final 'p', so stale results don't appear.

I'd implement this with React hooks: useState for the input, useRef for the abort controller, and useCallback for the debounced search function."

</details>

### Resources

- [WAI-ARIA Authoring Practices: Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [MDN: AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Lodash: Debounce](https://lodash.com/docs/#debounce)

---
