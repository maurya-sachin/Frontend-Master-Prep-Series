# Async Function with Retry Logic

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** All companies
**Time:** 25 minutes

---

## Problem Statement

Implement a retry wrapper for async functions that automatically retries failed operations with exponential backoff.

### Requirements

- ✅ Retry failed async operations
- ✅ Configurable retry count
- ✅ Exponential backoff delay
- ✅ Handle different error types
- ✅ Support timeout
- ✅ Return result or throw final error

---

## Solution

```javascript
async function retry(fn, options = {}) {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    timeout = 30000,
    onRetry = null,
    shouldRetry = () => true
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add timeout wrapper
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);

      return result;
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (!shouldRetry(error) || attempt === retries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const waitTime = delay * Math.pow(backoff, attempt);

      // Call retry callback
      if (onRetry) {
        onRetry(error, attempt + 1, waitTime);
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

// Usage
const fetchData = () => fetch('/api/data').then(r => r.json());

const result = await retry(fetchData, {
  retries: 3,
  delay: 1000,
  backoff: 2,
  onRetry: (error, attempt, delay) => {
    console.log(`Retry ${attempt} after ${delay}ms: ${error.message}`);
  }
});
```

---

## Advanced Implementation

```javascript
class RetryableOperation {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.retries = options.retries || 3;
    this.delay = options.delay || 1000;
    this.backoff = options.backoff || 2;
    this.timeout = options.timeout || 30000;
    this.maxDelay = options.maxDelay || 60000;
    this.shouldRetry = options.shouldRetry || this.defaultShouldRetry;
    this.onRetry = options.onRetry;
    this.onSuccess = options.onSuccess;
    this.onFailure = options.onFailure;

    this.attempts = 0;
    this.aborted = false;
  }

  defaultShouldRetry(error) {
    // Retry on network errors, 5xx, rate limits
    if (error.name === 'NetworkError') return true;
    if (error.status >= 500) return true;
    if (error.status === 429) return true; // Rate limit
    return false;
  }

  async execute(...args) {
    this.aborted = false;
    let lastError;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      if (this.aborted) {
        throw new Error('Operation aborted');
      }

      this.attempts = attempt + 1;

      try {
        const result = await this.executeWithTimeout(() => this.fn(...args));

        if (this.onSuccess) {
          this.onSuccess(result, this.attempts);
        }

        return result;
      } catch (error) {
        lastError = error;

        // Don't retry on last attempt or if shouldn't retry
        if (attempt === this.retries || !this.shouldRetry(error)) {
          if (this.onFailure) {
            this.onFailure(error, this.attempts);
          }
          throw error;
        }

        // Calculate delay with jitter
        const baseDelay = this.delay * Math.pow(this.backoff, attempt);
        const jitter = Math.random() * 0.3 * baseDelay; // ±30% jitter
        const waitTime = Math.min(baseDelay + jitter, this.maxDelay);

        if (this.onRetry) {
          this.onRetry(error, attempt + 1, waitTime);
        }

        await this.sleep(waitTime);
      }
    }

    throw lastError;
  }

  async executeWithTimeout(fn) {
    return Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Operation timeout')),
          this.timeout
        )
      )
    ]);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  abort() {
    this.aborted = true;
  }
}

// Usage
const operation = new RetryableOperation(
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      const error = new Error('Request failed');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },
  {
    retries: 5,
    delay: 1000,
    backoff: 2,
    maxDelay: 30000,
    timeout: 10000,
    shouldRetry: (error) => error.status >= 500,
    onRetry: (error, attempt, delay) => {
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
    },
    onSuccess: (result, attempts) => {
      console.log(`Success after ${attempts} attempts`);
    }
  }
);

try {
  const user = await operation.execute(123);
  console.log('User:', user);
} catch (error) {
  console.error('Failed after all retries:', error);
}
```

---

## Real-World Examples

### API Request with Retry

```javascript
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.retryConfig = {
      retries: 3,
      delay: 1000,
      backoff: 2
    };
  }

  async request(endpoint, options = {}) {
    const operation = new RetryableOperation(
      async () => {
        const response = await fetch(`${this.baseURL}${endpoint}`, options);

        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}`);
          error.status = response.status;
          error.response = response;
          throw error;
        }

        return response.json();
      },
      {
        ...this.retryConfig,
        shouldRetry: (error) => {
          // Retry on network errors and 5xx
          if (!error.status) return true;
          if (error.status >= 500) return true;
          if (error.status === 429) return true;
          return false;
        }
      }
    );

    return operation.execute();
  }

  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
}

// Usage
const api = new APIClient('https://api.example.com');
const users = await api.get('/users');
```

### Database Query with Retry

```javascript
async function queryWithRetry(db, query, params) {
  return retry(
    async () => {
      const connection = await db.getConnection();
      try {
        return await connection.query(query, params);
      } finally {
        connection.release();
      }
    },
    {
      retries: 5,
      delay: 2000,
      backoff: 1.5,
      shouldRetry: (error) => {
        // Retry on connection errors, deadlocks
        return error.code === 'ECONNRESET' ||
               error.code === 'PROTOCOL_CONNECTION_LOST' ||
               error.errno === 1213; // Deadlock
      },
      onRetry: (error, attempt) => {
        console.warn(`DB query retry ${attempt}: ${error.message}`);
      }
    }
  );
}
```

### File Upload with Progress

```javascript
async function uploadWithRetry(file, url) {
  let uploadedBytes = 0;

  return retry(
    async () => {
      const formData = new FormData();
      formData.append('file', file.slice(uploadedBytes));
      formData.append('offset', uploadedBytes);

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = new Error('Upload failed');
        error.status = response.status;
        throw error;
      }

      const result = await response.json();
      uploadedBytes = result.uploadedBytes;

      if (uploadedBytes < file.size) {
        throw new Error('Incomplete upload');
      }

      return result;
    },
    {
      retries: 10,
      delay: 2000,
      backoff: 1.5,
      shouldRetry: (error) => {
        return error.status >= 500 || error.message === 'Incomplete upload';
      },
      onRetry: (error, attempt) => {
        console.log(`Upload retry ${attempt}, resuming from ${uploadedBytes} bytes`);
      }
    }
  );
}
```

---

## Test Cases

```javascript
describe('retry', () => {
  test('succeeds on first try', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('retries on failure then succeeds', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');

    const result = await retry(fn, { retries: 3, delay: 10 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('throws after max retries', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));

    await expect(
      retry(fn, { retries: 2, delay: 10 })
    ).rejects.toThrow('fail');

    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  test('respects shouldRetry option', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('do not retry'));

    await expect(
      retry(fn, {
        retries: 3,
        shouldRetry: (error) => error.message !== 'do not retry'
      })
    ).rejects.toThrow('do not retry');

    expect(fn).toHaveBeenCalledTimes(1); // No retries
  });

  test('calls onRetry callback', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');

    const onRetry = jest.fn();

    await retry(fn, { retries: 2, delay: 10, onRetry });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(
      expect.any(Error),
      1,
      expect.any(Number)
    );
  });

  test('applies exponential backoff', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    const delays = [];

    const onRetry = jest.fn((_, __, delay) => {
      delays.push(delay);
    });

    await retry(fn, {
      retries: 3,
      delay: 100,
      backoff: 2,
      onRetry
    }).catch(() => {});

    expect(delays).toEqual([100, 200, 400]);
  });

  test('handles timeout', async () => {
    const fn = jest.fn(() => new Promise(() => {})); // Never resolves

    await expect(
      retry(fn, { timeout: 100 })
    ).rejects.toThrow('Timeout');
  });
});
```

---

## Common Mistakes

- ❌ Not handling timeout
- ❌ Retrying non-retryable errors (400, 401, 404)
- ❌ No maximum delay (exponential backoff without cap)
- ❌ Not adding jitter (thundering herd problem)
- ❌ Retrying forever without abort mechanism

✅ Set reasonable timeout
✅ Only retry transient failures (5xx, network errors)
✅ Cap maximum delay
✅ Add jitter to prevent synchronized retries
✅ Support abort/cancellation

---

[← Back to JavaScript Fundamentals](./README.md)
