# State Machines in React

## Question 1: How to manage complex state logic with state machines? (XState)

### Main Answer

State machines are a formal computation model where an application exists in exactly one of many finite states at any given time. In React, they solve complex state management problems where multiple interdependent state variables lead to impossible states and hard-to-reason-about logic.

**XState** is a popular state machine library for JavaScript that provides:

1. **Finite States**: Explicit set of allowed states (e.g., 'idle', 'loading', 'success', 'error')
2. **Transitions**: Clear rules for moving between states based on events
3. **Guards**: Conditional transitions based on context
4. **Actions**: Side effects triggered during state transitions
5. **Context**: Additional data beyond the state itself

**Basic XState Machine**:
```javascript
import { createMachine, interpret } from 'xstate';

const toggleMachine = createMachine({
  id: 'toggle',
  initial: 'off',
  states: {
    off: {
      on: { TOGGLE: 'on' }
    },
    on: {
      on: { TOGGLE: 'off' }
    }
  }
});

const service = interpret(toggleMachine);
service.start();
service.send('TOGGLE'); // transitions to 'on'
```

**In React with Hooks**:
```javascript
import { useMachine } from '@xstate/react';

function ToggleComponent() {
  const [state, send] = useMachine(toggleMachine);

  return (
    <button onClick={() => send('TOGGLE')}>
      Current: {state.value}
    </button>
  );
}
```

The key advantage is **impossibility prevention**: your code structure prevents invalid state combinations at compile-time and runtime, making applications more robust and maintainable.

---

## 🔍 Deep Dive: State Machine Concepts and Architecture

### 1. Core Concepts

**Finite State Machine (FSM) Theory**:
A state machine is defined by:
- **States (Q)**: `{idle, loading, success, error}`
- **Initial state (q₀)**: `idle`
- **Input symbols (Σ)**: `{FETCH, RETRY, RESET}`
- **Transition function (δ)**: Maps (state, input) → new state
- **Accepting states (F)**: Goal states

**State Chart Extensions** (Harel, 1987):
- Hierarchical states (parent-child relationships)
- Parallel regions (multiple simultaneous states)
- History states (remember previous substate)
- Deferred events (queue events during specific states)

### 2. XState Architecture Deep Dive

**Machine Structure**:
```javascript
const fetchMachine = createMachine({
  id: 'fetch',
  initial: 'idle',
  context: {
    data: null,
    error: null,
    retryCount: 0
  },
  states: {
    idle: {
      on: {
        FETCH: {
          target: 'loading',
          actions: 'resetError'
        }
      }
    },
    loading: {
      invoke: {
        src: 'fetchData',
        onDone: {
          target: 'success',
          actions: assign({
            data: (_, event) => event.data
          })
        },
        onError: {
          target: 'error',
          actions: assign({
            error: (_, event) => event.data
          })
        }
      }
    },
    success: {
      after: {
        5000: 'idle' // Auto-transition after 5s
      },
      on: {
        RESET: {
          target: 'idle',
          actions: assign({
            data: null,
            error: null
          })
        }
      }
    },
    error: {
      on: {
        RETRY: {
          target: 'loading',
          cond: 'canRetry',
          actions: assign({
            retryCount: ctx => ctx.retryCount + 1
          })
        }
      }
    }
  }
}, {
  actions: {
    resetError: assign({ error: null })
  },
  guards: {
    canRetry: ctx => ctx.retryCount < 3
  },
  services: {
    fetchData: async () => {
      const res = await fetch('/api/data');
      return res.json();
    }
  }
});
```

**Key Components**:

1. **Invoke (Side Effects)**:
   - `src`: Function to execute when entering state
   - `onDone`: Handle success
   - `onError`: Handle failure
   - Automatically cleaned up on exit

2. **Actions**:
   - Fire-and-forget operations
   - `assign`: Update context
   - Entry/exit actions: Triggered when entering/leaving state
   ```javascript
   entry: [
     'logStateEntry',
     assign({ startTime: () => Date.now() })
   ]
   ```

3. **Guards (Conditional Transitions)**:
   ```javascript
   RETRY: {
     target: 'loading',
     cond: (ctx, event) => ctx.retryCount < 3
   }
   ```

4. **Hierarchical States**:
   ```javascript
   states: {
     form: {
       initial: 'idle',
       states: {
         idle: { on: { FOCUS: 'editing' } },
         editing: { on: { BLUR: 'idle', SUBMIT: '#form.submitting' } }
       },
       on: { RESET: 'idle' }
     },
     submitting: {}
   }
   ```

### 3. XState Visualization and Debugging

**Statechart Visualization**:
```javascript
// Access state chart details
console.log(machine.getStateNodeByPath(['form', 'editing']));

// Get all possible transitions
const state = machine.getInitialState();
console.log(state.nextEvents); // ['FOCUS', 'RESET']
```

**XState Visualizer Tool**:
- Online: https://stately.ai/viz
- Paste machine JSON to see visual diagram
- Shows all states and transitions
- Simulates events in real-time

**Inspector in Development**:
```javascript
import { inspect } from '@xstate/inspect';

inspect({
  url: 'https://statecharts.io/inspect'
});

const service = interpret(fetchMachine).start();
// Opens inspector window showing live state transitions
```

### 4. Advanced Patterns

**Parallel States** (Concurrent Regions):
```javascript
states: {
  app: {
    type: 'parallel',
    states: {
      sidebar: {
        initial: 'collapsed',
        states: {
          collapsed: { on: { EXPAND: 'expanded' } },
          expanded: { on: { COLLAPSE: 'collapsed' } }
        }
      },
      modal: {
        initial: 'closed',
        states: {
          closed: { on: { OPEN: 'open' } },
          open: { on: { CLOSE: 'closed' } }
        }
      }
    }
  }
}
// State value: { app: { sidebar: 'expanded', modal: 'open' } }
```

**History States** (Remember Previous):
```javascript
form: {
  initial: 'idle',
  states: {
    idle: {},
    editing: {},
    submitting: {}
  },
  on: {
    CANCEL: {
      target: '#form.hist',
      actions: 'clearForm'
    }
  },
  states: {
    hist: {
      type: 'history',
      default: 'idle'
    }
  }
}
```

**Deferred Events**:
```javascript
submitting: {
  on: {
    // Event queued and processed after exiting state
    BLUR: { actions: 'deferEvent' }
  }
}
```

### 5. Performance Considerations

**Subscription Model**:
- XState uses event listeners, not React renders
- Only relevant components re-render on state changes
- Reduces unnecessary renders compared to naive state

**Memory Usage**:
- Service instances maintain full machine definition
- Context object stored in memory
- Multiple services for same machine: shallow copy (shared machine definition)

**Large Machines**:
- 100+ states: Still performant (state lookup is O(1))
- Deep nesting: No performance penalty
- Events per second: Can handle 10k+ events/sec

---

## 🐛 Real-World Scenario: Multi-Step Form Wizard with State Machine

### Problem: Complex Form State Without Machine

A checkout wizard with 4 steps (shipping, payment, review, confirmation) has complex requirements:

1. Skip payment if free shipping selected
2. Can't proceed to next step with validation errors
3. Must go back 1 step only (no jumping)
4. Auto-save form data at each step
5. Handle payment processing with retry logic
6. Show appropriate loading states
7. Preserve form data on navigation

**Without State Machine** (Problematic Code):
```javascript
// Multiple state variables = impossible states!
const [step, setStep] = useState(1);
const [isLoading, setIsLoading] = useState(false);
const [isSaved, setIsSaved] = useState(false);
const [hasError, setHasError] = useState(false);
const [errorMsg, setErrorMsg] = useState('');
const [paymentProcessing, setPaymentProcessing] = useState(false);
const [shippingMethod, setShippingMethod] = useState('standard');
const [formData, setFormData] = useState({});

// Problem: What if isLoading && isSaved? paymentProcessing && hasError?
// These are impossible states but code allows them!

const handleNext = async () => {
  setIsLoading(true);
  setHasError(false);

  try {
    // Auto-save logic mixed with navigation logic
    if (step === 2) {
      const result = await saveShipping(formData);
      setFormData(prev => ({ ...prev, ...result }));
    }
    setStep(step + 1);
  } catch (err) {
    setHasError(true);
    setErrorMsg(err.message);
    // But we already incremented step visually!
  } finally {
    setIsLoading(false);
  }
};

// Later: Render logic is scattered
if (isLoading) return <LoadingSpinner />;
if (hasError) return <ErrorBanner message={errorMsg} />;
if (step === 1 && isSaved) return <SuccessMessage />;
// Bug: What if !isSaved? What if hasError but still showing form?
```

**Problems**:
- Multiple state variables = 2^7 = 128 possible combinations
- Only ~8 are valid
- Race conditions during async operations
- Unclear transition rules
- Hard to test all paths

### Solution: XState Wizard Machine

```javascript
import { createMachine, assign } from 'xstate';
import { useMachine } from '@xstate/react';

const checkoutMachine = createMachine({
  id: 'checkout',
  initial: 'shipping',
  context: {
    formData: {
      shipping: {},
      payment: {},
      review: {}
    },
    shippingMethod: 'standard',
    errorMsg: '',
    retryCount: 0,
    validationErrors: {}
  },
  states: {
    shipping: {
      entry: 'focusShippingForm',
      on: {
        FIELD_CHANGE: {
          actions: assign({
            formData: (ctx, event) => ({
              ...ctx.formData,
              shipping: {
                ...ctx.formData.shipping,
                [event.field]: event.value
              }
            })
          })
        },
        SHIPPING_METHOD_CHANGE: {
          actions: assign({
            shippingMethod: (_, event) => event.method
          })
        },
        AUTO_SAVE: {
          target: 'shipping.autosaving'
        },
        NEXT: {
          target: 'shipping.validating'
        }
      },
      initial: 'idle',
      states: {
        idle: {},
        validating: {
          invoke: {
            src: 'validateShipping',
            onDone: {
              target: '#checkout.payment',
              actions: assign({ validationErrors: {} })
            },
            onError: {
              target: 'idle',
              actions: assign({
                validationErrors: (_, event) => event.data
              })
            }
          }
        },
        autosaving: {
          invoke: {
            src: 'saveShippingStep',
            onDone: {
              target: 'idle',
              actions: 'showSaveSuccess'
            },
            onError: {
              target: 'idle',
              actions: assign({
                errorMsg: (_, event) => event.data.message
              })
            }
          }
        }
      }
    },

    payment: {
      entry: ['focusPaymentForm', 'autoSaveOnEntry'],
      on: {
        FIELD_CHANGE: {
          actions: assign({
            formData: (ctx, event) => ({
              ...ctx.formData,
              payment: {
                ...ctx.formData.payment,
                [event.field]: event.value
              }
            })
          })
        },
        BACK: {
          target: 'shipping',
          cond: 'skipPaymentIfFreeShipping'
        },
        NEXT: {
          target: 'payment.validating'
        }
      },
      initial: 'idle',
      states: {
        idle: {},
        validating: {
          invoke: {
            src: 'validatePayment',
            onDone: {
              target: '#checkout.review'
            },
            onError: {
              target: 'idle',
              actions: assign({
                validationErrors: (_, event) => event.data
              })
            }
          }
        }
      }
    },

    review: {
      entry: 'autoSaveOnEntry',
      on: {
        BACK: {
          target: 'payment',
          cond: 'canGoBack'
        },
        SUBMIT: {
          target: 'processing'
        }
      }
    },

    processing: {
      invoke: {
        src: 'processPayment',
        onDone: {
          target: 'confirmation',
          actions: assign({
            formData: (ctx, event) => ({
              ...ctx.formData,
              orderId: event.data.orderId
            })
          })
        },
        onError: {
          target: 'paymentError',
          actions: assign({
            errorMsg: (_, event) => event.data.message,
            retryCount: ctx => ctx.retryCount + 1
          })
        }
      }
    },

    paymentError: {
      on: {
        RETRY: {
          target: 'processing',
          cond: 'canRetry'
        },
        BACK: 'payment'
      }
    },

    confirmation: {
      type: 'final'
    }
  }
}, {
  actions: {
    focusShippingForm: () => {
      document.getElementById('shipping-form')?.focus();
    },
    focusPaymentForm: () => {
      document.getElementById('payment-form')?.focus();
    },
    autoSaveOnEntry: (ctx) => {
      // Auto-save current step data
      localStorage.setItem('checkout_data', JSON.stringify(ctx.formData));
    },
    showSaveSuccess: () => {
      console.log('Form saved successfully');
    }
  },
  guards: {
    canGoBack: () => true,
    canRetry: (ctx) => ctx.retryCount < 3,
    skipPaymentIfFreeShipping: (ctx) =>
      ctx.shippingMethod === 'free'
  },
  services: {
    validateShipping: async (ctx) => {
      const errors = {};
      if (!ctx.formData.shipping.address)
        errors.address = 'Address required';
      if (!ctx.formData.shipping.zip)
        errors.zip = 'ZIP required';

      if (Object.keys(errors).length > 0)
        throw errors;
      return true;
    },

    validatePayment: async (ctx) => {
      // Skip if free shipping
      if (ctx.shippingMethod === 'free') return true;

      const errors = {};
      if (!ctx.formData.payment.cardNumber)
        errors.cardNumber = 'Card required';

      if (Object.keys(errors).length > 0)
        throw errors;
      return true;
    },

    saveShippingStep: async (ctx) => {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        body: JSON.stringify(ctx.formData.shipping)
      });
      if (!response.ok) throw new Error('Save failed');
      return response.json();
    },

    processPayment: async (ctx) => {
      const response = await fetch('/api/payment', {
        method: 'POST',
        body: JSON.stringify({
          shipping: ctx.formData.shipping,
          payment: ctx.formData.payment,
          shippingMethod: ctx.shippingMethod
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message);
      }
      return response.json(); // { orderId: '123' }
    }
  }
});
```

### React Component Implementation

```javascript
function CheckoutWizard() {
  const [state, send] = useMachine(checkoutMachine);

  // Metrics: Track state transitions
  useEffect(() => {
    console.log(`[Analytics] State: ${state.value}, RetryCount: ${state.context.retryCount}`);
  }, [state.value]);

  const renderStep = () => {
    if (state.matches('shipping')) {
      return (
        <ShippingStep
          formData={state.context.formData.shipping}
          isValidating={state.matches('shipping.validating')}
          isSaving={state.matches('shipping.autosaving')}
          errors={state.context.validationErrors}
          onFieldChange={(field, value) =>
            send({ type: 'FIELD_CHANGE', field, value })
          }
          onShippingMethodChange={(method) =>
            send({ type: 'SHIPPING_METHOD_CHANGE', method })
          }
          onAutoSave={() => send('AUTO_SAVE')}
          onNext={() => send('NEXT')}
        />
      );
    }

    if (state.matches('payment')) {
      return (
        <PaymentStep
          formData={state.context.formData.payment}
          isValidating={state.matches('payment.validating')}
          errors={state.context.validationErrors}
          onFieldChange={(field, value) =>
            send({ type: 'FIELD_CHANGE', field, value })
          }
          onBack={() => send('BACK')}
          onNext={() => send('NEXT')}
        />
      );
    }

    if (state.matches('review')) {
      return (
        <ReviewStep
          formData={state.context.formData}
          onBack={() => send('BACK')}
          onSubmit={() => send('SUBMIT')}
        />
      );
    }

    if (state.matches('processing')) {
      return <LoadingScreen message="Processing payment..." />;
    }

    if (state.matches('paymentError')) {
      return (
        <ErrorStep
          message={state.context.errorMsg}
          retryCount={state.context.retryCount}
          onRetry={() => send('RETRY')}
          onBack={() => send('BACK')}
        />
      );
    }

    if (state.matches('confirmation')) {
      return (
        <ConfirmationStep
          orderId={state.context.formData.orderId}
        />
      );
    }
  };

  return (
    <div className="checkout-wizard">
      <ProgressBar
        currentStep={['shipping', 'payment', 'review'].indexOf(state.value) + 1}
        totalSteps={3}
      />
      {renderStep()}
    </div>
  );
}
```

### Real Metrics & Debugging

```javascript
// Debug: Log all transitions
const service = interpret(checkoutMachine)
  .onTransition((state, event) => {
    console.log({
      timestamp: new Date().toISOString(),
      from: state.history?.value,
      to: state.value,
      event: event.type,
      context: state.context
    });

    // Send to analytics
    analytics.track('checkout_step_change', {
      step: state.value,
      retries: state.context.retryCount,
      duration: Date.now() - startTime
    });
  });

// Advantages Over useReducer:
// ✅ Impossible states prevented at compile time
// ✅ All transitions explicit and visible
// ✅ State chart can be visualized and tested
// ✅ Built-in debugging and visualization
// ✅ Side effects (invoke) automatically managed
// ✅ Conditional transitions (guards) easy to reason about
```

---

## ⚖️ Trade-offs: State Machines vs useReducer vs useState

### Comparison Matrix

| Feature | useState | useReducer | XState |
|---------|----------|-----------|--------|
| **Simplicity** | ✅ Simplest | ⚠️ Medium | ❌ Learning curve |
| **Number of States** | ✅ <10 | ✅ 10-50 | ✅ 50+ |
| **Impossible States** | ❌ Possible | ❌ Possible | ✅ Prevented |
| **Side Effects** | ⚠️ In render/effects | ⚠️ In reducer | ✅ invoke blocks |
| **Async Operations** | ❌ Complex | ⚠️ Needs external library | ✅ Built-in |
| **Conditional Logic** | ❌ In component | ⚠️ In reducer | ✅ Guards |
| **Visualization** | ❌ None | ❌ None | ✅ Stately.ai |
| **Testing** | ⚠️ Medium | ✅ Easy | ✅ Very Easy |
| **Performance** | ✅ Optimal | ✅ Good | ✅ Good |
| **Bundle Size** | ✅ 0B | ✅ 0B | ⚠️ 50KB (gzipped) |

### When to Use Each

**Use useState When**:
- Single boolean toggle
- Simple counter
- Form with 1-2 fields
- <5 total state variables
- No async operations
- Team unfamiliar with FSM theory

**Example**:
```javascript
const [isOpen, setIsOpen] = useState(false);
const [count, setCount] = useState(0);
```

**Use useReducer When**:
- 5-20 related state pieces
- Complex update logic
- Interdependent state changes
- Team familiar with Redux
- Don't need visualization
- Want to avoid prop drilling (with context)

**Example**:
```javascript
const [state, dispatch] = useReducer(formReducer, initialState);

const formReducer = (state, action) => {
  switch(action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        touched: { ...state.touched, [action.field]: true }
      };
    case 'SUBMIT':
      return { ...state, isSubmitting: true };
    // ... many more cases
  }
};
```

**Use XState When**:
- 20+ possible states
- Complex workflows (wizards, forms, auth flows)
- Multiple parallel processes
- Extensive conditional logic
- Need state visualization and debugging
- Team wants formal state machine model
- Large application complexity

**Example**:
```javascript
// Multi-step wizard with payment retry logic
// Parallel sidebar/modal states
// Need to visualize all possible flows
// Many guards and conditional transitions
```

### Performance Comparison

**useState Performance**:
```javascript
// Re-renders on every state change
// No optimization by default
const [a, setA] = useState(0);
const [b, setB] = useState(0);
const [c, setC] = useState(0);

setA(1); // Re-render 1
setB(1); // Re-render 2 (even if B not used!)
setC(1); // Re-render 3
```

**useReducer Performance**:
```javascript
// Single dispatch function = fewer render passes
const [state, dispatch] = useReducer(reducer, initial);

dispatch({ type: 'BATCH_UPDATE', updates: { a: 1, b: 1, c: 1 } });
// Re-render once (if reducer returns new object)
```

**XState Performance**:
```javascript
// Event-driven architecture
// Only subscribed components re-render
// Can batch multiple events

send({ type: 'EVENT1' });
send({ type: 'EVENT2' });
send({ type: 'EVENT3' });
// Batched: Single re-render

// Metrics in production:
// useState: 1200ms time-to-interactive
// useReducer: 980ms time-to-interactive
// XState: 920ms time-to-interactive (fewer re-renders)
```

### Decision Tree

```
Start: "How many state variables?"
├─ 1-3 variables (independent)
│  └─ Use useState ✅
├─ 4-8 variables (interdependent)
│  ├─ Single business domain?
│  │  └─ useReducer ✅
│  └─ Multiple domains (form + loading + error)?
│     └─ useReducer ⚠️ (or split context)
├─ 9-20 variables
│  ├─ Linear flow (no loops/conditionals)?
│  │  └─ useReducer ✅
│  └─ Complex conditional transitions?
│     └─ XState ✅
└─ 20+ variables or need visualization
   └─ XState ✅✅✅
```

### Cost-Benefit Analysis

| Scenario | useState | useReducer | XState |
|----------|----------|-----------|--------|
| Todo app | Best ✅ | Overkill | Overkill |
| User dashboard | Good | Better | Overkill |
| Checkout wizard | Bad | Good | Best ✅✅ |
| Auth flow | Bad | Good | Best ✅✅ |
| Complex form | Bad | Good | Best ✅✅ |
| Real-time editor | Bad | Bad | Best ✅✅ |

---

## 💬 Explain to Junior: Traffic Light Analogy & Interview Templates

### Traffic Light State Machine Analogy

Imagine a traffic light at an intersection:

**Bad Approach (Multiple useState)**:
```javascript
const [color, setColor] = useState('red');
const [isBlinking, setIsBlinking] = useState(false);
const [isPowerOn, setIsPowerOn] = useState(true);
const [timer, setTimer] = useState(30);
const [nextColor, setNextColor] = useState('yellow');

// Problem: What if color is 'red' AND isPowerOn is false AND isBlinking is true?
// That doesn't make sense! Red light can't blink when off!
// But JavaScript allows this impossible state!
```

**Good Approach (State Machine)**:
```javascript
const trafficLight = createMachine({
  initial: 'red',
  states: {
    red: {
      after: { 30000: 'green' } // Auto-transition after 30s
    },
    yellow: {
      after: { 5000: 'red' }
    },
    green: {
      after: { 25000: 'yellow' }
    },
    off: {
      on: { POWER_ON: 'red' }
    }
  },
  on: {
    POWER_OFF: 'off' // Can happen from any state
  }
});
```

**Why This is Better**:
1. ✅ Each state is explicit and separate
2. ✅ Transitions are clear (red → green, not random jumps)
3. ✅ Impossible states prevented (can't be in 'off' AND 'red' simultaneously)
4. ✅ Timing logic built-in (`after`)
5. ✅ Easy to visualize: just 4 states total!

### Real-World Analogy: Door Lock System

Untrained junior dev's attempt (Wrong ❌):
```javascript
const [isLocked, setIsLocked] = useState(true);
const [isUnlocking, setIsUnlocking] = useState(false);
const [keyInserted, setKeyInserted] = useState(false);
const [isDoorOpen, setIsDoorOpen] = useState(false);

// What's the state when:
// isLocked=true, isUnlocking=true? (Contradiction!)
// keyInserted=true, isDoorOpen=true? (Where's the key?)
// isDoorOpen=true, isLocked=true? (Door open but locked?)
```

Trained dev's approach (Right ✅):
```javascript
const doorMachine = createMachine({
  initial: 'locked',
  states: {
    locked: {
      on: {
        INSERT_KEY: 'unlocking'
      }
    },
    unlocking: {
      invoke: {
        src: 'unlockDoor', // Side effect
        onDone: 'unlocked'
      }
    },
    unlocked: {
      on: {
        OPEN_DOOR: 'open'
      }
    },
    open: {
      on: {
        CLOSE_DOOR: 'locked' // Auto-locks when closed
      }
    }
  }
});

// Visualized:
// locked --[INSERT_KEY]--> unlocking --[done]--> unlocked --[OPEN_DOOR]--> open --[CLOSE_DOOR]--> locked
//
// States: 4 (clear and simple)
// Impossible combinations: 0 (all prevented!)
```

### Interview Answer Template

**Question**: "How would you handle complex state in a form wizard?"

**Good Answer** (Using State Machine Knowledge):
```
"I'd use a state machine approach, ideally with XState. Here's why:

1. **Define all states explicitly**: shipping, payment, review, processing, confirmation, error
   - Each state is mutually exclusive
   - Can't be in two states at once

2. **Transitions are clear**: Form validation → proceed to next step, or stay with errors
   - Guards prevent invalid transitions
   - Example: Skip payment step if free shipping selected

3. **Side effects are managed**:
   - Auto-save on each step entry
   - Payment processing with automatic retry
   - XState's 'invoke' blocks handle async operations

4. **Impossible states prevented**:
   - Can't be 'loading' and 'error' simultaneously
   - Can't navigate to next step without validation
   - All combinations are valid states

5. **Easy testing**:
   - Test each state transition: 'shipping' + NEXT event → 'payment'
   - Test guards: Can't go to payment without valid shipping address
   - Test side effects: Auto-save triggers on entry

Example (rough code):
\`\`\`javascript
const wizardMachine = createMachine({
  states: {
    shipping: {
      on: { NEXT: { target: 'payment', cond: 'isShippingValid' } }
    },
    payment: {
      on: { NEXT: { target: 'review', cond: 'isPaymentValid' } },
      invoke: { src: 'processPayment', ... }
    },
    review: { on: { SUBMIT: 'confirmation' } },
    confirmation: { type: 'final' }
  }
});
\`\`\`

**Benefits**:
- Bugs related to impossible states: eliminated
- Navigation logic: explicit and testable
- Async handling: clean and predictable
- Debugging: visualize all possible flows
"
```

### Common Junior Mistakes

**Mistake 1**: Too many useState variables
```javascript
// ❌ Wrong: 8 useState calls
const [step, setStep] = useState(1);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);
const [isSaved, setIsSaved] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [validationErrors, setValidationErrors] = useState({});
const [isDirty, setIsDirty] = useState(false);

// ✅ Right: One state machine
const [state, send] = useMachine(formMachine);
```

**Mistake 2**: Mixing business logic with rendering
```javascript
// ❌ Wrong: Logic scattered in component
const handleNext = () => {
  if (!validateForm()) {
    setError('Invalid');
    return;
  }
  setIsLoading(true);
  fetch('/save').then(res => {
    setData(res);
    setStep(step + 1);
    setIsSaved(true);
  });
};

// ✅ Right: Logic in machine
// Component just sends events
<button onClick={() => send('NEXT')}>Next</button>
```

**Mistake 3**: Race conditions with async
```javascript
// ❌ Wrong: Multiple setStates can race
setIsLoading(true);
fetchData().then(data => {
  setData(data);        // Race condition!
  setStep(2);           // What if user clicked again?
  setIsLoading(false);  // State might be stale
});

// ✅ Right: Atomic transitions
// 'processing' state prevents duplicate events
// invoke handles async + auto-cleanup
```

### Step-by-Step Learning Path for Junior

**Week 1: Understanding States**
```javascript
// Simple 3-state machine
const lightMachine = createMachine({
  initial: 'off',
  states: {
    off: { on: { TOGGLE: 'on' } },
    on: { on: { TOGGLE: 'off' } }
  }
});

// "It's just: current state + event = next state"
```

**Week 2: Adding Context**
```javascript
// Track counter value alongside state
const counterMachine = createMachine({
  context: { count: 0 },
  states: {
    active: {
      on: {
        INCREMENT: {
          actions: assign({ count: ctx => ctx.count + 1 })
        }
      }
    }
  }
});

// "Context is extra data beyond the state"
```

**Week 3: Adding Async**
```javascript
// Fetch data when entering state
const dataMachine = createMachine({
  states: {
    loading: {
      invoke: {
        src: 'fetchData',
        onDone: { target: 'success', actions: assign({ data: ... }) },
        onError: { target: 'error', actions: assign({ error: ... }) }
      }
    }
  }
});

// "invoke automatically handles loading/error states"
```

**Week 4: Building Real App**
```javascript
// Combine all concepts: states + context + async + guards
const formMachine = createMachine({
  context: { formData: {} },
  states: {
    editing: {
      on: { SUBMIT: { target: 'submitting', cond: 'isFormValid' } }
    },
    submitting: {
      invoke: {
        src: 'submitForm',
        onDone: 'success'
      }
    }
  }
});
```

### Interview Answer Template: Compare useState vs XState

**Q**: "When would you use XState instead of useState?"

**A**:
```
"I'd use XState when:

1. **More than 8 related state variables**
   - useState: one setState per variable
   - XState: one machine, all coordinated

2. **Multiple async operations**
   - useState: useEffect hell, race conditions
   - XState: invoke blocks, automatic cleanup

3. **Complex conditional logic**
   - useState: logic scattered in component
   - XState: guards make conditions explicit

4. **Need to prevent impossible states**
   - useState: allows isLoading && isError simultaneously
   - XState: states are mutually exclusive

5. **Want to visualize flow**
   - useState: guess the logic from code
   - XState: stately.ai shows entire state diagram

Example: Form wizard with payment retry
- 20+ state variables if using useState
- 4-5 states with XState
- Clear state transitions
- Built-in retry logic
- Visualizable flow

Decision: If I count more than 10 state variables, I refactor to useReducer first. If I need visualization or have 20+, I use XState.

Performance is similar, main benefit is code clarity and maintainability.
"
```

