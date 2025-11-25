# TypeScript Declaration Files

## Question 1: What are .d.ts files and how to create them?

### <details>
<summary><strong>🔍 Deep Dive: Declaration File Structure and Ambient Declarations</strong></summary>

Declaration files (`.d.ts`) are TypeScript-specific files that describe the shape and types of JavaScript code without containing implementation. They serve as type definitions for JavaScript libraries, enabling TypeScript's type checker to understand external code structure.

**Core Concept:**
Declaration files are pure type definitions - they contain only type information, interfaces, classes, enums, and namespaces without executable code. The TypeScript compiler strips them away during transpilation, so they only exist for development-time type checking.

**Declaration File Structure:**

```typescript
// module.d.ts - Module declaration pattern (CommonJS/ESM)
declare module 'module-name' {
  export interface UserConfig {
    name: string;
    age: number;
    email?: string;
  }

  export function processUser(config: UserConfig): Promise<void>;
  export const version: string;
  export default function createApp(config: any): void;
}

// ambient.d.ts - Global ambient declarations
declare namespace Express {
  interface Request {
    user?: { id: string; role: string };
    startTime?: number;
  }
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: any;
  }

  var DEBUG: boolean;
  const APP_VERSION: string;
}

// types.d.ts - Reusable type definitions
declare interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}

declare type ApiHandler<T = any> = (
  req: any,
  res: any,
  next?: any
) => Promise<T>;

declare enum Environment {
  Development = 'development',
  Production = 'production',
  Testing = 'testing'
}
```

**Advanced Declaration Patterns:**

1. **Triple-slash directives** (legacy, now rarely used):
```typescript
/// <reference path="./path/to/file.d.ts" />
/// <reference lib="dom" />
/// <reference types="node" />

declare function legacyFunction(x: number): string;
```

2. **Conditional type declarations**:
```typescript
declare module 'conditional-module' {
  export interface Config {
    mode: 'browser' | 'node';
  }

  export const createAdapter: (config: Config) =>
    config['mode'] extends 'browser' ? BrowserAdapter : NodeAdapter;
}
```

3. **Augmentation patterns** (extending existing modules):
```typescript
// Extending built-in global types
declare global {
  interface Array<T> {
    groupBy<K extends PropertyKey>(
      predicate: (item: T) => K
    ): Record<K, T[]>;
  }
}

Array.prototype.groupBy = function(predicate) {
  return this.reduce((acc, item) => {
    const key = predicate(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
};

export {};
```

**tsconfig.json Configuration for Declaration Generation:**

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "declarationDir": "./dist/types",
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true,
    "strict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

**Key TypeScript Compiler Options:**
- `declaration: true` - Generates .d.ts files automatically
- `declarationMap: true` - Creates source maps for declarations
- `emitDeclarationOnly: true` - Generates ONLY .d.ts (no .js output)
- `stripInternal: true` - Removes @internal marked types from declarations

**Declaration File Resolution Order:**
1. Check `package.json` `types` field: `"types": "./dist/index.d.ts"`
2. Check `index.d.ts` in package root
3. Check default `package.json` main field
4. Search in `node_modules/@types` (DefinitelyTyped)
5. Inline type definitions in source `.ts` files

---

### <details>
<summary><strong>🐛 Real-World Scenario: DefinitelyTyped Integration Issue with Metrics</strong></summary>

**Scenario: Migrating from Untyped to Typed jQuery Library**

**Before (2 days of debugging):**

A development team imported jQuery without type definitions in their legacy TypeScript project:

```typescript
// Old code - no types
import $ from 'jquery';

const result = $.ajax({ url: '/api/data' });
// result is typed as 'any' - completely loses type safety
// No autocomplete for jQuery methods
// Runtime errors not caught until testing

const users: any = result.responseJSON; // Any type, bugs slip through
```

**Metrics - Pain Points:**
- 47 lines of `// @ts-ignore` comments scattered across codebase
- 3 production bugs related to jQuery API misuse ($.extend vs $.fn.extend)
- 8 hours spent debugging incorrect $.ajax error handler usage
- No IDE autocomplete - developers checking jQuery docs constantly
- Type errors in `responseJSON` access patterns not caught at compile time

**Solution: Add @types/jquery Package**

```bash
npm install --save-dev @types/jquery
# Downloads jQuery type definitions from DefinitelyTyped (117 KB, 2000+ lines)
```

**After (Immediate type safety):**

```typescript
import $ from 'jquery';

// Now fully typed from @types/jquery definitions
const result: JQuery.jqXHR<{ users: User[] }> = $.ajax({
  url: '/api/data',
  dataType: 'json'
});

// IDE provides autocomplete for all jQuery methods
// Type error caught at compile time
result.done((data: { users: User[] }) => {
  console.log(data.users); // Type: User[]
});

result.fail((jqXHR, textStatus, errorThrown) => {
  // Types automatically narrowed: jqXHR is JQuery.jqXHR
  console.error(jqXHR.statusCode()); // Method autocomplete available
});

// Without types, this compiles - WITH types, caught immediately
$.ajax({ url: '/api/data' }).success((data) => {
  // Type error: success() is deprecated, use done() instead
});
```

**Real Metrics After Implementation:**
- Lines of `// @ts-ignore`: 0 (eliminated)
- Type-related bugs in next sprint: 0 (down from ~1 per sprint)
- Time debugging jQuery API misuse: 0 (caught by IDE)
- Developer productivity: +15% (no docs checking needed)
- Build-time type errors caught: 12+ per developer per day

**Complex Scenario: Custom Declaration Augmentation**

The team needed to extend jQuery types for custom plugins:

```typescript
// src/types/jquery-custom.d.ts
declare global {
  interface JQuery {
    customModal(options?: CustomModalOptions): JQuery;
    toast(message: string, duration?: number): void;
  }
}

interface CustomModalOptions {
  title: string;
  content: string;
  buttons?: Array<{ text: string; onClick: () => void }>;
  closable?: boolean;
}

export {};

// Usage in application
$(element).customModal({
  title: 'Confirm Action',
  buttons: [
    {
      text: 'OK',
      onClick: () => {
        // Type safe
      }
    }
  ]
});
```

**DefinitelyTyped Contribution Metrics:**
- DefinitelyTyped repository: 8,000+ type packages
- Coverage of npm ecosystem: ~70% of top 1,000 packages
- Average PR merge time: 1-2 weeks (community maintained)
- Types lag behind library updates: 2-6 weeks typical
- Unmaintained packages: ~5% (outdated or abandoned)

**Debugging Workflow with Declaration Files:**

```typescript
// When types don't match library behavior
const cfg: JQuery.AjaxSettings = {
  url: '/api',
  timeout: 5000 // Type: number
};

// Runtime issue: API expects string milliseconds
// Solution: Create declaration patch file
```

</details>

---

### <details>
<summary><strong>⚖️ Trade-offs: Manual vs Generated Declaration Files</strong></summary>

**Manual Declaration Files:**

Pros:
- Full control over public API surface
- Can simplify complex implementation types
- Hide internal implementation details
- Smaller declaration file size
- Can support multiple library versions

Cons:
- Requires maintenance discipline
- Easy to fall out of sync with implementation
- Time-consuming to write comprehensive declarations
- Type inconsistencies with actual runtime behavior
- Need manual updates for each feature addition

```typescript
// Manual declaration (full control, but maintenance burden)
// users-api.d.ts
export function getUser(id: string): Promise<User>;
export interface User {
  id: string;
  name: string;
}
```

**Auto-Generated Declaration Files:**

Pros:
- Always in sync with implementation
- Zero maintenance burden
- Type accuracy guaranteed (no drift)
- Fast implementation - just enable compiler flag
- Covers entire public surface automatically

Cons:
- Exposes internal implementation types
- Declaration files can be very large
- May include unintended public APIs
- Less control over API presentation
- Harder to evolve public API cleanly

```typescript
// Auto-generated (always current, but verbose)
// users-api.ts with "declaration": true generates:
export declare function getUser(id: string): Promise<User>;
export declare interface User {
  id: string;
  name: string;
  _internalCacheKey?: string; // Accidentally exposed
}
```

**Decision Matrix:**

| Factor | Manual | Generated |
|--------|--------|-----------|
| Sync with code | ❌ High risk | ✅ Guaranteed |
| API control | ✅ Full | ❌ Limited |
| Maintenance | ❌ Labor-intensive | ✅ Zero |
| File size | ✅ Compact | ❌ Large |
| Learning curve | ❌ Steep | ✅ Zero |
| Library age | ✅ Better for legacy JS | ❌ Not applicable |
| Public API cleanness | ✅ Excellent | ❌ Exposes internals |

**Hybrid Approach (Recommended for libraries):**

```typescript
// src/internal/helpers.ts
export function _normalizeUser(raw: any): User {
  return { id: raw.id, name: raw.name };
}

// src/api.ts
/** @public */
export async function getUser(id: string): Promise<User> {
  return _normalizeUser(await fetch(`/users/${id}`).then(r => r.json()));
}

// Generated declaration shows:
// export declare async function getUser(id: string): Promise<User>;
// (internal _normalizeUser is not exported)

// tsconfig.json with stripInternal: true prevents @internal types in output
```

**When to Choose Each:**

**Choose Manual Declarations When:**
- Wrapping untyped JavaScript libraries
- Supporting multiple library versions
- Need to hide implementation complexity
- Library has complex internal types
- Want small declaration file size

**Choose Generated Declarations When:**
- Writing TypeScript libraries from scratch
- Maintenance burden is critical concern
- Public API closely mirrors implementation
- Teams are small (no dedicated types maintainer)
- Rapid development cycles with frequent API changes

**Cost Comparison (8-week project):**

Manual declarations:
- Initial write: 16 hours
- Maintenance: 2 hours/week × 8 weeks = 16 hours
- Total: 32 hours (4 days)
- Sync drift risk: 40% by week 8

Generated declarations:
- Initial setup: 1 hour
- Maintenance: 0 hours
- Total: 1 hour
- Sync drift risk: 0%

</details>

---

### <details>
<summary><strong>💬 Explain to Junior: Declaration Files and Type Inference</strong></summary>

**Simple Analogy:**

Think of TypeScript declaration files like instruction manuals for JavaScript code. When you import a JavaScript library, TypeScript doesn't understand what functions and objects are available - it's like trying to use a foreign library without documentation.

Declaration files are the "cheat sheet" that tells TypeScript: "Hey, this library has a function called `getUser` that takes a string ID and returns a Promise of a User object."

```typescript
// Without declaration file (confusing)
import $ from 'jquery';
const result = $.ajax(/* what goes here? IDE has no idea! */);

// With declaration file (@types/jquery)
import $ from 'jquery';
const result = $.ajax({ url: '/api' }); // IDE autocompletes all options!
```

**Why Declaration Files Matter:**

Imagine you're using someone else's toolbox. Without labels:
- You don't know which tool does what
- You might use the wrong tool and break it
- You waste time experimenting

With labels (declaration files):
- Each tool clearly describes what it does
- You use tools correctly
- You work faster with confidence

**Creating Your First Declaration File:**

```typescript
// math.js (untyped JavaScript)
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// math.d.ts (declaration file - the "instruction manual")
export function add(a: number, b: number): number;
export function multiply(a: number, b: number): number;

// Now in TypeScript:
import { add } from './math';
add(5, 10); // ✅ Works, numbers understood
add('5', '10'); // ❌ Type error: strings not allowed
```

**Real Interview Scenario:**

Interviewer: "You're adding a new JavaScript library to a TypeScript project. How would you handle types if the library isn't typed?"

**Your Answer Template:**

"There are three approaches:

1. **Check DefinitelyTyped first** - Run `npm install @types/library-name` to see if community types exist. This is the fastest solution. For example, `@types/jquery`, `@types/lodash` cover most popular libraries.

2. **If types don't exist, create a declaration file** - I'd create a `.d.ts` file describing the library's API:
```typescript
declare module 'untyped-library' {
  export function doSomething(param: string): Promise<void>;
}
```
This gives me type safety and IDE autocomplete for the most critical functions.

3. **As a last resort, use `any`** - If the library API is complex or rarely used, I might use `// @ts-ignore` temporarily while focusing on more important typed code.

The key is balancing type safety with productivity - fully typing an obscure library might not be worth the time investment."

**Common Mistakes Juniors Make:**

```typescript
// ❌ WRONG: Assuming untyped library is typed
import axios from 'axios'; // Without @types/axios installed
axios.get('/api'); // "Type is any" - no type safety!

// ✅ RIGHT: Install types first
// npm install axios @types/axios
import axios from 'axios';
axios.get('/api'); // Now fully typed with autocomplete

// ❌ WRONG: Typing the entire library in one massive file
// api.d.ts (2000 lines) - too big, hard to maintain

// ✅ RIGHT: Split declarations logically
// api-http.d.ts (for HTTP-related types)
// api-response.d.ts (for response types)
// api-errors.d.ts (for error types)
```

**Type Declaration File Structure (What Juniors Need to Know):**

Declaration files contain ONLY types, NO implementation:

```typescript
// ✅ Valid in .d.ts files
export interface User { id: string; name: string; }
export type Status = 'active' | 'inactive';
export declare function getUser(id: string): Promise<User>;
export declare const VERSION: string;
export declare class Logger { log(msg: string): void; }

// ❌ Invalid in .d.ts files (no implementation code)
export const users = []; // ❌ Can't assign values
export function getUser() { return ...; } // ❌ Can't have body
export class Logger { log(msg) { console.log(msg); } } // ❌ No implementation
```

**Debugging Type Issues Step-by-Step:**

```typescript
// Problem: TypeScript can't find types for 'moment'
import moment from 'moment'; // Error: Could not find a declaration file

// Step 1: Check if @types package exists
// npm search @types/moment
// → Found: @types/moment

// Step 2: Install the types package
// npm install --save-dev @types/moment

// Step 3: Try again
import moment from 'moment';
moment().format('YYYY-MM-DD'); // ✅ Now works with full type safety!

// If types still don't exist:
// Step 4: Create your own minimal declaration
// moment.d.ts
declare module 'moment' {
  export interface Moment {
    format(pattern?: string): string;
  }
  export function moment(): Moment;
  export default moment;
}
```

**Interview Answer (Explaining to a Non-Technical Person):**

"Declaration files in TypeScript are like translation sheets for JavaScript libraries. When you use a JavaScript library in TypeScript, TypeScript doesn't understand what that library can do. Declaration files tell TypeScript the 'shape' of the library - what functions exist, what inputs they need, and what they return.

For example, if you're using a weather API library, a declaration file tells TypeScript: 'This library has a function called `getWeather` that takes a city name (string) and returns a promise of weather data (object with temperature, humidity, etc.).' This way, TypeScript can catch mistakes at compile time instead of runtime."

</details>

---

## Question 2: How to type third-party JavaScript libraries?

### <details>
<summary><strong>🔍 Deep Dive: Typing Strategies and Advanced Patterns</strong></summary>

Typing third-party JavaScript libraries is essential for maintaining type safety in TypeScript projects while using untyped or partially-typed dependencies. This requires understanding declaration file patterns, module augmentation, and complex type inference.

**Core Typing Strategies:**

**1. Official Types from DefinitelyTyped:**

DefinitelyTyped is the community-maintained repository of TypeScript type definitions for JavaScript libraries. It's the first source to check:

```bash
# Check if types exist
npm search @types/lodash

# Install official types
npm install --save-dev @types/lodash

# Verify types work
npx tsc --noEmit # Type checking without compilation
```

```typescript
// Now fully typed from @types/lodash
import _ from 'lodash';

const result = _.groupBy([1, 2, 3], (n) => n % 2);
// result is typed as: Record<string, number[]>
// All lodash methods have full type information

// Without @types/lodash, result would be 'any'
```

**2. Library-Provided Types (Built-in):**

Modern libraries increasingly ship with TypeScript types directly:

```json
// package.json of well-typed library
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

Examples: Vue 3, Next.js, TypeScript itself all ship with built-in types.

```typescript
// These import with full type safety automatically
import { createApp } from 'vue'; // Has dist/index.d.ts
import { NextApiRequest } from 'next'; // Has dist/index.d.ts
```

**3. Inline Types in .ts Source:**

Some libraries ship source `.ts` files directly (instead of compiled `.js`):

```typescript
// node_modules/my-lib/src/index.ts
export interface Config {
  name: string;
  timeout: number;
}

export function setupLib(config: Config): void {
  // TypeScript infers types directly from source
}
```

**4. Manual Declaration Files for Untyped Libraries:**

When no types exist, create declarations:

```typescript
// types/untyped-lib.d.ts
declare module 'untyped-lib' {
  export interface Options {
    verbose?: boolean;
    timeout?: number;
  }

  export function init(options?: Options): void;
  export function process(data: string): Promise<string>;
  export function destroy(): void;
}
```

**Advanced Typing Patterns:**

**A. Complex Function Signatures with Overloads:**

```typescript
// types/complex-lib.d.ts
declare module 'complex-lib' {
  // Overload 1: sync version
  export function parse(json: string): Record<string, any>;

  // Overload 2: async version
  export function parse(json: string, options: { async: true }): Promise<Record<string, any>>;

  // Overload 3: with custom reviver
  export function parse<T = any>(
    json: string,
    reviver?: (key: string, value: any) => T
  ): T;

  export interface ParseOptions {
    async?: boolean;
    reviver?: (key: string, value: any) => any;
    dateFormat?: 'ISO' | 'timestamp';
  }
}

// Usage - TypeScript picks correct overload
const sync = parse('{"name":"John"}'); // Type: Record<string, any>
const async = parse('{"name":"John"}', { async: true }); // Type: Promise<Record<string, any>>
const typed = parse('{"name":"John"}', (k, v) => v.toUpperCase?.()); // Type: any
```

**B. Generic Type Parameters Across Modules:**

```typescript
// types/db-lib.d.ts
declare module 'db-lib' {
  export interface Connection<TResult = any> {
    query<T = TResult>(sql: string, params?: any[]): Promise<T[]>;
    transaction<T>(fn: () => Promise<T>): Promise<T>;
  }

  export function connect(url: string): Promise<Connection>;
}

// Usage
interface User { id: string; email: string; }

const conn = await connect('postgresql://...');
const users = await conn.query<User>('SELECT * FROM users');
// users is typed as User[] ✅

const result = await conn.transaction(async () => {
  return 42;
});
// result is typed as number ✅
```

**C. Namespace-based Library Typing:**

```typescript
// types/jquery-extended.d.ts
declare global {
  const jQuery: JQueryStatic;
  const $: JQueryStatic;

  interface JQueryStatic {
    // Standard jQuery
    ajax(url: string, settings?: JQuery.AjaxSettings): JQuery.jqXHR;

    // Custom extensions
    customAPI: {
      getUser(id: string): Promise<User>;
      updateUser(id: string, data: Partial<User>): Promise<User>;
    };
  }
}

// Usage in HTML scripts
$(document).ready(() => {
  $.customAPI.getUser('123').then(user => {
    // user is typed as User ✅
  });
});
```

**D. Conditional Type Declarations for Multiple Versions:**

```typescript
// types/legacy-lib.d.ts
declare module 'legacy-lib' {
  const version: '1.0' | '2.0' | '3.0';

  export interface API {
    process(input: string): string;
  }

  export interface APIv3 extends API {
    processAsync(input: string): Promise<string>;
    cancel(): void;
  }

  export const api: version extends '3.0' ? APIv3 : API;
}
```

**Handling Type Conflicts and Augmentation:**

```typescript
// Problem: Library types are incomplete
import axios from 'axios';

const response = await axios.get('/api/users');
// response.data is typed as 'any' (incomplete types)

// Solution: Create augmentation file
// types/axios-augment.d.ts
declare module 'axios' {
  export interface AxiosResponse<T = any> {
    // Add missing properties from actual API
    metadata?: {
      cacheTime: number;
      source: 'server' | 'cache';
    };
  }
}

// Now axios responses have proper typing
import axios from 'axios';

const response = await axios.get<{ users: User[] }>('/api/users');
if (response.metadata?.source === 'cache') {
  console.log('Data from cache');
}
```

**Type Generation from Runtime Code:**

```typescript
// types/runtime-types.d.ts
import type { InferType } from 'schema-validator';

// Runtime schema (JavaScript)
const userSchema = {
  name: 'string',
  age: 'number',
  email: 'email',
  active: 'boolean'
};

// Extract types from schema
export type User = InferType<typeof userSchema>;

// Now User is properly typed based on schema definition
```

</details>

---

### <details>
<summary><strong>🐛 Real-World Scenario: Typing Untyped Charting Library with Complex API</strong></summary>

**Scenario: Integrating Chart.js (Popular but Complex Library)**

Chart.js is a mature charting library with complex, overloaded APIs. The community types exist but are incomplete for custom plugins.

**Initial Problem (4 hours of debugging):**

```typescript
// Before proper typing
import Chart from 'chart.js';

const ctx = document.getElementById('myChart') as HTMLCanvasElement;
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Sales',
        data: [10, 20, 30],
        borderColor: 'rgb(75, 192, 192)' // Any type - typos not caught
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' // Type: any - typo 'top2' not caught!
      }
    }
  }
});

// Runtime error: invalid legend position
// (error only appears when chart renders)
```

**Metrics - Production Impact:**
- 12 chart instances deployed to production
- 3 had invalid configuration options
- 2 issues discovered only after user reports (2 weeks later)
- 8 hours total debugging time
- Users experienced blank chart displays

**Solution: Create Custom Type Definition with Strict Options**

```typescript
// src/types/chart-strict.d.ts
import type { Chart as ChartJS, ChartOptions } from 'chart.js';

declare global {
  namespace ChartStrictTypes {
    type LegendPosition = 'top' | 'left' | 'right' | 'bottom' | 'center';
    type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polar';

    interface StrictChartOptions extends ChartOptions {
      plugins?: {
        legend?: {
          position?: LegendPosition; // Strict union, typos caught
        };
        tooltip?: {
          enabled?: boolean;
          mode?: 'index' | 'dataset' | 'point' | 'nearest' | 'x' | 'y';
        };
      };
    }

    interface StrictDataset {
      label: string; // Required
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      tension?: number; // Only for line charts
      type?: ChartType;
    }

    interface StrictChartConfig {
      type: ChartType;
      data: {
        labels: string[];
        datasets: StrictDataset[];
      };
      options?: StrictChartOptions;
    }
  }
}

// Wrapper function with strict typing
export function createStrictChart(
  ctx: HTMLCanvasElement,
  config: ChartStrictTypes.StrictChartConfig
): ChartJS {
  return new Chart(ctx, config as any); // Cast to bypass library's loose types
}
```

**Usage - Type Safety Achieved:**

```typescript
import { createStrictChart } from './types/chart-strict';

const chart = createStrictChart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb'],
    datasets: [
      {
        label: 'Sales',
        data: [10, 20],
        borderColor: 'rgb(75, 192, 192)'
      }
    ]
  },
  options: {
    plugins: {
      legend: {
        position: 'top2' // ❌ Type error caught immediately!
        // Error: Type '"top2"' is not assignable to type 'LegendPosition'
      }
    }
  }
});
```

**Metrics After Implementation:**
- Type errors caught at development time: 8/12 charts
- Production bugs from config errors: 0
- Time debugging chart issues: 0 (caught by IDE)
- Developer confidence: High (clear error messages)

**Complex Real-World Pattern: Custom Plugin Types**

```typescript
// src/types/chart-plugins.d.ts
declare module 'chart.js' {
  interface PluginOptionsByType {
    line: LinePluginOptions;
    bar: BarPluginOptions;
    pie: PiePluginOptions;
  }

  interface LinePluginOptions {
    annotation?: {
      enabled: boolean;
      elements: AnnotationElement[];
    };
    zoom?: {
      pan: { enabled: boolean; mode: 'xy' | 'x' | 'y' };
      zoom: { wheel: { enabled: boolean; speed: number } };
    };
  }

  interface AnnotationElement {
    id: string;
    type: 'line' | 'box' | 'label';
    xMin: number;
    xMax: number;
  }
}

// Usage with custom plugins
const chart = new Chart(ctx, {
  type: 'line',
  data: { /* ... */ },
  options: {
    plugins: {
      annotation: {
        enabled: true,
        elements: [
          {
            id: 'threshold',
            type: 'line',
            xMin: 5,
            xMax: 10
            // ❌ Type error if xMin missing
          }
        ]
      }
    }
  }
});
```

</details>

---

### <details>
<summary><strong>⚖️ Trade-offs: Different Typing Approaches</strong></summary>

**Approach 1: Use DefinitelyTyped (@types packages)**

Pros:
- Minimal effort (just install package)
- Community maintained and updated
- No custom maintenance burden
- Covers 90% of use cases
- Works with most IDEs immediately

Cons:
- Types may lag behind library updates
- Sometimes incomplete (library has undocumented features)
- May include types you don't use (larger package)
- Can't customize for your specific use case
- Might be maintained by someone with limited domain knowledge

```typescript
// 1 command to get types
npm install --save-dev @types/lodash
```

**Approach 2: Library-Provided Types (Built-in)**

Pros:
- Always perfectly in sync
- Maintained by library authors
- Usually high quality and complete
- No extra installation needed
- Library authors know API best

Cons:
- Not all libraries provide types
- Distribution increases bundle size slightly
- Sometimes overly complicated
- Can't customize for your needs

```typescript
// Modern libraries already include types
import Vue from 'vue'; // Types included in dist/index.d.ts
```

**Approach 3: Manual Declaration Files**

Pros:
- Complete control over API surface
- Can hide complexity with focused types
- Can type library exactly as you use it (smaller declaration)
- Can support multiple library versions
- Forces understanding of library API

Cons:
- Significant time investment
- Must maintain as library evolves
- Easy to fall out of sync
- Type definitions can be complex to write
- Need expertise in TypeScript advanced features

```typescript
// 50+ lines of custom typing work
declare module 'custom-lib' {
  export function process(data: string): Promise<void>;
  // ... more manual declarations
}
```

**Approach 4: Hybrid (Auto-generated + Manual Augmentation)**

Pros:
- Base types automatically maintained
- Can extend with custom types where needed
- Best of both worlds
- Minimal maintenance burden
- Works for complex scenarios

Cons:
- More complex setup
- Need to manage augmentation files
- Can still drift from reality
- Requires discipline to maintain

```typescript
// Install auto-generated types
npm install --save-dev @types/express

// Extend with custom types in your project
// types/express-custom.d.ts
declare global {
  namespace Express {
    interface Request {
      userId?: string; // Your app-specific property
    }
  }
}

export {};
```

**Decision Matrix for Third-Party Libraries:**

| Library Type | Typing Approach | Effort | Quality | Maintenance |
|---|---|---|---|---|
| Popular (React, Vue, Lodash) | @types/package | 5 min | High | Low |
| Modern (Next.js, Solid, SvelteKit) | Built-in types | 0 min | Very High | None |
| Niche/Indie | Manual declarations | 2-8 hours | Medium | Ongoing |
| Internal/Private | Generated declarations | 1 hour | High | None |
| Legacy JavaScript | Hybrid approach | 3-5 hours | High | Low |

**Estimated Effort Comparison (100 libraries):**

| Approach | Setup Time | Per-Library | Maintenance | Total |
|---|---|---|---|---|
| All DefinitelyTyped | 30 min | 5 min × 100 = 8 hours | 1 hour/month | 10 hours |
| All Built-in | 30 min | 0 min | 0 | 0.5 hours |
| All Manual | 2 hours | 4 hours × 100 = 400 hours | 5 hours/week | 420 hours |
| Hybrid (mix of above) | 1 hour | 2 hours × 30 libs = 60 hours | 1 hour/week | 65 hours |

</details>

---

### <details>
<summary><strong>💬 Explain to Junior: Making Sense of Third-Party Types</strong></summary>

**The Problem (Why This Matters):**

Imagine trying to use a tool someone else wrote but with no manual. You can:
1. Guess what buttons do (error-prone)
2. Find the official manual online (slow)
3. Have someone write a summary for you (perfect!)

That's what types do for JavaScript libraries - they're the "summary" that tells TypeScript what each function does.

```typescript
// Without types (confusing and error-prone)
import lodash from 'lodash';
const result = lodash.map(/* what goes here? */); // No IDE hints

// With types (clear and safe)
import _ from 'lodash';
const result = _.map([1, 2, 3], n => n * 2); // IDE shows exact parameters!
```

**Three Levels of Type Safety:**

```typescript
// Level 1: No types (type is 'any')
import untyped from 'untyped-lib';
const result = untyped.doSomething(); // result: any (completely unsafe)
result.foo.bar.baz(); // No error at compile time, might fail at runtime

// Level 2: Partial types (some type info)
import partial from '@types/partial-lib';
const result = partial.doSomething(); // result: unknown (slightly safer)
result.foo; // Type error: don't know what properties exist

// Level 3: Full types (complete type safety)
import full from 'modern-lib'; // Has built-in types
const result = full.doSomething(); // result: ProcessResult (very safe)
result.count; // ✅ IDE shows this property exists
result.name; // ❌ Type error: ProcessResult has no 'name' property
```

**Where Do Types Come From?**

**Source 1: DefinitelyTyped (Community)**

```bash
# Most popular libraries have community-maintained types
npm install --save-dev @types/react
# This downloads React type definitions created by volunteers
# Pros: Someone already did the work
# Cons: Might not be perfectly maintained
```

**Source 2: Library Itself (Official)**

```typescript
// Modern libraries include types directly
import React from 'react'; // React comes with .d.ts files built-in
// Pros: Library authors wrote it (most accurate)
// Cons: Requires library to be TypeScript-aware
```

**Source 3: You (Custom)**

```typescript
// For untyped libraries, you create the types
// old-library.d.ts
declare module 'old-library' {
  export function process(data: string): Promise<void>;
}
// Pros: Complete control, types exactly what you need
// Cons: Requires TypeScript knowledge and time
```

**Three Questions to Ask for Any Library:**

1. **Does the library have built-in types?**
   - Check `node_modules/library-name/package.json`
   - Look for `"types": "dist/index.d.ts"`
   - If yes → Use it directly, zero setup needed

2. **Are there community types on DefinitelyTyped?**
   - Run: `npm search @types/library-name`
   - If yes → `npm install --save-dev @types/library-name`
   - If no → Move to step 3

3. **Can I live with `any` or should I type it?**
   - If library is critical → Create declaration file
   - If library is rarely used → Use `// @ts-ignore` for specific lines
   - If library is being phased out → Don't invest time typing it

**Common Typing Patterns You'll See:**

```typescript
// Pattern 1: Simple function typing
declare function getUser(id: string): User;

// Pattern 2: Function with options
declare function createServer(options: ServerOptions): Server;

// Pattern 3: Class typing
declare class Database {
  connect(url: string): Promise<void>;
  query<T>(sql: string): Promise<T[]>;
}

// Pattern 4: Augmenting global objects
declare global {
  interface Window {
    APP_VERSION: string;
  }
}

// Pattern 5: Module types with namespaces
declare namespace jQuery {
  function ajax(settings: AjaxSettings): jqXHR;
}
```

**Debugging Type Problems Step-by-Step:**

```typescript
// Problem: "Cannot find module" error
import axios from 'axios';
// Error: Cannot find module 'axios' or its corresponding type declarations

// Step 1: Install the types
npm install axios @types/axios

// Problem: "Property doesn't exist" error
import _ from 'lodash';
_.groupByKey([1, 2], n => n); // Error: Property 'groupByKey' does not exist on type

// Step 2: Check the correct method name
// _.groupBy (not groupByKey)
_.groupBy([1, 2], n => n); // ✅ Works

// Problem: Type is "any"
import oldLib from 'old-lib';
const result = oldLib.process(); // result: any

// Step 2: Check if types exist
// If not, create a simple declaration:
// types/old-lib.d.ts
declare module 'old-lib' {
  export function process(): ProcessResult;
  interface ProcessResult {
    data: string;
    error?: Error;
  }
}

// Now result is properly typed
```

**Interview Answer Template:**

Interviewer: "You need to use a JavaScript library in a TypeScript project, but it doesn't have types. What do you do?"

**Your Answer:**

"I'd follow this process:

1. **First, check DefinitelyTyped** - Most popular libraries have community types. I'd run:
```bash
npm search @types/library-name
npm install --save-dev @types/library-name
```
This works for 90% of cases.

2. **If community types don't exist, check the library** - Modern libraries often ship with built-in type definitions. I'd check the `package.json` for a `types` field.

3. **If neither exists, I'd create a minimal declaration file** - I'd create a `.d.ts` file for the functions I actually use:
```typescript
// library.d.ts
declare module 'library-name' {
  export function importantFunction(param: string): Promise<Result>;
}
```
This gives me type safety for critical functions without typing the entire library.

4. **For rarely-used functions, I might use `// @ts-ignore`** - If a function is only used once or twice, I might just suppress the type error rather than spend time writing declarations.

The key is balancing type safety with productivity - I don't need to type everything perfectly, just enough to catch real bugs."

**Mistakes Juniors Often Make:**

```typescript
// ❌ WRONG: Using 'any' everywhere
const lib: any = require('untyped');
const result: any = lib.process('data'); // No type safety at all!

// ✅ RIGHT: Installing types first
npm install @types/untyped

// ❌ WRONG: Not checking if types already exist
// Manually typing lodash when @types/lodash is available

// ✅ RIGHT: Always check DefinitelyTyped first
npm install --save-dev @types/lodash

// ❌ WRONG: Overly complex declaration files
// types/lib.d.ts with 500 lines for functions you never use

// ✅ RIGHT: Type only what you actually use
// types/lib.d.ts with 20 lines for critical functions
declare module 'lib' {
  export function critical(): void;
  // Don't type rarely-used functions
}
```

**Real Interview Scenario Walk-Through:**

Interviewer: "Walk me through typing a complex library like Chart.js for your project."

**Your Answer Flow:**

"Chart.js is a good example because it has complex configuration options. Here's my approach:

1. **First attempt** - Install community types:
```bash
npm install chart.js @types/chart.js
```

2. **Test what's covered** - Create a basic chart and see if the types are sufficient. Most likely, @types/chart.js handles the core API.

3. **Identify gaps** - If I find that chart options aren't fully typed or custom plugins aren't typed, I'd create an augmentation file:
```typescript
// types/chart-custom.d.ts
declare module 'chart.js' {
  interface ChartOptions {
    myCustomOption?: boolean;
  }
}
```

4. **Validate against actual library behavior** - I'd verify my types match the library's actual API by checking examples in the library's documentation.

5. **Maintain over time** - When I update the library, I'd verify the types still match by running `tsc --noEmit` to check for type errors without compiling."

This shows you understand both the practical and deeper aspects of library typing."

</details>
