# Promises - Error Handling Strategies

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 1: What are common async error handling strategies?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
How do you handle errors in async code? Explain different strategies for error handling, retry logic, and graceful degradation.

### Answer

**Async error handling** requires careful consideration to prevent unhandled rejections, provide user feedback, and maintain application stability.

**Key Strategies:**

1. **Try-Catch with Async/Await** - Wrap async operations in try-catch blocks
2. **Promise .catch()** - Handle rejections in promise chains
3. **Error Boundaries** - Catch errors at component level (React)
4. **Retry Logic** - Automatically retry failed operations with backoff
5. **Graceful Degradation** - Continue with partial data when some operations fail

### Code Example

```javascript
// ============================================
// 1. BASIC TRY-CATCH
// ============================================

async function fetchUser(id) {
  try {
    const response = await fetch(`/api/user/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error; // Re-throw or handle
  }
}


// ============================================
// 2. RETRY WITH EXPONENTIAL BACKOFF
// ============================================

async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    onRetry = () => {}
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        onRetry(attempt, waitTime, error);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw new Error(`Failed after ${maxAttempts} attempts: ${lastError.message}`);
}

// Usage
const data = await retry(
  () => fetch('/api/data').then(r => r.json()),
  {
    maxAttempts: 5,
    delay: 1000,
    backoff: 2,
    onRetry: (attempt, wait) => {
      console.log(`Retry ${attempt} after ${wait}ms`);
    }
  }
);


// ============================================
// 3. CIRCUIT BREAKER PATTERN
// ============================================

class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      console.warn('Circuit breaker opened!');
    }
  }
}

// Usage
const breaker = new CircuitBreaker(5, 60000);

try {
  const data = await breaker.execute(() =>
    fetch('/api/data').then(r => r.json())
  );
} catch (error) {
  console.error('Request failed or circuit open:', error);
}


// ============================================
// 4. GRACEFUL DEGRADATION
// ============================================

async function loadDashboard(userId) {
  const results = await Promise.allSettled([
    fetchUserProfile(userId),
    fetchUserPosts(userId),
    fetchRecommendations(userId),
    fetchNotifications(userId)
  ]);

  const [profile, posts, recommendations, notifications] = results;

  // Critical data - must succeed
  if (profile.status === 'rejected') {
    throw new Error('Cannot load dashboard without user profile');
  }

  // Build dashboard with available data
  return {
    user: profile.value,
    posts: posts.status === 'fulfilled' ? posts.value : [],
    recommendations: recommendations.status === 'fulfilled' ? recommendations.value : [],
    notifications: notifications.status === 'fulfilled' ? notifications.value : [],
    errors: results
      .filter(r => r.status === 'rejected')
      .map(r => r.reason.message)
  };
}


// ============================================
// 5. GLOBAL ERROR HANDLER
// ============================================

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // Report to error tracking service
  reportError(event.reason);

  // Prevent default browser behavior
  event.preventDefault();
});

// Catch global errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  reportError(event.error);
});


// ============================================
// 6. TIMEOUT WITH ERROR
// ============================================

async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}


// ============================================
// 7. ERROR AGGREGATION
// ============================================

async function fetchMultiple(urls) {
  const results = await Promise.allSettled(
    urls.map(url => fetch(url).then(r => r.json()))
  );

  const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  const failed = results.filter(r => r.status === 'rejected').map(r => ({
    url: urls[results.indexOf(r)],
    error: r.reason.message
  }));

  if (failed.length > 0) {
    console.warn(`${failed.length} requests failed:`, failed);
  }

  if (successful.length === 0) {
    throw new Error('All requests failed');
  }

  return { data: successful, errors: failed };
}
```

### Common Mistakes

- ❌ **Mistake:** Not handling errors in async functions
  ```javascript
  // ❌ Unhandled error!
  async function loadData() {
    const data = await fetch('/api/data').then(r => r.json());
    return data; // What if fetch fails?
  }

  // ✅ Always wrap in try-catch
  async function loadData() {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Load failed:', error);
      throw error;
    }
  }
  ```

- ❌ **Mistake:** Swallowing errors silently
  ```javascript
  // ❌ Silent failure!
  try {
    await fetchData();
  } catch (error) {
    // Do nothing - user never knows it failed
  }

  // ✅ At minimum, log the error
  try {
    await fetchData();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    showErrorToUser('Unable to load data');
  }
  ```

<details>
<summary><strong>🔍 Deep Dive: Unhandled Rejection Tracking in V8</strong></summary>

**How V8 Tracks Unhandled Rejections:**

```javascript
// When a promise rejects without a .catch() handler

const promise = fetch('/api/data')
  .then(r => r.json());
// No .catch()! What happens?

// V8 internal tracking:
// 1. Promise transitions to rejected state
// 2. Check: Does promise have rejection handler? (has_handler_ flag)
// 3. If no → Add to unhandled_rejections_ list
// 4. Schedule microtask checkpoint
// 5. At checkpoint: Trigger 'unhandledrejection' event

// PromiseRejectEvent structure in V8:
interface PromiseRejectionEvent {
  promise: Promise<any>;      // The rejected promise
  reason: any;                // The rejection reason (error)
  type: 'unhandledrejection'; // Event type
}
```

**Node.js vs Browser Handling:**

```javascript
// BROWSER: Warning in console
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  event.preventDefault(); // Prevent default logging
});

Promise.reject(new Error('Test error'));
// Output: Unhandled rejection: Error: Test error

// NODE.JS: Can crash the process
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optional: process.exit(1)
});

// Node.js flags:
// --unhandled-rejections=strict  → Crash immediately (default in v15+)
// --unhandled-rejections=warn    → Log warning only
// --unhandled-rejections=none    → Ignore (not recommended)
```

**V8 Promise Rejection Tracking Algorithm:**

```cpp
// Simplified V8 internal implementation

class Isolate {
  std::vector<Promise*> unhandled_rejections_;

  void OnPromiseReject(Promise* promise) {
    if (!promise->has_handler()) {
      // No rejection handler attached
      unhandled_rejections_.push_back(promise);

      // Schedule microtask to trigger event
      EnqueueMicrotask([this, promise]() {
        if (!promise->has_handler()) {
          // Still no handler after microtask checkpoint
          TriggerUnhandledRejectionEvent(promise);
        }
      });
    }
  }

  void OnPromiseHandlerAdded(Promise* promise) {
    // Remove from unhandled list if present
    auto it = std::find(unhandled_rejections_.begin(),
                        unhandled_rejections_.end(),
                        promise);
    if (it != unhandled_rejections_.end()) {
      unhandled_rejections_.erase(it);
      TriggerRejectionHandledEvent(promise);
    }
  }
};
```

**Error Propagation Through Promise Chains:**

```javascript
// How errors bubble through promise chains

fetch('/api/user/1')
  .then(r => r.json())        // Step 1
  .then(user => {
    console.log(user.name);    // Step 2
    return fetch(`/api/posts/${user.id}`);
  })
  .then(r => r.json())        // Step 3
  .then(posts => {
    console.log(posts);        // Step 4
  })
  .catch(error => {
    console.error('Error:', error); // Catches errors from ANY step
  });

// Error flow in V8:
// 1. Step 1 throws → Skip to .catch()
// 2. Step 2 throws → Skip to .catch()
// 3. Step 3 throws → Skip to .catch()
// 4. Step 4 throws → Skip to .catch()

// Internal mechanism:
// Each .then() creates a new promise
// If previous promise rejects, skip .then() callback
// Jump directly to next .catch() in chain
```

**Try-Catch vs .catch() Performance:**

```javascript
// Benchmark: 1 million error handles

// Pattern 1: try-catch with async/await
async function withTryCatch() {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    return handleError(error);
  }
}

// Pattern 2: .catch() chaining
function withCatch() {
  return fetchData()
    .then(data => data)
    .catch(error => handleError(error));
}

// Performance results (V8 optimized):
// try-catch:    ~0.02ms per call (faster)
// .catch():     ~0.03ms per call (50% slower)

// Why try-catch is faster?
// 1. V8 can optimize try-catch blocks with TurboFan
// 2. .catch() creates additional promise wrappers
// 3. try-catch uses native exception handling (C++ level)
// 4. .catch() goes through JavaScript microtask queue

// However: Difference is negligible in real apps
// Choose based on code readability, not performance
```

**Circuit Breaker State Machine:**

```javascript
// V8 doesn't have built-in circuit breaker
// But understanding state transitions is key

class CircuitBreaker {
  constructor() {
    this.state = 'CLOSED';  // States: CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.threshold = 5;
    this.timeout = 60000;
    this.nextAttempt = Date.now();
  }

  // State transition diagram:
  //
  //     CLOSED ──[failures >= threshold]──> OPEN
  //        ↑                                  │
  //        │                [timeout expires]  │
  //        │                                  ↓
  //        └────[success]───── HALF_OPEN <────┘
  //
  //     HALF_OPEN ──[failure]──> OPEN
  //

  async call(fn) {
    switch (this.state) {
      case 'CLOSED':
        try {
          const result = await fn();
          this.failures = 0;
          return result;
        } catch (error) {
          this.failures++;
          if (this.failures >= this.threshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.timeout;
            console.error('Circuit breaker OPENED');
          }
          throw error;
        }

      case 'OPEN':
        if (Date.now() < this.nextAttempt) {
          throw new Error('Circuit breaker is OPEN');
        }
        this.state = 'HALF_OPEN';
        // Fall through to HALF_OPEN

      case 'HALF_OPEN':
        try {
          const result = await fn();
          this.state = 'CLOSED';
          this.failures = 0;
          console.log('Circuit breaker CLOSED');
          return result;
        } catch (error) {
          this.state = 'OPEN';
          this.nextAttempt = Date.now() + this.timeout;
          console.error('Circuit breaker re-OPENED');
          throw error;
        }
    }
  }
}
```

**Memory Leak from Unhandled Rejections:**

```javascript
// Unhandled rejections can cause memory leaks

// ❌ LEAK: Creating promises without handlers
setInterval(() => {
  fetch('/api/data')
    .then(r => r.json())
    .then(data => {
      if (!data.valid) {
        throw new Error('Invalid data');
      }
      processData(data);
    });
  // No .catch()! Unhandled rejections accumulate
}, 1000);

// After 1 hour:
// - 3,600 unhandled rejections
// - V8 keeps reference to each promise
// - Memory usage: ~50MB (should be ~1MB)
// - Eventually: Out of memory

// ✅ FIX: Always add .catch()
setInterval(() => {
  fetch('/api/data')
    .then(r => r.json())
    .then(data => {
      if (!data.valid) {
        throw new Error('Invalid data');
      }
      processData(data);
    })
    .catch(error => {
      console.error('Data fetch failed:', error);
      // Error handled, promise can be GC'd
    });
}, 1000);

// After 1 hour:
// - 0 unhandled rejections
// - Memory usage: ~1MB (healthy)
```

**Advanced: Error Context Preservation:**

```javascript
// V8 preserves stack traces through async boundaries

async function level3() {
  throw new Error('Something failed');
}

async function level2() {
  await level3(); // Error originates here
}

async function level1() {
  await level2(); // Error propagates through here
}

try {
  await level1();
} catch (error) {
  console.error(error.stack);
  // Output:
  // Error: Something failed
  //     at level3 (file.js:2:9)
  //     at level2 (file.js:6:9)
  //     at level1 (file.js:10:9)
  //     at <anonymous> (file.js:14:9)

  // V8 uses async stack traces (added in V8 6.3)
  // Internally: Maintains AsyncStackTrace linked list
}
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Silent Failure in Payment System</strong></summary>

**Scenario:** Your payment processing system is silently failing. Users report "payment successful" messages, but charges never appear in the database. Audit logs show 8% of payments are lost.

**The Problem:**

```javascript
// ❌ SILENT FAILURE: Errors swallowed
class PaymentService {
  async processPayment(userId, amount, paymentMethod) {
    // Step 1: Charge the card
    const charge = await this.chargeCard(paymentMethod, amount)
      .catch(error => {
        console.log('Card charge failed:', error);
        // ⚠️ SWALLOWED! No throw, no return
      });

    // Step 2: Save to database (charge might be undefined!)
    const payment = await this.savePayment({
      userId,
      amount,
      chargeId: charge.id, // ❌ charge is undefined if step 1 failed!
      status: 'completed'
    }).catch(error => {
      console.log('Database save failed:', error);
      // ⚠️ SWALLOWED AGAIN! Payment charged but not recorded
    });

    // Step 3: Send confirmation email
    await this.sendConfirmationEmail(userId, amount)
      .catch(error => {
        console.log('Email failed:', error);
        // ⚠️ SWALLOWED! User doesn't know payment succeeded
      });

    // Always returns undefined (implicit return)
    // UI shows "success" even if everything failed!
  }
}

// Production metrics (30-day period):
// - Total payment attempts: 10,000
// - Payments shown as "successful" to users: 10,000 (100%)
// - Actual charges in Stripe: 9,500 (95%)
// - Payments recorded in DB: 9,200 (92%)
// - Confirmation emails sent: 8,900 (89%)
// - Revenue discrepancy: $45,000 (charged but not recorded)
// - User complaints: "Charged but no confirmation" (+500 support tickets)
```

**Debugging the Silent Failure:**

```javascript
// Step 1: Add detailed logging with error propagation
class PaymentService {
  async processPayment(userId, amount, paymentMethod) {
    console.log('[Payment] Starting payment processing', {
      userId,
      amount,
      timestamp: new Date().toISOString()
    });

    let charge;
    try {
      charge = await this.chargeCard(paymentMethod, amount);
      console.log('[Payment] Card charged successfully', { chargeId: charge.id });
    } catch (error) {
      console.error('[Payment] Card charge FAILED:', error);
      // DON'T SWALLOW! Re-throw
      throw new Error(`Card charge failed: ${error.message}`);
    }

    let payment;
    try {
      payment = await this.savePayment({
        userId,
        amount,
        chargeId: charge.id,
        status: 'completed'
      });
      console.log('[Payment] Payment saved to DB', { paymentId: payment.id });
    } catch (error) {
      console.error('[Payment] Database save FAILED:', error);
      // CRITICAL: Card was charged but not recorded!
      // Need to refund or retry save
      await this.handleDatabaseFailure(charge.id, error);
      throw new Error(`Payment recorded but database failed: ${error.message}`);
    }

    try {
      await this.sendConfirmationEmail(userId, amount);
      console.log('[Payment] Confirmation email sent');
    } catch (error) {
      console.error('[Payment] Email FAILED:', error);
      // Email is non-critical, but log for follow-up
      // Don't throw - payment already succeeded
    }

    return payment;
  }
}

// Logs reveal the issue:
// [Payment] Card charge FAILED: Card declined
// [Payment] Database save FAILED: chargeId is undefined
// → 5% card charges fail (expected)
// → 8% database saves fail (charge.id is undefined from failed step 1)
```

**Solution 1: Proper Error Propagation**

```javascript
// ✅ FIX: Don't swallow errors, propagate them
class PaymentService {
  async processPayment(userId, amount, paymentMethod) {
    let charge, payment;

    // CRITICAL STEP 1: Charge card (must succeed)
    try {
      charge = await this.chargeCard(paymentMethod, amount);
    } catch (error) {
      throw new PaymentError('CHARGE_FAILED', {
        message: 'Failed to charge payment method',
        originalError: error,
        userId,
        amount
      });
    }

    // CRITICAL STEP 2: Save to database (must succeed)
    try {
      payment = await this.savePayment({
        userId,
        amount,
        chargeId: charge.id,
        status: 'completed'
      });
    } catch (error) {
      // Card charged but database failed - CRITICAL!
      // Attempt refund
      console.error('[Payment] DB save failed, attempting refund');

      try {
        await this.refundCharge(charge.id);
        throw new PaymentError('DB_SAVE_FAILED_REFUNDED', {
          message: 'Payment database save failed, charge refunded',
          originalError: error,
          chargeId: charge.id
        });
      } catch (refundError) {
        // WORST CASE: Charge succeeded, DB failed, refund failed
        // Need manual intervention
        await this.alertOps({
          severity: 'CRITICAL',
          message: 'Payment charged but not recorded, refund failed',
          data: { charge, error, refundError }
        });

        throw new PaymentError('DB_SAVE_FAILED_REFUND_FAILED', {
          message: 'Payment system error, support team notified',
          chargeId: charge.id
        });
      }
    }

    // OPTIONAL STEP 3: Send email (can fail gracefully)
    try {
      await this.sendConfirmationEmail(userId, amount);
    } catch (error) {
      // Log but don't throw - payment already succeeded
      console.error('[Payment] Email failed (non-critical):', error);
      // Queue for retry
      await this.queueEmailRetry(userId, payment.id);
    }

    return {
      success: true,
      payment,
      charge
    };
  }
}

// Custom error class for better error handling
class PaymentError extends Error {
  constructor(code, details) {
    super(details.message);
    this.name = 'PaymentError';
    this.code = code;
    this.details = details;
  }
}

// Usage:
try {
  const result = await paymentService.processPayment(userId, amount, paymentMethod);
  showSuccessMessage('Payment successful!');
} catch (error) {
  if (error instanceof PaymentError) {
    switch (error.code) {
      case 'CHARGE_FAILED':
        showErrorMessage('Payment method declined. Please try a different card.');
        break;
      case 'DB_SAVE_FAILED_REFUNDED':
        showErrorMessage('Payment failed, no charge was made. Please try again.');
        break;
      case 'DB_SAVE_FAILED_REFUND_FAILED':
        showErrorMessage('Payment error. Our support team has been notified and will contact you.');
        break;
      default:
        showErrorMessage('Payment failed. Please try again or contact support.');
    }
  }
}

// After fix:
// - Payment accuracy: 100% (from 92%)
// - Revenue discrepancy: $0 (from $45,000)
// - Failed charges properly refunded: 100%
// - Support tickets: -450 (90% reduction)
```

**Solution 2: Transaction Pattern with Rollback**

```javascript
// ✅ BETTER: Implement transaction-like pattern
class PaymentService {
  async processPayment(userId, amount, paymentMethod) {
    const transaction = new PaymentTransaction();

    try {
      // Step 1: Charge card
      const charge = await this.chargeCard(paymentMethod, amount);
      transaction.addStep('charge', charge, async () => {
        await this.refundCharge(charge.id);
      });

      // Step 2: Save to database
      const payment = await this.savePayment({
        userId,
        amount,
        chargeId: charge.id,
        status: 'completed'
      });
      transaction.addStep('payment', payment, async () => {
        await this.deletePayment(payment.id);
      });

      // Step 3: Update inventory
      const inventory = await this.updateInventory(userId, payment.items);
      transaction.addStep('inventory', inventory, async () => {
        await this.restoreInventory(inventory.id);
      });

      // All critical steps succeeded
      transaction.commit();

      // Non-critical: Send email (outside transaction)
      this.sendConfirmationEmail(userId, amount).catch(error => {
        console.error('Email failed (non-critical):', error);
      });

      return {
        success: true,
        payment,
        charge
      };

    } catch (error) {
      // Rollback all completed steps
      console.error('[Payment] Transaction failed, rolling back:', error);
      await transaction.rollback();
      throw error;
    }
  }
}

// Transaction manager
class PaymentTransaction {
  constructor() {
    this.steps = [];
    this.committed = false;
  }

  addStep(name, data, rollbackFn) {
    this.steps.push({ name, data, rollbackFn });
  }

  async rollback() {
    // Rollback in reverse order
    for (let i = this.steps.length - 1; i >= 0; i--) {
      const step = this.steps[i];
      try {
        console.log(`[Transaction] Rolling back step: ${step.name}`);
        await step.rollbackFn();
      } catch (error) {
        console.error(`[Transaction] Rollback failed for ${step.name}:`, error);
        // Continue rolling back other steps
      }
    }
  }

  commit() {
    this.committed = true;
    this.steps = [];
  }
}
```

**Solution 3: Saga Pattern for Distributed Transactions**

```javascript
// ✅ BEST: Saga pattern for complex multi-service payments
class PaymentSaga {
  constructor() {
    this.steps = [];
    this.completedSteps = [];
  }

  addStep(name, action, compensation) {
    this.steps.push({ name, action, compensation });
  }

  async execute() {
    for (const step of this.steps) {
      try {
        console.log(`[Saga] Executing: ${step.name}`);
        const result = await step.action();
        this.completedSteps.push({ ...step, result });
      } catch (error) {
        console.error(`[Saga] Step failed: ${step.name}`, error);
        await this.compensate();
        throw new Error(`Saga failed at ${step.name}: ${error.message}`);
      }
    }
    return this.completedSteps.map(s => s.result);
  }

  async compensate() {
    console.log('[Saga] Starting compensation');

    // Compensate in reverse order
    for (let i = this.completedSteps.length - 1; i >= 0; i--) {
      const step = this.completedSteps[i];
      try {
        console.log(`[Saga] Compensating: ${step.name}`);
        await step.compensation(step.result);
      } catch (error) {
        console.error(`[Saga] Compensation failed for ${step.name}:`, error);
        // Log for manual intervention but continue
      }
    }
  }
}

// Usage:
class PaymentService {
  async processPayment(userId, amount, paymentMethod) {
    const saga = new PaymentSaga();

    // Define saga steps
    saga.addStep(
      'charge',
      () => this.chargeCard(paymentMethod, amount),
      (charge) => this.refundCharge(charge.id)
    );

    saga.addStep(
      'savePayment',
      () => this.savePayment({ userId, amount, chargeId: saga.completedSteps[0].result.id }),
      (payment) => this.deletePayment(payment.id)
    );

    saga.addStep(
      'updateInventory',
      () => this.updateInventory(userId),
      (inventory) => this.restoreInventory(inventory.id)
    );

    saga.addStep(
      'notifyWarehouse',
      () => this.notifyWarehouse(userId),
      () => this.cancelWarehouseNotification(userId)
    );

    try {
      const [charge, payment, inventory, notification] = await saga.execute();

      // Send email outside saga (non-critical)
      this.sendConfirmationEmail(userId, amount);

      return { success: true, payment, charge };
    } catch (error) {
      // Saga automatically compensated
      throw new PaymentError('PAYMENT_FAILED', {
        message: 'Payment processing failed, all changes have been reversed',
        originalError: error
      });
    }
  }
}
```

**Metrics After Implementing Solutions:**

| Metric | Before | After (Sol 1) | After (Sol 2) | After (Sol 3) |
|--------|--------|---------------|---------------|---------------|
| Payment accuracy | 92% | 99.9% | 99.95% | 99.99% |
| Revenue discrepancy | $45,000/mo | $500/mo | $200/mo | $50/mo |
| Failed refunds | 200/mo | 5/mo | 2/mo | 0/mo |
| Support tickets | 500/mo | 50/mo | 20/mo | 5/mo |
| Manual interventions | 50/mo | 5/mo | 2/mo | 0/mo |

</details>

<details>
<summary><strong>⚖️ Trade-offs: Error Handling Strategies</strong></summary>

**1. Try-Catch vs .catch() Chaining**

```javascript
// Pattern 1: try-catch with async/await (procedural)
async function loadUserData(userId) {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts.map(p => p.id));
    return { user, posts, comments };
  } catch (error) {
    console.error('Load failed:', error);
    throw error;
  }
}

// Pattern 2: .catch() chaining (functional)
function loadUserData(userId) {
  return fetchUser(userId)
    .then(user =>
      fetchPosts(user.id)
        .then(posts =>
          fetchComments(posts.map(p => p.id))
            .then(comments => ({ user, posts, comments }))
        )
    )
    .catch(error => {
      console.error('Load failed:', error);
      throw error;
    });
}

// Pattern 3: Flat promise chain (best of both)
function loadUserData(userId) {
  let user;
  return fetchUser(userId)
    .then(u => {
      user = u;
      return fetchPosts(user.id);
    })
    .then(posts => {
      return fetchComments(posts.map(p => p.id))
        .then(comments => ({ user, posts, comments }));
    })
    .catch(error => {
      console.error('Load failed:', error);
      throw error;
    });
}
```

**Comparison:**

| Aspect | try-catch | .catch() | Flat chain |
|--------|-----------|----------|------------|
| **Readability** | ✅ Excellent | ❌ Poor (nesting) | ✅ Good |
| **Debugging** | ✅ Clear stack traces | ❌ Harder to debug | ✅ Clear |
| **Error granularity** | ✅ Per-operation | ❌ Single handler | ❌ Single handler |
| **Performance** | ✅ Slightly faster | ❌ Slower | ❌ Slower |
| **Code length** | ✅ Shorter | ❌ Longer | ⚠️ Medium |

**2. Fail-Fast vs Fail-Safe Strategies**

```javascript
// Fail-Fast: Stop on first error (default)
async function loadPageDataFailFast() {
  const user = await fetchUser(); // Throws on error
  const posts = await fetchPosts(); // Never runs if user fails
  return { user, posts };
}
// ✅ Simple, clear failure mode
// ✅ Fast failure (no wasted work)
// ❌ No partial data
// Use when: All data is critical

// Fail-Safe: Continue on errors, return partial data
async function loadPageDataFailSafe() {
  const results = await Promise.allSettled([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);

  return {
    user: results[0].status === 'fulfilled' ? results[0].value : null,
    posts: results[1].status === 'fulfilled' ? results[1].value : [],
    comments: results[2].status === 'fulfilled' ? results[2].value : [],
    errors: results.filter(r => r.status === 'rejected').map(r => r.reason)
  };
}
// ✅ Partial data available
// ✅ User sees something (better UX)
// ❌ More complex error handling
// Use when: Partial data is useful
```

**3. Retry Strategies Comparison**

```javascript
// Strategy 1: Fixed delay retry
async function retryFixed(fn, maxAttempts = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await sleep(delay); // Always wait 1s
    }
  }
}
// ✅ Simple
// ✅ Predictable
// ❌ May overwhelm recovering service
// ❌ No adaptation to server load

// Strategy 2: Exponential backoff
async function retryExponential(fn, maxAttempts = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay); // 1s, 2s, 4s, 8s...
    }
  }
}
// ✅ Gives service time to recover
// ✅ Reduces load during recovery
// ❌ Slower for transient failures
// ✅ Industry standard

// Strategy 3: Exponential backoff with jitter
async function retryWithJitter(fn, maxAttempts = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const exponential = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * exponential;
      await sleep(jitter); // Randomized delay
    }
  }
}
// ✅ Prevents thundering herd
// ✅ Distributes load
// ✅ Best for distributed systems
// ❌ Most complex
```

**Retry Strategy Comparison:**

| Strategy | Delay Pattern | Thundering Herd | Recovery Time | Use Case |
|----------|---------------|-----------------|---------------|----------|
| **Fixed** | 1s, 1s, 1s | ❌ High risk | Fast | Single client |
| **Exponential** | 1s, 2s, 4s | ⚠️ Medium risk | Medium | Multiple clients |
| **Jitter** | Random(1s), Random(2s), Random(4s) | ✅ Low risk | Medium | Many clients |

**4. Circuit Breaker vs Simple Retry**

```javascript
// Simple Retry: Always try, waste resources
async function withSimpleRetry(fn) {
  for (let i = 0; i < 3; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === 2) throw error;
      await sleep(1000);
    }
  }
}
// Service is down → Every request retries 3x
// 100 requests = 300 total attempts (overload!)

// Circuit Breaker: Fail fast when service is down
class CircuitBreaker {
  async call(fn) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit open');
    }
    try {
      return await fn();
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
}
// Service is down → Circuit opens
// 100 requests = 5 attempts (until circuit opens)
// → Saves 295 attempts, server recovers faster
```

**When to Use Each:**

| Situation | Use Retry | Use Circuit Breaker |
|-----------|-----------|---------------------|
| Transient network errors | ✅ Yes | ❌ No (overkill) |
| Service degradation | ⚠️ Maybe | ✅ Yes |
| Service completely down | ❌ No (wasteful) | ✅ Yes |
| Single client | ✅ Yes | ⚠️ Maybe |
| Many clients | ⚠️ Maybe | ✅ Yes |

**5. Error Logging Strategies**

```javascript
// Strategy 1: Log everything (verbose)
try {
  const result = await fetchData();
  console.log('[SUCCESS] Data fetched:', result);
} catch (error) {
  console.error('[ERROR] Fetch failed:', error);
  console.error('[ERROR] Stack:', error.stack);
  console.error('[ERROR] Timestamp:', new Date());
}
// ✅ Maximum information
// ❌ Log spam (80% noise)
// ❌ Hard to find real issues
// ❌ Storage costs

// Strategy 2: Log errors only (minimal)
try {
  return await fetchData();
} catch (error) {
  console.error('Fetch failed:', error.message);
  throw error;
}
// ✅ Clean logs
// ❌ Missing context
// ❌ Hard to reproduce issues

// Strategy 3: Structured logging with context (balanced)
const logger = {
  error: (message, context, error) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      message,
      context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      timestamp: new Date().toISOString()
    }));
  }
};

try {
  return await fetchData();
} catch (error) {
  logger.error('Data fetch failed', { userId, operation: 'fetchData' }, error);
  throw error;
}
// ✅ Structured, searchable
// ✅ Context included
// ✅ Moderate verbosity
// ✅ Easy aggregation
```

**6. Error Recovery Trade-offs**

```javascript
// Option 1: Crash on error (strict)
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1); // Crash
});
// ✅ Forces proper error handling
// ✅ Prevents silent failures
// ❌ Service downtime
// Use: Development, critical systems

// Option 2: Log and continue (lenient)
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  // Continue running
});
// ✅ Service stays up
// ❌ May hide bugs
// ❌ Degraded state
// Use: Non-critical systems

// Option 3: Restart on error (resilient)
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  setTimeout(() => process.exit(1), 1000); // Graceful shutdown
});
// Container orchestrator (Docker, K8s) restarts
// ✅ Self-healing
// ✅ Forces error handling
// ⚠️ Brief downtime
// Use: Production (with orchestration)
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Error Handling Best Practices</strong></summary>

**Simple Analogy: Package Delivery**

Error handling is like planning for when package delivery goes wrong:

**No Error Handling = Ignoring Problems**
```javascript
// ❌ Like ordering a package and never checking if it arrived
async function orderPackage() {
  const package = await deliveryService.send();
  usePackage(package); // What if package never arrived?
}
// No tracking, no Plan B, just hope it works!
```

**Try-Catch = Having a Backup Plan**
```javascript
// ✅ Like having a backup plan if package doesn't arrive
async function orderPackage() {
  try {
    const package = await deliveryService.send();
    usePackage(package);
  } catch (error) {
    console.error('Package lost:', error);
    // Order from local store instead
    const package = await localStore.buy();
    usePackage(package);
  }
}
// You checked, it failed, you had a backup!
```

**Retry Logic = Trying Multiple Delivery Services**
```javascript
// ✅ Like trying 3 different delivery services
async function orderPackage() {
  const services = [fastDelivery, standardDelivery, slowDelivery];

  for (const service of services) {
    try {
      return await service.send();
    } catch (error) {
      console.log(`${service.name} failed, trying next...`);
    }
  }

  throw new Error('All delivery services failed!');
}
```

**Real-World Example: Online Shopping**

```javascript
// Scenario: Buying a product online

// ❌ NO ERROR HANDLING (Bad UX)
async function checkout() {
  const payment = await processPayment();
  const order = await createOrder();
  const email = await sendConfirmation();

  return 'Success!';
}
// If payment fails → Crashes
// If email fails → Crashes
// User sees: "Something went wrong" (no details!)

// ✅ WITH ERROR HANDLING (Good UX)
async function checkout() {
  let payment, order;

  // Critical: Payment must succeed
  try {
    payment = await processPayment();
  } catch (error) {
    return {
      success: false,
      message: 'Payment failed. Please check your card details.',
      error: 'PAYMENT_FAILED'
    };
  }

  // Critical: Order must be created
  try {
    order = await createOrder(payment.id);
  } catch (error) {
    // Payment succeeded but order failed - refund!
    await refundPayment(payment.id);
    return {
      success: false,
      message: 'Order creation failed. Your card was not charged.',
      error: 'ORDER_FAILED'
    };
  }

  // Optional: Email can fail gracefully
  try {
    await sendConfirmation(order.id);
  } catch (error) {
    console.warn('Email failed (non-critical):', error);
    // Order succeeded, just email failed
    // Queue for retry later
  }

  return {
    success: true,
    message: 'Order placed successfully!',
    orderId: order.id
  };
}
// User always gets clear feedback!
```

**Explaining to PM:**

"Error handling is like insurance:

**No Error Handling** = No insurance
- House burns down → You're homeless
- In code: App crashes → User loses work

**Basic Try-Catch** = Home insurance
- House burns down → Insurance rebuilds
- In code: Error occurs → Show user-friendly message

**Retry Logic** = Multiple contractors
- First contractor unavailable → Call second contractor
- In code: Primary server down → Try backup server

**Circuit Breaker** = Knowing when to stop
- Contractor no-shows 5 times → Stop calling them
- In code: Service down → Stop sending requests, try later

**Why it matters for business:**
- Without: 20% of users abandon checkout on errors
- With proper error handling: Only 2% abandon
- Revenue impact: $500,000/year difference"

**Common Junior Mistakes:**

```javascript
// ❌ MISTAKE 1: Catching but not handling
try {
  await saveData();
} catch (error) {
  // Empty catch - error disappears!
}

// ✅ CORRECT: At minimum, log it
try {
  await saveData();
} catch (error) {
  console.error('Save failed:', error);
  showErrorToUser('Could not save. Please try again.');
}


// ❌ MISTAKE 2: Generic error messages
try {
  await processPayment();
} catch (error) {
  alert('Something went wrong');
  // User has no idea what failed!
}

// ✅ CORRECT: Specific, actionable messages
try {
  await processPayment();
} catch (error) {
  if (error.code === 'CARD_DECLINED') {
    alert('Your card was declined. Please use a different payment method.');
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    alert('Insufficient funds. Please check your balance.');
  } else {
    alert('Payment failed. Please try again or contact support.');
  }
}


// ❌ MISTAKE 3: Not cleaning up on error
async function uploadFile(file) {
  const tempFile = await createTempFile();
  const result = await uploadToServer(tempFile);
  await deleteTempFile(tempFile);
  return result;
}
// If uploadToServer fails, tempFile never gets deleted!

// ✅ CORRECT: Use finally for cleanup
async function uploadFile(file) {
  const tempFile = await createTempFile();

  try {
    const result = await uploadToServer(tempFile);
    return result;
  } finally {
    // Always runs, success or failure
    await deleteTempFile(tempFile);
  }
}
```

**Visual: Error Handling Levels**

```
Level 0: No error handling
  Code: await fetchData()
  Result: ❌ Crashes on error

Level 1: Basic try-catch
  Code: try { await fetchData() } catch (e) { console.log(e) }
  Result: ⚠️ Logs error, doesn't crash

Level 2: User-friendly messages
  Code: try { ... } catch (e) { showError('Load failed') }
  Result: ✅ User sees friendly message

Level 3: Retry logic
  Code: try { ... } catch (e) { retry 3x with backoff }
  Result: ✅✅ Recovers from transient failures

Level 4: Circuit breaker
  Code: Circuit opens after 5 failures
  Result: ✅✅✅ Prevents overwhelming failing service

Level 5: Saga pattern
  Code: Multi-step transaction with rollback
  Result: ✅✅✅✅ Production-grade resilience
```

**Practice Exercise:**

```javascript
// Scenario: Weather app loading data from API
// The API is slow and sometimes fails

// Try writing error handling for this:
async function loadWeather(city) {
  const data = await fetch(`/api/weather/${city}`).then(r => r.json());
  return data;
}

// What could go wrong?
// 1. Network failure (no internet)
// 2. API timeout (>5 seconds)
// 3. City not found (404)
// 4. API rate limit (429)
// 5. Server error (500)

// Your turn: Add proper error handling!

// Solution:
async function loadWeather(city) {
  try {
    const response = await fetchWithTimeout(
      `/api/weather/${city}`,
      5000 // 5 second timeout
    );

    if (response.status === 404) {
      return {
        error: 'CITY_NOT_FOUND',
        message: `City "${city}" not found. Please check spelling.`
      };
    }

    if (response.status === 429) {
      return {
        error: 'RATE_LIMIT',
        message: 'Too many requests. Please try again in a minute.'
      };
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    if (error.message.includes('Timeout')) {
      return {
        error: 'TIMEOUT',
        message: 'Weather service is slow. Please try again.'
      };
    }

    return {
      error: 'NETWORK_ERROR',
      message: 'Could not load weather. Check your internet connection.'
    };
  }
}
```

**Key Takeaways:**

1. **Always handle errors** - Don't let them crash your app
2. **Be specific** - Tell users exactly what went wrong
3. **Have a Plan B** - Retry, fallback, or graceful degradation
4. **Clean up resources** - Use finally for cleanup
5. **Log for debugging** - Future you will thank you

</details>

### Follow-up Questions

- "How would you implement a retry with jitter to avoid thundering herd?"
- "What's the difference between fail-fast and fail-safe strategies?"
- "How do you test error handling in async code?"
- "When should you use circuit breaker vs simple retry?"

### Resources

- [Error Handling in JavaScript](https://javascript.info/try-catch)
- [Promise Error Handling](https://javascript.info/promise-error-handling)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)

---

