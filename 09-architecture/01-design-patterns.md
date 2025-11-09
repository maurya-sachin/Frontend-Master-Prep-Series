# Frontend Design Patterns

> Singleton, Factory, Observer, Module patterns, and modern architectural patterns for frontend development.

---

## Question 1: Singleton Pattern in JavaScript

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon

### Question
What is the Singleton pattern? How do you implement it in JavaScript?

### Answer

**Singleton** ensures a class has only one instance and provides global access to it.

### Code Example

```javascript
// ES6 Class Singleton
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.data = [];
    Database.instance = this;
  }

  query(sql) {
    console.log(`Executing: ${sql}`);
    return this.data;
  }
}

// Usage
const db1 = new Database();
const db2 = new Database();

console.log(db1 === db2); // true (same instance)

// Module Singleton
const ConfigManager = (() => {
  let instance;

  function createInstance() {
    return {
      apiUrl: 'https://api.example.com',
      timeout: 5000,
      getConfig() {
        return { apiUrl: this.apiUrl, timeout: this.timeout };
      }
    };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

const config1 = ConfigManager.getInstance();
const config2 = ConfigManager.getInstance();

console.log(config1 === config2); // true
```

**Modern Singleton (ES6 Module):**

```javascript
// config.js
class Config {
  constructor() {
    this.settings = {};
  }

  set(key, value) {
    this.settings[key] = value;
  }

  get(key) {
    return this.settings[key];
  }
}

// Export single instance
export default new Config();

// app.js
import config from './config.js';

config.set('apiUrl', 'https://api.example.com');

// anotherFile.js
import config from './config.js';

console.log(config.get('apiUrl')); // Same instance
```

### Resources
- [JavaScript Design Patterns](https://www.patterns.dev/posts/classic-design-patterns/)

---

*[File continues with Factory, Observer, Module patterns, etc.]*

