# Webpack Fundamentals

> **Focus**: Modern JavaScript tooling and bundling

---

## Question 1: What is Webpack and what are its core concepts (entry, output, loaders, plugins)?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix, Airbnb

### Question
Explain Webpack's core concepts: entry, output, loaders, and plugins. How do they work together?

### Answer

Webpack is a **static module bundler** for modern JavaScript applications. It builds a dependency graph from entry points and bundles all modules into optimized output files.

### Core Concepts

**1. Entry:**
- Starting point(s) for Webpack to build dependency graph
- Tells Webpack which module to start from
- Default: `./src/index.js`

**2. Output:**
- Where to emit bundled files
- Filename and path configuration
- Default: `./dist/main.js`

**3. Loaders:**
- Transform non-JavaScript files (CSS, images, TypeScript) into modules
- Apply transformations during bundling
- Processed right-to-left / bottom-to-top

**4. Plugins:**
- Extend Webpack functionality
- Perform broader tasks (optimization, asset management, environment variables)
- Run at various stages of the bundle lifecycle

### Code Example

**Basic Webpack Configuration:**

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  // 1. ENTRY - Where to start building dependency graph
  entry: './src/index.js',

  // Or multiple entries:
  entry: {
    app: './src/app.js',
    vendor: './src/vendor.js'
  },

  // 2. OUTPUT - Where to emit bundles
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js', // e.g., app.a1b2c3d4.js
    clean: true // Clean dist folder before each build
  },

  // 3. LOADERS - Transform files
  module: {
    rules: [
      {
        test: /\.js$/,           // Match .js files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: 'babel-loader', // Use babel-loader
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // Extract CSS to separate file
          'css-loader'                  // Resolve CSS imports
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource', // Emit separate file
        generator: {
          filename: 'images/[name].[hash][ext]'
        }
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },

  // 4. PLUGINS - Extend functionality
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ],

  // Development settings
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    static: './dist',
    port: 3000,
    hot: true
  }
};
```

**Real Example - React App:**

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      main: './src/index.tsx',
      vendor: ['react', 'react-dom']
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction
        ? 'js/[name].[contenthash:8].js'
        : 'js/[name].js',
      chunkFilename: isProduction
        ? 'js/[name].[contenthash:8].chunk.js'
        : 'js/[name].chunk.js',
      publicPath: '/',
      clean: true
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils')
      }
    },

    module: {
      rules: [
        // TypeScript/JSX
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript'
              ],
              plugins: [
                '@babel/plugin-transform-runtime',
                isProduction && 'transform-remove-console'
              ].filter(Boolean)
            }
          }
        },

        // CSS/SCSS
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  localIdentName: isProduction
                    ? '[hash:base64:8]'
                    : '[path][name]__[local]'
                }
              }
            },
            'postcss-loader'
          ]
        },
        {
          test: /\.scss$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader'
          ]
        },

        // Images
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024 // Inline images < 8kb
            }
          },
          generator: {
            filename: 'images/[name].[hash:8][ext]'
          }
        },

        // Fonts
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash:8][ext]'
          }
        }
      ]
    },

    plugins: [
      new CleanWebpackPlugin(),

      new HtmlWebpackPlugin({
        template: './public/index.html',
        favicon: './public/favicon.ico',
        minify: isProduction && {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        }
      }),

      new MiniCssExtractPlugin({
        filename: isProduction
          ? 'css/[name].[contenthash:8].css'
          : 'css/[name].css'
      }),

      new Dotenv({
        path: `.env.${isProduction ? 'production' : 'development'}`
      })
    ],

    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: 'single'
    },

    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      port: 3000,
      hot: true,
      historyApiFallback: true,
      compress: true,
      open: true
    },

    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map'
  };
};
```

**How Components Work Together:**

```javascript
// src/index.js (ENTRY)
import './styles.css';          // Loader processes CSS
import logo from './logo.png';  // Loader processes image
import { greet } from './utils'; // Webpack builds dependency graph

console.log(greet('Webpack'));

// webpack.config.js
module.exports = {
  entry: './src/index.js', // 1. Start here

  output: {
    filename: 'bundle.js',  // 2. Output to dist/bundle.js
    path: path.resolve(__dirname, 'dist')
  },

  module: {
    rules: [
      {
        test: /\.css$/,      // 3. Loader transforms CSS
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.png$/,      // 3. Loader handles images
        type: 'asset/resource'
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({  // 4. Plugin generates HTML
      template: './src/index.html'
    })
  ]
};

// Build process:
// 1. Webpack starts at entry (index.js)
// 2. Builds dependency graph (finds all imports)
// 3. Loaders transform files (CSS → JS module, PNG → file path)
// 4. Plugins perform tasks (generate HTML, optimize, etc.)
// 5. Output bundles to dist/bundle.js
```

<details>
<summary><strong>🔍 Deep Dive: Webpack Build Process & Internals</strong></summary>

**How Webpack Builds the Dependency Graph:**

```javascript
// Step-by-step build process

// 1. ENTRY RESOLUTION
// Webpack starts at entry point
entry: './src/index.js'

// 2. PARSE & AST GENERATION
// Webpack uses acorn parser to create AST (Abstract Syntax Tree)
import React from 'react';
import './App.css';
import logo from './logo.svg';

// Becomes AST:
{
  type: 'Program',
  body: [
    {
      type: 'ImportDeclaration',
      source: { value: 'react' },
      // ... more AST nodes
    }
  ]
}

// 3. DEPENDENCY EXTRACTION
// Webpack finds all import/require statements
dependencies = [
  'react',           // npm module
  './App.css',       // CSS file (needs loader)
  './logo.svg'       // SVG file (needs loader)
]

// 4. MODULE RESOLUTION
// For each dependency, Webpack:
// - Checks if it's a file or npm module
// - Applies appropriate loaders
// - Recursively builds dependency graph

// 5. LOADER TRANSFORMATION
// Loaders process files right-to-left
{
  test: /\.css$/,
  use: ['style-loader', 'css-loader'] // css-loader THEN style-loader
}

// css-loader: Parses CSS and resolves imports/url()
// style-loader: Injects CSS into DOM via <style> tag

// 6. PLUGIN EXECUTION
// Plugins hook into Webpack's compilation lifecycle
compiler.hooks.emit.tap('MyPlugin', (compilation) => {
  // Runs before emitting assets
});

// 7. CHUNK GENERATION
// Webpack creates chunks (bundles) based on:
// - Entry points
// - Code splitting (dynamic imports)
// - Optimization.splitChunks configuration

// 8. OUTPUT EMISSION
// Webpack writes final bundles to disk
```

**Internal Module System:**

```javascript
// How Webpack bundles modules

// INPUT: Multiple files
// src/utils.js
export function add(a, b) {
  return a + b;
}

// src/index.js
import { add } from './utils';
console.log(add(2, 3));

// OUTPUT: Single bundle (simplified)
(function(modules) {
  // Module cache
  var installedModules = {};

  // Require function
  function __webpack_require__(moduleId) {
    // Check cache
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }

    // Create module
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };

    // Execute module
    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );

    // Mark as loaded
    module.l = true;

    return module.exports;
  }

  // Load entry module
  return __webpack_require__('./src/index.js');
})({
  './src/utils.js': function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.add = function(a, b) {
      return a + b;
    };
  },

  './src/index.js': function(module, exports, __webpack_require__) {
    "use strict";
    var utils = __webpack_require__('./src/utils.js');
    console.log(utils.add(2, 3)); // 5
  }
});
```

**Loader Execution Pipeline:**

```javascript
// How loaders work internally

// Example: Processing SCSS → CSS → JS
{
  test: /\.scss$/,
  use: [
    'style-loader',   // 3. Inject CSS into DOM
    'css-loader',     // 2. Parse CSS, resolve imports
    'sass-loader'     // 1. Compile SCSS → CSS
  ]
}

// Execution flow (RIGHT-TO-LEFT):

// 1. sass-loader
input: "body { color: $primary; }"
output: "body { color: #007bff; }"

// 2. css-loader
input: "body { color: #007bff; }"
output: {
  toString: () => "body { color: #007bff; }",
  locals: {},
  // CSS Module mappings if enabled
}

// 3. style-loader
input: CSS string
output: JavaScript code that injects CSS:
  var style = document.createElement('style');
  style.textContent = "body { color: #007bff; }";
  document.head.appendChild(style);

// Final bundle includes this JS code
```

**Loader Implementation Example:**

```javascript
// Custom loader: markdown-loader
// Converts .md files to HTML

module.exports = function(source) {
  // 'source' is the file content
  const marked = require('marked');

  // Transform markdown to HTML
  const html = marked(source);

  // Return JavaScript module
  return `module.exports = ${JSON.stringify(html)}`;
};

// Usage in webpack.config.js
{
  test: /\.md$/,
  use: './loaders/markdown-loader.js'
}

// Now you can import markdown:
import readme from './README.md';
console.log(readme); // HTML string
```

**Plugin Architecture:**

```javascript
// How plugins work

// Webpack plugin structure
class MyPlugin {
  apply(compiler) {
    // compiler provides hooks for entire compilation lifecycle

    // Hook 1: Before compilation starts
    compiler.hooks.beforeCompile.tap('MyPlugin', (params) => {
      console.log('Starting compilation...');
    });

    // Hook 2: After modules are optimized
    compiler.hooks.compilation.tap('MyPlugin', (compilation) => {
      // compilation provides hooks for module-level events

      compilation.hooks.optimizeChunkAssets.tapAsync(
        'MyPlugin',
        (chunks, callback) => {
          chunks.forEach(chunk => {
            chunk.files.forEach(file => {
              // Modify assets
              const asset = compilation.assets[file];
              console.log(`Processing: ${file}`);
            });
          });
          callback();
        }
      );
    });

    // Hook 3: Before emitting assets
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // Add custom asset
      compilation.assets['custom-file.txt'] = {
        source: () => 'Custom content',
        size: () => 14
      };
      callback();
    });

    // Hook 4: After build is done
    compiler.hooks.done.tap('MyPlugin', (stats) => {
      console.log('Build completed!');
      console.log(`Time: ${stats.endTime - stats.startTime}ms`);
    });
  }
}

// Usage
module.exports = {
  plugins: [new MyPlugin()]
};
```

**Real Plugin Example: Bundle Analyzer**

```javascript
// Custom BundleSizePlugin - Warns if bundle too large

class BundleSizePlugin {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 500 * 1024; // 500KB default
  }

  apply(compiler) {
    compiler.hooks.emit.tap('BundleSizePlugin', (compilation) => {
      const assets = compilation.assets;

      Object.keys(assets).forEach(filename => {
        const size = assets[filename].size();

        if (size > this.maxSize) {
          compilation.warnings.push(
            new Error(
              `Bundle ${filename} is ${(size / 1024).toFixed(2)}KB ` +
              `(max: ${(this.maxSize / 1024).toFixed(2)}KB)`
            )
          );
        }
      });
    });
  }
}

// Usage
module.exports = {
  plugins: [
    new BundleSizePlugin({
      maxSize: 300 * 1024 // 300KB limit
    })
  ]
};
```

**Code Splitting Internals:**

```javascript
// How Webpack implements code splitting

// 1. DYNAMIC IMPORT
// Input code:
button.addEventListener('click', async () => {
  const module = await import('./heavy-feature.js');
  module.init();
});

// Webpack transforms to:
button.addEventListener('click', async () => {
  const module = await __webpack_require__.e(/* chunk id */ 1)
    .then(__webpack_require__.bind(null, './heavy-feature.js'));
  module.init();
});

// 2. __webpack_require__.e IMPLEMENTATION
__webpack_require__.e = function(chunkId) {
  var promises = [];

  // Check if chunk is already loaded
  var installedChunkData = installedChunks[chunkId];
  if (installedChunkData !== 0) {
    // 0 means already installed

    if (installedChunkData) {
      // Chunk is loading, return existing promise
      promises.push(installedChunkData[2]);
    } else {
      // Start chunk loading
      var promise = new Promise((resolve, reject) => {
        installedChunkData = installedChunks[chunkId] = [resolve, reject];
      });

      promises.push(installedChunkData[2] = promise);

      // Create script tag
      var script = document.createElement('script');
      script.src = __webpack_require__.p + chunkId + '.chunk.js';

      // Handle load/error
      script.onerror = script.onload = (event) => {
        // ... cleanup code
      };

      document.head.appendChild(script);
    }
  }

  return Promise.all(promises);
};

// 3. CHUNK FILE STRUCTURE
// heavy-feature.1.chunk.js
(window['webpackJsonp'] = window['webpackJsonp'] || []).push([
  [1], // chunk id
  {
    './heavy-feature.js': function(module, exports, __webpack_require__) {
      module.exports = {
        init: function() {
          console.log('Heavy feature loaded!');
        }
      };
    }
  }
]);
```

**Tree Shaking Implementation:**

```javascript
// How Webpack eliminates dead code

// INPUT: library.js
export function used() {
  return 'I am used';
}

export function unused() {
  return 'I am never used';
}

// app.js
import { used } from './library';
console.log(used());

// WEBPACK ANALYSIS:
// 1. Mark phase (during module parsing)
//    - Marks 'used' as used
//    - 'unused' is NOT marked (never imported)

// 2. Sweep phase (during optimization)
//    - Removes unmarked exports

// OUTPUT: bundle.js (production mode)
function used() {
  return 'I am used';
}
console.log(used());
// 'unused' is completely removed!

// SIDE EFFECTS MATTER:
// package.json
{
  "sideEffects": false // Enables aggressive tree shaking
}

// Or specify files with side effects:
{
  "sideEffects": ["*.css", "*.scss"]
}
```

**Module Federation (Webpack 5):**

```javascript
// Advanced: Share code between separate Webpack builds

// App 1: Host (webpack.config.js)
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app2: 'app2@http://localhost:3002/remoteEntry.js'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};

// App 2: Remote (webpack.config.js)
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app2',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};

// Host app can now import from App 2:
import Button from 'app2/Button';

// This loads Button from separate Webpack build at runtime!
```

**Performance Optimization Techniques:**

```javascript
// 1. PERSISTENT CACHING (Webpack 5)
module.exports = {
  cache: {
    type: 'filesystem', // Cache to disk
    buildDependencies: {
      config: [__filename] // Rebuild cache when config changes
    }
  }
};

// First build: 45 seconds
// Subsequent builds (no changes): 2 seconds (22x faster!)

// 2. PARALLEL PROCESSING
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true, // Use multiple CPUs
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  }
};

// Single core: 30 seconds
// 4 cores parallel: 8 seconds (3.75x faster!)

// 3. LAZY COMPILATION (Webpack 5 dev server)
module.exports = {
  experiments: {
    lazyCompilation: true // Only compile imported modules
  }
};

// Before: Compiles entire app on start (60 seconds)
// After: Compiles only accessed routes (3 seconds initial)
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Debugging Slow Webpack Builds</strong></summary>

**Scenario**: Your company's React application has grown to 500+ components. Webpack builds that used to take 30 seconds now take 8+ minutes in development. Hot Module Replacement (HMR) takes 20-30 seconds per change. Developers are frustrated, productivity is down 40%, and the team is considering switching to Vite.

**Production Metrics (Before Fix):**
- Development build time: 8 minutes 15 seconds
- Production build time: 12 minutes 30 seconds
- HMR update time: 25-30 seconds
- Development server memory: 4.2GB
- CPU usage during build: 95-100%
- Developer complaints: 15/week
- Lost productivity: ~2 hours/developer/day
- Team morale: Low

**The Problem Code:**

```javascript
// ❌ CRITICAL ISSUES: webpack.config.js

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',

  entry: './src/index.tsx',

  // ISSUE 1: No caching configured
  // Every build starts from scratch

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            // ISSUE 2: No babel cache
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        // ISSUE 3: Processing all CSS every time
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource'
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
    // ISSUE 4: No build progress feedback
  ],

  // ISSUE 5: Source maps too detailed for development
  devtool: 'source-map', // Slowest option

  devServer: {
    port: 3000,
    hot: true
    // ISSUE 6: No lazy compilation
  }

  // ISSUE 7: No optimization configuration
};

// Build output:
// [webpack-cli] Compilation starting...
// (8 minutes pass with no feedback)
// [webpack-cli] Compiled successfully in 495320ms (8m 15s)
```

**Debugging Process:**

**Step 1: Identify Performance Bottlenecks**

```bash
# Use webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer

# Add to webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
};

# Build and check report
npm run build

# Findings:
# - Bundle size: 8.2MB (HUGE!)
# - Lodash: 500KB (entire library imported)
# - Moment.js: 600KB (includes all locales)
# - Duplicate dependencies: React imported 3 times
# - Source maps: 15MB
```

**Step 2: Profile Build with speed-measure-webpack-plugin**

```javascript
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  // ... your config
});

// Output:
// Speed Measure Plugin:
//
// babel-loader took 285 seconds (58%)
// css-loader took 95 seconds (19%)
// postcss-loader took 68 seconds (14%)
// mini-css-extract-plugin took 24 seconds (5%)
// html-webpack-plugin took 18 seconds (4%)
//
// Total build time: 495 seconds (8m 15s)

// Aha! Babel is the bottleneck (58% of time)
```

**Step 3: Enable Caching**

```javascript
// ✅ FIX 1: Enable Webpack filesystem cache (Webpack 5)

module.exports = {
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
    buildDependencies: {
      config: [__filename] // Invalidate cache on config change
    }
  },

  // ... rest of config
};

// Result:
// First build: 8m 15s (same as before)
// Second build: 12 seconds (41x faster!)
// Subsequent builds with small changes: 3-5 seconds
```

**Step 4: Optimize Babel**

```javascript
// ✅ FIX 2: Enable Babel caching

module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true, // ⭐ Enable cache
            cacheCompression: false, // Faster (no compression)
            presets: [
              ['@babel/preset-env', {
                modules: false, // Let Webpack handle modules
                targets: { browsers: 'last 2 versions' }
              }],
              ['@babel/preset-react', {
                runtime: 'automatic' // New JSX transform
              }],
              '@babel/preset-typescript'
            ]
          }
        }
      }
    ]
  }
};

// Result:
// babel-loader time: 285s → 45s (6.3x faster!)
```

**Step 5: Optimize Source Maps**

```javascript
// ✅ FIX 3: Use faster source map for development

module.exports = {
  devtool: 'eval-cheap-module-source-map', // Much faster

  // Source map comparison:
  // 'source-map':                 Slowest, best quality (8m)
  // 'eval-source-map':            Slow, good quality (5m)
  // 'cheap-module-source-map':    Medium, okay quality (2m)
  // 'eval-cheap-module-source-map': Fast, good enough (30s)
  // false:                        Fastest, no debugging (10s)
};

// Result:
// Build time: 495s → 380s (2.3x faster)
```

**Step 6: Lazy Compilation (Webpack 5)**

```javascript
// ✅ FIX 4: Enable lazy compilation

module.exports = {
  experiments: {
    lazyCompilation: {
      entries: false, // Don't lazy compile entry
      imports: true   // Lazy compile dynamic imports
    }
  },

  devServer: {
    port: 3000,
    hot: true,
    // Webpack 5 dev server automatically uses lazy compilation
  }
};

// Result:
// Initial dev server start: 8m → 45s (10.6x faster!)
// Only compiles routes when you visit them
```

**Step 7: Code Splitting**

```javascript
// ✅ FIX 5: Split vendor code

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: 'single'
  }
};

// Result:
// Main bundle: 8.2MB → 2.1MB
// Vendor bundle: 1.8MB (cached separately)
// HMR updates: 25s → 3s (8x faster!)
```

**Complete Optimized Configuration:**

```javascript
// ✅ PRODUCTION-READY webpack.config.js

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  const isProduction = argv.mode === 'production';

  return {
    mode: argv.mode,

    entry: './src/index.tsx',

    // ⭐ OPTIMIZATION 1: Filesystem cache
    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
      buildDependencies: {
        config: [__filename]
      }
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction
        ? 'js/[name].[contenthash:8].js'
        : 'js/[name].js',
      chunkFilename: isProduction
        ? 'js/[name].[contenthash:8].chunk.js'
        : 'js/[name].chunk.js',
      clean: true,
      publicPath: '/'
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },

    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              // ⭐ OPTIMIZATION 2: Babel cache
              cacheDirectory: true,
              cacheCompression: false,
              presets: [
                ['@babel/preset-env', {
                  modules: false,
                  useBuiltIns: 'usage',
                  corejs: 3
                }],
                ['@babel/preset-react', {
                  runtime: 'automatic'
                }],
                '@babel/preset-typescript'
              ],
              plugins: [
                isProduction && 'transform-remove-console'
              ].filter(Boolean)
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  localIdentName: isProduction
                    ? '[hash:base64:8]'
                    : '[path][name]__[local]'
                }
              }
            },
            'postcss-loader'
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024 // Inline < 10KB
            }
          }
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        minify: isProduction && {
          removeComments: true,
          collapseWhitespace: true
        }
      }),

      isProduction && new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:8].css'
      }),

      // ⭐ OPTIMIZATION 3: Build progress
      new webpack.ProgressPlugin({
        activeModules: true,
        modules: true,
        modulesCount: 5000,
        profile: false
      }),

      // Only in production
      isProduction && new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false
      })
    ].filter(Boolean),

    optimization: {
      // ⭐ OPTIMIZATION 4: Code splitting
      splitChunks: {
        chunks: 'all',
        maxSize: 244 * 1024, // 244KB chunks
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react-vendor',
            priority: 15
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: 'single',

      // ⭐ OPTIMIZATION 5: Parallel minification
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: true
            }
          }
        }),
        new CssMinimizerPlugin()
      ]
    },

    // ⭐ OPTIMIZATION 6: Faster source maps
    devtool: isDevelopment
      ? 'eval-cheap-module-source-map'
      : 'source-map',

    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      port: 3000,
      hot: true,
      historyApiFallback: true,
      compress: true,
      client: {
        overlay: {
          errors: true,
          warnings: false
        },
        progress: true
      }
    },

    // ⭐ OPTIMIZATION 7: Lazy compilation
    experiments: {
      lazyCompilation: isDevelopment && {
        entries: false,
        imports: true
      }
    },

    // Performance hints
    performance: {
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
      hints: isProduction ? 'warning' : false
    }
  };
};
```

**Production Metrics (After Fix):**

```javascript
// BEFORE:
// - Development build: 8m 15s
// - Production build: 12m 30s
// - HMR update: 25-30s
// - Memory usage: 4.2GB
// - Bundle size: 8.2MB

// AFTER:
// - Development first build: 45 seconds (10.6x faster!)
// - Development rebuild: 3-5 seconds (100x faster!)
// - Production build: 2 minutes (6.25x faster!)
// - HMR update: 2-3 seconds (10x faster!)
// - Memory usage: 1.8GB (57% reduction)
// - Bundle size: 2.1MB (74% reduction)

// ADDITIONAL BENEFITS:
// - Developer satisfaction: +95%
// - Productivity regained: ~2 hours/developer/day
// - Team stayed with Webpack (no migration needed)
// - CI/CD pipeline: 12m → 2m (faster deployments)
// - Cost savings: Reduced build server usage
```

**Key Lessons:**

```javascript
// ✅ ALWAYS enable caching
cache: { type: 'filesystem' }

// ✅ ALWAYS enable Babel cache
{ loader: 'babel-loader', options: { cacheDirectory: true } }

// ✅ Use appropriate source maps for environment
devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map'

// ✅ Enable lazy compilation in development
experiments: { lazyCompilation: true }

// ✅ Split vendor code
optimization: { splitChunks: { chunks: 'all' } }

// ✅ Profile builds to find bottlenecks
// Use speed-measure-webpack-plugin

// ✅ Analyze bundle size regularly
// Use webpack-bundle-analyzer

// ❌ NEVER disable cache to "fix" weird bugs
// ❌ NEVER use 'source-map' in development
// ❌ NEVER import entire libraries (import individual functions)
// ❌ NEVER skip build optimization
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Webpack Configuration Decisions</strong></summary>

**1. Source Map Trade-offs:**

| Type | Build Speed | Quality | Use Case |
|------|-------------|---------|----------|
| `eval` | Fastest | Poor | Quick dev iterations |
| `eval-cheap-source-map` | Very Fast | Okay | Development |
| `eval-cheap-module-source-map` | Fast | Good | Development (recommended) |
| `source-map` | Slowest | Best | Production debugging |
| `hidden-source-map` | Slow | Best (hidden) | Production (upload to error tracking) |

```javascript
// Development: Speed > Quality
devtool: 'eval-cheap-module-source-map' // ⚡ Fast builds, good enough debugging

// Production: Quality > Speed
devtool: 'source-map' // 📊 Best debugging, separate .map files
```

**2. Code Splitting Strategies:**

```javascript
// STRATEGY 1: Split by vendor
splitChunks: {
  cacheGroups: {
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendors'
    }
  }
}
// ✅ Pros: Vendor code cached separately (changes less often)
// ❌ Cons: Large vendor bundle if many dependencies

// STRATEGY 2: Split by package
splitChunks: {
  cacheGroups: {
    react: {
      test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
      name: 'react'
    },
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendor'
    }
  }
}
// ✅ Pros: Fine-grained caching, smaller chunks
// ❌ Cons: More HTTP requests (mitigated by HTTP/2)

// STRATEGY 3: Automatic splitting by size
splitChunks: {
  chunks: 'all',
  maxSize: 200 * 1024 // 200KB max per chunk
}
// ✅ Pros: Optimal chunk sizes automatically
// ❌ Cons: Less predictable chunk names
```

**3. Loader Performance:**

```javascript
// OPTION 1: babel-loader (flexible but slower)
{
  test: /\.tsx?$/,
  use: 'babel-loader'
}
// ✅ Pros: Highly configurable, plugin ecosystem
// ❌ Cons: Slower than alternatives

// OPTION 2: esbuild-loader (fast but limited)
{
  test: /\.tsx?$/,
  loader: 'esbuild-loader',
  options: {
    loader: 'tsx',
    target: 'es2015'
  }
}
// ✅ Pros: 10-20x faster than Babel
// ❌ Cons: Less plugin support, fewer transformations

// OPTION 3: swc-loader (fast and feature-rich)
{
  test: /\.tsx?$/,
  use: {
    loader: 'swc-loader',
    options: {
      jsc: {
        parser: { syntax: 'typescript', tsx: true },
        target: 'es2015'
      }
    }
  }
}
// ✅ Pros: 20x faster than Babel, growing ecosystem
// ❌ Cons: Newer, some plugins not available yet
```

**4. Cache Trade-offs:**

```javascript
// OPTION 1: No cache
cache: false
// ✅ Pros: Always fresh, no stale cache issues
// ❌ Cons: Slow builds every time

// OPTION 2: Memory cache
cache: { type: 'memory' }
// ✅ Pros: Fast, no disk I/O
// ❌ Cons: Lost on restart, high memory usage

// OPTION 3: Filesystem cache (recommended)
cache: { type: 'filesystem' }
// ✅ Pros: Persistent, massive speedup
// ❌ Cons: 500MB-1GB disk space, rare stale cache bugs
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Webpack Core Concepts</strong></summary>

**Simple Explanation:**

Think of Webpack as a **factory assembly line** for your code:

**Entry** = Starting point (raw materials enter)
```javascript
entry: './src/index.js'
// "Start building from this file"
```

**Loaders** = Machines that transform materials
```javascript
{
  test: /\.css$/,
  use: 'css-loader'
}
// "When you see .css files, use css-loader to process them"
// Like a machine that turns cotton → fabric
```

**Plugins** = Special tasks during assembly
```javascript
new HtmlWebpackPlugin()
// "Generate an HTML file with script tags"
// Like quality control or packaging at end of assembly line
```

**Output** = Final product (packaged and ready)
```javascript
output: {
  filename: 'bundle.js',
  path: './dist'
}
// "Put the final bundle in dist/bundle.js"
```

**Real-World Analogy:**

Imagine you're making a smoothie:

1. **Entry**: You start with fruits (index.js)
2. **Loaders**: Blender transforms fruits → liquid (CSS → JS modules)
3. **Plugins**: Add vitamins, pour into cup (optimize, generate HTML)
4. **Output**: Final smoothie in a cup (bundle.js in dist/)

**Why Do We Need Webpack?**

```javascript
// WITHOUT WEBPACK:
// You have 50 JavaScript files
<script src="utils.js"></script>
<script src="auth.js"></script>
<script src="api.js"></script>
<!-- ... 47 more scripts! -->
// ❌ 50 HTTP requests = SLOW
// ❌ Global namespace pollution
// ❌ Manual dependency management

// WITH WEBPACK:
<script src="bundle.js"></script>
// ✅ 1 HTTP request = FAST
// ✅ Modules properly scoped
// ✅ Automatic dependency resolution
```

**Interview Answer Template:**

"Webpack is a module bundler that takes all your project files (JavaScript, CSS, images) and bundles them into optimized files for the browser.

The four core concepts are:
1. **Entry** - Starting point for building dependency graph
2. **Output** - Where to put bundled files
3. **Loaders** - Transform non-JS files into modules
4. **Plugins** - Extend Webpack's capabilities

For example, when I use `import './styles.css'`, Webpack's css-loader processes the CSS file and includes it in the bundle. The HtmlWebpackPlugin then generates an HTML file that references the bundle."

</details>

### Resources

- [Webpack Official Docs](https://webpack.js.org/)
- [Webpack Configuration Guide](https://webpack.js.org/configuration/)

---
