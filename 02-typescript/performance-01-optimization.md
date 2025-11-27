# TypeScript Performance Optimization

## Question 1: How to optimize TypeScript compilation performance?

**Answer:**

TypeScript compilation performance becomes critical in large codebases where full builds can take minutes and incremental compilations slow down development feedback loops. Optimizing compilation involves configuring the compiler efficiently, leveraging incremental builds, using project references, and understanding what makes compilation slow.

**Core Optimization Strategies:**

1. **Incremental Compilation**: Use `--incremental` flag to cache previous compilation results
2. **Project References**: Split monorepos into separate projects with dependencies
3. **Skip Library Checks**: Use `skipLibCheck` to avoid type-checking node_modules
4. **Selective Type Checking**: Configure `include`/`exclude` patterns carefully
5. **Parallel Compilation**: Use tools like `tsc-watch` or webpack's `ts-loader` with `transpileOnly`

**Quick Wins Configuration:**

```json
{
  "compilerOptions": {
    // Enable incremental compilation (caches .tsbuildinfo)
    "incremental": true,

    // Skip type checking for declaration files in node_modules
    "skipLibCheck": true,

    // Faster module resolution
    "moduleResolution": "bundler", // or "node16"

    // Don't check unused locals/params during development
    "noUnusedLocals": false,
    "noUnusedParameters": false,

    // Use faster emit (no semantic checks in emit phase)
    "isolatedModules": true,

    // Disable source map generation during dev
    "sourceMap": false,

    // Use composite projects for project references
    "composite": true
  },

  // Be specific about what to compile
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "**/*.spec.ts",
    "**/*.test.ts",
    "dist",
    "build"
  ]
}
```

**Project References for Monorepos:**

```json
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}

// packages/app/tsconfig.json
{
  "compilerOptions": {
    "composite": true
  },
  "references": [
    { "path": "../core" }
  ]
}

// Root tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/app" }
  ]
}
```

**Build Commands:**

```bash
# Build with project references
tsc --build

# Incremental build (only changed files)
tsc --build --incremental

# Clean and rebuild
tsc --build --clean
tsc --build

# Watch mode with project references
tsc --build --watch

# Parallel builds (faster for monorepos)
tsc --build --verbose
```

**Build Tools Integration:**

```javascript
// webpack.config.js - Fast development builds
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          // Only transpile, skip type checking (use fork-ts-checker-webpack-plugin)
          transpileOnly: true,

          // Use project references
          projectReferences: true,

          // Faster incremental builds
          experimentalWatchApi: true
        }
      }
    ]
  },
  plugins: [
    // Type checking in separate process
    new ForkTsCheckerWebpackPlugin({
      async: true, // Don't block emit on type errors
      typescript: {
        configFile: 'tsconfig.json',
        build: true // Use --build mode
      }
    })
  ]
};
```

**Vite Configuration (Modern Alternative):**

```typescript
// vite.config.ts - Ultra-fast TypeScript compilation
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Vite uses esbuild for TS compilation (10-100x faster than tsc)
  esbuild: {
    // esbuild doesn't type-check, only transpiles
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },

  build: {
    // Faster source map generation
    sourcemap: false,

    // Target modern browsers (less transpilation)
    target: 'esnext'
  }
});
```

**Performance Metrics:**

```bash
# Measure compilation time
time tsc

# Detailed build trace
tsc --diagnostics
# Output:
# Files:            450
# Lines:            185000
# Identifiers:      95000
# Symbols:          75000
# Types:            25000
# I/O Read:         0.5s
# Parse:            1.2s
# Bind:             0.8s
# Check:            8.5s
# Emit:             1.0s
# Total:            12.0s

# Extended diagnostics (more detailed)
tsc --extendedDiagnostics
```

---

<details>
<summary><strong>🔍 Deep Dive: Compiler Performance Internals and Optimization Techniques</strong></summary>

Understanding what makes TypeScript compilation slow requires knowledge of the compiler's internal architecture and where it spends most of its time during the type checking and emit phases.

**1. Compilation Phase Breakdown**

The TypeScript compiler goes through five distinct phases, each with different performance characteristics:

```typescript
// TypeScript Compiler Internal Flow
class CompilerHost {
  // Phase 1: I/O Read (0.5s for 450 files)
  readFile(fileName: string): string | undefined {
    // Reads source files from disk
    // Optimization: Use in-memory cache, reduce file count
  }

  // Phase 2: Parse (1.2s)
  createSourceFile(fileName: string, text: string): SourceFile {
    // Converts text to AST
    // Performance: O(n) where n = file size
    // Optimization: Incremental parsing for watch mode
  }

  // Phase 3: Bind (0.8s)
  bindSourceFile(file: SourceFile): void {
    // Creates symbol table, resolves imports/exports
    // Performance: O(n * m) where m = imported modules
    // Optimization: Skip library bindings with skipLibCheck
  }

  // Phase 4: Type Check (8.5s - SLOWEST PHASE)
  checkSourceFile(file: SourceFile): void {
    // Validates all type relationships
    // Performance: O(n²) in worst case (deep type inference)
    // Optimization: Incremental builds, explicit types
  }

  // Phase 5: Emit (1.0s)
  emitFiles(files: SourceFile[]): EmitResult {
    // Generates JavaScript, .d.ts, source maps
    // Performance: O(n) for transpilation
    // Optimization: isolatedModules, skip maps
  }
}
```

**2. Incremental Compilation Deep Dive**

Incremental builds use a `.tsbuildinfo` file to cache compilation results:

```json
// .tsbuildinfo (simplified structure)
{
  "program": {
    "fileNames": [
      "./src/index.ts",
      "./src/utils.ts"
    ],
    "fileInfos": {
      "./src/index.ts": {
        "version": "8a3f2c1d...", // Content hash
        "signature": "9b4e3f2a...", // Type signature hash
        "affectsGlobalScope": false
      }
    },
    "options": {
      "composite": true,
      "declaration": true
    },
    "semanticDiagnosticsPerFile": [
      // Cached type errors per file
    ]
  },
  "version": "5.3.3"
}
```

**Incremental Build Algorithm:**

```typescript
class IncrementalCompilationHost {
  getChangedFiles(oldBuildInfo: BuildInfo, currentFiles: SourceFile[]): SourceFile[] {
    const changed: SourceFile[] = [];

    for (const file of currentFiles) {
      const oldInfo = oldBuildInfo.fileInfos[file.fileName];
      const currentHash = this.computeHash(file.text);

      // File changed if content hash differs
      if (!oldInfo || oldInfo.version !== currentHash) {
        changed.push(file);
      }
    }

    return changed;
  }

  getAffectedFiles(changedFiles: SourceFile[]): SourceFile[] {
    const affected = new Set(changedFiles);

    // Find all files that import changed files
    for (const changed of changedFiles) {
      const importers = this.getReverseDependencies(changed);
      importers.forEach(f => affected.add(f));

      // If type signature changed, recheck importers
      if (this.typeSignatureChanged(changed)) {
        const transitiveImporters = this.getTransitiveImporters(changed);
        transitiveImporters.forEach(f => affected.add(f));
      }
    }

    return Array.from(affected);
  }

  // Only recheck affected files (HUGE performance win)
  incrementalBuild(changedFiles: SourceFile[]): void {
    const affected = this.getAffectedFiles(changedFiles);

    // Skip type checking for unchanged files
    for (const file of affected) {
      this.checkSourceFile(file);
    }

    // Reuse cached diagnostics for unchanged files
    this.mergeCachedDiagnostics();
  }
}
```

**Real Performance Impact:**

```typescript
// Scenario: Change one file in 500-file project

// Without incremental (full rebuild):
// - Parse: 500 files (1.5s)
// - Bind: 500 files (1.0s)
// - Check: 500 files (10.0s)
// - Total: 12.5s

// With incremental (1 file changed):
// - Parse: 1 file (0.003s)
// - Bind: 1 file (0.002s)
// - Check: 1 + 5 affected files (0.12s)
// - Total: 0.125s (100x faster!)
```

**3. Project References Performance Benefits**

Project references enable true incremental builds across package boundaries:

```typescript
// Traditional monorepo (slow)
// tsconfig.json includes ALL packages
{
  "include": [
    "packages/*/src/**/*"  // 50 packages, 10,000 files
  ]
}
// Every build: Type check ALL 10,000 files (30s)

// With project references (fast)
// Root tsconfig.json
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/utils" },
    { "path": "./packages/app" }
  ]
}

// Build process:
// 1. tsc --build determines build order from references
// 2. Builds packages/core (unchanged → skip)
// 3. Builds packages/utils (unchanged → skip)
// 4. Builds packages/app (changed → only rebuild this)
// Result: 0.5s instead of 30s
```

**4. Type Complexity and Performance**

Complex type operations slow down type checking exponentially:

```typescript
// ❌ SLOW: Deep recursive type inference
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>  // Recursive (slow for deep objects)
    : T[P];
};

interface DeepNestedState {
  user: {
    profile: {
      settings: {
        notifications: {
          email: { enabled: boolean; frequency: string; };
          push: { enabled: boolean; apps: string[]; };
        };
      };
    };
  };
}

// Type checking DeepPartial<DeepNestedState> takes 500ms+

// ✅ FAST: Explicit types, no deep inference
type PartialUser = {
  user?: {
    profile?: {
      settings?: NotificationSettings;
    };
  };
};

// Type checking takes 5ms
```

**5. Module Resolution Performance**

Different module resolution strategies have different performance characteristics:

```typescript
// tsconfig.json module resolution comparison

// Classic (slowest - checks many locations)
"moduleResolution": "classic"
// For import './utils':
// 1. ./utils.ts
// 2. ./utils.tsx
// 3. ./utils.d.ts
// 4. ./utils/package.json
// 5. ./utils/index.ts
// 6. ./utils/index.tsx
// ... (15+ filesystem checks per import)

// Node (moderate - node_modules traversal)
"moduleResolution": "node"
// For import 'lodash':
// 1. ./node_modules/lodash
// 2. ../node_modules/lodash
// 3. ../../node_modules/lodash
// ... (walks up directory tree)

// Bundler (fastest - minimal checks)
"moduleResolution": "bundler"
// Assumes bundler will resolve, minimal FS checks
// Perfect for webpack/vite/esbuild projects

// Performance difference:
// Classic: 100ms to resolve 500 imports
// Node: 50ms to resolve 500 imports
// Bundler: 10ms to resolve 500 imports
```

**6. Advanced Optimization: Compiler API for Custom Builds**

For maximum performance, use the TypeScript Compiler API directly:

```typescript
import ts from 'typescript';
import { createHash } from 'crypto';

class OptimizedBuilder {
  private fileCache = new Map<string, { hash: string; ast: ts.SourceFile }>();

  build(rootFiles: string[], options: ts.CompilerOptions): void {
    // Create program with custom host
    const host = this.createIncrementalHost(options);
    const program = ts.createProgram(rootFiles, options, host);

    // Only emit changed files
    const changedFiles = this.getChangedFiles(program);

    for (const sourceFile of changedFiles) {
      // Emit only this file (not all files)
      program.emit(
        sourceFile,
        undefined, // writeFile callback
        undefined, // cancellationToken
        false,     // emitOnlyDtsFiles
        undefined  // customTransformers
      );
    }
  }

  private createIncrementalHost(options: ts.CompilerOptions): ts.CompilerHost {
    const host = ts.createCompilerHost(options);

    // Override getSourceFile to use cache
    const originalGetSourceFile = host.getSourceFile;
    host.getSourceFile = (fileName, languageVersion) => {
      const content = ts.sys.readFile(fileName);
      if (!content) return undefined;

      const hash = createHash('md5').update(content).digest('hex');
      const cached = this.fileCache.get(fileName);

      // Return cached AST if file unchanged
      if (cached && cached.hash === hash) {
        return cached.ast;
      }

      // Parse and cache
      const ast = originalGetSourceFile(fileName, languageVersion);
      if (ast) {
        this.fileCache.set(fileName, { hash, ast });
      }

      return ast;
    };

    return host;
  }

  private getChangedFiles(program: ts.Program): ts.SourceFile[] {
    return program.getSourceFiles().filter(sf => {
      const cached = this.fileCache.get(sf.fileName);
      return !cached; // File not in cache = changed
    });
  }
}

// Usage
const builder = new OptimizedBuilder();
builder.build(['src/index.ts'], {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
  incremental: true
});

// Result: 80% faster than tsc for incremental builds
```

**Performance Metrics with Optimizations:**

```
Large monorepo (50 packages, 10,000 files):

Before optimizations:
- Cold build: 120s
- Incremental (1 file): 45s
- Watch mode rebuild: 30s

After optimizations:
- Cold build: 45s (project references + skipLibCheck)
- Incremental (1 file): 2s (incremental + project references)
- Watch mode rebuild: 0.5s (custom compiler host + cache)

Improvements:
- Cold: 2.6x faster
- Incremental: 22.5x faster
- Watch: 60x faster
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Slow TypeScript Compilation in E-Commerce Platform</strong></summary>

**Context:**

You're working on a large e-commerce platform with 15,000 TypeScript files across 25 packages. Developers are complaining that TypeScript compilation takes 8-10 minutes for full builds and 30-45 seconds for incremental changes in watch mode, severely impacting development velocity. The CI/CD pipeline times out after 15 minutes, causing deployment delays.

**Initial Metrics:**

```bash
# Full build diagnostics
$ tsc --diagnostics

Files:            15,247
Lines:            3,450,000
Nodes:            12,800,000
Identifiers:      4,200,000
Symbols:          2,100,000
Types:            850,000
Instantiations:   1,500,000
Memory used:      4,800MB
I/O Read:         12.5s
Parse time:       45.2s
Bind time:        38.7s
Check time:       385.4s  ⚠️ BOTTLENECK
Emit time:        28.3s
Total time:       510.1s (8.5 minutes)

# Incremental build (single file change)
$ tsc --watch (after change)
File change detected. Starting incremental compilation...
Check time:       32.8s  ⚠️ TOO SLOW
Total time:       35.2s
```

**Project Structure:**

```
ecommerce-platform/
├── packages/
│   ├── core/           (500 files, base types)
│   ├── api/            (800 files, REST/GraphQL)
│   ├── ui-components/  (1,200 files, React components)
│   ├── cart/           (400 files, shopping cart logic)
│   ├── checkout/       (600 files, payment/shipping)
│   ├── products/       (900 files, catalog/search)
│   ├── users/          (500 files, auth/profile)
│   ├── admin/          (1,500 files, backoffice)
│   ├── mobile-app/     (2,000 files, React Native)
│   └── ... (16 more packages)
└── tsconfig.json (single config for all packages)
```

**Root Cause Analysis:**

```typescript
// 1. ISSUE: Single tsconfig.json for entire monorepo
{
  "compilerOptions": {
    "incremental": false,  // ❌ Not enabled
    "skipLibCheck": false, // ❌ Type checking node_modules
    "declaration": true,
    "sourceMap": true      // ❌ Generating source maps in dev
  },
  "include": [
    "packages/*/src/**/*"  // ❌ All 15,000 files
  ]
}

// 2. ISSUE: Complex type inference in shared types
// packages/core/src/types/api.ts
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>  // ❌ Recursive for 50+ level deep objects
    : T[P];
};

type ApiResponse<T> = DeepReadonly<{
  data: T;
  meta: {
    pagination: {
      page: number;
      total: number;
      // ... 30 more nested fields
    };
    // ... 15 more nested objects
  };
}>;

// Used in 2,000+ files - type checking takes 180s alone!

// 3. ISSUE: Barrel exports causing circular dependencies
// packages/ui-components/src/index.ts
export * from './Button';
export * from './Input';
// ... 300 more exports
// ❌ Every import reprocesses entire barrel (30s overhead)

// 4. ISSUE: No module resolution optimization
"moduleResolution": "node"
// ❌ Walks up node_modules tree for every import

// 5. ISSUE: Type checking test files in production build
"include": [
  "packages/*/src/**/*",
  "packages/*/**/*.test.ts",  // ❌ 3,000 test files
  "packages/*/**/*.spec.ts"
]
```

**Solution Implementation:**

**Step 1: Enable Project References**

```bash
# Create individual tsconfig.json for each package
# packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["**/*.test.ts", "**/*.spec.ts"]
}

# packages/api/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist"
  },
  "references": [
    { "path": "../core" }
  ],
  "include": ["src"]
}

# packages/ui-components/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "jsx": "react-jsx",
    "outDir": "./dist"
  },
  "references": [
    { "path": "../core" },
    { "path": "../api" }
  ],
  "include": ["src"]
}

# Root tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/api" },
    { "path": "./packages/ui-components" },
    // ... 22 more references in dependency order
  ]
}
```

**Step 2: Optimize Compiler Options**

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],

    // PERFORMANCE OPTIMIZATIONS
    "incremental": true,        // ✅ Enable incremental builds
    "skipLibCheck": true,       // ✅ Skip node_modules type checking
    "moduleResolution": "bundler", // ✅ Fast resolution (using webpack)
    "isolatedModules": true,    // ✅ Enable transpileOnly mode

    // DEVELOPMENT SPEED
    "sourceMap": false,         // ✅ No source maps in dev (add in prod)
    "declaration": true,        // Keep for project references
    "declarationMap": false,    // ✅ Skip declaration maps

    // TYPE CHECKING
    "strict": true,
    "noUnusedLocals": false,    // ✅ Skip in dev (enable in CI)
    "noUnusedParameters": false,

    // MODULE SYSTEM
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true
  }
}
```

**Step 3: Simplify Complex Types**

```typescript
// BEFORE (slow - 180s type checking)
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

type ApiResponse<T> = DeepReadonly<{
  data: T;
  meta: ComplexMetadata;
}>;

// AFTER (fast - 2s type checking)
// Use simpler utility types
type ApiResponse<T> = {
  readonly data: T;
  readonly meta: Readonly<ComplexMetadata>;
};

// Or use library types (pre-computed)
import type { DeepReadonly } from 'ts-essentials';

// Only apply readonly at necessary depth
type ApiResponse<T> = {
  readonly data: T;
  meta: ComplexMetadata; // Don't deep-readonly everything
};
```

**Step 4: Fix Barrel Exports**

```typescript
// BEFORE: packages/ui-components/src/index.ts
export * from './Button';
export * from './Input';
// ... 300 exports

// AFTER: Direct imports (no barrel)
// packages/ui-components/src/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './types';

// Usage
import { Button } from '@ecommerce/ui-components/Button';
// Instead of: import { Button } from '@ecommerce/ui-components';
```

**Step 5: Webpack Configuration for Fast Dev Builds**

```javascript
// webpack.config.js
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  mode: 'development',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          // Only transpile (no type checking)
          transpileOnly: true,

          // Use project references
          projectReferences: true,

          // Faster incremental builds
          experimentalWatchApi: true,

          // Compile in parallel
          happyPackMode: true
        }
      }
    ]
  },

  plugins: [
    // Type check in separate process (doesn't block builds)
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: 'tsconfig.json',
        build: true, // Use tsc --build
        mode: 'write-references' // Update .tsbuildinfo
      },
      async: true, // Don't block webpack emit
      logger: {
        infrastructure: 'silent',
        issues: 'console'
      }
    })
  ],

  // Cache compiled modules
  cache: {
    type: 'filesystem',
    cacheDirectory: '.webpack-cache'
  }
};
```

**Results After Optimization:**

```bash
# Full build with project references
$ tsc --build --verbose

[core] Building...
[core] Done in 3.2s

[api] Building...
[api] Using cached results for 450/500 files
[api] Done in 1.8s

[ui-components] Building...
[ui-components] Using cached results for 1100/1200 files
[ui-components] Done in 4.5s

... (22 more packages)

Total build time: 48.3s (was 510s)
Improvement: 10.5x faster (91% reduction)

# Incremental build (single file change in ui-components)
$ tsc --build --verbose

[core] Up to date
[api] Up to date
[ui-components] Building...
[ui-components] 1 file changed, 8 affected files
[ui-components] Done in 0.8s

... (packages depending on ui-components)

Total incremental time: 2.1s (was 35.2s)
Improvement: 16.7x faster (94% reduction)

# Webpack dev server (with transpileOnly)
$ webpack serve

Starting dev server...
Initial build: 12.4s (was 120s)
Hot reload: 0.3s (was 8s)
Type checking: Async (doesn't block)

Improvement: 9.6x faster initial, 26x faster rebuilds
```

**Production Build Configuration:**

```json
// tsconfig.prod.json (stricter for production)
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": true,          // Enable for production debugging
    "declarationMap": true,
    "noUnusedLocals": true,     // Strict checks in CI
    "noUnusedParameters": true,
    "removeComments": true,     // Smaller output
    "importHelpers": true       // Use tslib helpers (smaller bundle)
  }
}
```

**CI/CD Pipeline Optimization:**

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # Cache TypeScript build info
      - name: Cache TypeScript
        uses: actions/cache@v3
        with:
          path: |
            packages/*/.tsbuildinfo
            packages/*/dist
            .webpack-cache
          key: ${{ runner.os }}-ts-${{ hashFiles('**/tsconfig.json') }}-${{ hashFiles('**/*.ts') }}
          restore-keys: |
            ${{ runner.os }}-ts-${{ hashFiles('**/tsconfig.json') }}-
            ${{ runner.os }}-ts-

      - run: npm ci

      # Use production config in CI
      - run: tsc --build tsconfig.prod.json

      # CI build time: 12s (was 8+ minutes - often timed out)
```

**Key Takeaways:**

1. **Project references**: Biggest win - enables true incremental builds across packages
2. **skipLibCheck**: Immediate 30% speedup by not type-checking node_modules
3. **Simplified types**: Avoid deep recursive types - they're exponentially slow
4. **transpileOnly mode**: Separate transpilation from type checking for fast dev feedback
5. **Module resolution**: `bundler` strategy is 5x faster than `node` for bundled apps
6. **Caching**: Both TypeScript (.tsbuildinfo) and webpack caches are critical

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Type Safety vs Compilation Speed</strong></summary>

TypeScript compilation performance often requires balancing type safety guarantees against build speed. Understanding these trade-offs helps make informed decisions for different environments (development vs production, local vs CI).

**1. Full Type Checking vs transpileOnly Mode**

```typescript
// Option 1: Full type checking (slow but safe)
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}

// Webpack config
module.exports = {
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'ts-loader',
      options: {
        transpileOnly: false // Type check during build
      }
    }]
  }
};

// Pros:
// - Catches type errors immediately
// - No separate type checking step needed
// - Single source of truth

// Cons:
// - Slow builds (10-30s for 1000 files)
// - Blocks hot reload
// - Poor developer experience

// Option 2: transpileOnly (fast but deferred safety)
module.exports = {
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'ts-loader',
      options: {
        transpileOnly: true // Skip type checking
      }
    }]
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin() // Type check in parallel
  ]
};

// Pros:
// - Fast builds (1-2s for 1000 files)
// - Instant hot reload
// - Type checking doesn't block development

// Cons:
// - Type errors shown separately (async)
// - Can write code with type errors
// - Need separate plugin/process

// Decision Matrix:
// - Development: Use transpileOnly + async type checking
// - CI/Production: Use full type checking
// - Pre-commit hook: Run tsc --noEmit
```

**2. skipLibCheck: Speed vs Library Type Safety**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": false  // or true?
  }
}

// Example library with type errors
// node_modules/@types/some-lib/index.d.ts
export function buggyFunction(): string | number {
  return 42;
}

export const result: string = buggyFunction(); // Type error in library!

// With skipLibCheck: false
// - Catches type errors in library definitions
// - Slower compilation (checks all .d.ts files)
// - Can fail builds due to library bugs you can't fix
// Build time: +30-50% for large projects

// With skipLibCheck: true
// - Ignores library type errors
// - Much faster compilation
// - May miss real issues in library types
// Build time: Baseline

// Comparison:
// Project with 500 dependencies, 10,000 .d.ts files:
// skipLibCheck: false → 45s compilation
// skipLibCheck: true → 28s compilation (37% faster)

// Recommendation:
// ✅ Use skipLibCheck: true (almost always)
// - Library type errors are rare
// - You can't fix them anyway
// - Huge performance benefit
// - Quality libraries have correct types
```

**3. Incremental Builds: Correctness vs Performance**

```typescript
// Incremental compilation can sometimes produce incorrect builds
// if dependency graph is not correctly tracked

// tsconfig.json
{
  "compilerOptions": {
    "incremental": true  // Creates .tsbuildinfo cache
  }
}

// Scenario where incremental builds can fail:
// Step 1: Initial build
// types.ts
export interface User {
  id: string;
  name: string;
}

// user-service.ts
import { User } from './types';
export function getUser(): User {
  return { id: '1', name: 'John' };
}

// Step 2: Change types.ts (add field)
// types.ts
export interface User {
  id: string;
  name: string;
  email: string; // Added field
}

// Step 3: Incremental build
// TypeScript should recheck user-service.ts
// But if cache is stale, it might not!

// Result: user-service.ts has stale type info
// getUser() returns User without email
// No type error shown (incorrect!)

// Solutions:
// 1. Force rebuild: tsc --build --force
// 2. Clean cache: tsc --build --clean
// 3. Delete .tsbuildinfo files

// Trade-off:
// Speed: Incremental builds are 10-100x faster
// Safety: Occasionally need full rebuilds
// Best practice: Incremental locally, clean in CI

// CI configuration:
// .github/workflows/ci.yml
jobs:
  typecheck:
    steps:
      - run: tsc --build --clean  # Clean build in CI
      - run: tsc --build --force  # Ensure everything rebuilds
```

**4. Project References: Modularity vs Complexity**

```typescript
// Without project references (simple but slow)
// Single tsconfig.json
{
  "compilerOptions": { /* ... */ },
  "include": ["packages/*/src/**/*"]
}

// Pros:
// - Simple setup (one config file)
// - Easy to understand
// - No build ordering needed

// Cons:
// - Every change rebuilds everything
// - No parallel compilation
// - Slow at scale (10,000+ files)

// With project references (complex but fast)
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true  // Required for references
  }
}

// packages/app/tsconfig.json
{
  "references": [
    { "path": "../core" }
  ]
}

// Pros:
// - Incremental builds across packages
// - Parallel compilation
// - 10-100x faster for large monorepos

// Cons:
// - Complex setup (tsconfig per package)
// - Must manage build order
// - declaration files required (larger output)

// Complexity comparison:
// Simple monorepo: 1 config file
// Project references: 25+ config files for 25 packages

// Performance comparison (25 packages, 5000 files):
// Without references: 180s build, 45s incremental
// With references: 60s build, 2s incremental

// Decision:
// - <5 packages: Skip project references
// - 5-10 packages: Consider project references
// - >10 packages: Definitely use project references
```

**5. Type Complexity: Powerful Types vs Compilation Time**

```typescript
// Option 1: Complex utility types (powerful but slow)
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? DeepRequired<T[P]>
    : T[P];
};

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// Usage
interface AppState {
  user: { profile: { settings: { theme: string; } } };
  cart: { items: { id: string; quantity: number; }[] };
  // 50 more nested levels...
}

type PartialState = DeepPartial<AppState>;
// Type checking: 800ms per usage (recursive inference)

// Option 2: Simple types (less powerful but fast)
type PartialUser = {
  user?: {
    profile?: {
      settings?: Partial<Settings>;
    };
  };
};

type PartialCart = {
  cart?: {
    items?: Partial<CartItem>[];
  };
};

// Explicitly define partial types
type PartialAppState = PartialUser & PartialCart;
// Type checking: 5ms per usage

// Performance comparison:
// Complex recursive types: 800ms × 500 usages = 400s
// Simple explicit types: 5ms × 500 usages = 2.5s
// Difference: 160x slower

// Trade-off decision:
// - Use complex types: When type safety is critical, small codebase
// - Use simple types: When performance matters, large codebase
// - Middle ground: Limit recursion depth

type SafeDeepPartial<T, Depth extends number = 3> = {
  [P in keyof T]?: Depth extends 0
    ? T[P]
    : T[P] extends object
    ? SafeDeepPartial<T[P], Prev<Depth>>
    : T[P];
};

// Limits recursion to 3 levels (much faster)
```

**6. Source Maps: Debugging vs Build Performance**

```typescript
// tsconfig.json source map options
{
  "compilerOptions": {
    "sourceMap": true,        // Generate .js.map files
    "inlineSourceMap": false, // Inline maps in .js files
    "inlineSources": false,   // Include TS source in maps
    "declarationMap": true    // Generate .d.ts.map files
  }
}

// Performance impact:
// sourceMap: false → Build time: 10s
// sourceMap: true → Build time: 14s (+40%)
// inlineSourceMap: true → Build time: 18s (+80%)
// declarationMap: true → Build time: 16s (+60%)

// File size impact:
// app.js: 2MB
// app.js.map: 3MB (150% of JS size)
// With inlineSourceMap: app.js becomes 5MB

// Trade-offs:
// Development:
{
  "sourceMap": false,        // Faster builds
  "declarationMap": false    // Don't need for dev
}

// Production:
{
  "sourceMap": true,         // Enable debugging
  "declarationMap": true,    // Useful for library consumers
  "inlineSources": true      // Include TS source for better debugging
}

// CI builds:
{
  "sourceMap": true,
  "declarationMap": false,   // Usually not needed
  "inlineSources": false     // Smaller files
}
```

**7. Strict Mode: Type Safety vs Adoption Cost**

```typescript
// tsconfig.json strict options
{
  "compilerOptions": {
    "strict": true,  // Enables all strict checks

    // Or individual flags:
    "noImplicitAny": true,           // Fast check
    "strictNullChecks": true,        // Moderate performance impact
    "strictFunctionTypes": true,     // Fast check
    "strictBindCallApply": true,     // Fast check
    "strictPropertyInitialization": true, // Fast check
    "noImplicitThis": true,          // Fast check
    "alwaysStrict": true,            // Fast check

    // Additional strict checks (not in "strict"):
    "noUncheckedIndexedAccess": true, // ⚠️ Slow for large arrays
    "exactOptionalPropertyTypes": true // ⚠️ Slow type checking
  }
}

// Performance impact on large codebase (5000 files):
// strict: false → Build: 30s, Check: 15s
// strict: true → Build: 30s, Check: 22s (+47%)
// + noUncheckedIndexedAccess → Check: 35s (+133%)

// Migration cost vs safety:
// Enabling strict mode on existing project:
// - 500 type errors to fix (2-3 weeks)
// - Better runtime safety
// - Slower type checking

// Recommendation:
// New projects: strict: true from day 1
// Existing projects: Gradual migration
// {
//   "strict": false,
//   "noImplicitAny": true,  // Enable incrementally
//   "strictNullChecks": true // Enable next
// }
```

**Decision Matrix Summary:**

| Feature | Development | CI/Production | Monorepo |
|---------|-------------|---------------|----------|
| transpileOnly | ✅ Yes | ❌ No | ✅ Yes |
| skipLibCheck | ✅ Yes | ✅ Yes | ✅ Yes |
| incremental | ✅ Yes | ❌ No (clean build) | ✅ Yes |
| Project references | ⚠️ If >5 packages | ✅ Yes | ✅ Essential |
| sourceMap | ❌ No | ✅ Yes | ❌ No |
| declarationMap | ❌ No | ⚠️ Libraries only | ❌ No |
| strict | ✅ Yes (new) | ✅ Yes | ✅ Yes |
| Deep utility types | ❌ Avoid | ❌ Avoid | ❌ Avoid |

</details>

---

<details>
<summary><strong>💬 Explain to Junior: TypeScript Compilation Performance</strong></summary>

**Simple Analogy:**

Imagine TypeScript compilation like a factory quality control process:

**Without optimization (slow factory):**
- Every product (file) goes through every inspection station (parsing, type checking, emitting)
- Every day, ALL products are inspected from scratch (no caching)
- One production line handles everything (no parallelization)
- Every component supplier (node_modules) is also inspected
- Result: Takes 10 minutes to verify 1000 products

**With optimization (fast factory):**
- Products are grouped by department (project references)
- Only changed products are reinspected (incremental builds)
- Multiple production lines run in parallel (parallel compilation)
- Trusted suppliers skip inspection (skipLibCheck)
- Result: Takes 30 seconds to verify the same 1000 products

**Key Concepts Explained:**

**1. Incremental Compilation**

```typescript
// Think of it like video game save files

// Without incremental (no saves):
// - Close game → lose all progress
// - Next time → start from beginning
// - Takes 10 minutes to get back to same level

// With incremental (save files):
// - Game saves progress in .tsbuildinfo file
// - Next time → continue from save point
// - Takes 10 seconds to resume

// TypeScript incremental:
{
  "compilerOptions": {
    "incremental": true  // Enable "save files"
  }
}

// Creates .tsbuildinfo (like a save file)
// Next build: Loads save, only checks changed files
```

**2. skipLibCheck**

```typescript
// Think of it like trusting official products

// Without skipLibCheck:
// - You buy a laptop from Dell
// - Before using, you inspect every internal component
// - You find a tiny issue in the Wi-Fi chip
// - You can't use the laptop (even though you can't fix the chip anyway)

// With skipLibCheck:
// - You buy a laptop from Dell
// - You trust Dell tested it properly
// - You use it immediately
// - If there's an issue, Dell will fix it in updates

// TypeScript equivalent:
{
  "compilerOptions": {
    "skipLibCheck": true  // Trust library authors
  }
}

// Don't type-check node_modules (you can't fix them anyway)
// Saves 30-50% compilation time
```

**3. Project References**

```typescript
// Think of it like a construction site

// Without project references (one giant building):
// - 1000 workers building one huge structure
// - If one brick changes, inspect entire building
// - Takes hours to verify everything

// With project references (separate buildings):
// Building A (foundation) ← Built first
// Building B (floor 1) ← Depends on A
// Building C (floor 2) ← Depends on B

// If floor 2 changes:
// - Don't rebuild foundation (A is unchanged)
// - Don't rebuild floor 1 (B is unchanged)
// - Only rebuild floor 2 (C changed)
// - Takes minutes instead of hours

// TypeScript equivalent:
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true  // This is a separate "building"
  }
}

// packages/app/tsconfig.json
{
  "references": [
    { "path": "../core" }  // Depends on core "building"
  ]
}
```

**4. transpileOnly Mode**

```typescript
// Think of it like cooking and tasting separately

// Normal mode (cook and taste together):
// - Mix ingredients (parse)
// - Cook dish (transpile)
// - Taste for quality (type check)
// - Serve (emit JavaScript)
// - Total time: 10 minutes

// transpileOnly mode (cook fast, taste later):
// - Mix and cook immediately (parse + transpile)
// - Serve right away (emit JavaScript)
// - Taste in background (type check in separate process)
// - Total time: 2 minutes (tasting doesn't block serving)

// Webpack config:
module.exports = {
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'ts-loader',
      options: {
        transpileOnly: true  // Cook fast, don't wait for tasting
      }
    }]
  },
  plugins: [
    // Taste in background (doesn't block hot reload)
    new ForkTsCheckerWebpackPlugin()
  ]
};
```

**Common Questions:**

**Q: Why is my TypeScript build so slow?**

```typescript
// Most common reasons:

// 1. Not using incremental builds
// Fix:
{
  "compilerOptions": {
    "incremental": true  // Add this!
  }
}

// 2. Type checking node_modules
// Fix:
{
  "compilerOptions": {
    "skipLibCheck": true  // Add this!
  }
}

// 3. Complex recursive types
type DeepPartial<T> = {  // ❌ Slow
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Fix: Use simpler types or limit depth

// 4. Large monorepo with one tsconfig.json
// Fix: Use project references (split into packages)
```

**Q: What's the fastest way to develop with TypeScript?**

```typescript
// Development setup (speed first):
{
  "compilerOptions": {
    "incremental": true,        // Faster rebuilds
    "skipLibCheck": true,       // Skip libraries
    "sourceMap": false,         // No source maps in dev
    "declaration": false,       // No .d.ts files in dev
    "noUnusedLocals": false,    // Skip strict checks
    "noUnusedParameters": false
  }
}

// Webpack/Vite: Use transpileOnly mode
// Type checking: Async (doesn't block hot reload)

// Production/CI setup (safety first):
{
  "compilerOptions": {
    "incremental": false,       // Clean builds
    "skipLibCheck": true,       // Still skip (safe)
    "sourceMap": true,          // Enable debugging
    "declaration": true,        // Generate .d.ts
    "strict": true,             // All strict checks
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Q: How do I measure TypeScript performance?**

```bash
# Get detailed timing breakdown
tsc --diagnostics

# Output:
# Files:    500
# Lines:    120,000
# Check:    12.5s  ← Main bottleneck
# Emit:     1.2s
# Total:    15.8s

# If "Check" time is high:
# - Simplify complex types
# - Enable skipLibCheck
# - Use project references

# If "Emit" time is high:
# - Disable source maps in dev
# - Use transpileOnly mode
```

**Interview Answer Template:**

**Question: "How would you optimize TypeScript compilation performance?"**

**Answer Structure:**

"I'd start by measuring the current performance using `tsc --diagnostics` to identify bottlenecks. The most impactful optimizations are:

1. **Enable incremental builds** with `incremental: true` - this caches previous compilation results and only rechecks changed files, often giving 10-100x speedup

2. **Use skipLibCheck** to skip type-checking node_modules - typically saves 30-50% compilation time

3. **For monorepos**, implement project references to enable per-package incremental builds and parallel compilation

4. **In development**, use transpileOnly mode with async type checking to get instant hot reloads without blocking on type errors

5. **Simplify complex types** - deep recursive types can slow type checking exponentially

For example, in a recent project with 5000 files, enabling incremental + skipLibCheck + project references reduced full builds from 8 minutes to 45 seconds, and incremental builds from 30 seconds to 2 seconds."

**Red Flags in Code Reviews:**

```typescript
// ❌ BAD: Single tsconfig for entire monorepo
{
  "include": ["packages/*/src/**/*"]  // 10,000 files
}

// ✅ GOOD: Project references
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/app" }
  ]
}

// ❌ BAD: Deep recursive types without depth limit
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ✅ GOOD: Limit recursion depth
type DeepPartial<T, Depth = 3> = Depth extends 0
  ? T
  : { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P], Prev<Depth>> : T[P] };

// ❌ BAD: Type checking node_modules
{
  "compilerOptions": {
    "skipLibCheck": false  // Slow!
  }
}

// ✅ GOOD: Skip library checks
{
  "compilerOptions": {
    "skipLibCheck": true  // Fast!
  }
}
```

**Key Takeaways:**
- Incremental builds = save files (resume instead of restart)
- skipLibCheck = trust official products (don't inspect libraries)
- Project references = separate buildings (rebuild only changed parts)
- transpileOnly = cook fast, taste later (async type checking)
- Always measure with --diagnostics before optimizing

</details>

---

## Question 2: What are type-level performance considerations in TypeScript?

**Answer:**

Type-level performance refers to how efficiently TypeScript's type system evaluates and infers types during compilation. Unlike runtime performance (how fast code executes), type-level performance impacts build times and IDE responsiveness. Complex type operations can cause exponential slowdowns in type checking, while well-designed types check instantly.

**Key Type-Level Performance Factors:**

1. **Type Inference Complexity**: How many steps TypeScript needs to infer a type
2. **Type Instantiations**: Number of times generic types are instantiated
3. **Union/Intersection Size**: Large unions (100+ members) slow down type checking
4. **Conditional Type Recursion**: Deep recursion in conditional types
5. **Mapped Type Complexity**: Transforming large object types with mapped types

**Performance Categories:**

```typescript
// INSTANT (<1ms type checking)
type FastType = string | number | boolean;
const value: FastType = 42;

// FAST (1-10ms type checking)
type Props = {
  id: string;
  name: string;
  children: React.ReactNode;
};

// MODERATE (10-100ms type checking)
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

// SLOW (100-1000ms type checking)
type VeryDeepRecursive<T, Depth = 10> = {
  [P in keyof T]: Depth extends 0
    ? T[P]
    : T[P] extends object
    ? VeryDeepRecursive<T[P], Prev<Depth>>
    : T[P];
};

// EXTREMELY SLOW (>1000ms, may cause TS server crash)
type Permutations<T extends string> = T extends any
  ? T | `${T},${Permutations<Exclude<T, T>>}`
  : never;
// For 10 strings: 3,628,800 type instantiations!
```

**Common Performance Issues:**

**1. Large Union Types**

```typescript
// ❌ SLOW: 1000-member union
type HttpStatusCode =
  | 100 | 101 | 102 | 103
  | 200 | 201 | 202 | 203 | 204
  // ... 1000 more numbers
  | 599;

// Type checking: 500ms per usage

// ✅ FAST: Use type narrowing instead
type HttpStatusCode = number & { readonly __brand: 'HttpStatusCode' };

function isValidStatus(code: number): code is HttpStatusCode {
  return code >= 100 && code < 600;
}
```

**2. Deep Recursive Types**

```typescript
// ❌ SLOW: Unbounded recursion
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>  // Can recurse 50+ levels
    : T[P];
};

// ✅ FAST: Limit recursion depth
type DeepReadonly<T, Depth extends number = 5> = Depth extends 0
  ? T
  : {
      readonly [P in keyof T]: T[P] extends object
        ? DeepReadonly<T[P], Prev<Depth>>
        : T[P];
    };

type Prev<N extends number> = [never, 0, 1, 2, 3, 4, 5][N];
```

**3. Excessive Type Instantiations**

```typescript
// ❌ SLOW: Generic type instantiated for every property
type Validated<T> = {
  [P in keyof T]: {
    value: T[P];
    error?: string;
    touched: boolean;
    dirty: boolean;
  };
};

interface Form {
  name: string;
  email: string;
  // ... 100 more fields
}

type ValidatedForm = Validated<Form>;
// 100 object type instantiations

// ✅ FAST: Use interface or shared type
interface ValidatedField<T> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

type ValidatedForm = {
  [P in keyof Form]: ValidatedField<Form[P]>;
};
// 1 generic instantiation, reused 100 times
```

**4. Complex Conditional Types**

```typescript
// ❌ SLOW: Nested conditionals with inference
type DeepExtract<T, U> = T extends any[]
  ? T[number] extends U
    ? T[number]
    : never
  : T extends object
  ? { [K in keyof T]: DeepExtract<T[K], U> }[keyof T]
  : T extends U
  ? T
  : never;

// ✅ FAST: Simplify or use helper types
type DeepExtract<T, U> = T extends U
  ? T
  : T extends any[]
  ? T[number] extends U
    ? T[number]
    : never
  : never;
```

**Best Practices:**

```typescript
// 1. Use specific types over generic unions
type Status = 'pending' | 'success' | 'error';  // ✅ Fast
type Status = string;  // ❌ Too loose, no type safety

// 2. Avoid deeply nested objects in types
interface NestedState {  // ❌ Slow type operations
  user: {
    profile: {
      settings: {
        notifications: {
          email: boolean;
        };
      };
    };
  };
}

interface Settings {  // ✅ Fast
  emailNotifications: boolean;
}
interface UserProfile {
  settings: Settings;
}
interface NestedState {
  userProfile: UserProfile;
}

// 3. Use type aliases for complex intersections
type Props = PropsA & PropsB & PropsC & PropsD;  // ❌ Recalculated each time

interface Props extends PropsA, PropsB, PropsC, PropsD {}  // ✅ Computed once

// 4. Limit generic type parameters
type Complex<A, B, C, D, E> = /* ... */;  // ❌ Hard to infer

type Complex<T, Options = {}> = /* ... */;  // ✅ Easier inference
```

**Measuring Type Performance:**

```bash
# Enable TypeScript performance tracing
tsc --generateTrace traceDir

# Analyze trace with @typescript/analyze-trace
npx @typescript/analyze-trace traceDir

# Output shows:
# - Slowest type instantiations
# - Most expensive type checks
# - Files with longest check times
```

---

<details>
<summary><strong>🔍 Deep Dive: Type System Performance and Evaluation Strategies</strong></summary>

TypeScript's type system is a compile-time constraint solver that evaluates type relationships through sophisticated algorithms. Understanding how these algorithms work reveals why certain type patterns are slow and how to optimize them.

**1. Type Checking Algorithm Complexity**

TypeScript uses structural typing with lazy evaluation, leading to different complexity classes for various type operations:

```typescript
// O(1) - Constant time type checking
type PrimitiveType = string | number | boolean;
const value: PrimitiveType = 42;
// Single comparison against union members

// O(n) - Linear time (n = number of properties)
interface User {
  id: string;
  name: string;
  email: string;
  // ... n properties
}

const user: User = {
  id: '1',
  name: 'John',
  email: 'john@example.com'
};
// Checks each property once

// O(n²) - Quadratic time (n = number of union members)
type LargeUnion =
  | { type: 'A'; valueA: string }
  | { type: 'B'; valueB: number }
  // ... 100 more members
  | { type: 'Z'; valueZ: boolean };

function process(item: LargeUnion) {
  // TypeScript checks discriminant against all 100+ members
  // For each property access, rechecks union
  // Total: 100 × 100 = 10,000 type comparisons
}

// O(2^n) - Exponential time (n = recursion depth)
type DeepNested<T, N extends number = 10> = N extends 0
  ? T
  : { nested: DeepNested<T, Prev<N>> };

// Each recursion level doubles type complexity
// Depth 10: 1,024 type instantiations
// Depth 20: 1,048,576 type instantiations (crash!)
```

**2. Type Instantiation Cache and Memoization**

TypeScript caches type instantiations to avoid redundant calculations:

```typescript
// Example: Generic type instantiation caching

// First usage: Type is computed and cached
type Result1 = Array<string>;
// TypeScript computes: Array<string> = {
//   [index: number]: string;
//   length: number;
//   push(...items: string[]): number;
//   // ... 40 more methods
// }
// Cache stores: Array<string> → computed type

// Second usage: Retrieved from cache
type Result2 = Array<string>;
// TypeScript retrieves cached result (instant)

// Different type parameter: New computation
type Result3 = Array<number>;
// TypeScript computes new instantiation
// Cache now has: Array<string>, Array<number>

// Implications for performance:
// ✅ GOOD: Reuse same type instantiations
type UserArray = Array<User>;  // Computed once
const users1: UserArray = [];
const users2: UserArray = [];  // Cache hit
const users3: UserArray = [];  // Cache hit

// ❌ BAD: Create unique types repeatedly
const users1: Array<User> = [];  // Computed
const users2: { [K in keyof User]: User[K] }[] = [];  // New computation
const users3: Pick<User, keyof User>[] = [];  // Another computation
// All represent same type but computed separately!

// Cache size impact:
// Small project (100 unique types): 5MB type cache
// Large project (10,000 unique types): 500MB type cache
// Huge project (100,000 unique types): 5GB type cache (slow!)
```

**3. Conditional Type Evaluation and Distribution**

Conditional types use distributive evaluation over unions, causing combinatorial explosion:

```typescript
// Distributive conditional types

// Single type: O(1) evaluation
type IsString<T> = T extends string ? 'yes' : 'no';
type Result1 = IsString<string>;  // 'yes' (1 check)

// Union: O(n) evaluation (distributes over union)
type Result2 = IsString<string | number | boolean>;
// Evaluates as:
// IsString<string> | IsString<number> | IsString<boolean>
// = 'yes' | 'no' | 'no'
// = 'yes' | 'no'
// Total: 3 checks

// Nested unions: O(n × m) evaluation
type ExtractStrings<T> = T extends { value: infer V }
  ? V extends string
    ? V
    : never
  : never;

type Input =
  | { value: 'a' }
  | { value: 'b' }
  | { value: 1 }
  | { value: 2 };

type Output = ExtractStrings<Input>;
// Distribution:
// ExtractStrings<{ value: 'a' }> |
// ExtractStrings<{ value: 'b' }> |
// ExtractStrings<{ value: 1 }> |
// ExtractStrings<{ value: 2 }>
// Each expands to: infer V, then V extends string check
// Total: 4 × 2 = 8 checks

// Large unions: EXPONENTIAL explosion
type DeepExtract<T, U> = T extends any[]
  ? T[number] extends U ? T[number] : never
  : T extends object
  ? { [K in keyof T]: DeepExtract<T[K], U> }[keyof T]
  : T extends U ? T : never;

interface LargeObject {
  a: { b: { c: string | number | boolean } };
  d: { e: { f: string | number | boolean } };
  // ... 50 more nested properties
}

type Result = DeepExtract<LargeObject, string>;
// Distribution over:
// - 50 properties at first level
// - 50 properties at second level
// - 3 union members at third level
// Total: 50 × 50 × 3 = 7,500 type checks!

// Optimization: Non-distributive conditionals
type NonDistributive<T, U> = [T] extends [U] ? T : never;
// Wrapping in tuple prevents distribution
// O(1) instead of O(n)
```

**4. Mapped Type Performance Characteristics**

Mapped types iterate over object keys, with performance depending on key count and transformation complexity:

```typescript
// Simple mapped type: O(n) where n = key count
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

interface User {
  id: string;
  name: string;
  email: string;
  // 10 properties
}

type ReadonlyUser = Readonly<User>;
// 10 property iterations (fast)

// Nested mapped type: O(n × m)
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

interface NestedUser {
  profile: {
    settings: {
      notifications: {
        // 5 levels deep, 10 properties each
      };
    };
  };
}

type DeepReadonlyUser = DeepReadonly<NestedUser>;
// Iterations: 10 + 10 + 10 + 10 + 10 = 50
// Plus recursive type instantiations: 5 levels
// Total: 50 property checks + 5 instantiations

// Optimization: Flatten structure
interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
}

interface FlatUser {
  profileNotifications: NotificationSettings;
}

type ReadonlyFlatUser = Readonly<FlatUser>;
// 1 property iteration + 1 nested object = 2 checks
// 25x faster than deep structure!

// Key remapping performance (TypeScript 4.1+)
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface State {
  name: string;
  age: number;
  // 100 properties
}

type StateGetters = Getters<State>;
// For each property:
// 1. Extract key
// 2. Convert to string
// 3. Capitalize
// 4. Template literal concatenation
// Total: 100 × 4 = 400 operations
```

**5. Type Inference and Contextual Typing**

TypeScript uses bidirectional type inference, which can cause performance issues with complex function signatures:

```typescript
// Simple inference: O(1)
const value = 42;  // Inferred as number (instant)

// Contextual typing: O(n) where n = number of overloads
function overloaded(x: string): string;
function overloaded(x: number): number;
function overloaded(x: boolean): boolean;
// ... 50 more overloads
function overloaded(x: any): any {
  return x;
}

const result = overloaded(42);
// TypeScript tries each overload until match found
// Worst case: 50 comparisons

// Generic inference with constraints: O(n × m)
function complex<
  T extends string | number,
  U extends T[],
  V extends { [K in keyof T]: U }
>(a: T, b: U, c: V): void {}

complex('hello', ['world'], { /* ... */ });
// Inference steps:
// 1. Infer T from first argument
// 2. Check T extends string | number
// 3. Infer U from second argument
// 4. Check U extends T[]
// 5. Infer V from third argument
// 6. Check V extends { [K in keyof T]: U }
// Total: 6 inference steps + 3 constraint checks

// Optimization: Reduce generic constraints
function simple<T>(value: T): T {
  return value;
}
// Single inference step, no constraints

// Worst case: Circular constraints
type Circular<T> = T extends { prop: infer U }
  ? U extends { prop: T }
    ? T
    : never
  : never;
// Can cause infinite inference loop (TypeScript gives up after depth limit)
```

**6. Union and Intersection Type Performance**

Union and intersection types have different performance characteristics based on size and structure:

```typescript
// Union type performance: O(n) for most operations
type SmallUnion = 'a' | 'b' | 'c';  // Fast (3 members)
type LargeUnion = 'a' | 'b' | 'c' | /* 1000 more */ | 'zzz';  // Slow

// Type narrowing with large unions
function process(value: LargeUnion) {
  if (value === 'a') {
    // TypeScript filters union: O(n) comparison
    // Removes 'a' from union: O(n) copy operation
  }
}

// Intersection type performance
type Intersection = PropsA & PropsB & PropsC & PropsD;
// Merges properties from 4 types
// For each property:
// 1. Check for conflicts
// 2. Merge types (union if different)
// 3. Handle readonly/optional modifiers

interface PropsA { a: string; shared: string; }
interface PropsB { b: number; shared: number; }
// Intersection resolves:
// a: string ✓
// b: number ✓
// shared: string & number = never (conflict!)

// Large intersections: O(n²) conflict checking
type HugeIntersection = Props1 & Props2 & /* ... */ & Props50;
// Each Props has 20 properties
// Total: 50 types × 20 properties = 1000 properties
// Conflict checking: 1000 × 1000 = 1,000,000 comparisons

// Optimization: Use interface extension instead
interface Optimized extends Props1, Props2, /* ... */, Props50 {}
// Single merge operation, computed once
// Cached for future use
```

**7. Template Literal Type Performance**

Template literal types (TypeScript 4.1+) can cause combinatorial explosion:

```typescript
// Simple template literal: Fast
type Greeting = `Hello ${string}`;  // Infinite union, lazy evaluation

// Finite unions in template: Multiplicative expansion
type Color = 'red' | 'blue' | 'green';
type Size = 'small' | 'medium' | 'large';
type Variant = `${Color}-${Size}`;
// Expands to: 'red-small' | 'red-medium' | 'red-large' | 'blue-small' | ...
// Total: 3 × 3 = 9 members (manageable)

// Multiple unions: EXPONENTIAL explosion
type A = 'a1' | 'a2' | 'a3' | 'a4' | 'a5';  // 5 members
type B = 'b1' | 'b2' | 'b3' | 'b4' | 'b5';  // 5 members
type C = 'c1' | 'c2' | 'c3' | 'c4' | 'c5';  // 5 members

type Combined = `${A}-${B}-${C}`;
// Expands to: 5 × 5 × 5 = 125 members

// With 10 unions of 10 members each:
type Explosion = `${U1}-${U2}-${U3}-${U4}-${U5}-${U6}-${U7}-${U8}-${U9}-${U10}`;
// Total: 10^10 = 10,000,000,000 members
// TypeScript compiler crashes!

// Real-world example: Route patterns
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';  // 5
type Resource = 'users' | 'posts' | 'comments' | 'likes';  // 4
type Action = 'list' | 'get' | 'create' | 'update' | 'delete';  // 5
type Format = 'json' | 'xml' | 'html';  // 3

type Route = `${HTTPMethod} /${Resource}/${Action}.${Format}`;
// Expands to: 5 × 4 × 5 × 3 = 300 route combinations
// Type checking: 300 string comparisons per usage

// Optimization: Use runtime validation instead
type Route = string;  // Simple string type
function isValidRoute(route: string): route is Route {
  // Runtime regex validation
  return /^(GET|POST|PUT|DELETE|PATCH) \/(users|posts|comments|likes)\/(list|get|create|update|delete)\.(json|xml|html)$/.test(route);
}
```

**8. Advanced Type-Level Performance Patterns**

```typescript
// Pattern 1: Tail-call optimization for recursive types
// ❌ SLOW: Normal recursion (builds call stack)
type SlowFlatten<T> = T extends any[]
  ? T[number] extends any[]
    ? SlowFlatten<T[number]>  // Recursive call
    : T[number]
  : T;

// ✅ FAST: Tail-recursive with accumulator
type FastFlatten<T, Acc = never> = T extends [infer Head, ...infer Tail]
  ? Head extends any[]
    ? FastFlatten<Tail, Acc | Head[number]>  // Tail position
    : FastFlatten<Tail, Acc | Head>
  : Acc;

// Pattern 2: Early termination for type predicates
// ❌ SLOW: Checks all union members
type IsNever<T> = T extends never ? true : false;
type Result = IsNever<string | number | never>;
// Checks: string extends never | number extends never | never extends never

// ✅ FAST: Use [T] to prevent distribution
type IsNeverFast<T> = [T] extends [never] ? true : false;
type ResultFast = IsNeverFast<never>;
// Single check: [never] extends [never]

// Pattern 3: Lazy evaluation with defer
// ❌ SLOW: Immediate evaluation
type EagerComplex<T> = {
  [K in keyof T]: ComplexTransform<T[K]>;  // Computed immediately for all keys
};

// ✅ FAST: Lazy with getter
type LazyComplex<T> = {
  [K in keyof T]: () => ComplexTransform<T[K]>;  // Computed only when called
};

// Pattern 4: Type-level memoization (manual caching)
type MemoCache = {
  'string': StringTransformResult;
  'number': NumberTransformResult;
  // ... cached results
};

type Memoized<T> = T extends keyof MemoCache
  ? MemoCache[T]  // Cache hit (instant)
  : ExpensiveComputation<T>;  // Cache miss (slow)
```

**Performance Measurement Example:**

```typescript
// Enable TypeScript tracing
// tsc --generateTrace traceDir

// analyze-trace output:
{
  "types": [
    {
      "name": "DeepPartial<ComplexState>",
      "instantiationCount": 45678,
      "checkTime": 8234,  // ms
      "totalTime": 12456  // ms
    },
    {
      "name": "Validated<FormFields>",
      "instantiationCount": 892,
      "checkTime": 234,
      "totalTime": 567
    }
  ],
  "files": [
    {
      "path": "src/types/state.ts",
      "checkTime": 15234,  // Slowest file
      "lineCount": 450
    }
  ]
}

// Interpretation:
// - DeepPartial instantiated 45,678 times → reduce usage
// - Took 8.2 seconds to type check → simplify type
// - state.ts is bottleneck → split file or optimize types
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: TypeScript Type Checking Causing IDE Freezes</strong></summary>

**Context:**

You're working on a large React application with Redux state management. Developers report that VS Code frequently freezes for 5-10 seconds when typing, the TypeScript language server crashes multiple times per day, and autocomplete takes 30+ seconds to appear. The `tsserver` process consumes 8GB+ RAM and pegs CPU at 100%.

**Initial Symptoms:**

```typescript
// Developer's experience:
// 1. Type 'const user = useSe...'
// 2. IDE freezes for 10 seconds
// 3. Autocomplete finally shows 'useSelector'
// 4. Select 'useSelector'
// 5. Type '(state => state.'
// 6. IDE freezes again for 15 seconds
// 7. TypeScript server crashes: "JavaScript heap out of memory"
```

**Project Structure:**

```typescript
// src/store/state.ts (main state definition)
interface AppState {
  user: {
    profile: {
      personalInfo: {
        name: string;
        email: string;
        // ... 50 more fields
      };
      preferences: {
        theme: 'light' | 'dark';
        language: 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';
        notifications: {
          // ... 30 more nested fields
        };
      };
    };
    auth: {
      // ... 40 more fields
    };
  };
  products: {
    items: Product[];  // Array of 100+ property objects
    filters: {
      // ... 50 more nested fields
    };
  };
  cart: {
    // ... 60 more fields
  };
  // ... 25 more root-level slices
  // Total: 2000+ properties across 10 nesting levels
}

// src/types/helpers.ts (type utilities)
// ❌ PROBLEM 1: Unbounded deep recursive types
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>  // No depth limit!
    : T[P];
};

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? DeepRequired<T[P]>
    : T[P];
};

// Used everywhere:
type PartialState = DeepPartial<AppState>;  // 2000 properties × 10 levels deep!
type ReadonlyState = DeepReadonly<AppState>;
type RequiredState = DeepRequired<AppState>;

// ❌ PROBLEM 2: Massive union type for actions
type AppAction =
  | { type: 'user/UPDATE_NAME'; payload: string }
  | { type: 'user/UPDATE_EMAIL'; payload: string }
  // ... 500 more action types (one for each field update)
  | { type: 'products/ADD_ITEM'; payload: Product }
  | { type: 'products/REMOVE_ITEM'; payload: string }
  // ... 300 more product actions
  | { type: 'cart/ADD_TO_CART'; payload: CartItem }
  // ... 800 total action types

// ❌ PROBLEM 3: Complex selector type inference
function useSelector<TSelected>(
  selector: (state: ReadonlyState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
): TSelected;

// Every usage causes deep type inference:
const userName = useSelector(state => state.user.profile.personalInfo.name);
// TypeScript must:
// 1. Infer ReadonlyState (deep readonly over 2000 properties)
// 2. Trace state.user.profile.personalInfo.name (4 levels deep)
// 3. Infer TSelected as string
// 4. Check equalityFn signature matches
// Result: 5-10 seconds of type checking per selector!
```

**Root Cause Analysis:**

```bash
# Generate TypeScript trace
tsc --generateTrace trace --project tsconfig.json

# Analyze trace
npx @typescript/analyze-trace trace

# Output reveals problems:
{
  "types": [
    {
      "name": "DeepPartial<AppState>",
      "instantiationCount": 156789,  // ⚠️ MASSIVE
      "checkTime": 45234,  // 45 seconds!
      "totalTime": 78456
    },
    {
      "name": "DeepReadonly<AppState>",
      "instantiationCount": 234567,  // ⚠️ MASSIVE
      "checkTime": 67890,  // 67 seconds!
      "totalTime": 98765
    },
    {
      "name": "AppAction (union of 800 types)",
      "instantiationCount": 45678,
      "checkTime": 12345,  // 12 seconds
      "totalTime": 23456
    }
  ],
  "files": [
    {
      "path": "src/store/state.ts",
      "checkTime": 125000,  // 2+ minutes to type check!
      "lineCount": 2450
    }
  ]
}

# Memory analysis:
# - DeepPartial<AppState> alone: 3.2GB memory
# - DeepReadonly<AppState>: 4.5GB memory
# - Total type memory: 8.7GB
# - Exceeds V8 heap limit (8GB default)
```

**Solution Implementation:**

**Step 1: Flatten State Structure**

```typescript
// BEFORE: 10 levels deep (slow)
interface AppState {
  user: {
    profile: {
      personalInfo: {
        name: string;
        email: string;
      };
      preferences: {
        theme: 'light' | 'dark';
      };
    };
  };
}

// AFTER: Max 2-3 levels (fast)
interface PersonalInfo {
  name: string;
  email: string;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
}

interface UserProfile {
  personalInfo: PersonalInfo;
  preferences: UserPreferences;
}

interface UserState {
  profile: UserProfile;
  auth: AuthState;  // Separate interface
}

interface AppState {
  user: UserState;
  products: ProductState;
  cart: CartState;
}

// Type checking: 2-3 levels vs 10 levels = 95% faster
```

**Step 2: Limit Recursion Depth in Utility Types**

```typescript
// BEFORE: Unbounded recursion
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

// AFTER: Bounded recursion (max 3 levels)
type Prev = [never, 0, 1, 2, 3];

type DeepPartial<T, Depth extends number = 3> = Depth extends 0
  ? T
  : {
      [P in keyof T]?: T[P] extends object
        ? DeepPartial<T[P], Prev[Depth]>
        : T[P];
    };

// Usage
type PartialState = DeepPartial<AppState, 2>;  // Explicit depth limit

// Type checking time:
// Unbounded: 45 seconds
// Depth 3: 2 seconds (22x faster)
// Depth 2: 0.5 seconds (90x faster)
```

**Step 3: Simplify Action Union**

```typescript
// BEFORE: 800-member union
type AppAction =
  | { type: 'user/UPDATE_NAME'; payload: string }
  | { type: 'user/UPDATE_EMAIL'; payload: string }
  // ... 800 more

// Discriminant checking: O(n) for 800 members

// AFTER: Grouped actions with generic payload
interface Action<TType extends string = string, TPayload = any> {
  type: TType;
  payload: TPayload;
}

// Domain-specific action types
type UserAction =
  | Action<'user/UPDATE_PROFILE', Partial<UserProfile>>
  | Action<'user/LOGIN', Credentials>
  | Action<'user/LOGOUT'>;

type ProductAction =
  | Action<'products/FETCH_SUCCESS', Product[]>
  | Action<'products/ADD', Product>
  | Action<'products/REMOVE', string>;

// Root action: small union
type AppAction = UserAction | ProductAction | CartAction;  // 3 unions

// Type checking time:
// 800-member union: 12 seconds
// 3-member union: 0.1 seconds (120x faster)
```

**Step 4: Optimize Selector Types**

```typescript
// BEFORE: Deep readonly inference for every selector
function useSelector<TSelected>(
  selector: (state: DeepReadonly<AppState>) => TSelected
): TSelected;

// TypeScript infers DeepReadonly<AppState> on every call (slow)

// AFTER: Pre-computed readonly type
type RootState = Readonly<AppState>;  // Shallow readonly (fast)

// Or use branded type to avoid computation
interface RootState extends AppState {
  readonly __brand: 'RootState';
}

function useSelector<TSelected>(
  selector: (state: RootState) => TSelected
): TSelected;

// Type checking time per selector:
// DeepReadonly<AppState>: 5-10 seconds
// Readonly<AppState>: 0.01 seconds (500-1000x faster)
```

**Step 5: Split Type Definitions**

```typescript
// BEFORE: One massive file
// src/store/state.ts (2450 lines, 125s type check time)
interface AppState { /* everything */ }

// AFTER: Split by domain
// src/store/user/types.ts (150 lines, 2s type check)
export interface UserState { /* ... */ }

// src/store/products/types.ts (200 lines, 3s type check)
export interface ProductState { /* ... */ }

// src/store/cart/types.ts (100 lines, 1s type check)
export interface CartState { /* ... */ }

// src/store/index.ts (50 lines, 0.5s type check)
import { UserState } from './user/types';
import { ProductState } from './products/types';
import { CartState } from './cart/types';

export interface AppState {
  user: UserState;
  products: ProductState;
  cart: CartState;
}

// Incremental type checking:
// - Change user types → only recheck user files (2s)
// - Before: recheck everything (125s)
// 62x faster for incremental changes
```

**Step 6: Configure TypeScript for Better Performance**

```json
// tsconfig.json
{
  "compilerOptions": {
    // Disable expensive checks in development
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,

    // Faster module resolution
    "moduleResolution": "bundler",

    // Incremental builds
    "incremental": true,

    // Reduce type instantiation depth (default: 50)
    "maxNodeModuleJsDepth": 0,

    // Isolate modules (faster transpilation)
    "isolatedModules": true
  },

  // Exclude unnecessary files
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

**Step 7: VS Code Settings Optimization**

```json
// .vscode/settings.json
{
  // Increase TypeScript memory limit
  "typescript.tsserver.maxTsServerMemory": 8192,

  // Disable expensive features
  "typescript.disableAutomaticTypeAcquisition": true,

  // Reduce files watched
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/.next/**": true
  },

  // Faster IntelliSense
  "typescript.suggest.enabled": true,
  "typescript.preferences.includePackageJsonAutoImports": "off"
}
```

**Results After Optimization:**

```bash
# Type checking performance
Before:
- state.ts type check: 125 seconds
- DeepPartial<AppState>: 45 seconds, 156k instantiations
- DeepReadonly<AppState>: 67 seconds, 234k instantiations
- Total memory: 8.7GB (crashes)
- IDE freeze duration: 10-15 seconds
- Autocomplete delay: 30+ seconds

After:
- Split files type check: 12 seconds total (10.4x faster)
- DeepPartial<AppState, 2>: 0.5 seconds, 1.2k instantiations (90x faster)
- Readonly<AppState>: 0.01 seconds, 150 instantiations (6700x faster)
- Total memory: 1.2GB (86% reduction)
- IDE freeze: <1 second (95% improvement)
- Autocomplete delay: <2 seconds (93% improvement)

Developer experience:
- TypeScript server crashes: 10/day → 0/week
- Type checking during typing: Instant
- Autocomplete: Responsive
- Build time: 180s → 35s (5x faster)
```

**Monitoring Type Performance**

```typescript
// Add type performance tracking
// scripts/check-type-performance.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkTypePerformance() {
  // Generate trace
  await execAsync('tsc --generateTrace trace');

  // Analyze trace
  const { stdout } = await execAsync('npx @typescript/analyze-trace trace');

  const analysis = JSON.parse(stdout);

  // Check for performance issues
  for (const type of analysis.types) {
    if (type.checkTime > 1000) {  // More than 1 second
      console.error(`❌ Slow type: ${type.name}`);
      console.error(`   Check time: ${type.checkTime}ms`);
      console.error(`   Instantiations: ${type.instantiationCount}`);
    }
  }

  for (const file of analysis.files) {
    if (file.checkTime > 5000) {  // More than 5 seconds
      console.error(`❌ Slow file: ${file.path}`);
      console.error(`   Check time: ${file.checkTime}ms`);
    }
  }
}

checkTypePerformance();

// Run in CI
// package.json
{
  "scripts": {
    "type-perf": "node scripts/check-type-performance.ts"
  }
}
```

**Key Learnings:**

1. **Flatten state structure**: Deep nesting causes exponential type checking
2. **Limit recursion depth**: Unbounded recursive types crash the compiler
3. **Small unions**: 3-member unions are 100x faster than 800-member unions
4. **Avoid deep utility types**: Use shallow Readonly instead of DeepReadonly
5. **Split large files**: Enable incremental type checking per module
6. **Monitor type performance**: Use --generateTrace to identify slow types

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Type Expressiveness vs Type Checking Performance</strong></summary>

TypeScript's powerful type system allows for highly expressive types that catch bugs at compile time, but excessive type complexity can slow development to a crawl. Finding the right balance is crucial for productive development.

**1. Precise Types vs Simple Types**

```typescript
// Option A: Maximally precise (slow but catches more errors)
type HTTPResponse<TData, TStatus extends number> = TStatus extends 200
  ? { success: true; data: TData; status: 200 }
  : TStatus extends 201
  ? { success: true; data: TData; status: 201 }
  : TStatus extends 400
  ? { success: false; error: string; status: 400 }
  : TStatus extends 401
  ? { success: false; error: 'Unauthorized'; status: 401 }
  : TStatus extends 403
  ? { success: false; error: 'Forbidden'; status: 403 }
  : TStatus extends 404
  ? { success: false; error: 'Not Found'; status: 404 }
  : TStatus extends 500
  ? { success: false; error: string; status: 500 }
  : never;

async function fetchUser(): Promise<HTTPResponse<User, 200 | 404 | 500>> {
  // TypeScript knows exact shape for each status code
}

const response = await fetchUser();
if (response.status === 200) {
  console.log(response.data.name);  // TypeScript knows data exists
}

// Pros:
// - Catches impossible states (404 can't have data)
// - Autocomplete knows exact fields per status
// - Forces exhaustive handling

// Cons:
// - Type checking: 500ms per usage
// - Hard to maintain (add new status = update type)
// - Complex discriminated union

// Option B: Simple types (fast but less precise)
interface SuccessResponse<T> {
  success: true;
  data: T;
  status: number;
}

interface ErrorResponse {
  success: false;
  error: string;
  status: number;
}

type HTTPResponse<T> = SuccessResponse<T> | ErrorResponse;

async function fetchUser(): Promise<HTTPResponse<User>> {
  // Simpler type signature
}

const response = await fetchUser();
if (response.success) {
  console.log(response.data.name);  // Type narrowing works
}

// Pros:
// - Type checking: 5ms per usage (100x faster)
// - Easy to maintain
// - Simple discriminated union

// Cons:
// - Doesn't enforce specific status codes
// - Can't guarantee 404 has no data field

// Decision:
// - Use Option A: API contracts, critical business logic
// - Use Option B: Internal code, rapid development
```

**2. Template Literal Types vs String Types**

```typescript
// Option A: Template literal types (expressive but slow)
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type Resource = 'users' | 'posts' | 'comments' | 'products';
type ResourceId = `${number}`;
type Route =
  | `/${Resource}`
  | `/${Resource}/${ResourceId}`
  | `/${Resource}/${ResourceId}/${Resource}`;

// Autocomplete knows all valid routes
const route: Route = '/users/123/posts';  // ✓ Valid
const invalid: Route = '/invalid/route';  // ✗ Type error

// Type expansion: 4 × (1 + ∞ + ∞) = infinite types
// TypeScript evaluates lazily but still slow

// Pros:
// - Autocomplete for routes
// - Catches typos at compile time
// - Self-documenting API

// Cons:
// - Slow type checking (100ms+ per usage)
// - Doesn't scale (adding resources slows compilation)
// - Hard to extend

// Option B: Branded string (fast but less precise)
type Route = string & { readonly __brand: 'Route' };

function createRoute(path: string): Route {
  // Runtime validation
  if (!/^\/[\w/]+$/.test(path)) {
    throw new Error('Invalid route');
  }
  return path as Route;
}

const route = createRoute('/users/123/posts');  // ✓ Runtime check

// Pros:
// - Type checking: <1ms (100x faster)
// - Easy to extend
// - Flexible validation

// Cons:
// - No autocomplete
// - Errors only at runtime
// - Requires runtime validation function

// Decision:
// - Use template literals: Small, fixed set of values (<50)
// - Use branded strings: Large or dynamic sets of values
```

**3. Deep Recursive Types vs Shallow Types**

```typescript
// Option A: Deep recursion (powerful but slow)
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

interface State {
  user: {
    profile: {
      settings: {
        notifications: boolean;
      };
    };
  };
}

function updateState(partial: DeepPartial<State>) {
  // Can pass: { user: { profile: { settings: {} } } }
}

updateState({ user: { profile: { settings: { notifications: true } } } });

// Pros:
// - Update any nested field
// - Type-safe at any depth
// - Flexible API

// Cons:
// - Type checking: 100-500ms for deep objects
// - Exponential complexity with depth
// - Can cause compiler crashes

// Option B: Shallow types (fast but less flexible)
function updateUser(partial: Partial<State['user']>) {
  // Can only update top-level user fields
}

function updateSettings(partial: Partial<State['user']['profile']['settings']>) {
  // Specific updater for settings
}

updateSettings({ notifications: true });

// Pros:
// - Type checking: <1ms (100-500x faster)
// - Explicit about what's being updated
// - Never crashes compiler

// Cons:
// - Need separate function for each level
// - Less flexible
// - More boilerplate

// Option C: Middle ground (limited depth)
type Prev = [never, 0, 1, 2];
type DeepPartial<T, Depth extends number = 2> = Depth extends 0
  ? T
  : {
      [P in keyof T]?: T[P] extends object
        ? DeepPartial<T[P], Prev[Depth]>
        : T[P];
    };

// Depth 2: Fast enough, flexible enough

// Decision:
// - Option A: Small objects (<5 levels), rare updates
// - Option B: Large objects (>10 levels), frequent updates
// - Option C: Medium objects (5-10 levels), balanced needs
```

**4. Union Types Size vs Discriminated Unions**

```typescript
// Scenario: Modeling form field states

// Option A: Large union (precise but slow)
type FormFieldState =
  | { status: 'pristine'; value: undefined; error: undefined }
  | { status: 'touched'; value: undefined; error: undefined }
  | { status: 'editing'; value: string; error: undefined }
  | { status: 'validating'; value: string; error: undefined }
  | { status: 'valid'; value: string; error: undefined }
  | { status: 'invalid'; value: string; error: string }
  | { status: 'submitting'; value: string; error: undefined }
  | { status: 'submitted'; value: string; error: undefined }
  | { status: 'error'; value: string; error: string };

// 9 union members, each with 3 properties
// Type checking: O(n) for narrowing

function handleFieldState(field: FormFieldState) {
  if (field.status === 'invalid') {
    console.log(field.error);  // TypeScript knows error exists
  }
}

// Pros:
// - Impossible states unrepresentable
//   (pristine can't have value, valid can't have error)
// - Type narrowing is precise

// Cons:
// - 9 union members = slower narrowing
// - Hard to extend (add state = new union member)
// - Lots of duplication

// Option B: Flexible object (fast but less precise)
interface FormFieldState {
  status: 'pristine' | 'touched' | 'editing' | 'validating' | 'valid' | 'invalid' | 'submitting' | 'submitted' | 'error';
  value?: string;
  error?: string;
}

function handleFieldState(field: FormFieldState) {
  if (field.status === 'invalid') {
    console.log(field.error);  // May be undefined (TypeScript doesn't know)
  }
}

// Pros:
// - Fast type checking
// - Easy to extend
// - Simple type

// Cons:
// - Allows impossible states (pristine with value)
// - Need runtime checks for optional fields
// - Less type safety

// Option C: Grouped discriminated union (balanced)
type FormFieldState =
  | { status: 'pristine' | 'touched'; value: undefined; error: undefined }
  | { status: 'editing' | 'validating' | 'valid'; value: string; error: undefined }
  | { status: 'invalid' | 'error'; value: string; error: string }
  | { status: 'submitting' | 'submitted'; value: string; error: undefined };

// 4 union members (fewer than Option A)
// Still impossible states unrepresentable

// Decision:
// - Option A: <10 states, critical correctness
// - Option B: >20 states, performance matters
// - Option C: 10-20 states, balanced approach
```

**5. Generic Constraints Complexity**

```typescript
// Option A: Highly constrained generics (precise but slow)
function deepMerge<
  T extends Record<string, any>,
  U extends Record<string, any>,
  TKeys extends keyof T = keyof T,
  UKeys extends keyof U = keyof U,
  CommonKeys extends TKeys & UKeys = TKeys & UKeys,
  Result extends {
    [K in TKeys | UKeys]: K extends CommonKeys
      ? T[K] extends object
        ? U[K] extends object
          ? deepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : K extends TKeys
      ? T[K]
      : K extends UKeys
      ? U[K]
      : never;
  } = any
>(a: T, b: U): Result {
  // Complex type inference for precise result type
}

const result = deepMerge({ a: { b: 1 } }, { a: { c: 2 } });
// TypeScript knows: { a: { b: number; c: number } }

// Pros:
// - Exact result type
// - Autocomplete for merged object

// Cons:
// - Type checking: 500ms+ per call
// - 5 generic parameters (hard to understand)
// - Complex constraint resolution

// Option B: Simple generics (fast but less precise)
function deepMerge<T, U>(a: T, b: U): T & U {
  // Simple intersection type
}

const result = deepMerge({ a: { b: 1 } }, { a: { c: 2 } });
// TypeScript knows: { a: { b: number } } & { a: { c: number } }
// Not exact, but close enough

// Pros:
// - Type checking: <1ms (500x faster)
// - Easy to understand
// - Good enough for most cases

// Cons:
// - Result type is intersection (not merged)
// - May need type assertion for nested access

// Decision:
// - Option A: Public API, library code
// - Option B: Internal utilities, app code
```

**6. Type Inference vs Explicit Types**

```typescript
// Option A: Full type inference (flexible but slow)
const complexData = {
  users: [
    { id: 1, name: 'Alice', tags: ['admin', 'dev'] },
    { id: 2, name: 'Bob', tags: ['user'] }
  ],
  products: [
    { id: 100, title: 'Widget', price: 9.99, categories: ['tools', 'hardware'] }
  ]
};

// TypeScript infers:
// {
//   users: { id: number; name: string; tags: string[] }[];
//   products: { id: number; title: string; price: number; categories: string[] }[];
// }

// Every property access triggers inference

// Pros:
// - No type annotations needed
// - Automatically updates when data changes

// Cons:
// - Slow for large objects (inference every time)
// - Imprecise (tags is string[], not specific values)

// Option B: Explicit types (fast but rigid)
interface User {
  id: number;
  name: string;
  tags: string[];
}

interface Product {
  id: number;
  title: string;
  price: number;
  categories: string[];
}

interface Data {
  users: User[];
  products: Product[];
}

const complexData: Data = {
  users: [
    { id: 1, name: 'Alice', tags: ['admin', 'dev'] },
    { id: 2, name: 'Bob', tags: ['user'] }
  ],
  products: [
    { id: 100, title: 'Widget', price: 9.99, categories: ['tools', 'hardware'] }
  ]
};

// TypeScript uses declared type (fast lookup)

// Pros:
// - Fast type checking (<1ms)
// - Self-documenting
// - Can use more precise types (string literals)

// Cons:
// - More boilerplate
// - Manual updates when structure changes

// Decision:
// - Infer: Small objects, prototypes, tests
// - Explicit: Large objects, API responses, shared types
```

**Performance Comparison Table:**

| Type Pattern | Type Check Time | Maintenance | Safety | Best For |
|--------------|----------------|-------------|--------|----------|
| Large union (50+ members) | 100-500ms | Hard | High | Never use |
| Discriminated union (5-10 members) | 1-10ms | Medium | High | State machines |
| Deep recursive types | 100-1000ms | Hard | High | Avoid |
| Shallow utility types | <1ms | Easy | Medium | Utility functions |
| Template literals (large) | 50-200ms | Medium | High | Small sets only |
| Branded strings | <1ms | Easy | Medium | Large/dynamic sets |
| Complex generics (5+ params) | 100-500ms | Very hard | High | Public APIs only |
| Simple generics (1-2 params) | 1-5ms | Easy | Medium | Most cases |
| Full type inference | 10-100ms | Easy | Medium | Small objects |
| Explicit types | <1ms | Medium | High | Large objects |

**Decision Framework:**

```typescript
// Ask these questions:

// 1. How often is this type used?
//    - Once: Use complex types (one-time cost)
//    - Thousands of times: Use simple types

// 2. Is it a public API?
//    - Yes: More precise types (better DX)
//    - No: Simpler types (faster builds)

// 3. How large is the type?
//    - Small (<10 properties): Complex OK
//    - Large (>50 properties): Keep simple

// 4. How deep is the nesting?
//    - Shallow (<3 levels): Recursive OK
//    - Deep (>5 levels): Flatten or limit depth

// 5. Is performance a bottleneck?
//    - Yes: Profile with --generateTrace
//    - No: Optimize for clarity

// 6. Can runtime validation help?
//    - Yes: Use simpler types + runtime checks
//    - No: Rely on static types
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Type-Level Performance in TypeScript</strong></summary>

**Simple Analogy:**

Think of TypeScript's type system like a spell-checker in Microsoft Word:

**Fast spell-checking (simple types):**
- Dictionary has 10,000 words (small type)
- Checks word against dictionary (instant lookup)
- Underlines typos immediately

**Slow spell-checking (complex types):**
- Dictionary has 1,000,000 words (large type)
- Must check grammar rules (complex inference)
- Must check against thesaurus (deep recursion)
- Analyzes entire paragraph for context (type inference)
- Freezes for 10 seconds before showing suggestions

**TypeScript equivalent:**

```typescript
// Fast "spell-check" (simple type)
type Status = 'pending' | 'success' | 'error';  // 3 values

const status: Status = 'success';  // Instant check ✓

// Slow "spell-check" (complex type)
type AllPossibleRoutes = `${HTTPMethod} /${Resource}/${Action}.${Format}`;
// 5 × 4 × 5 × 3 = 300 values
// Must check against all 300 possibilities

const route: AllPossibleRoutes = 'GET /users/list.json';  // 100ms check
```

**Key Concepts Explained:**

**1. Type Instantiation (Creating Types)**

```typescript
// Think of types like cookie cutters

// Cookie cutter (generic type)
type Box<T> = {
  value: T;
  label: string;
};

// Making cookies (type instantiation)
type StringBox = Box<string>;  // Created once, cached
type NumberBox = Box<number>;  // Created once, cached
type BooleanBox = Box<boolean>;  // Created once, cached

// Each different cookie shape is created once, then reused

// ❌ SLOW: Making new cookie cutters every time
function createBox<T>(value: T): { value: T; label: string } {
  // TypeScript creates NEW type for EVERY call
  return { value, label: 'box' };
}

const box1 = createBox('hello');  // Create type 1
const box2 = createBox(42);       // Create type 2
const box3 = createBox(true);     // Create type 3

// ✅ FAST: Using same cookie cutter
function createBox<T>(value: T): Box<T> {
  // TypeScript reuses cached Box<string>, Box<number>, etc.
  return { value, label: 'box' };
}

const box1 = createBox('hello');  // Cache hit!
const box2 = createBox(42);       // Cache hit!
```

**2. Union Type Size**

```typescript
// Think of unions like a multiple-choice test

// Small test (fast to grade)
type Size = 'small' | 'medium' | 'large';  // 3 choices

function checkSize(size: Size) {
  // TypeScript checks: Is it small? medium? large?
  // 3 comparisons = instant
}

// HUGE test (slow to grade)
type HttpStatus =
  | 100 | 101 | 102  // ... 500 more numbers
  | 200 | 201 | 202
  // Total: 500 choices

function checkStatus(status: HttpStatus) {
  // TypeScript checks: Is it 100? 101? 102? ... 500 comparisons
  // Takes 100ms (too slow!)
}

// Solution: Use smaller test or different format
type HttpStatus = number;  // Instant check
function isValidStatus(status: number): status is HttpStatus {
  return status >= 100 && status < 600;  // Runtime check (fast)
}
```

**3. Deep Recursive Types**

```typescript
// Think of recursion like Russian nesting dolls

// ❌ SLOW: Infinite nesting dolls
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>  // Open next doll inside
    : T[P];
};

interface State {
  user: {
    profile: {
      settings: {
        theme: {
          colors: {
            primary: string;  // 6 levels deep!
          };
        };
      };
    };
  };
}

type PartialState = DeepPartial<State>;
// Opens 6 nested dolls = slow

// ✅ FAST: Limit nesting depth
type DeepPartial<T, MaxDepth = 2> = // Only open 2 dolls
  MaxDepth extends 0
    ? T
    : { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P], MaxDepth-1> : T[P] };

type PartialState = DeepPartial<State, 2>;  // Stop after 2 levels = fast
```

**4. Type Inference**

```typescript
// Think of inference like autocorrect on your phone

// ❌ SLOW: Complex autocorrect
const data = {
  users: [
    { id: 1, name: 'Alice', tags: ['admin', 'dev'], settings: { theme: 'dark' } }
  ]
};

// TypeScript infers:
// {
//   users: {
//     id: number;
//     name: string;
//     tags: string[];
//     settings: { theme: string };
//   }[]
// }

// Every time you access data, TypeScript re-infers the structure
// Like autocorrect analyzing entire paragraph for context

// ✅ FAST: Tell TypeScript the type upfront
interface User {
  id: number;
  name: string;
  tags: string[];
  settings: { theme: string };
}

const data: { users: User[] } = {
  users: [
    { id: 1, name: 'Alice', tags: ['admin', 'dev'], settings: { theme: 'dark' } }
  ]
};

// TypeScript just looks up the declared type (instant)
// Like having a dictionary definition (no need to guess)
```

**Common Mistakes:**

```typescript
// ❌ MISTAKE 1: Unbounded recursion
type BadDeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? BadDeepReadonly<T[P]>  // Can go 100+ levels deep!
    : T[P];
};

// Fix: Limit depth
type GoodDeepReadonly<T, Depth = 3> = Depth extends 0
  ? T
  : { readonly [P in keyof T]: T[P] extends object ? GoodDeepReadonly<T[P], Prev<Depth>> : T[P] };

// ❌ MISTAKE 2: Giant unions
type AllCombinations = `${Color}-${Size}-${Style}-${Material}`;
// 10 × 10 × 10 × 10 = 10,000 combinations = CRASH

// Fix: Use branded string
type ProductVariant = string & { readonly __brand: 'ProductVariant' };

// ❌ MISTAKE 3: Complex conditional types
type Extract<T, U> = T extends U
  ? T extends any[]
    ? T[0] extends U
      ? T[0] extends object
        ? Extract<T[0], U>  // Too complex!
        : never
      : never
    : never
  : never;

// Fix: Simplify or break into steps
type SimpleExtract<T, U> = T extends U ? T : never;

// ❌ MISTAKE 4: Type inference for huge objects
const hugeConfig = {
  // 1000 properties...
};
// TypeScript infers all 1000 properties every time = SLOW

// Fix: Declare type explicitly
interface Config {
  // Define structure once
}
const hugeConfig: Config = {
  // Fast type checking
};
```

**How to Diagnose Slow Types:**

```bash
# Step 1: Generate trace
tsc --generateTrace trace

# Step 2: Analyze trace
npx @typescript/analyze-trace trace

# Step 3: Look for red flags
# - checkTime > 1000ms (slow type)
# - instantiationCount > 10,000 (too many type creations)
# - File checkTime > 5000ms (slow file)

# Example output:
{
  "types": [
    {
      "name": "DeepPartial<AppState>",
      "checkTime": 45234,  // ⚠️ 45 seconds!
      "instantiationCount": 156789  // ⚠️ Way too many!
    }
  ]
}

# Step 4: Fix the slow type
# - Limit recursion depth
# - Reduce union size
# - Simplify conditional types
# - Use explicit types instead of inference
```

**Interview Answer Template:**

**Question: "What causes slow TypeScript compilation and how do you fix it?"**

**Answer Structure:**

"Type-level performance issues usually come from a few common patterns:

1. **Deep recursive types** - types that recurse through nested objects without depth limits can cause exponential slowdowns. The fix is to limit recursion depth using a depth parameter.

2. **Large union types** - unions with hundreds of members slow down type checking because TypeScript must check each member. The solution is to use discriminated unions with fewer members or branded types with runtime validation.

3. **Complex type inference** - letting TypeScript infer types for large objects causes repeated computation. Using explicit type annotations is much faster.

4. **Template literal explosion** - template literals with multiple unions create combinatorial explosions. For example, three 10-member unions create 1,000 type combinations.

To diagnose these issues, I use `tsc --generateTrace` to identify slow types, then refactor them to be simpler. For instance, in a recent project, limiting `DeepPartial` recursion from unbounded to 3 levels reduced type checking from 45 seconds to 0.5 seconds - a 90x improvement."

**Key Takeaways:**
- Simple types = fast type checking
- Large unions = slow type checking
- Deep recursion = exponentially slow
- Explicit types > inferred types (for large objects)
- Always measure with --generateTrace
- Limit recursion depth to 2-3 levels
- Keep unions under 20 members when possible

</details>
