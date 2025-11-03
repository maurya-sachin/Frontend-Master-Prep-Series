# Implement Event Emitter

## Problem Statement

Implement an Event Emitter class that allows subscribing to events, emitting events, and unsubscribing from events. Similar to Node.js EventEmitter or the observer pattern.

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 20-25 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Airbnb, Uber

## Requirements

- [ ] `on(event, callback)` - Subscribe to an event
- [ ] `emit(event, ...args)` - Trigger all callbacks for an event
- [ ] `off(event, callback)` - Unsubscribe from an event
- [ ] `once(event, callback)` - Subscribe to an event that fires only once
- [ ] Support multiple listeners for the same event
- [ ] Pass arguments to event callbacks
- [ ] Handle edge cases (unsubscribing non-existent listeners)

## Example Usage

```javascript
const emitter = new EventEmitter();

// Subscribe to events
emitter.on('userLogin', (user) => {
  console.log(`${user.name} logged in`);
});

emitter.on('userLogin', (user) => {
  console.log(`Welcome, ${user.name}!`);
});

// Emit event
emitter.emit('userLogin', { name: 'John', id: 123 });
// Output:
// John logged in
// Welcome, John!

// Once listener (fires only once)
emitter.once('appStart', () => {
  console.log('App started!');
});

emitter.emit('appStart'); // "App started!"
emitter.emit('appStart'); // (nothing - already fired)

// Unsubscribe
const handler = (data) => console.log(data);
emitter.on('dataReceived', handler);
emitter.emit('dataReceived', 'test'); // "test"
emitter.off('dataReceived', handler);
emitter.emit('dataReceived', 'test'); // (nothing - unsubscribed)

// Multiple arguments
emitter.on('calculate', (a, b, operation) => {
  console.log(`${a} ${operation} ${b} = ${a + b}`);
});

emitter.emit('calculate', 5, 10, '+'); // "5 + 10 = 15"
```

## Test Cases

```javascript
describe('EventEmitter', () => {
  test('should call listener when event is emitted', () => {
    const emitter = new EventEmitter();
    const listener = jest.fn();

    emitter.on('test', listener);
    emitter.emit('test');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('should pass arguments to listeners', () => {
    const emitter = new EventEmitter();
    const listener = jest.fn();

    emitter.on('test', listener);
    emitter.emit('test', 1, 2, 3);

    expect(listener).toHaveBeenCalledWith(1, 2, 3);
  });

  test('should support multiple listeners for same event', () => {
    const emitter = new EventEmitter();
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    emitter.on('test', listener1);
    emitter.on('test', listener2);
    emitter.emit('test');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  test('should unsubscribe listener with off()', () => {
    const emitter = new EventEmitter();
    const listener = jest.fn();

    emitter.on('test', listener);
    emitter.emit('test');
    emitter.off('test', listener);
    emitter.emit('test');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('should call once() listener only once', () => {
    const emitter = new EventEmitter();
    const listener = jest.fn();

    emitter.once('test', listener);
    emitter.emit('test');
    emitter.emit('test');
    emitter.emit('test');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('should handle unsubscribing non-existent listener', () => {
    const emitter = new EventEmitter();
    const listener = jest.fn();

    expect(() => {
      emitter.off('test', listener);
    }).not.toThrow();
  });

  test('should support event names as strings or symbols', () => {
    const emitter = new EventEmitter();
    const symbol = Symbol('test');
    const listener = jest.fn();

    emitter.on(symbol, listener);
    emitter.emit(symbol);

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
```

## Solution 1: Basic Implementation

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, ...args) {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(callback => {
        callback(...args);
      });
    }
  }

  off(event, callback) {
    const callbacks = this.events[event];
    if (callbacks) {
      this.events[event] = callbacks.filter(cb => cb !== callback);
    }
  }
}
```

**Time Complexity:**
- `on()`: O(1)
- `emit()`: O(n) where n is number of listeners
- `off()`: O(n) where n is number of listeners

**Space Complexity:** O(n) where n is total number of listeners

## Solution 2: With once() Support

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
    return this; // Enable chaining
  }

  once(event, callback) {
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(event, onceWrapper);
    };

    // Store reference to original callback for off()
    onceWrapper.originalCallback = callback;

    this.on(event, onceWrapper);
    return this;
  }

  emit(event, ...args) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      // Create copy to avoid issues if listeners modify array
      [...callbacks].forEach(callback => {
        callback(...args);
      });
    }
    return this;
  }

  off(event, callback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      this.events.set(
        event,
        callbacks.filter(cb =>
          cb !== callback && cb.originalCallback !== callback
        )
      );
    }
    return this;
  }

  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  listenerCount(event) {
    const callbacks = this.events.get(event);
    return callbacks ? callbacks.length : 0;
  }
}
```

## Solution 3: Production-Ready with Error Handling

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
    this.maxListeners = 10;
  }

  on(event, callback) {
    this._validateCallback(callback);

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event);

    // Warn if too many listeners (potential memory leak)
    if (listeners.length >= this.maxListeners) {
      console.warn(
        `Warning: Possible EventEmitter memory leak detected. ` +
        `${listeners.length + 1} ${event} listeners added. ` +
        `Use setMaxListeners() to increase limit.`
      );
    }

    listeners.push(callback);
    return this;
  }

  once(event, callback) {
    this._validateCallback(callback);

    const onceWrapper = (...args) => {
      try {
        callback(...args);
      } finally {
        this.off(event, onceWrapper);
      }
    };

    onceWrapper.originalCallback = callback;
    this.on(event, onceWrapper);
    return this;
  }

  emit(event, ...args) {
    const listeners = this.events.get(event);

    if (!listeners || listeners.length === 0) {
      return false;
    }

    // Create copy to safely iterate even if listeners modify the array
    const listenersCopy = [...listeners];

    for (const listener of listenersCopy) {
      try {
        listener(...args);
      } catch (error) {
        // Emit error event if error occurs in listener
        if (event !== 'error') {
          this.emit('error', error);
        } else {
          // If error occurs in error handler, throw it
          console.error('Error in error handler:', error);
        }
      }
    }

    return true;
  }

  off(event, callback) {
    this._validateCallback(callback);

    const listeners = this.events.get(event);

    if (!listeners) {
      return this;
    }

    this.events.set(
      event,
      listeners.filter(listener =>
        listener !== callback && listener.originalCallback !== callback
      )
    );

    return this;
  }

  removeAllListeners(event) {
    if (event !== undefined) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  listenerCount(event) {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }

  eventNames() {
    return Array.from(this.events.keys());
  }

  listeners(event) {
    const listeners = this.events.get(event);
    return listeners ? [...listeners] : [];
  }

  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) {
      throw new TypeError('n must be a non-negative number');
    }
    this.maxListeners = n;
    return this;
  }

  _validateCallback(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }
  }
}
```

## Solution 4: TypeScript Version

```typescript
type EventCallback<T = any> = (...args: T[]) => void;
type EventMap = Record<string | symbol, EventCallback[]>;

class EventEmitter<Events extends EventMap = EventMap> {
  private events: Map<keyof Events, EventCallback[]>;
  private maxListeners: number;

  constructor() {
    this.events = new Map();
    this.maxListeners = 10;
  }

  on<K extends keyof Events>(event: K, callback: Events[K]): this {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event)!;
    listeners.push(callback);

    return this;
  }

  once<K extends keyof Events>(event: K, callback: Events[K]): this {
    const onceWrapper = ((...args: any[]) => {
      callback(...args);
      this.off(event, onceWrapper as Events[K]);
    }) as Events[K];

    (onceWrapper as any).originalCallback = callback;
    this.on(event, onceWrapper);

    return this;
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): boolean {
    const listeners = this.events.get(event);

    if (!listeners || listeners.length === 0) {
      return false;
    }

    for (const listener of [...listeners]) {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${String(event)}:`, error);
      }
    }

    return true;
  }

  off<K extends keyof Events>(event: K, callback: Events[K]): this {
    const listeners = this.events.get(event);

    if (!listeners) {
      return this;
    }

    this.events.set(
      event,
      listeners.filter(listener =>
        listener !== callback &&
        (listener as any).originalCallback !== callback
      )
    );

    return this;
  }

  listenerCount<K extends keyof Events>(event: K): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }

  removeAllListeners<K extends keyof Events>(event?: K): this {
    if (event !== undefined) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }
}

// Usage with type safety
interface AppEvents {
  userLogin: (user: { id: number; name: string }) => void;
  dataReceived: (data: string) => void;
  error: (error: Error) => void;
}

const emitter = new EventEmitter<AppEvents>();

emitter.on('userLogin', (user) => {
  console.log(user.name); // Type-safe!
});

emitter.emit('userLogin', { id: 1, name: 'John' });
```

## Common Mistakes

❌ **Mistake 1:** Modifying listeners array while iterating
```javascript
emit(event, ...args) {
  const listeners = this.events[event];
  listeners.forEach(cb => cb(...args)); // Dangerous if callback calls off()
}
```

❌ **Mistake 2:** Not handling once() with off()
```javascript
// Won't work - can't unsubscribe once() listeners
once(event, callback) {
  const wrapper = () => {
    callback();
    this.off(event, callback); // Wrong! callback !== wrapper
  };
  this.on(event, wrapper);
}
```

❌ **Mistake 3:** Not validating inputs
```javascript
on(event, callback) {
  this.events[event].push(callback); // Crashes if callback is not a function
}
```

✅ **Correct:** Create copy of listeners, validate inputs, handle edge cases

## Real-World Applications

1. **Custom Event Bus**
```javascript
const eventBus = new EventEmitter();

// Component A
eventBus.on('userUpdated', (user) => {
  updateUI(user);
});

// Component B
function saveUser(user) {
  api.save(user).then(() => {
    eventBus.emit('userUpdated', user);
  });
}
```

2. **State Management**
```javascript
class Store extends EventEmitter {
  constructor() {
    super();
    this.state = {};
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.emit('change', this.state);
  }

  getState() {
    return this.state;
  }
}

const store = new Store();
store.on('change', (state) => console.log('State updated:', state));
```

3. **WebSocket Handler**
```javascript
class WebSocketClient extends EventEmitter {
  connect(url) {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => this.emit('connected');
    this.ws.onmessage = (msg) => this.emit('message', JSON.parse(msg.data));
    this.ws.onerror = (err) => this.emit('error', err);
    this.ws.onclose = () => this.emit('disconnected');
  }

  send(data) {
    this.ws.send(JSON.stringify(data));
  }
}

const client = new WebSocketClient();
client.on('message', (data) => console.log('Received:', data));
client.connect('ws://localhost:8080');
```

## Follow-up Questions

1. **How would you prevent memory leaks?**
   - Implement max listeners warning
   - Provide removeAllListeners()
   - Auto-cleanup with WeakMap for DOM elements

2. **How does this differ from DOM events?**
   - DOM events bubble/capture
   - preventDefault() and stopPropagation()
   - Event phases

3. **How would you add priority to listeners?**
   - Store listeners with priority numbers
   - Sort before emitting

4. **How would you implement async event handling?**
   ```javascript
   async emitAsync(event, ...args) {
     const listeners = this.events.get(event) || [];
     await Promise.all(listeners.map(cb => cb(...args)));
   }
   ```

## Performance Considerations

1. **Use Map instead of Object** for better performance with many events
2. **Copy listeners array** before iterating to handle modifications
3. **Limit listeners** to prevent memory leaks
4. **Consider WeakMap** for DOM element event handlers

## Resources

- [Node.js EventEmitter](https://nodejs.org/api/events.html)
- [Observer Pattern](https://refactoring.guru/design-patterns/observer)
- [MDN: EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)

---

[← Back to JavaScript Fundamentals](./README.md) | [Next Problem →](./curry-function.md)
