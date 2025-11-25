# TypeScript ESLint Configuration

## Question 1: How do you configure ESLint with TypeScript?

**Answer:**

Configuring ESLint with TypeScript requires the TypeScript ESLint parser and plugin to enable type-aware linting. The setup involves installing dependencies, configuring the parser, and enabling TypeScript-specific rules.

**Basic Setup:**

```bash
# Install dependencies
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# For type-aware linting
npm install --save-dev typescript
```

**Configuration (.eslintrc.json):**

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

**Project Structure:**

```
project/
├── .eslintrc.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   └── utils.ts
└── package.json
```

**Key Configuration Options:**

1. **Parser**: `@typescript-eslint/parser` - Converts TypeScript to ESTree format
2. **ParserOptions.project**: Points to tsconfig.json for type information
3. **Plugins**: Adds TypeScript-specific rules
4. **Extends**: Applies recommended rule sets

**Type-Aware vs Non-Type-Aware:**

```javascript
// Non-type-aware (faster, basic checks)
{
  "extends": ["plugin:@typescript-eslint/recommended"]
}

// Type-aware (slower, comprehensive checks)
{
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parserOptions": {
    "project": "./tsconfig.json"
  }
}
```

**Multiple tsconfig Support:**

```json
{
  "parserOptions": {
    "project": [
      "./tsconfig.json",
      "./tsconfig.tests.json",
      "./packages/*/tsconfig.json"
    ]
  }
}
```

---

### <details>
<summary><strong>🔍 Deep Dive: Parser Implementation & Type Program</strong></summary>

**How @typescript-eslint/parser Works:**

The TypeScript ESLint parser bridges the gap between TypeScript's AST (Abstract Syntax Tree) and ESLint's ESTree format.

**Parsing Pipeline:**

```
TypeScript Source Code
        ↓
TypeScript Compiler (tsc) - Creates TypeScript AST
        ↓
@typescript-eslint/parser - Converts to ESTree AST
        ↓
ESLint - Applies rules to ESTree
        ↓
Lint Results
```

**Internal Architecture:**

```typescript
// Simplified parser implementation
import * as ts from 'typescript';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';

class Parser {
  private typeChecker: ts.TypeChecker;

  parse(code: string, options: ParserOptions) {
    // 1. Create TypeScript program
    const program = ts.createProgram({
      rootNames: [options.filePath],
      options: this.getTSConfig(options.project)
    });

    // 2. Get type checker for type-aware rules
    this.typeChecker = program.getTypeChecker();

    // 3. Parse source file
    const sourceFile = program.getSourceFile(options.filePath);

    // 4. Convert TS AST to ESTree AST
    const estree = this.convertToESTree(sourceFile);

    // 5. Attach type information
    this.attachTypeInfo(estree, this.typeChecker);

    return estree;
  }

  convertToESTree(node: ts.Node): TSESTree.Node {
    // Convert each TypeScript node type to ESTree equivalent
    switch (node.kind) {
      case ts.SyntaxKind.InterfaceDeclaration:
        return this.createTSInterfaceDeclaration(node as ts.InterfaceDeclaration);

      case ts.SyntaxKind.TypeAliasDeclaration:
        return this.createTSTypeAliasDeclaration(node as ts.TypeAliasDeclaration);

      // ... 100+ node type conversions
    }
  }
}
```

**Type Program Loading:**

```typescript
// When parserOptions.project is set
{
  "parserOptions": {
    "project": "./tsconfig.json"
  }
}

// Parser loads full TypeScript program
const program = ts.createProgram({
  rootNames: getAllTypeScriptFiles(),
  options: loadTSConfig('./tsconfig.json')
});

// This enables type-aware rules to query types
const type = typeChecker.getTypeAtLocation(node);
const isPromise = typeChecker.getPromisedTypeOfPromise(type);
```

**Performance Optimization - Project Service:**

```typescript
// ESLint uses project service to cache TypeScript programs
class ProjectService {
  private programCache = new Map<string, ts.Program>();

  getProgram(configPath: string): ts.Program {
    // Cache programs to avoid recreating for every file
    if (this.programCache.has(configPath)) {
      return this.programCache.get(configPath)!;
    }

    const program = ts.createProgram(...);
    this.programCache.set(configPath, program);
    return program;
  }
}
```

**AST Node Enhancement:**

```typescript
// ESTree node with TypeScript type information
interface ESTreeNodeWithTypes extends ESTree.Node {
  // Original ESTree properties
  type: string;
  loc: SourceLocation;

  // TypeScript enhancements
  typeAnnotation?: TSESTree.TSTypeAnnotation;
  returnType?: TSESTree.TSTypeAnnotation;

  // Attached type information from type checker
  tsType?: ts.Type;
  tsSymbol?: ts.Symbol;
}
```

**Rule Implementation with Type Information:**

```typescript
// Example: no-floating-promises rule
export default createRule({
  name: 'no-floating-promises',
  meta: { /* ... */ },

  create(context) {
    const parserServices = context.parserServices;
    const checker = parserServices.program.getTypeChecker();

    return {
      ExpressionStatement(node) {
        // Get TypeScript type from ESTree node
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.expression);
        const type = checker.getTypeAtLocation(tsNode);

        // Check if expression is a Promise
        if (isPromiseType(type, checker)) {
          context.report({
            node: node.expression,
            message: 'Promises must be awaited or returned'
          });
        }
      }
    };
  }
});

function isPromiseType(type: ts.Type, checker: ts.TypeChecker): boolean {
  // Use type checker APIs to determine if type is Promise
  const promisedType = checker.getPromisedTypeOfPromise(type);
  return promisedType !== undefined;
}
```

**Configuration File Discovery:**

```typescript
// How parser finds tsconfig.json
function findTSConfig(options: ParserOptions): string {
  if (options.project) {
    // Explicit path(s) provided
    return resolveProjectPath(options.project);
  }

  // Search upward from file being linted
  let currentDir = path.dirname(options.filePath);

  while (currentDir !== path.parse(currentDir).root) {
    const configPath = path.join(currentDir, 'tsconfig.json');
    if (fs.existsSync(configPath)) {
      return configPath;
    }
    currentDir = path.dirname(currentDir);
  }

  throw new Error('No tsconfig.json found');
}
```

**Memory Management:**

```typescript
// Parser caches and cleanup
class ParserCache {
  private astCache = new LRUCache<string, TSESTree.Program>({ max: 500 });
  private programCache = new Map<string, ts.Program>();

  // Clear cache when tsconfig changes
  watchTSConfig(configPath: string) {
    fs.watch(configPath, () => {
      this.programCache.delete(configPath);
      this.astCache.clear();
    });
  }

  // Memory-efficient parsing
  parseFile(filePath: string): TSESTree.Program {
    const cacheKey = `${filePath}:${fs.statSync(filePath).mtimeMs}`;

    if (this.astCache.has(cacheKey)) {
      return this.astCache.get(cacheKey)!;
    }

    const ast = this.parse(filePath);
    this.astCache.set(cacheKey, ast);
    return ast;
  }
}
```

**Performance Characteristics:**

- **Non-type-aware linting**: 50-100ms per file (syntax-only)
- **Type-aware linting**: 200-500ms per file (requires type program)
- **First run**: 2-5s (TypeScript program creation)
- **Subsequent runs**: 100-300ms (cached program)
- **Memory usage**: 200-500MB (TypeScript program in memory)

**Plugin Architecture:**

```typescript
// How plugins extend TypeScript rules
export default {
  rules: {
    'no-explicit-any': noExplicitAnyRule,
    'explicit-function-return-type': explicitReturnTypeRule,
    // ... 100+ TypeScript-specific rules
  },

  configs: {
    recommended: {
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'error'
      }
    }
  }
};
```

</details>

---

### <details>
<summary><strong>🐛 Real-World Scenario: Slow Linting in Monorepo</strong></summary>

**Problem:**
Large monorepo with 50 packages, ESLint taking 3-4 minutes per run, blocking CI/CD pipeline.

**Initial Setup (Slow):**

```json
// Root .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"  // ❌ Points to root, includes all packages
  },
  "extends": [
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ]
}
```

**Performance Metrics:**

```
Linting Performance (Initial):
├── Total time: 247 seconds
├── Type checking: 189 seconds (76%)
├── Rule execution: 43 seconds (17%)
├── File I/O: 15 seconds (7%)
└── Files linted: 1,247 TypeScript files

Memory Usage:
├── Peak memory: 3.2 GB
├── TypeScript programs: 2.1 GB
├── AST cache: 890 MB
└── Node.js heap: 4 GB limit reached
```

**Investigation Steps:**

1. **Profile ESLint execution:**

```bash
# Run with timing data
TIMING=1 eslint src/**/*.ts

# Output shows bottleneck
Rule                                    | Time (ms) | Relative
:---------------------------------------|----------:|--------:
@typescript-eslint/no-floating-promises |   45231.2 |    24.1%
@typescript-eslint/await-thenable       |   38942.7 |    20.7%
@typescript-eslint/no-misused-promises  |   32154.1 |    17.1%
```

2. **Analyze TypeScript program creation:**

```typescript
// Debug parser performance
const startTime = Date.now();
const program = ts.createProgram({
  rootNames: getAllFiles(),
  options: tsConfig.options
});
console.log(`Program creation: ${Date.now() - startTime}ms`);
// Output: Program creation: 12483ms ❌ Too slow!
```

3. **Check file count in TypeScript project:**

```bash
# Files included in tsconfig.json
npx tsc --listFiles | wc -l
# Output: 4,832 files ❌ Including node_modules!
```

**Root Cause:**
- TypeScript program loading ALL files (including node_modules)
- Each package creating separate program
- No caching between ESLint runs
- Type-aware rules on every file

**Solution:**

**Step 1: Optimize tsconfig.json:**

```json
// tsconfig.json
{
  "compilerOptions": { /* ... */ },
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

**Step 2: Use project references for monorepo:**

```json
// Root tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/utils" },
    { "path": "./packages/api" }
  ]
}

// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

**Step 3: Selective type-aware linting:**

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',

  overrides: [
    {
      // Type-aware rules only for source files (not tests)
      files: ['src/**/*.ts'],
      excludedFiles: ['**/*.test.ts', '**/*.spec.ts'],
      parserOptions: {
        project: ['./tsconfig.json', './packages/*/tsconfig.json']
      },
      extends: [
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
      ]
    },
    {
      // Faster non-type-aware rules for tests
      files: ['**/*.test.ts', '**/*.spec.ts'],
      extends: ['plugin:@typescript-eslint/recommended']
    }
  ]
};
```

**Step 4: Enable caching:**

```json
// package.json
{
  "scripts": {
    "lint": "ESLINT_USE_FLAT_CONFIG=false eslint --cache --cache-location .eslintcache src/**/*.ts"
  }
}
```

**Step 5: Parallel linting in CI:**

```yaml
# .github/workflows/lint.yml
jobs:
  lint:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [core, utils, api, components]
    steps:
      - name: Lint package
        run: |
          cd packages/${{ matrix.package }}
          npm run lint
```

**Results After Optimization:**

```
Linting Performance (Optimized):
├── Total time: 42 seconds ⚡ (83% reduction)
├── Type checking: 18 seconds (43%)
├── Rule execution: 19 seconds (45%)
├── File I/O: 5 seconds (12%)
└── Files linted: 847 TypeScript files (excluded tests)

Memory Usage:
├── Peak memory: 1.1 GB ⚡ (66% reduction)
├── TypeScript programs: 620 MB
├── AST cache: 380 MB
└── Cache reuse: 94% (second run: 8 seconds)

CI/CD Impact:
├── Before: 247 seconds (pipeline blocked)
├── After: 42 seconds (parallel: 18 seconds)
└── Cost savings: $120/month (faster compute time)
```

**Additional Optimizations:**

1. **Incremental linting (Git hook):**

```bash
# lint-staged.config.js
module.exports = {
  '*.ts': [
    'eslint --cache --fix',
    'git add'
  ]
};

# Only lint changed files
npx lint-staged
# 2-3 seconds vs 42 seconds for full project
```

2. **VSCode workspace settings:**

```json
// .vscode/settings.json
{
  "eslint.experimental.useFlatConfig": false,
  "eslint.workingDirectories": [
    { "pattern": "./packages/*" }
  ],
  "eslint.nodePath": "./node_modules"
}
```

**Lessons Learned:**
- Type-aware linting is powerful but expensive (2-3x slower)
- Monorepos need project references for efficient TypeScript programs
- Exclude test files from type-aware rules when possible
- Cache aggressively (ESLint cache + TypeScript program cache)
- Lint only changed files in development, full project in CI

</details>

---

### <details>
<summary><strong>⚖️ Trade-offs: Linting Configuration Decisions</strong></summary>

**1. Type-Aware vs Non-Type-Aware Rules**

| Aspect | Type-Aware | Non-Type-Aware |
|--------|------------|----------------|
| **Performance** | 200-500ms per file ❌ | 50-100ms per file ✅ |
| **Accuracy** | Catches type-level bugs ✅ | Syntax-only checks ❌ |
| **Setup Complexity** | Requires tsconfig.json ❌ | Simple plugin install ✅ |
| **Memory Usage** | 200-500MB (TS program) ❌ | 50-100MB ✅ |
| **CI/CD Time** | 2-5 minutes ❌ | 30-60 seconds ✅ |

**When to Use Type-Aware:**
```typescript
// ✅ Good use case: Catching Promise bugs
async function fetchData() {
  fetch('/api/data'); // ❌ Type-aware rule catches missing await
  return data;
}

// ✅ Good use case: Preventing unsafe operations
function process(value: string | number) {
  return value.toFixed(2); // ❌ Type-aware rule catches potential runtime error
}
```

**When Non-Type-Aware is Sufficient:**
```typescript
// ✅ Syntax checks don't need types
const foo = 'bar';; // ❌ Extra semicolon caught without types

// ✅ Style rules don't need types
function bad(){return 1;} // ❌ Formatting caught without types
```

**Recommendation:**
- **Small projects (<100 files)**: Type-aware everywhere
- **Medium projects (100-500 files)**: Type-aware for src/, non-type-aware for tests
- **Large monorepos (500+ files)**: Selective type-aware, parallel linting, aggressive caching

---

**2. Strict vs Relaxed Rule Sets**

| Configuration | Rules | Impact | Team Adoption |
|---------------|-------|--------|---------------|
| **Minimal** | `recommended` only | Low friction ✅ | Easy (90%+ acceptance) ✅ |
| **Balanced** | `recommended` + key strict rules | Moderate friction ⚖️ | Medium (70% acceptance) ⚖️ |
| **Strict** | `recommended-requiring-type-checking` + all strict rules | High friction ❌ | Hard (40% acceptance) ❌ |

**Minimal Configuration:**
```json
{
  "extends": ["plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn", // Not error
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
```
- **Pros**: Fast adoption, minimal refactoring, team buy-in
- **Cons**: Misses subtle bugs, allows `any` proliferation
- **Best for**: Legacy codebases, new teams learning TypeScript

**Balanced Configuration (Recommended):**
```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/explicit-function-return-type": "warn", // Warn, not error
    "@typescript-eslint/strict-boolean-expressions": "off" // Too strict for most teams
  }
}
```
- **Pros**: Catches 80% of bugs, reasonable friction, gradual improvement
- **Cons**: Some false positives, occasional escape hatches needed
- **Best for**: Most production codebases

**Strict Configuration:**
```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/no-non-null-assertion": "error"
  }
}
```
- **Pros**: Maximum safety, catches nearly all bugs
- **Cons**: High refactoring cost, team pushback, verbose code
- **Best for**: New greenfield projects, safety-critical systems

**Migration Strategy:**
```json
// Phase 1: Start minimal (Month 1)
{ "extends": ["plugin:@typescript-eslint/recommended"] }

// Phase 2: Add type-aware (Month 2)
{
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ]
}

// Phase 3: Gradually enable strict rules (Months 3-6)
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error", // Month 3
    "@typescript-eslint/no-floating-promises": "error", // Month 4
    "@typescript-eslint/explicit-function-return-type": ["error", {
      "allowExpressions": true // Month 5
    }]
  }
}
```

---

**3. Monorepo Configuration Strategies**

| Strategy | Setup | Performance | Maintenance |
|----------|-------|-------------|-------------|
| **Single Config** | Simple ✅ | Slow (lints everything) ❌ | Easy ✅ |
| **Per-Package Configs** | Complex ❌ | Fast (isolated) ✅ | Moderate ⚖️ |
| **Hybrid (Overrides)** | Moderate ⚖️ | Fast ✅ | Easy ✅ |

**Single Config (Simple but Slow):**
```json
// Root .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json" // Includes all packages
  }
}
```
- **Pros**: One config to maintain, consistent rules
- **Cons**: Slow (loads entire project), no package-specific rules
- **Best for**: Small monorepos (<10 packages)

**Per-Package Configs (Fast but Complex):**
```
monorepo/
├── packages/
│   ├── api/
│   │   ├── .eslintrc.json (API-specific rules)
│   │   └── tsconfig.json
│   ├── web/
│   │   ├── .eslintrc.json (React rules)
│   │   └── tsconfig.json
│   └── shared/
│       ├── .eslintrc.json (Strict rules)
│       └── tsconfig.json
└── .eslintrc.base.json (Shared base config)
```
- **Pros**: Fast (isolated linting), package-specific rules
- **Cons**: Config duplication, harder to update globally
- **Best for**: Large monorepos with diverse packages

**Hybrid with Overrides (Recommended):**
```javascript
// Root .eslintrc.js
module.exports = {
  extends: ['plugin:@typescript-eslint/recommended'],

  overrides: [
    {
      files: ['packages/api/**/*.ts'],
      parserOptions: { project: './packages/api/tsconfig.json' },
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'error' // Strict API
      }
    },
    {
      files: ['packages/web/**/*.tsx'],
      extends: ['plugin:react/recommended'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off' // Relaxed for React
      }
    }
  ]
};
```
- **Pros**: Single config with customization, fast (targeted projects)
- **Cons**: Config can become large with many overrides
- **Best for**: Most monorepos (10-50 packages)

---

**4. Auto-fix vs Manual Fix**

| Approach | Development Speed | Code Quality | Risk |
|----------|-------------------|--------------|------|
| **Auto-fix on Save** | Fast ✅ | Good ✅ | Low (reversible) ✅ |
| **Auto-fix in Pre-commit** | Moderate ⚖️ | Good ✅ | Low ✅ |
| **Manual Fix Only** | Slow ❌ | Best (reviewed) ✅ | None ✅ |

**Auto-fix Configuration:**
```json
// VSCode settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["typescript", "typescriptreact"]
}

// Auto-fixable rules
{
  "rules": {
    "@typescript-eslint/semi": ["error", "always"], // ✅ Auto-fixable
    "@typescript-eslint/quotes": ["error", "single"], // ✅ Auto-fixable
    "@typescript-eslint/no-explicit-any": "error" // ❌ Not auto-fixable
  }
}
```

**When to Enable Auto-fix:**
- ✅ Style rules (quotes, semicolons, spacing)
- ✅ Import sorting
- ✅ Trivial syntax fixes

**When to Disable Auto-fix:**
- ❌ Type-related changes (may break logic)
- ❌ Complex refactors
- ❌ Rules that require understanding context

</details>

---

### <details>
<summary><strong>💬 Explain to Junior: ESLint + TypeScript for Beginners</strong></summary>

**Analogy: ESLint as a Writing Tutor**

Imagine you're writing an essay, and you have a tutor who reads it and gives feedback:

- **ESLint (Standard)**: Checks spelling, grammar, punctuation
  - "You forgot a period here"
  - "This sentence is too long"

- **TypeScript ESLint**: Also understands the *meaning* of your words
  - "This paragraph contradicts what you said earlier" (type checking)
  - "You promised to explain this concept, but you didn't" (return type mismatch)

**Why Do We Need Both TypeScript Compiler AND ESLint?**

**TypeScript Compiler (`tsc`):**
- Checks if your types are correct
- Converts TypeScript to JavaScript
- Focuses on: "Will this code run without type errors?"

**ESLint with TypeScript:**
- Checks code quality and patterns
- Enforces team conventions
- Focuses on: "Is this code well-written and maintainable?"

**Example:**

```typescript
// ✅ TypeScript compiler is happy (no type errors)
function add(a: number, b: number) {
  return a + b;
}

// ❌ But ESLint catches code quality issues
function add(a: number, b: number) { // ESLint: Missing return type annotation
  const result = a + b; // ESLint: Unnecessary variable
  return result;
}

// ✅ Both TypeScript and ESLint are happy
function add(a: number, b: number): number {
  return a + b;
}
```

---

**Basic Setup (Step-by-Step)**

**Step 1: Install Dependencies**
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Think of this as:
- `eslint`: The main linter engine
- `@typescript-eslint/parser`: Teaches ESLint to read TypeScript
- `@typescript-eslint/eslint-plugin`: TypeScript-specific rules

**Step 2: Create Configuration File**

```json
// .eslintrc.json (like a rulebook)
{
  "parser": "@typescript-eslint/parser", // "Use TypeScript parser"
  "plugins": ["@typescript-eslint"], // "Load TypeScript rules"
  "extends": ["plugin:@typescript-eslint/recommended"], // "Use recommended rules"
  "rules": {
    "@typescript-eslint/no-explicit-any": "error" // "Custom rule: ban 'any'"
  }
}
```

**Step 3: Run ESLint**

```bash
npx eslint src/**/*.ts
```

---

**Understanding Rule Severity**

```json
{
  "rules": {
    "rule-name": "off",    // ⚪ Ignore this rule completely
    "rule-name": "warn",   // ⚠️ Warning (won't fail build)
    "rule-name": "error"   // ❌ Error (fails build)
  }
}
```

**Example:**
```typescript
// Rule: "@typescript-eslint/no-explicit-any": "error"

function process(data: any) { // ❌ ERROR: Don't use 'any'
  return data;
}

// Fix:
function process(data: unknown) { // ✅ Use 'unknown' instead
  return data;
}
```

---

**Type-Aware Rules (Advanced)**

Some rules need to understand the *types* of your code, not just the syntax.

**Without Type Information:**
```typescript
// ESLint can see: "This is a function call"
fetch('/api/data');

// But can't know: "This returns a Promise that should be awaited"
```

**With Type Information:**
```json
{
  "parserOptions": {
    "project": "./tsconfig.json" // Tell ESLint where to find type info
  },
  "extends": [
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ]
}
```

Now ESLint can detect:
```typescript
async function getData() {
  fetch('/api/data'); // ❌ ERROR: Promise should be awaited

  // Fix:
  await fetch('/api/data'); // ✅
}
```

**Trade-off:**
- ✅ Catches more bugs
- ❌ 2-3x slower (needs to load TypeScript project)

---

**Common Rules Explained**

**1. `no-explicit-any` - Avoid using `any`**

```typescript
// ❌ Bad: 'any' disables type checking
function process(data: any) {
  return data.foo.bar.baz; // No error, but might crash at runtime
}

// ✅ Good: Use specific types
function process(data: { foo: { bar: { baz: string } } }) {
  return data.foo.bar.baz; // TypeScript checks this is safe
}
```

**2. `no-unused-vars` - Remove unused variables**

```typescript
// ❌ Bad: Unused variables clutter code
function calculate(a: number, b: number) {
  const sum = a + b; // ESLint: 'sum' is declared but never used
  return a * b;
}

// ✅ Good: Remove unused variables
function calculate(a: number, b: number) {
  return a * b;
}
```

**3. `explicit-function-return-type` - Always specify return types**

```typescript
// ❌ Bad: No return type (harder to understand)
function getUser(id: number) {
  return { id, name: 'John' };
}

// ✅ Good: Explicit return type
function getUser(id: number): { id: number; name: string } {
  return { id, name: 'John' };
}
```

---

**Interview Answer Template**

**Q: How do you configure ESLint with TypeScript?**

**Answer Structure:**

"Configuring ESLint with TypeScript involves three main components:

1. **Parser**: We use `@typescript-eslint/parser` to convert TypeScript code into a format ESLint understands. This is like translating TypeScript to ESLint's language.

2. **Plugin**: The `@typescript-eslint/eslint-plugin` provides TypeScript-specific rules, like preventing the use of `any` or requiring return type annotations.

3. **Configuration**: We set up an `.eslintrc.json` file that tells ESLint:
   - Which parser to use (`@typescript-eslint/parser`)
   - Which plugins to load
   - Which rule sets to apply (e.g., `recommended`)
   - Any custom rules

For basic projects, the `recommended` preset is sufficient and fast. For larger projects, we can enable type-aware linting by setting `parserOptions.project` to point to our `tsconfig.json`. This catches more bugs but is 2-3x slower because it needs to load the full TypeScript type information.

A balanced approach is to use type-aware rules only for source files, not tests, and enable caching for faster subsequent runs."

**Follow-up Q: What's the difference between type-aware and non-type-aware linting?**

"Non-type-aware linting is faster (50-100ms per file) because it only analyzes syntax without understanding types. It can catch style issues and basic mistakes.

Type-aware linting is slower (200-500ms per file) because it loads the full TypeScript project to understand types. This allows it to catch bugs like:
- Promises that aren't awaited
- Type mismatches that could cause runtime errors
- Incorrect assumptions about types

For example, only type-aware rules can detect that `fetch('/api')` returns a Promise and should be awaited. Non-type-aware rules just see a function call and can't know it's a Promise.

The trade-off is performance vs. safety. In large projects, we often use type-aware rules selectively or only in CI to balance speed and thorough checking."

</details>

---

## Question 2: What are the most important TypeScript ESLint rules to enforce?

**Answer:**

The most critical TypeScript ESLint rules fall into several categories: type safety, code quality, and best practices. Enforcing these rules prevents common bugs and ensures maintainable code.

**Essential Type Safety Rules:**

```json
{
  "rules": {
    // Prevent 'any' type (breaks type safety)
    "@typescript-eslint/no-explicit-any": "error",

    // Ensure Promises are handled
    "@typescript-eslint/no-floating-promises": "error",

    // Prevent unsafe type assertions
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",

    // Require return types on functions
    "@typescript-eslint/explicit-function-return-type": ["warn", {
      "allowExpressions": true,
      "allowTypedFunctionExpressions": true
    }]
  }
}
```

**Code Quality Rules:**

```json
{
  "rules": {
    // Remove unused variables
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],

    // Prevent redundant type declarations
    "@typescript-eslint/no-inferrable-types": "error",

    // Consistent type imports
    "@typescript-eslint/consistent-type-imports": ["error", {
      "prefer": "type-imports"
    }],

    // Prevent namespace usage (use ES modules)
    "@typescript-eslint/no-namespace": "error"
  }
}
```

**Best Practices:**

```json
{
  "rules": {
    // Prevent non-null assertions (!)
    "@typescript-eslint/no-non-null-assertion": "warn",

    // Consistent array types
    "@typescript-eslint/array-type": ["error", {
      "default": "array-simple"
    }],

    // Naming conventions
    "@typescript-eslint/naming-convention": ["error",
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "prefix": ["I"]
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      }
    ]
  }
}
```

**Real-World Example:**

```typescript
// ❌ Violations of critical rules
async function fetchUser(id: any) { // no-explicit-any
  const response = fetch(`/api/users/${id}`); // no-floating-promises
  const data: User = response as any; // no-unsafe-assignment
  return data; // Missing return type
}

// ✅ Following all rules
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  const data: unknown = await response.json();
  return data as User; // Controlled assertion
}
```

**Recommended Configuration Levels:**

**Level 1: Minimum (New Projects)**
```json
{
  "extends": ["plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

**Level 2: Balanced (Production Apps)**
```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

**Level 3: Strict (Critical Systems)**
```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict"
  ]
}
```

---

### <details>
<summary><strong>🔍 Deep Dive: Rule Implementation & Type Checker Integration</strong></summary>

**How TypeScript ESLint Rules Work Internally**

TypeScript ESLint rules leverage the TypeScript compiler's type checker to analyze code beyond syntax. Let's examine the implementation of critical rules.

**Rule Architecture:**

```typescript
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

// Rule creation utility with type checking
const createRule = ESLintUtils.RuleCreator(
  name => `https://typescript-eslint.io/rules/${name}`
);

export default createRule({
  name: 'rule-name',
  meta: {
    type: 'problem', // or 'suggestion', 'layout'
    docs: {
      description: 'Rule description',
      recommended: 'error'
    },
    messages: {
      messageId: 'Error message template'
    },
    schema: [] // Rule options
  },
  defaultOptions: [],

  create(context) {
    // Get TypeScript type checker
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      // AST node visitors
      FunctionDeclaration(node) {
        // Rule logic using type checker
      }
    };
  }
});
```

---

**1. no-floating-promises Implementation**

This rule prevents forgetting to await Promises, one of the most common TypeScript bugs.

```typescript
export default createRule({
  name: 'no-floating-promises',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require Promise-like statements to be handled appropriately',
      recommended: 'error',
      requiresTypeChecking: true
    },
    messages: {
      floating: 'Promises must be awaited, returned, or handled with .then()/.catch()'
    },
    schema: []
  },
  defaultOptions: [],

  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      ExpressionStatement(node: TSESTree.ExpressionStatement) {
        // Get TypeScript node from ESTree node
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.expression);

        // Get type of the expression
        const type = checker.getTypeAtLocation(tsNode);

        // Check if type is Promise-like
        if (!isPromiseLike(type, checker)) {
          return; // Not a Promise, ignore
        }

        // Check if Promise is handled
        const parent = node.parent;

        if (isHandled(parent)) {
          return; // Promise is awaited/returned, OK
        }

        // Report error: floating Promise
        context.report({
          node: node.expression,
          messageId: 'floating'
        });
      }
    };
  }
});

// Helper: Check if type is Promise-like
function isPromiseLike(type: ts.Type, checker: ts.TypeChecker): boolean {
  // Check for Promise type
  const promisedType = checker.getPromisedTypeOfPromise(type);
  if (promisedType !== undefined) {
    return true;
  }

  // Check for thenable (has .then() method)
  const thenSymbol = type.getProperty('then');
  if (thenSymbol !== undefined) {
    const thenType = checker.getTypeOfSymbolAtLocation(thenSymbol, {} as any);
    return checker.getSignaturesOfType(thenType, ts.SignatureKind.Call).length > 0;
  }

  return false;
}

// Helper: Check if Promise is handled
function isHandled(parent: TSESTree.Node | undefined): boolean {
  if (!parent) return false;

  switch (parent.type) {
    case 'AwaitExpression': // await promise
    case 'ReturnStatement': // return promise
      return true;

    case 'MemberExpression':
      // promise.then() or promise.catch()
      return parent.property.type === 'Identifier' &&
             (parent.property.name === 'then' || parent.property.name === 'catch');

    default:
      return false;
  }
}
```

**Example detections:**

```typescript
async function example() {
  fetch('/api/data'); // ❌ Floating promise detected

  await fetch('/api/data'); // ✅ Awaited

  return fetch('/api/data'); // ✅ Returned

  fetch('/api/data').then(r => r.json()); // ✅ .then() called

  const promise = fetch('/api/data'); // ❌ Assigned but not handled
}
```

---

**2. no-unsafe-assignment Implementation**

Prevents assigning `any` type to typed variables, preserving type safety.

```typescript
export default createRule({
  name: 'no-unsafe-assignment',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow assigning any to typed variables',
      recommended: 'error',
      requiresTypeChecking: true
    },
    messages: {
      unsafeAssignment: 'Unsafe assignment of {{type}} to {{target}}'
    },
    schema: []
  },
  defaultOptions: [],

  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (!node.init) return;

        // Get types
        const targetNode = parserServices.esTreeNodeToTSNodeMap.get(node.id);
        const sourceNode = parserServices.esTreeNodeToTSNodeMap.get(node.init);

        const targetType = checker.getTypeAtLocation(targetNode);
        const sourceType = checker.getTypeAtLocation(sourceNode);

        // Check if source is 'any'
        if (isAnyType(sourceType)) {
          // Check if target has specific type annotation
          if (node.id.typeAnnotation) {
            context.report({
              node: node.init,
              messageId: 'unsafeAssignment',
              data: {
                type: checker.typeToString(sourceType),
                target: checker.typeToString(targetType)
              }
            });
          }
        }
      },

      AssignmentExpression(node: TSESTree.AssignmentExpression) {
        const leftNode = parserServices.esTreeNodeToTSNodeMap.get(node.left);
        const rightNode = parserServices.esTreeNodeToTSNodeMap.get(node.right);

        const leftType = checker.getTypeAtLocation(leftNode);
        const rightType = checker.getTypeAtLocation(rightNode);

        // Check unsafe assignment
        if (isAnyType(rightType) && !isAnyType(leftType)) {
          context.report({
            node: node.right,
            messageId: 'unsafeAssignment',
            data: {
              type: 'any',
              target: checker.typeToString(leftType)
            }
          });
        }
      }
    };
  }
});

function isAnyType(type: ts.Type): boolean {
  return (type.flags & ts.TypeFlags.Any) !== 0;
}
```

**Example detections:**

```typescript
// ❌ Unsafe assignment detected
const value: string = getData() as any;

// ❌ Detected
let typed: number;
typed = unknownValue as any;

// ✅ Safe (both any)
const value: any = getData() as any;

// ✅ Safe (proper typing)
const value: string = getData() as string;
```

---

**3. explicit-function-return-type Implementation**

Enforces explicit return type annotations for better documentation and type safety.

```typescript
export default createRule({
  name: 'explicit-function-return-type',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require explicit return types on functions',
      recommended: 'warn'
    },
    messages: {
      missingReturnType: 'Missing return type on function {{name}}'
    },
    schema: [{
      type: 'object',
      properties: {
        allowExpressions: { type: 'boolean' },
        allowTypedFunctionExpressions: { type: 'boolean' },
        allowHigherOrderFunctions: { type: 'boolean' }
      }
    }]
  },
  defaultOptions: [{
    allowExpressions: false,
    allowTypedFunctionExpressions: true,
    allowHigherOrderFunctions: true
  }],

  create(context, [options]) {
    return {
      FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
        // Check if return type is annotated
        if (node.returnType) {
          return; // Has return type, OK
        }

        // Report missing return type
        context.report({
          node,
          messageId: 'missingReturnType',
          data: {
            name: node.id?.name ?? 'anonymous'
          }
        });
      },

      FunctionExpression(node: TSESTree.FunctionExpression) {
        // Check if part of typed declaration
        if (options.allowTypedFunctionExpressions) {
          const parent = node.parent;

          // const fn: MyType = function() {}
          if (parent?.type === 'VariableDeclarator' && parent.id.typeAnnotation) {
            return; // Type inferred from declaration
          }
        }

        if (node.returnType) {
          return;
        }

        context.report({
          node,
          messageId: 'missingReturnType',
          data: { name: 'function expression' }
        });
      },

      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression) {
        // Allow expressions: const x = () => 1
        if (options.allowExpressions && node.body.type !== 'BlockStatement') {
          return;
        }

        // Allow higher-order functions: map(x => x * 2)
        if (options.allowHigherOrderFunctions) {
          const parent = node.parent;
          if (parent?.type === 'CallExpression') {
            return; // Return type inferred from callback context
          }
        }

        if (node.returnType) {
          return;
        }

        context.report({
          node,
          messageId: 'missingReturnType',
          data: { name: 'arrow function' }
        });
      }
    };
  }
});
```

**Example detections:**

```typescript
// ❌ Missing return type
function getData() {
  return { id: 1 };
}

// ✅ Explicit return type
function getData(): { id: number } {
  return { id: 1 };
}

// ✅ Allowed with allowTypedFunctionExpressions
type Handler = () => void;
const handler: Handler = function() {
  console.log('ok');
};

// ✅ Allowed with allowExpressions
const double = (x: number) => x * 2;

// ✅ Allowed with allowHigherOrderFunctions
[1, 2, 3].map(x => x * 2);
```

---

**Type Checker API Usage**

Common TypeScript Compiler API methods used in rules:

```typescript
// Get type of a node
const type = checker.getTypeAtLocation(node);

// Check type flags
const isAny = (type.flags & ts.TypeFlags.Any) !== 0;
const isString = (type.flags & ts.TypeFlags.String) !== 0;
const isNumber = (type.flags & ts.TypeFlags.Number) !== 0;

// Get Promise type
const promisedType = checker.getPromisedTypeOfPromise(type);

// Get symbol of a declaration
const symbol = checker.getSymbolAtLocation(node);

// Get type as string
const typeName = checker.typeToString(type);

// Check assignability
const isAssignable = checker.isTypeAssignableTo(sourceType, targetType);

// Get call signatures (for functions)
const signatures = checker.getSignaturesOfType(type, ts.SignatureKind.Call);

// Get return type of function
const returnType = checker.getReturnTypeOfSignature(signatures[0]);

// Get properties of object type
const properties = type.getProperties();
```

---

**Performance Optimization in Rules**

```typescript
// ❌ Slow: Creates new type checker for every file
create(context) {
  const program = ts.createProgram([context.getFilename()], {});
  const checker = program.getTypeChecker();
  // ...
}

// ✅ Fast: Reuses cached type checker
create(context) {
  const parserServices = ESLintUtils.getParserServices(context);
  const checker = parserServices.program.getTypeChecker(); // Cached
  // ...
}

// ✅ Optimize with early returns
FunctionDeclaration(node) {
  // Quick syntax check first
  if (node.returnType) {
    return; // No need for expensive type checking
  }

  // Only do expensive type analysis if needed
  const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
  const type = checker.getTypeAtLocation(tsNode);
  // ...
}
```

</details>

---

### <details>
<summary><strong>🐛 Real-World Scenario: Rule Configuration Causing False Positives</strong></summary>

**Problem:**
Team enabled strict TypeScript ESLint rules, but getting 200+ false positive errors in legitimate code, blocking development.

**Initial Strict Configuration:**

```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error"
  }
}
```

**Error Metrics:**

```
ESLint Errors Summary:
├── Total errors: 247
├── False positives (legitimate code): 203 (82%)
├── True issues: 44 (18%)
├── Files affected: 89
└── Developer time wasted: ~12 hours fixing false positives

Top Error Categories:
1. explicit-function-return-type: 87 errors
   - React components: 42 (should be allowed)
   - Callbacks: 28 (type inferred from context)
   - Inline functions: 17

2. strict-boolean-expressions: 64 errors
   - Truthiness checks: 48 (legitimate pattern)
   - Optional chaining: 16 (false positive)

3. no-unsafe-assignment: 38 errors
   - JSON parsing: 22 (unavoidable)
   - Third-party library types: 16 (missing types)

4. no-non-null-assertion: 34 errors
   - DOM queries: 18 (after null checks)
   - Map.get() after has(): 16 (safe usage)

5. no-unsafe-member-access: 24 errors
   - Dynamic API responses: 24 (runtime validated)
```

**Investigation Examples:**

**1. False Positive: React Components**

```typescript
// ❌ ERROR: Missing return type on function
// @typescript-eslint/explicit-function-return-type
export function UserProfile({ userId }: Props) {
  const user = useUser(userId);

  return (
    <div>
      <h1>{user.name}</h1>
    </div>
  );
}

// Team feedback: "This is standard React - return type is obvious JSX.Element"
// Adding `: JSX.Element` to every component is verbose and unnecessary
```

**2. False Positive: Strict Boolean Expressions**

```typescript
// ❌ ERROR: Unexpected truthiness check
// @typescript-eslint/strict-boolean-expressions
function greet(name?: string) {
  if (name) { // ESLint: 'name' might be empty string, use 'name != null' instead
    return `Hello, ${name}`;
  }
  return 'Hello';
}

// Team feedback: "Checking truthiness is intentional - we want to exclude empty strings"
```

**3. False Positive: JSON Parsing**

```typescript
// ❌ ERROR: Unsafe assignment of 'any'
// @typescript-eslint/no-unsafe-assignment
async function loadConfig() {
  const response = await fetch('/api/config');
  const config = await response.json(); // ESLint: json() returns 'any'
  return config;
}

// Team feedback: "JSON parsing always returns 'any' - this is unavoidable"
// We validate the data with runtime checks anyway
```

**4. False Positive: DOM Queries After Null Check**

```typescript
// ❌ ERROR: Non-null assertion used
// @typescript-eslint/no-non-null-assertion
const button = document.getElementById('submit-btn');

if (button) {
  button.addEventListener('click', handleClick); // ✅ Null check done
}

// Later in code (after check):
button!.focus(); // ❌ ESLint error: Don't use non-null assertion

// Team feedback: "We already checked for null above - assertion is safe here"
```

**5. False Positive: Map.get() After has()**

```typescript
// ❌ ERROR: Non-null assertion used
const cache = new Map<string, User>();

if (cache.has(userId)) {
  const user = cache.get(userId)!; // ❌ ESLint error
  processUser(user);
}

// Team feedback: "Map.get() returns undefined if key doesn't exist,
// but we just checked with has() - the value IS guaranteed to exist"
```

---

**Solution: Balanced Configuration**

**Step 1: Analyze Error Patterns**

```bash
# Group errors by rule
npx eslint src/**/*.ts --format json | jq '.[] | .messages | .[] | .ruleId' | sort | uniq -c | sort -rn

# Output:
#  87 @typescript-eslint/explicit-function-return-type
#  64 @typescript-eslint/strict-boolean-expressions
#  38 @typescript-eslint/no-unsafe-assignment
#  34 @typescript-eslint/no-non-null-assertion
#  24 @typescript-eslint/no-unsafe-member-access
```

**Step 2: Create Balanced Configuration**

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],

  rules: {
    // ✅ Keep critical rules as errors
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-unused-vars': 'error',

    // ⚠️ Relax overly strict rules
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true, // Allow: const x = () => 1
      allowTypedFunctionExpressions: true, // Allow: const fn: Type = function() {}
      allowHigherOrderFunctions: true, // Allow: arr.map(x => x * 2)
      allowDirectConstAssertionInArrowFunctions: true
    }],

    // ⚠️ Allow truthiness checks (common pattern)
    '@typescript-eslint/strict-boolean-expressions': ['warn', {
      allowString: true,
      allowNumber: true,
      allowNullableObject: true
    }],

    // ⚠️ Disable overly strict unsafe rules (use targeted fixes instead)
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',

    // ⚠️ Allow non-null assertions with warning
    '@typescript-eslint/no-non-null-assertion': 'warn'
  },

  overrides: [
    {
      // Relax rules for React components
      files: ['*.tsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off'
      }
    },
    {
      // Relax rules for test files
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'warn'
      }
    },
    {
      // Strict rules for critical files
      files: ['src/api/**/*.ts', 'src/db/**/*.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error'
      }
    }
  ]
};
```

**Step 3: Add Rule-Specific Disable Comments for Legitimate Cases**

```typescript
// JSON parsing (unavoidable 'any')
async function loadConfig(): Promise<Config> {
  const response = await fetch('/api/config');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const config = await response.json();

  // Runtime validation
  if (!isValidConfig(config)) {
    throw new Error('Invalid config');
  }

  return config as Config;
}

// DOM query after null check
const button = document.getElementById('submit-btn');

if (button) {
  // Safe to assert non-null after check
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  button!.focus();
}
```

**Step 4: Create Type Guards for Dynamic Data**

```typescript
// Instead of disabling rules, create type guards
interface Config {
  apiKey: string;
  timeout: number;
}

function isConfig(value: unknown): value is Config {
  return (
    typeof value === 'object' &&
    value !== null &&
    'apiKey' in value &&
    typeof value.apiKey === 'string' &&
    'timeout' in value &&
    typeof value.timeout === 'number'
  );
}

async function loadConfig(): Promise<Config> {
  const response = await fetch('/api/config');
  const data: unknown = await response.json(); // ✅ No 'any'

  if (!isConfig(data)) {
    throw new Error('Invalid config format');
  }

  return data; // ✅ Properly typed
}
```

**Results After Optimization:**

```
ESLint Errors Summary (After Fix):
├── Total errors: 44 ⚡ (82% reduction)
├── False positives: 0 ✅
├── True issues: 44 (all legitimate bugs to fix)
├── Files affected: 21
└── Developer time saved: ~12 hours

Error Breakdown:
1. no-floating-promises: 18 errors (real bugs - missing awaits)
2. no-explicit-any: 12 errors (real bugs - replace with proper types)
3. no-unused-vars: 9 errors (real bugs - cleanup needed)
4. explicit-function-return-type: 5 warnings (add return types for clarity)

Team Satisfaction:
├── Before: 32% (frustrated with false positives)
├── After: 89% (catching real bugs, no noise)
└── False positive rate: 82% → 0%
```

**Additional Improvements:**

1. **Documentation for Team:**

```markdown
# TypeScript ESLint Rules Guide

## When to Use `eslint-disable`

**✅ Acceptable:**
- JSON parsing (always returns 'any')
- Third-party libraries with missing types
- Complex type inference edge cases

**❌ Not Acceptable:**
- Laziness (not wanting to type something)
- Skipping proper error handling
- Avoiding fixing real type issues

## Common Patterns

### JSON Parsing
\`\`\`typescript
const data: unknown = await response.json(); // Prefer unknown
if (isValidData(data)) { // Runtime validation
  return data;
}
\`\`\`

### Non-null Assertions
Only use after explicit null checks:
\`\`\`typescript
if (value != null) {
  value.method(); // No need for !
}
\`\`\`
```

2. **Custom ESLint Plugin for Project-Specific Rules:**

```typescript
// custom-rules/no-unsafe-json-parse.ts
export default createRule({
  name: 'no-unsafe-json-parse',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require type guard after JSON.parse()',
      recommended: 'error'
    },
    messages: {
      missingTypeGuard: 'Use type guard after JSON parsing'
    }
  },
  defaultOptions: [],
  create(context) {
    return {
      AwaitExpression(node) {
        // Detect: await response.json()
        if (isJsonCall(node.argument)) {
          // Check if followed by type guard
          const parent = node.parent;
          if (!hasTypeGuard(parent)) {
            context.report({
              node,
              messageId: 'missingTypeGuard'
            });
          }
        }
      }
    };
  }
});
```

**Lessons Learned:**
- Start with `recommended`, not `strict` config
- Enable strict rules gradually (one per week)
- Use `overrides` for different file types (React, tests, API)
- Document acceptable `eslint-disable` use cases
- Prefer type guards over `any` for runtime data
- Monitor false positive rate (<5% is good)

</details>

---

### <details>
<summary><strong>⚖️ Trade-offs: TypeScript ESLint Rule Decisions</strong></summary>

**1. Strict Type Safety vs Developer Productivity**

| Aspect | Strict Rules | Relaxed Rules |
|--------|-------------|---------------|
| **Type Safety** | Maximum ✅ | Moderate ⚖️ |
| **Development Speed** | Slower ❌ | Faster ✅ |
| **Codebase Consistency** | High ✅ | Variable ❌ |
| **Onboarding Difficulty** | Hard ❌ | Easy ✅ |
| **Bug Prevention** | More bugs caught ✅ | Some bugs slip through ❌ |

**Strict Configuration (Safety First):**

```json
{
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

**Example Impact:**

```typescript
// ❌ 5 violations with strict rules
function processUser(user) {
  if (user) {
    return user.name;
  }
}

// ✅ Strict rules require this
function processUser(user: User | null): string | undefined {
  if (user !== null) {
    return user.name;
  }
  return undefined;
}

// Developer time: 2 minutes per function (more typing, more thinking)
```

**Relaxed Configuration (Productivity First):**

```json
{
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/no-non-null-assertion": "warn"
  }
}
```

**Example Impact:**

```typescript
// ✅ Allowed with relaxed rules
function processUser(user: User | null) {
  if (user) {
    return user.name;
  }
}

// Developer time: 30 seconds (less friction)
// Risk: May miss edge cases (empty string, 0, etc.)
```

**Decision Matrix:**

| Project Type | Recommended Strictness | Rationale |
|--------------|------------------------|-----------|
| **Banking/Finance** | Strict ✅ | Safety critical, bugs = money loss |
| **Healthcare** | Strict ✅ | Safety critical, bugs = compliance issues |
| **E-commerce** | Balanced ⚖️ | Important but not life-critical |
| **Internal Tools** | Relaxed ⚖️ | Speed matters more than perfection |
| **Prototypes** | Minimal ❌ | Move fast, refactor later |

---

**2. Type-Aware Rules: Performance vs Comprehensive Checking**

| Configuration | Lint Time | Bugs Caught | CI Cost |
|---------------|-----------|-------------|---------|
| **Non-type-aware** | 30s | 60% | Low ✅ |
| **Selective type-aware** | 90s | 85% ⚖️ | Medium ⚖️ |
| **Full type-aware** | 180s | 95% | High ❌ |

**Full Type-Aware (Comprehensive):**

```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parserOptions": {
    "project": ["./tsconfig.json", "./packages/*/tsconfig.json"]
  }
}
```

**Performance Impact:**

```
Linting 500 files:
├── Non-type-aware: 32 seconds
├── Full type-aware: 187 seconds (5.8x slower)
└── CI runs/day: 50
    ├── Non-type-aware cost: 27 minutes/day
    └── Type-aware cost: 156 minutes/day (2.6 hours)
```

**Selective Type-Aware (Balanced):**

```javascript
module.exports = {
  overrides: [
    {
      // Type-aware for critical files only
      files: ['src/api/**/*.ts', 'src/db/**/*.ts', 'src/utils/**/*.ts'],
      parserOptions: {
        project: './tsconfig.json'
      },
      extends: [
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
      ]
    },
    {
      // Non-type-aware for everything else
      files: ['src/**/*.tsx', 'src/components/**/*.ts'],
      extends: ['plugin:@typescript-eslint/recommended']
    }
  ]
};
```

**Performance Impact:**

```
Linting 500 files:
├── Critical files (type-aware): 100 files × 400ms = 40s
├── Other files (non-type-aware): 400 files × 80ms = 32s
├── Total: 72 seconds (2.25x faster than full type-aware)
└── Bugs caught: ~90% (vs 95% with full type-aware)
```

**When to Use Each:**

- **Non-type-aware**: Fast prototypes, low-risk code, pre-commit hooks
- **Selective type-aware**: Production apps, monorepos, balanced approach
- **Full type-aware**: Safety-critical systems, CI only (not local dev)

---

**3. Auto-Fix vs Manual Review**

| Rule Category | Auto-Fix Safe? | Risk Level |
|---------------|----------------|------------|
| **Formatting** (quotes, semicolons) | Yes ✅ | None |
| **Imports** (unused, sorting) | Yes ✅ | Low |
| **Simple Types** (inferrable types) | Yes ✅ | Low |
| **Complex Types** (any → specific) | No ❌ | High |
| **Async** (missing await) | No ❌ | High |

**Safe Auto-Fix Rules:**

```json
{
  "rules": {
    "@typescript-eslint/semi": ["error", "always"], // ✅ Auto-fixable
    "@typescript-eslint/quotes": ["error", "single"], // ✅ Auto-fixable
    "@typescript-eslint/no-inferrable-types": "error", // ✅ Auto-fixable
    "@typescript-eslint/consistent-type-imports": "error" // ✅ Auto-fixable
  }
}
```

**Example Auto-Fixes:**

```typescript
// Before:
import { User, type Config } from './types'
const age: number = 25

// After (auto-fixed):
import type { Config } from './types';
import { User } from './types';
const age = 25; // Type inferred
```

**Dangerous Auto-Fix Rules (Disable):**

```json
{
  "rules": {
    // ❌ Don't auto-fix: Could break logic
    "@typescript-eslint/no-floating-promises": ["error", { "fix": false }],

    // ❌ Don't auto-fix: Requires human judgment
    "@typescript-eslint/no-explicit-any": "error" // No auto-fix available
  }
}
```

**VSCode Configuration:**

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true // ✅ Safe rules only
  },

  // Disable auto-fix for specific rules
  "eslint.codeActionsOnSave.rules": [
    "!@typescript-eslint/no-floating-promises",
    "!@typescript-eslint/await-thenable"
  ]
}
```

---

**4. Naming Conventions: Enforcement vs Flexibility**

| Approach | Consistency | Flexibility | Onboarding |
|----------|-------------|-------------|------------|
| **Strict Conventions** | High ✅ | Low ❌ | Hard ❌ |
| **Recommended Conventions** | Medium ⚖️ | Medium ⚖️ | Medium ⚖️ |
| **No Conventions** | Low ❌ | High ✅ | Easy ✅ |

**Strict Naming Conventions:**

```json
{
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "prefix": ["I"]
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      },
      {
        "selector": "class",
        "format": ["PascalCase"]
      },
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE"]
      },
      {
        "selector": "function",
        "format": ["camelCase"]
      }
    ]
  }
}
```

**Impact:**

```typescript
// ❌ Violations
interface User {} // Must be IUser
type config = {}; // Must be Config
const api_key = '...'; // Must be apiKey or API_KEY

// ✅ Compliant
interface IUser {}
type Config = {};
const apiKey = '...';
```

**Recommended Naming Conventions (Modern):**

```json
{
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"]
        // No "I" prefix (modern convention)
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      },
      {
        "selector": "variable",
        "modifiers": ["const", "global"],
        "format": ["UPPER_CASE", "camelCase"]
      }
    ]
  }
}
```

**Trade-offs:**

- **Strict conventions**: Better consistency, harder to adopt (team resistance)
- **Relaxed conventions**: Easier adoption, some inconsistency
- **No conventions**: Freedom, but confusing codebase (UserType vs user_type vs usertype)

**Recommendation**: Start with recommended conventions, add strict rules gradually based on team feedback.

---

**5. Error vs Warning: Blocking vs Non-Blocking**

| Severity | CI Behavior | Developer Behavior | Fix Rate |
|----------|-------------|-------------------|----------|
| **Error** | Blocks merge ❌ | Must fix immediately | 100% |
| **Warning** | Passes ✅ | Often ignored | 30-40% |
| **Off** | N/A | N/A | 0% |

**When to Use Errors:**

```json
{
  "rules": {
    // Critical bugs → ERROR
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",

    // Best practices → WARNING
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn"
  }
}
```

**Phased Enforcement:**

```json
// Week 1: Introduce as warning
{
  "@typescript-eslint/explicit-function-return-type": "warn"
}

// Week 2-4: Give team time to fix (warning count should decrease)
// Monitor: npx eslint . --format json | jq '[.[] | .messages | .[] | select(.ruleId == "@typescript-eslint/explicit-function-return-type")] | length'

// Week 5: Promote to error (if warning count < 10)
{
  "@typescript-eslint/explicit-function-return-type": "error"
}
```

</details>

---

### <details>
<summary><strong>💬 Explain to Junior: Important TypeScript ESLint Rules</strong></summary>

**Analogy: ESLint Rules as Code Reviewers**

Imagine you have several expert code reviewers, each specializing in different areas:

1. **Type Safety Reviewer**: Catches type-related bugs
2. **Code Quality Reviewer**: Ensures clean, maintainable code
3. **Best Practices Reviewer**: Enforces team conventions

TypeScript ESLint rules are like these automated reviewers, checking your code 24/7.

---

**The Top 5 Rules Every Junior Should Know**

**1. no-explicit-any - The "No Shortcuts" Rule**

**Why it exists:**
Using `any` defeats the purpose of TypeScript - it disables all type checking.

**Bad Example:**
```typescript
function processData(data: any) { // ❌ Type checking disabled
  return data.foo.bar.baz; // Could crash at runtime, TypeScript won't warn
}
```

**Good Example:**
```typescript
interface Data {
  foo: {
    bar: {
      baz: string;
    };
  };
}

function processData(data: Data) { // ✅ Type-safe
  return data.foo.bar.baz; // TypeScript checks this is valid
}
```

**Analogy:** Using `any` is like turning off your car's safety features. Sure, it's easier, but you lose all the protection TypeScript provides.

---

**2. no-floating-promises - The "Don't Forget to Wait" Rule**

**Why it exists:**
Forgetting to `await` a Promise is one of the most common bugs in async code.

**Bad Example:**
```typescript
async function saveUser(user: User) {
  database.save(user); // ❌ Promise not awaited! Might not finish before function returns
  console.log('User saved'); // Logs before save actually completes
}
```

**Good Example:**
```typescript
async function saveUser(user: User) {
  await database.save(user); // ✅ Waits for save to complete
  console.log('User saved'); // Now this is accurate
}
```

**Analogy:** It's like asking someone to deliver a package but leaving before they confirm they received it. You assume it worked, but you don't actually know.

---

**3. no-unused-vars - The "Clean Up Your Room" Rule**

**Why it exists:**
Unused variables clutter code and may indicate incomplete work or bugs.

**Bad Example:**
```typescript
function calculateTotal(price: number, quantity: number) {
  const tax = price * 0.1; // ❌ Declared but never used
  const shipping = 5; // ❌ Never used
  return price * quantity; // Forgot to add tax and shipping!
}
```

**Good Example:**
```typescript
function calculateTotal(price: number, quantity: number) {
  const tax = price * 0.1;
  const shipping = 5;
  return (price * quantity) + tax + shipping; // ✅ All variables used
}
```

**Analogy:** Like leaving tools out after a project - they take up space and make it hard to see what's actually being used.

---

**4. explicit-function-return-type - The "Document Your Promises" Rule**

**Why it exists:**
Explicit return types make code more readable and catch bugs early.

**Bad Example:**
```typescript
function getUser(id: number) { // ❌ What does this return?
  if (id < 0) {
    return null; // Sometimes null
  }
  return { id, name: 'John' }; // Sometimes object
}

// Later:
const user = getUser(5);
user.name; // TypeScript knows it could be null, but not obvious from function signature
```

**Good Example:**
```typescript
function getUser(id: number): { id: number; name: string } | null {
  if (id < 0) {
    return null;
  }
  return { id, name: 'John' };
}

// Later:
const user = getUser(5);
if (user) {
  user.name; // ✅ Clear that we need to check for null first
}
```

**Analogy:** Like a recipe that says "makes something delicious" vs "makes 12 chocolate chip cookies" - the specific version tells you exactly what to expect.

---

**5. no-non-null-assertion - The "Don't Assume" Rule**

**Why it exists:**
Using `!` (non-null assertion) tells TypeScript "trust me, this isn't null", but if you're wrong, your app crashes.

**Bad Example:**
```typescript
function focusButton() {
  const button = document.getElementById('submit'); // Could be null
  button!.focus(); // ❌ Assumes button exists - crashes if it doesn't
}
```

**Good Example:**
```typescript
function focusButton() {
  const button = document.getElementById('submit');

  if (button) { // ✅ Check for null first
    button.focus();
  } else {
    console.error('Submit button not found');
  }
}
```

**Analogy:** Like saying "I'm 100% sure the door is unlocked" without checking - you might be right, but if you're wrong, you'll be locked out.

---

**How to Learn Rule by Rule**

**Week 1: Start with "no-explicit-any"**
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

Fix all `any` types in your code. This is the foundation of TypeScript.

**Week 2: Add "no-floating-promises"**
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-floating-promises": "error"
  }
}
```

Fix all missing `await` keywords. This prevents async bugs.

**Week 3: Add "no-unused-vars"**
Remove all unused variables. This cleans up your code.

**Week 4: Add "explicit-function-return-type" (as warning)**
```json
{
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

Start adding return types (warnings won't block you while learning).

---

**Interview Answer Template**

**Q: What are the most important TypeScript ESLint rules?**

**Answer Structure:**

"The most critical TypeScript ESLint rules fall into three categories:

**Type Safety:**
- `no-explicit-any`: Prevents using `any` type, which disables type checking. This is essential because `any` defeats the purpose of TypeScript.
- `no-floating-promises`: Ensures Promises are awaited or handled. This prevents common async bugs where operations don't complete as expected.

**Code Quality:**
- `no-unused-vars`: Removes unused variables, keeping code clean and potentially catching logic bugs where you intended to use a variable but forgot.
- `explicit-function-return-type`: Requires explicit return type annotations, making function contracts clear and catching return value bugs early.

**Best Practices:**
- `no-non-null-assertion`: Prevents using the non-null assertion operator (`!`), encouraging proper null checks instead of assumptions that can cause runtime crashes.

For a new project, I'd start with the `recommended` preset, then gradually enable stricter rules. The key is balancing type safety with developer productivity - too strict and the team pushes back, too relaxed and bugs slip through.

In my experience, `no-explicit-any` and `no-floating-promises` catch the most real bugs, so I always enforce those as errors. Rules like `explicit-function-return-type` I start as warnings to avoid blocking development while the team adapts."

**Follow-up Q: How do you decide which rules to enable?**

"I consider three factors:

1. **Project criticality**: Financial or healthcare apps need stricter rules than internal tools
2. **Team experience**: Senior teams can handle stricter rules, junior teams need gradual introduction
3. **Performance**: Type-aware rules are slower, so I use them selectively in large projects

I typically start with `plugin:@typescript-eslint/recommended`, monitor false positives for 2 weeks, then add type-aware rules for critical files only. I use `overrides` in ESLint config to apply stricter rules to API/database code and relaxed rules to React components where type inference works well."

</details>
