# React Hooks - useReducer

## Question 1: How does useReducer work and when should you use it over useState?

**Answer:**

`useReducer` is a React Hook for managing complex state logic through a reducer function, following the Redux pattern. It provides a more structured approach to state management than `useState`, especially when dealing with multiple related state values or complex state transitions.

The hook accepts a reducer function `(state, action) => newState` and an initial state, returning the current state and a dispatch function. The reducer function receives the current state and an action object, then returns the new state based on the action type. This pattern centralizes state update logic, making it predictable and easier to test.

You should choose `useReducer` over `useState` when:
- State logic involves multiple sub-values (complex objects)
- Next state depends on previous state in non-trivial ways
- State transitions follow specific business rules
- You need to optimize performance by passing dispatch down instead of callbacks
- State updates are deeply nested or require multiple related changes

Basic example:

```javascript
function Counter() {
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'increment': return { count: state.count + 1 };
        case 'decrement': return { count: state.count - 1 };
        default: return state;
      }
    },
    { count: 0 }
  );

  return (
    <>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  );
}
```

The dispatch function is stable across re-renders (identity stable), making it safe to pass to child components without causing unnecessary re-renders. This makes `useReducer` particularly valuable for performance optimization in component trees.

---

### 🔍 Deep Dive

**Reducer Pattern Architecture:**

The reducer pattern in React is inspired by Redux but simplified for component-level state management. Understanding the underlying implementation reveals why it's powerful for complex state:

```javascript
// Conceptual React internals (simplified)
function useReducer(reducer, initialState, init) {
  // Initialize state (only on mount)
  const initialStateValue = init ? init(initialState) : initialState;

  // Get current fiber (component instance in React's internal tree)
  const hook = mountOrUpdateHook();

  if (hook.memoizedState === null) {
    // Mount phase
    hook.memoizedState = initialStateValue;
    hook.queue = { pending: null, dispatch: null };

    // Create stable dispatch function
    const dispatch = (action) => {
      // Add action to update queue
      const update = { action, next: null };

      // Circular linked list for batching
      if (hook.queue.pending === null) {
        update.next = update;
      } else {
        update.next = hook.queue.pending.next;
        hook.queue.pending.next = update;
      }
      hook.queue.pending = update;

      // Schedule re-render
      scheduleUpdateOnFiber(currentFiber);
    };

    hook.queue.dispatch = dispatch;
    return [hook.memoizedState, dispatch];
  } else {
    // Update phase - process queued updates
    let newState = hook.memoizedState;
    const queue = hook.queue;

    if (queue.pending !== null) {
      // Process all queued actions
      let update = queue.pending.next;
      do {
        newState = reducer(newState, update.action);
        update = update.next;
      } while (update !== queue.pending.next);

      queue.pending = null;
      hook.memoizedState = newState;
    }

    return [newState, queue.dispatch];
  }
}
```

**Key Internal Mechanisms:**

1. **Update Queue (Circular Linked List):**
   - React batches multiple dispatch calls into a queue
   - Updates are processed in order during render phase
   - Enables automatic batching for performance

2. **Dispatch Stability:**
   - Dispatch function identity never changes
   - Safe to omit from dependency arrays
   - Closure captures the reducer and fiber reference, not state

3. **Lazy Initialization:**
   - Third argument `init` function runs only on mount
   - Useful for expensive initial state computation
   - Pattern: `useReducer(reducer, initialArg, init)`

**Advanced Reducer Patterns:**

```javascript
// ✅ GOOD: Action creators with payload validation
const actions = {
  increment: (amount = 1) => ({
    type: 'INCREMENT',
    payload: Math.max(0, amount)
  }),

  decrement: (amount = 1) => ({
    type: 'DECREMENT',
    payload: Math.max(0, amount)
  }),

  reset: () => ({ type: 'RESET' }),

  setCount: (count) => ({
    type: 'SET_COUNT',
    payload: count,
    meta: { timestamp: Date.now() }
  })
};

// ✅ GOOD: Reducer with comprehensive error handling
function counterReducer(state, action) {
  // Validate action structure
  if (!action || typeof action.type !== 'string') {
    console.error('Invalid action:', action);
    return state;
  }

  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + (action.payload || 1),
        lastAction: action.type,
        history: [...state.history, state.count]
      };

    case 'DECREMENT':
      return {
        ...state,
        count: Math.max(0, state.count - (action.payload || 1)),
        lastAction: action.type,
        history: [...state.history, state.count]
      };

    case 'RESET':
      return {
        ...state,
        count: 0,
        lastAction: action.type,
        history: []
      };

    case 'SET_COUNT':
      if (typeof action.payload !== 'number') {
        console.error('SET_COUNT requires numeric payload');
        return state;
      }
      return {
        ...state,
        count: action.payload,
        lastAction: action.type,
        lastUpdate: action.meta?.timestamp
      };

    default:
      // Log unknown actions in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unknown action type:', action.type);
      }
      return state;
  }
}

// Usage with action creators
function Counter() {
  const [state, dispatch] = useReducer(counterReducer, {
    count: 0,
    lastAction: null,
    history: [],
    lastUpdate: null
  });

  return (
    <div>
      <p>Count: {state.count}</p>
      <p>Last Action: {state.lastAction}</p>
      <button onClick={() => dispatch(actions.increment(5))}>+5</button>
      <button onClick={() => dispatch(actions.decrement())}>-1</button>
      <button onClick={() => dispatch(actions.reset())}>Reset</button>
    </div>
  );
}
```

**Comparison with useState Implementation:**

```javascript
// ❌ BAD: Multiple useState for related state
function FormBad() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scattered update logic
  const handleNameChange = (e) => {
    setName(e.target.value);
    setErrors(prev => ({ ...prev, name: '' }));
    setTouched(prev => ({ ...prev, name: true }));
  };

  // Easy to have inconsistent state updates
  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Forgot to clear errors - bug!
    try {
      await api.submit({ name, email });
    } catch (err) {
      setErrors({ form: err.message });
      setIsSubmitting(false); // Have to remember to set this
    }
  };
}

// ✅ GOOD: Single useReducer with centralized logic
function FormGood() {
  const [state, dispatch] = useReducer(formReducer, {
    values: { name: '', email: '' },
    errors: {},
    touched: {},
    isSubmitting: false
  });

  // Consistent, testable update logic
  const handleChange = (field, value) => {
    dispatch({ type: 'FIELD_CHANGE', field, value });
  };

  const handleSubmit = async () => {
    dispatch({ type: 'SUBMIT_START' });
    try {
      await api.submit(state.values);
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (err) {
      dispatch({ type: 'SUBMIT_ERROR', error: err.message });
    }
  };
}
```

---

### 🐛 Real-World Scenario

**Production Bug: Inconsistent Multi-Step Form State**

**Context:** E-commerce checkout flow with 4 steps (shipping, payment, review, confirmation). Users reported data loss when navigating backward, and payment information sometimes persisting after failed submissions.

**Initial Implementation (Buggy):**

```javascript
// ❌ BAD: Multiple useState creating race conditions
function CheckoutFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingData, setShippingData] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [reviewData, setReviewData] = useState({});
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    setIsValidating(true);
    const valid = await validateStep(currentStep);
    setIsValidating(false);

    if (valid) {
      setCurrentStep(prev => prev + 1);
      setErrors({}); // Bug: timing issue with validation
    } else {
      // Bug: errors set before validation completes
      setErrors(await getValidationErrors(currentStep));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitOrder({ shippingData, paymentData });
      // Bug: forgot to clear payment data on success
      setCurrentStep(4);
    } catch (err) {
      // Bug: payment data still in state after error
      setErrors({ submit: err.message });
      setIsSubmitting(false);
    }
  };

  // Bug: no coordination between state updates
  // Race condition when rapid navigation occurs
}
```

**Metrics:**
- Error rate: 8.3% of checkouts failed
- User frustration: 23% abandoned cart after errors
- Support tickets: 140+ complaints/month
- Average time to checkout: 4.2 minutes (target: 2.5 minutes)

**Root Cause Analysis:**

1. **State Updates Not Atomic:** Multiple `setState` calls created race conditions
2. **No Transaction Semantics:** Validation errors could mismatch with current step
3. **Side Effect Timing:** Async operations caused state to be out of sync
4. **Memory Leaks:** Failed to clear sensitive payment data
5. **No State History:** Couldn't debug user-reported issues

**Solution with useReducer:**

```javascript
// ✅ GOOD: Atomic state updates with useReducer
const STEPS = ['shipping', 'payment', 'review', 'confirmation'];

const initialState = {
  currentStep: 0,
  steps: {
    shipping: { data: {}, completed: false, errors: {} },
    payment: { data: {}, completed: false, errors: {} },
    review: { data: {}, completed: false, errors: {} }
  },
  isValidating: false,
  isSubmitting: false,
  submitError: null,
  history: [] // For debugging
};

function checkoutReducer(state, action) {
  switch (action.type) {
    case 'FIELD_UPDATE': {
      const { step, field, value } = action.payload;
      return {
        ...state,
        steps: {
          ...state.steps,
          [step]: {
            ...state.steps[step],
            data: {
              ...state.steps[step].data,
              [field]: value
            },
            // Clear field error when user types
            errors: {
              ...state.steps[step].errors,
              [field]: undefined
            }
          }
        },
        history: [...state.history, { action: 'FIELD_UPDATE', timestamp: Date.now() }]
      };
    }

    case 'VALIDATION_START': {
      return {
        ...state,
        isValidating: true,
        history: [...state.history, { action: 'VALIDATION_START', timestamp: Date.now() }]
      };
    }

    case 'VALIDATION_SUCCESS': {
      const { step } = action.payload;
      return {
        ...state,
        isValidating: false,
        currentStep: state.currentStep + 1,
        steps: {
          ...state.steps,
          [step]: {
            ...state.steps[step],
            completed: true,
            errors: {}
          }
        },
        history: [...state.history, { action: 'VALIDATION_SUCCESS', step, timestamp: Date.now() }]
      };
    }

    case 'VALIDATION_ERROR': {
      const { step, errors } = action.payload;
      return {
        ...state,
        isValidating: false,
        steps: {
          ...state.steps,
          [step]: {
            ...state.steps[step],
            errors
          }
        },
        history: [...state.history, { action: 'VALIDATION_ERROR', step, timestamp: Date.now() }]
      };
    }

    case 'STEP_BACK': {
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1),
        submitError: null,
        history: [...state.history, { action: 'STEP_BACK', timestamp: Date.now() }]
      };
    }

    case 'SUBMIT_START': {
      return {
        ...state,
        isSubmitting: true,
        submitError: null,
        history: [...state.history, { action: 'SUBMIT_START', timestamp: Date.now() }]
      };
    }

    case 'SUBMIT_SUCCESS': {
      // Clear sensitive payment data after successful submission
      return {
        ...state,
        isSubmitting: false,
        currentStep: 3, // Confirmation step
        steps: {
          ...state.steps,
          payment: {
            ...state.steps.payment,
            data: {} // Clear payment info
          }
        },
        history: [...state.history, { action: 'SUBMIT_SUCCESS', timestamp: Date.now() }]
      };
    }

    case 'SUBMIT_ERROR': {
      const { error } = action.payload;
      // Clear payment data on error for security
      return {
        ...state,
        isSubmitting: false,
        submitError: error,
        steps: {
          ...state.steps,
          payment: {
            ...state.steps.payment,
            data: {} // Clear payment info
          }
        },
        history: [...state.history, { action: 'SUBMIT_ERROR', error, timestamp: Date.now() }]
      };
    }

    case 'RESET_CHECKOUT': {
      return {
        ...initialState,
        history: [...state.history, { action: 'RESET_CHECKOUT', timestamp: Date.now() }]
      };
    }

    default:
      return state;
  }
}

function CheckoutFlow() {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const currentStepName = STEPS[state.currentStep];
  const currentStepData = state.steps[currentStepName];

  const handleFieldChange = (field, value) => {
    dispatch({
      type: 'FIELD_UPDATE',
      payload: { step: currentStepName, field, value }
    });
  };

  const handleNext = async () => {
    dispatch({ type: 'VALIDATION_START' });

    try {
      const errors = await validateStep(
        currentStepName,
        currentStepData.data
      );

      if (Object.keys(errors).length === 0) {
        dispatch({
          type: 'VALIDATION_SUCCESS',
          payload: { step: currentStepName }
        });
      } else {
        dispatch({
          type: 'VALIDATION_ERROR',
          payload: { step: currentStepName, errors }
        });
      }
    } catch (err) {
      dispatch({
        type: 'VALIDATION_ERROR',
        payload: {
          step: currentStepName,
          errors: { _form: 'Validation failed. Please try again.' }
        }
      });
    }
  };

  const handleBack = () => {
    dispatch({ type: 'STEP_BACK' });
  };

  const handleSubmit = async () => {
    dispatch({ type: 'SUBMIT_START' });

    try {
      const orderData = {
        shipping: state.steps.shipping.data,
        payment: state.steps.payment.data
      };

      await submitOrder(orderData);

      dispatch({ type: 'SUBMIT_SUCCESS' });

      // Log success event
      analytics.track('checkout_completed', {
        duration: calculateDuration(state.history)
      });
    } catch (err) {
      dispatch({
        type: 'SUBMIT_ERROR',
        payload: { error: err.message }
      });

      // Log error with full state history for debugging
      errorReporter.log('checkout_failed', {
        error: err.message,
        history: state.history,
        currentStep: state.currentStep
      });
    }
  };

  // Debug helper (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Checkout State:', state);
    }
  }, [state]);

  return (
    <div className="checkout-flow">
      <StepIndicator current={state.currentStep} steps={STEPS} />

      {state.currentStep === 0 && (
        <ShippingStep
          data={currentStepData.data}
          errors={currentStepData.errors}
          onChange={handleFieldChange}
          isValidating={state.isValidating}
        />
      )}

      {state.currentStep === 1 && (
        <PaymentStep
          data={currentStepData.data}
          errors={currentStepData.errors}
          onChange={handleFieldChange}
          isValidating={state.isValidating}
        />
      )}

      {state.currentStep === 2 && (
        <ReviewStep
          shipping={state.steps.shipping.data}
          payment={state.steps.payment.data}
          isSubmitting={state.isSubmitting}
          submitError={state.submitError}
        />
      )}

      {state.currentStep === 3 && (
        <ConfirmationStep />
      )}

      <div className="checkout-actions">
        {state.currentStep > 0 && state.currentStep < 3 && (
          <button
            onClick={handleBack}
            disabled={state.isValidating || state.isSubmitting}
          >
            Back
          </button>
        )}

        {state.currentStep < 2 && (
          <button
            onClick={handleNext}
            disabled={state.isValidating}
          >
            {state.isValidating ? 'Validating...' : 'Next'}
          </button>
        )}

        {state.currentStep === 2 && (
          <button
            onClick={handleSubmit}
            disabled={state.isSubmitting}
          >
            {state.isSubmitting ? 'Submitting...' : 'Complete Order'}
          </button>
        )}
      </div>
    </div>
  );
}
```

**Results After Fix:**
- Error rate: 8.3% → 1.2% (85% reduction)
- Cart abandonment: 23% → 9% (61% improvement)
- Support tickets: 140 → 18/month (87% reduction)
- Average checkout time: 4.2 → 2.3 minutes (45% faster)
- Debug time: State history reduced investigation time by 70%

**Key Learnings:**
1. Atomic state updates prevent race conditions
2. State history invaluable for debugging production issues
3. Centralized reducer logic easier to test and maintain
4. Security: Automatic cleanup of sensitive data in one place
5. Performance: Single state object reduces re-render coordination

---

### ⚖️ Trade-offs

**useReducer vs useState:**

| Aspect | useReducer | useState |
|--------|------------|----------|
| **Complexity** | Higher learning curve, more boilerplate | Simple, minimal code |
| **Use Case** | Complex state logic, multiple sub-values | Simple values, independent state |
| **Testability** | Pure reducer easy to test in isolation | Test through component |
| **Performance** | Better for complex updates (one dispatch) | Can cause cascade of updates |
| **Type Safety** | TypeScript discriminated unions shine | Simple types sufficient |
| **Code Location** | Centralized state logic | Scattered across component |
| **Debugging** | Action history, time-travel debugging | Harder to track state changes |

**Detailed Comparison:**

```javascript
// Scenario: Shopping cart with quantity, discounts, taxes

// ❌ useState: Multiple related state values
function CartWithUseState() {
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // Problem: Easy to forget to update dependent values
  const addItem = (item) => {
    setItems(prev => [...prev, item]);
    // Forgot to update subtotal, tax, total - BUG!
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    // Have to recalculate everything
    const newSubtotal = calculateSubtotal(items);
    setSubtotal(newSubtotal);
    const newTax = calculateTax(newSubtotal, discount);
    setTax(newTax);
    setTotal(newSubtotal - discount + newTax);
    // Multiple re-renders, potential inconsistency
  };

  const applyDiscount = (code) => {
    const discountAmount = getDiscountAmount(code, subtotal);
    setDiscount(discountAmount);
    // Forgot to update tax and total - BUG!
  };
}

// ✅ useReducer: Single source of truth
function CartWithUseReducer() {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    discount: 0,
    discountCode: null
  });

  // Derived values computed in one place
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = calculateTax(subtotal, state.discount);
  const total = subtotal - state.discount + tax;

  // Simple, consistent actions
  const addItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const applyDiscount = (code) => dispatch({ type: 'APPLY_DISCOUNT', payload: code });

  // All derived calculations happen in render
  // Single re-render, guaranteed consistency
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(i => i.id === action.payload.id);

      if (existingIndex > -1) {
        const newItems = [...state.items];
        newItems[existingIndex].quantity += action.payload.quantity || 1;
        return { ...state, items: newItems };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.payload)
      };

    case 'APPLY_DISCOUNT': {
      const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discount = calculateDiscount(action.payload, subtotal);

      return {
        ...state,
        discount,
        discountCode: action.payload
      };
    }

    default:
      return state;
  }
}
```

**useReducer vs Redux:**

| Aspect | useReducer | Redux |
|--------|------------|-------|
| **Scope** | Component/local tree | Global application state |
| **Setup** | Zero config, built-in Hook | Store config, provider, middleware |
| **DevTools** | Limited (custom logging) | Time-travel, action history, state diff |
| **Middleware** | Manual implementation | Rich ecosystem (thunks, sagas, etc.) |
| **Performance** | Re-renders component tree | Selector-based subscriptions |
| **Learning Curve** | Low (just React) | High (Redux concepts, best practices) |
| **Use Case** | Form state, UI state, feature-level | Cross-cutting concerns, shared state |

**When to Upgrade from useReducer to Redux:**

```javascript
// Signs you need Redux:

// 1. State needed in many distant components
// ❌ Prop drilling hell
function App() {
  const [user, dispatch] = useReducer(userReducer, null);

  return (
    <Layout user={user} dispatch={dispatch}>
      <Header user={user} dispatch={dispatch}>
        <UserMenu user={user} dispatch={dispatch} />
      </Header>
      <Sidebar user={user} dispatch={dispatch}>
        <UserProfile user={user} dispatch={dispatch} />
      </Sidebar>
      <Main user={user} dispatch={dispatch}>
        <Dashboard user={user} dispatch={dispatch} />
      </Main>
    </Layout>
  );
}

// ✅ Redux: No prop drilling
function App() {
  return (
    <Provider store={store}>
      <Layout>
        <Header>
          <UserMenu /> {/* useSelector internally */}
        </Header>
        <Sidebar>
          <UserProfile />
        </Sidebar>
        <Main>
          <Dashboard />
        </Main>
      </Layout>
    </Provider>
  );
}

// 2. Complex async logic with side effects
// ❌ useReducer: Manual side effect handling
function DataFetcher() {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'FETCH_START' });

    fetch('/api/data')
      .then(res => res.json())
      .then(data => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
      .catch(err => dispatch({ type: 'FETCH_ERROR', payload: err }));
  }, []);

  // Have to handle side effects in useEffect
  // No middleware, no request cancellation
}

// ✅ Redux with Redux Thunk: Built-in async handling
const fetchData = () => async (dispatch, getState) => {
  dispatch({ type: 'FETCH_START' });

  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    dispatch({ type: 'FETCH_SUCCESS', payload: data });

    // Access other state if needed
    const currentState = getState();
    if (currentState.user.preferences.autoRefresh) {
      setTimeout(() => dispatch(fetchData()), 30000);
    }
  } catch (err) {
    dispatch({ type: 'FETCH_ERROR', payload: err.message });
  }
};

// 3. Need for advanced DevTools
// Redux DevTools provides:
// - Time-travel debugging
// - Action replay
// - State diff visualization
// - Export/import state snapshots
// - Performance monitoring
```

**Performance Considerations:**

```javascript
// useReducer optimization patterns

// ✅ GOOD: Memoize dispatch with useCallback
function TodoList() {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  // dispatch is stable, but callbacks are not
  const handleAdd = useCallback((text) => {
    dispatch({ type: 'ADD_TODO', payload: { text, id: Date.now() } });
  }, [dispatch]); // dispatch never changes, but include for clarity

  return (
    <div>
      <TodoForm onAdd={handleAdd} /> {/* Won't re-render */}
      <TodoItems items={state.todos} />
    </div>
  );
}

// ✅ GOOD: Split large state into multiple reducers
function ComplexApp() {
  const [userState, userDispatch] = useReducer(userReducer, userInitialState);
  const [uiState, uiDispatch] = useReducer(uiReducer, uiInitialState);
  const [dataState, dataDispatch] = useReducer(dataReducer, dataInitialState);

  // Each reducer handles independent concerns
  // Changes to UI don't re-render user-dependent components

  return (
    <UserContext.Provider value={{ state: userState, dispatch: userDispatch }}>
      <UIContext.Provider value={{ state: uiState, dispatch: uiDispatch }}>
        <DataContext.Provider value={{ state: dataState, dispatch: dataDispatch }}>
          <App />
        </DataContext.Provider>
      </UIContext.Provider>
    </UserContext.Provider>
  );
}

// ❌ BAD: Single massive reducer for everything
function BadApp() {
  const [state, dispatch] = useReducer(massiveReducer, {
    user: {},
    ui: {},
    data: {},
    forms: {},
    modals: {},
    // ... 20 more properties
  });

  // Any state change re-renders entire tree
  // Hard to optimize
}
```

**Decision Matrix:**

**Use useState when:**
- Single primitive value or simple object
- Independent state (no complex relationships)
- Updates are straightforward (direct assignments)
- No need for action history or debugging

**Use useReducer when:**
- Complex state object with multiple sub-values
- Next state depends on previous (complex transitions)
- Multiple related state updates (atomicity needed)
- Testing state logic in isolation is important
- Performance optimization with stable dispatch

**Use Redux when:**
- State shared across many distant components
- Complex async logic with middleware needs
- Need advanced debugging (time-travel, replays)
- Team familiar with Redux patterns
- Integration with existing Redux ecosystem

---

### 💬 Explain to Junior

**Simple Analogy:**

Imagine you're managing a restaurant order:

**useState = Direct Instructions:**
"Add fries to order. Update total. Add drink. Update total. Apply discount. Update total."

Each instruction is independent. If you forget one step, things get messy. If someone asks, "What did I order?", you have to remember each individual change.

**useReducer = Order Form with Rules:**
You have a form where customers fill out orders. The kitchen (reducer) has a rule book:
- Action: "ADD_ITEM" → Check menu, add to order, recalculate total
- Action: "REMOVE_ITEM" → Find item, remove, recalculate total
- Action: "APPLY_DISCOUNT" → Validate code, apply discount, recalculate total

All the logic is in the kitchen's rule book. You just send actions like "Add burger" and the kitchen handles all the calculations consistently. If there's a mistake, you can review the order form (action history) to see what happened.

**Real Code Explanation:**

```javascript
// Think of useReducer as a "state machine" with rules

// Step 1: Define initial state (starting point)
const initialState = {
  count: 0,
  history: []
};

// Step 2: Define reducer (rule book)
// Reducer = function that takes (current state, action) and returns new state
function counterReducer(state, action) {
  // "action" is an object with a "type" (what to do)
  switch (action.type) {
    case 'INCREMENT':
      // Return NEW state (don't modify old state)
      return {
        count: state.count + 1,
        history: [...state.history, 'incremented']
      };

    case 'DECREMENT':
      return {
        count: state.count - 1,
        history: [...state.history, 'decremented']
      };

    case 'RESET':
      return initialState; // Back to start

    default:
      return state; // Unknown action = no change
  }
}

// Step 3: Use the reducer in component
function Counter() {
  // useReducer returns [current state, dispatch function]
  const [state, dispatch] = useReducer(counterReducer, initialState);

  // To update state, "dispatch" an action
  const handleIncrement = () => {
    dispatch({ type: 'INCREMENT' });
    // React will call: counterReducer(currentState, { type: 'INCREMENT' })
    // Then update state with returned value
  };

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={handleIncrement}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      <p>History: {state.history.join(', ')}</p>
    </div>
  );
}
```

**When Would I Use This in Real Life?**

**Scenario: Todo List**

```javascript
// ❌ With useState: Gets messy quickly
function TodoListBad() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [completedCount, setCompletedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, completed: false }]);
    setActiveCount(activeCount + 1); // Have to remember to update this
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    // Now have to update counts - easy to forget!
    // What if todo was completed? Decrement completed, increment active
    // What if todo was active? Increment completed, decrement active
    // This logic gets scattered and buggy
  };
}

// ✅ With useReducer: Clean and consistent
const initialTodoState = {
  todos: [],
  filter: 'all'
};

function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, {
          id: Date.now(),
          text: action.payload,
          completed: false
        }]
      };

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      };

    default:
      return state;
  }
}

function TodoListGood() {
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);

  // Calculate counts from state (no need to track separately)
  const completedCount = state.todos.filter(t => t.completed).length;
  const activeCount = state.todos.filter(t => !t.completed).length;

  // Filter todos based on current filter
  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === 'active') return !todo.completed;
    if (state.filter === 'completed') return todo.completed;
    return true; // 'all'
  });

  return (
    <div>
      <input
        type="text"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            dispatch({ type: 'ADD_TODO', payload: e.target.value });
            e.target.value = '';
          }
        }}
      />

      <div>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}>
          All ({state.todos.length})
        </button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'active' })}>
          Active ({activeCount})
        </button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'completed' })}>
          Completed ({completedCount})
        </button>
      </div>

      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Interview Answer Template:**

"useReducer is a React Hook for managing complex state with a reducer function. You give it a reducer (a function that defines how state changes based on actions) and initial state. It returns the current state and a dispatch function to trigger updates.

I use useReducer when state has multiple related properties that need to update together, like a form with values, errors, and validation state. The reducer centralizes all update logic in one place, making it predictable and testable.

For example, in a checkout flow, I might have shipping info, payment info, and validation errors. With useState, I'd need multiple state variables and risk them getting out of sync. With useReducer, I dispatch actions like 'UPDATE_FIELD' or 'VALIDATE_STEP' and the reducer ensures all related state updates happen correctly.

The dispatch function is stable across re-renders, so it's safe to pass to child components without causing extra renders. This makes it great for performance optimization too."

**Common Interview Questions:**

1. **What's the difference between useReducer and useState?**
   - useState: Simple state, direct updates
   - useReducer: Complex state, centralized logic via reducer
   - Use useReducer when next state depends on previous in complex ways

2. **How does dispatch work?**
   - Dispatch sends an action to the reducer
   - Reducer calculates new state based on action
   - React updates component with new state
   - Dispatch identity is stable (never changes)

3. **Can you use useReducer with Context?**
   - Yes! Common pattern for component tree state management
   - Put state and dispatch in Context.Provider
   - Child components access via useContext
   - Alternative to prop drilling

4. **How to handle async actions with useReducer?**
   - Dispatch action before async operation (FETCH_START)
   - Perform async work in useEffect or event handler
   - Dispatch success/error action when complete (FETCH_SUCCESS/FETCH_ERROR)
   - Reducer handles all three states

---

## Question 2: How to implement complex state logic with useReducer?

**Answer:**

Implementing complex state logic with `useReducer` involves designing a well-structured state object, defining clear action types, and writing a comprehensive reducer function that handles all state transitions predictably. The key is to break down complex operations into discrete actions and let the reducer manage the intricate state relationships.

For complex state logic, follow these principles:

1. **Normalize State Structure:** Flatten nested data and use IDs for relationships instead of direct references
2. **Action Naming Convention:** Use domain-specific action types that describe business events (e.g., `ORDER_SUBMITTED`, not `SET_LOADING`)
3. **Atomic Updates:** Each action should represent a complete state transition, not partial updates
4. **Immutable Updates:** Always return new state objects; never mutate existing state
5. **Validation in Reducer:** Put business rules and constraints in the reducer for consistency

Example pattern for complex state:

```javascript
const initialState = {
  // Entities (normalized data)
  entities: {
    users: {},
    posts: {},
    comments: {}
  },

  // UI state
  ui: {
    isLoading: false,
    activeModal: null,
    selectedIds: []
  },

  // Domain state
  domain: {
    currentUserId: null,
    filter: 'all',
    sortBy: 'date'
  },

  // Error state
  errors: {
    form: {},
    api: null
  }
};

function complexReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        ui: { ...state.ui, isLoading: true },
        errors: { ...state.errors, api: null }
      };

    case 'FETCH_SUCCESS':
      // Normalize data on arrival
      const { users, posts } = normalizeData(action.payload);
      return {
        ...state,
        entities: {
          ...state.entities,
          users: { ...state.entities.users, ...users },
          posts: { ...state.entities.posts, ...posts }
        },
        ui: { ...state.ui, isLoading: false }
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        ui: { ...state.ui, isLoading: false },
        errors: { ...state.errors, api: action.payload }
      };

    default:
      return state;
  }
}
```

For truly complex state logic, consider these advanced patterns:
- **Immer integration** for easier immutable updates
- **Action creators** for validation and consistency
- **Reducer composition** to split logic into smaller functions
- **Middleware pattern** for side effects and logging
- **State machines** for explicit state transitions

---

### 🔍 Deep Dive

**State Normalization Patterns:**

Complex applications often deal with relational data. Normalizing state prevents duplication and makes updates efficient:

```javascript
// ❌ BAD: Nested, denormalized state
const badState = {
  posts: [
    {
      id: 1,
      title: 'Post 1',
      author: { id: 10, name: 'John', avatar: 'url1' },
      comments: [
        { id: 100, text: 'Great!', author: { id: 10, name: 'John', avatar: 'url1' } },
        { id: 101, text: 'Thanks!', author: { id: 11, name: 'Jane', avatar: 'url2' } }
      ]
    },
    {
      id: 2,
      title: 'Post 2',
      author: { id: 11, name: 'Jane', avatar: 'url2' },
      comments: []
    }
  ]
};

// Problem: If John updates his name, have to update multiple places
// Problem: Hard to find all posts by a user
// Problem: Inefficient to update a single comment

// ✅ GOOD: Normalized state (inspired by Redux patterns)
const goodState = {
  entities: {
    users: {
      10: { id: 10, name: 'John', avatar: 'url1' },
      11: { id: 11, name: 'Jane', avatar: 'url2' }
    },
    posts: {
      1: { id: 1, title: 'Post 1', authorId: 10, commentIds: [100, 101] },
      2: { id: 2, title: 'Post 2', authorId: 11, commentIds: [] }
    },
    comments: {
      100: { id: 100, text: 'Great!', authorId: 10, postId: 1 },
      101: { id: 101, text: 'Thanks!', authorId: 11, postId: 1 }
    }
  },

  // UI state separate from data
  ui: {
    currentPostId: 1,
    isLoadingPosts: false,
    isLoadingComments: false
  }
};

// Benefits:
// 1. Update John's name in ONE place: state.entities.users[10].name
// 2. Find all posts by user: Object.values(state.entities.posts).filter(p => p.authorId === 10)
// 3. Update single comment: state.entities.comments[100].text = 'Updated'
// 4. No data duplication
```

**Normalization with useReducer:**

```javascript
// Utility: Normalize API response
function normalizeEntities(data, entityType, schema) {
  const entities = {};

  data.forEach(item => {
    // Extract nested entities based on schema
    const normalized = { ...item };

    Object.keys(schema).forEach(key => {
      if (schema[key].type === 'reference') {
        // Replace nested object with ID reference
        normalized[`${key}Id`] = item[key].id;
        delete normalized[key];

        // Store nested entity separately
        if (!entities[schema[key].entity]) {
          entities[schema[key].entity] = {};
        }
        entities[schema[key].entity][item[key].id] = item[key];
      } else if (schema[key].type === 'referenceList') {
        // Replace nested array with ID array
        normalized[`${key}Ids`] = item[key].map(ref => ref.id);
        delete normalized[key];

        // Store each nested entity
        if (!entities[schema[key].entity]) {
          entities[schema[key].entity] = {};
        }
        item[key].forEach(ref => {
          entities[schema[key].entity][ref.id] = ref;
        });
      }
    });

    if (!entities[entityType]) {
      entities[entityType] = {};
    }
    entities[entityType][item.id] = normalized;
  });

  return entities;
}

// Schema definition
const postSchema = {
  author: { type: 'reference', entity: 'users' },
  comments: { type: 'referenceList', entity: 'comments' }
};

// Reducer with normalization
function socialReducer(state, action) {
  switch (action.type) {
    case 'LOAD_POSTS_SUCCESS': {
      const entities = normalizeEntities(action.payload, 'posts', postSchema);

      return {
        ...state,
        entities: {
          users: { ...state.entities.users, ...entities.users },
          posts: { ...state.entities.posts, ...entities.posts },
          comments: { ...state.entities.comments, ...entities.comments }
        },
        ui: { ...state.ui, isLoadingPosts: false }
      };
    }

    case 'ADD_COMMENT': {
      const { postId, text, authorId } = action.payload;
      const commentId = Date.now();

      return {
        ...state,
        entities: {
          ...state.entities,
          comments: {
            ...state.entities.comments,
            [commentId]: { id: commentId, text, authorId, postId }
          },
          posts: {
            ...state.entities.posts,
            [postId]: {
              ...state.entities.posts[postId],
              commentIds: [...state.entities.posts[postId].commentIds, commentId]
            }
          }
        }
      };
    }

    case 'UPDATE_USER_NAME': {
      const { userId, name } = action.payload;

      // Only need to update one place!
      return {
        ...state,
        entities: {
          ...state.entities,
          users: {
            ...state.entities.users,
            [userId]: {
              ...state.entities.users[userId],
              name
            }
          }
        }
      };
    }

    default:
      return state;
  }
}

// Selectors: Denormalize data for components
function selectPostWithAuthorAndComments(state, postId) {
  const post = state.entities.posts[postId];
  if (!post) return null;

  return {
    ...post,
    author: state.entities.users[post.authorId],
    comments: post.commentIds.map(id => ({
      ...state.entities.comments[id],
      author: state.entities.users[state.entities.comments[id].authorId]
    }))
  };
}
```

**Immer Integration for Simpler Updates:**

Immer allows writing "mutating" code that produces immutable updates:

```javascript
import { useReducer } from 'react';
import { produce } from 'immer';

// ❌ Without Immer: Verbose nested updates
function complexReducerWithoutImmer(state, action) {
  switch (action.type) {
    case 'UPDATE_NESTED_FIELD':
      return {
        ...state,
        form: {
          ...state.form,
          sections: {
            ...state.form.sections,
            personal: {
              ...state.form.sections.personal,
              address: {
                ...state.form.sections.personal.address,
                street: action.payload
              }
            }
          }
        }
      };

    case 'ADD_ARRAY_ITEM':
      return {
        ...state,
        items: [
          ...state.items.slice(0, action.index),
          action.payload,
          ...state.items.slice(action.index)
        ]
      };

    default:
      return state;
  }
}

// ✅ With Immer: Simple, readable "mutations"
const complexReducerWithImmer = produce((draft, action) => {
  switch (action.type) {
    case 'UPDATE_NESTED_FIELD':
      // Looks like mutation, but Immer makes it immutable
      draft.form.sections.personal.address.street = action.payload;
      break;

    case 'ADD_ARRAY_ITEM':
      draft.items.splice(action.index, 0, action.payload);
      break;

    case 'REMOVE_ARRAY_ITEM':
      const index = draft.items.findIndex(item => item.id === action.payload);
      if (index > -1) {
        draft.items.splice(index, 1);
      }
      break;

    case 'UPDATE_MULTIPLE_FIELDS':
      // Can make multiple "mutations" in one action
      draft.user.name = action.payload.name;
      draft.user.email = action.payload.email;
      draft.user.lastUpdated = Date.now();
      draft.ui.isEditing = false;
      break;

    case 'TOGGLE_ITEM':
      const item = draft.items.find(item => item.id === action.payload);
      if (item) {
        item.completed = !item.completed;
        // Update related state
        if (item.completed) {
          draft.stats.completed += 1;
          draft.stats.active -= 1;
        } else {
          draft.stats.completed -= 1;
          draft.stats.active += 1;
        }
      }
      break;
  }
});

// Use with useReducer
function ComplexForm() {
  const [state, dispatch] = useReducer(complexReducerWithImmer, initialState);

  // All updates are still immutable under the hood
  // But code is much more readable and maintainable
}
```

**Reducer Composition (Split Complex Logic):**

```javascript
// Break large reducer into smaller, focused reducers

// User reducer
function userReducer(state, action) {
  switch (action.type) {
    case 'USER_LOGIN':
      return { ...state, currentUser: action.payload, isAuthenticated: true };
    case 'USER_LOGOUT':
      return { ...state, currentUser: null, isAuthenticated: false };
    case 'USER_UPDATE_PROFILE':
      return { ...state, currentUser: { ...state.currentUser, ...action.payload } };
    default:
      return state;
  }
}

// UI reducer
function uiReducer(state, action) {
  switch (action.type) {
    case 'MODAL_OPEN':
      return { ...state, activeModal: action.payload };
    case 'MODAL_CLOSE':
      return { ...state, activeModal: null };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    default:
      return state;
  }
}

// Data reducer
function dataReducer(state, action) {
  switch (action.type) {
    case 'DATA_FETCH_START':
      return { ...state, loading: true, error: null };
    case 'DATA_FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'DATA_FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

// Root reducer combines sub-reducers
function rootReducer(state, action) {
  return {
    user: userReducer(state.user, action),
    ui: uiReducer(state.ui, action),
    data: dataReducer(state.data, action)
  };
}

// Use combined reducer
function App() {
  const [state, dispatch] = useReducer(rootReducer, {
    user: { currentUser: null, isAuthenticated: false },
    ui: { activeModal: null, sidebarOpen: false },
    data: { loading: false, items: [], error: null }
  });

  // All sub-reducers can respond to the same action if needed
  // Example: USER_LOGOUT might clear data and reset UI in addition to user state
}

// Advanced: Sub-reducers can respond to cross-cutting actions
function dataReducer(state, action) {
  switch (action.type) {
    case 'DATA_FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload };

    case 'USER_LOGOUT':
      // Clear data when user logs out
      return { ...state, items: [], error: null };

    default:
      return state;
  }
}
```

**Middleware Pattern for Side Effects:**

```javascript
// Custom middleware for logging, analytics, async actions

function createReducerWithMiddleware(reducer, middleware) {
  return (state, action) => {
    // Run middleware before reducer
    const context = { getState: () => state };
    const next = middleware(context)(action);

    if (next) {
      // Middleware can modify or block action
      return reducer(state, next);
    }

    return state;
  };
}

// Logging middleware
const loggingMiddleware = ({ getState }) => (action) => {
  console.group(`Action: ${action.type}`);
  console.log('Previous State:', getState());
  console.log('Action:', action);

  // Return action to pass to next middleware/reducer
  return action;
};

// Analytics middleware
const analyticsMiddleware = ({ getState }) => (action) => {
  // Send certain actions to analytics
  if (action.type.startsWith('USER_')) {
    analytics.track(action.type, {
      userId: getState().user.currentUser?.id,
      timestamp: Date.now(),
      payload: action.payload
    });
  }

  return action;
};

// Async action middleware
const asyncMiddleware = ({ getState }) => (action) => {
  // If action has a promise, handle it
  if (action.payload && typeof action.payload.then === 'function') {
    action.payload
      .then(result => {
        dispatch({ type: `${action.type}_SUCCESS`, payload: result });
      })
      .catch(error => {
        dispatch({ type: `${action.type}_ERROR`, payload: error });
      });

    return { type: `${action.type}_START` };
  }

  return action;
};

// Compose multiple middleware
function composeMiddleware(...middlewares) {
  return (context) => (action) => {
    return middlewares.reduce((acc, middleware) => {
      return middleware(context)(acc);
    }, action);
  };
}

// Usage
function useReducerWithMiddleware(reducer, initialState, middleware) {
  const middlewareRef = useRef(middleware);
  const reducerWithMiddleware = useMemo(
    () => createReducerWithMiddleware(reducer, middlewareRef.current),
    [reducer]
  );

  return useReducer(reducerWithMiddleware, initialState);
}

function App() {
  const middleware = composeMiddleware(
    loggingMiddleware,
    analyticsMiddleware,
    asyncMiddleware
  );

  const [state, dispatch] = useReducerWithMiddleware(
    rootReducer,
    initialState,
    middleware
  );
}
```

**State Machine Pattern:**

Explicit state transitions prevent invalid states:

```javascript
// Example: File upload state machine

const UPLOAD_STATES = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Define valid transitions
const VALID_TRANSITIONS = {
  [UPLOAD_STATES.IDLE]: [UPLOAD_STATES.VALIDATING],
  [UPLOAD_STATES.VALIDATING]: [UPLOAD_STATES.IDLE, UPLOAD_STATES.UPLOADING, UPLOAD_STATES.ERROR],
  [UPLOAD_STATES.UPLOADING]: [UPLOAD_STATES.SUCCESS, UPLOAD_STATES.ERROR],
  [UPLOAD_STATES.SUCCESS]: [UPLOAD_STATES.IDLE],
  [UPLOAD_STATES.ERROR]: [UPLOAD_STATES.IDLE]
};

function uploadReducer(state, action) {
  // Helper: Check if transition is valid
  const canTransition = (from, to) => {
    return VALID_TRANSITIONS[from]?.includes(to);
  };

  switch (action.type) {
    case 'START_VALIDATION': {
      if (!canTransition(state.status, UPLOAD_STATES.VALIDATING)) {
        console.warn('Invalid transition:', state.status, '→', UPLOAD_STATES.VALIDATING);
        return state;
      }

      return {
        ...state,
        status: UPLOAD_STATES.VALIDATING,
        error: null
      };
    }

    case 'VALIDATION_SUCCESS': {
      if (!canTransition(state.status, UPLOAD_STATES.UPLOADING)) {
        console.warn('Invalid transition:', state.status, '→', UPLOAD_STATES.UPLOADING);
        return state;
      }

      return {
        ...state,
        status: UPLOAD_STATES.UPLOADING,
        progress: 0
      };
    }

    case 'UPLOAD_PROGRESS': {
      if (state.status !== UPLOAD_STATES.UPLOADING) {
        console.warn('Cannot update progress in state:', state.status);
        return state;
      }

      return {
        ...state,
        progress: action.payload
      };
    }

    case 'UPLOAD_SUCCESS': {
      if (!canTransition(state.status, UPLOAD_STATES.SUCCESS)) {
        console.warn('Invalid transition:', state.status, '→', UPLOAD_STATES.SUCCESS);
        return state;
      }

      return {
        ...state,
        status: UPLOAD_STATES.SUCCESS,
        fileUrl: action.payload
      };
    }

    case 'UPLOAD_ERROR': {
      if (!canTransition(state.status, UPLOAD_STATES.ERROR)) {
        console.warn('Invalid transition:', state.status, '→', UPLOAD_STATES.ERROR);
        return state;
      }

      return {
        ...state,
        status: UPLOAD_STATES.ERROR,
        error: action.payload
      };
    }

    case 'RESET': {
      if (!canTransition(state.status, UPLOAD_STATES.IDLE)) {
        console.warn('Invalid transition:', state.status, '→', UPLOAD_STATES.IDLE);
        return state;
      }

      return {
        ...state,
        status: UPLOAD_STATES.IDLE,
        file: null,
        progress: 0,
        fileUrl: null,
        error: null
      };
    }

    default:
      return state;
  }
}

// This prevents bugs like:
// - Starting upload without validation
// - Updating progress after error
// - Trying to upload while already uploading
```

---

### 🐛 Real-World Scenario

**Production Bug: Race Conditions in Multi-Step Wizard**

**Context:** SaaS onboarding wizard with 5 steps (account, profile, preferences, integrations, confirmation). Users experienced data loss, infinite loading states, and duplicate API calls due to complex async state management.

**Initial Implementation (Buggy):**

```javascript
// ❌ BAD: Multiple useState creating race conditions
function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [accountData, setAccountData] = useState({});
  const [profileData, setProfileData] = useState({});
  const [preferencesData, setPreferencesData] = useState({});
  const [integrationsData, setIntegrationsData] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState([]);

  const handleNext = async () => {
    setIsValidating(true);

    try {
      const valid = await validateCurrentStep();

      if (valid) {
        // Bug: What if user clicks again before this completes?
        setIsSaving(true);
        await saveStepData(getCurrentStepData());
        setIsSaving(false);

        // Bug: State updates may be out of order
        setCompletedSteps([...completedSteps, currentStep]);
        setCurrentStep(currentStep + 1);
        setErrors({});
      } else {
        setErrors(await getValidationErrors());
      }
    } catch (err) {
      // Bug: isSaving might not be set to false if validation throws
      setErrors({ api: err.message });
    } finally {
      setIsValidating(false);
    }
  };

  // Bug: Race condition if called multiple times rapidly
  const handleSkipStep = async () => {
    setIsSaving(true);
    await markStepAsSkipped(currentStep);
    setCurrentStep(currentStep + 1);
    setIsSaving(false);
    // Forgot to update completedSteps - inconsistency!
  };

  // Bug: No protection against going to invalid steps
  const jumpToStep = (step) => {
    setCurrentStep(step);
    // Lost current step's unsaved data!
  };
}
```

**Metrics:**
- Error rate: 12.4% of users encountered errors
- Completion rate: Only 47% finished onboarding
- Support tickets: 230+ per month about "stuck" onboarding
- Average time: 8.3 minutes (target: 5 minutes)
- Data loss: 15% of sessions lost partial data

**Root Cause Analysis:**

1. **Race Conditions:** Multiple async operations could run simultaneously
2. **Inconsistent State:** completedSteps not always in sync with currentStep
3. **No Request Cancellation:** Old requests completing after new ones started
4. **Lost Data:** Jump to step discarded unsaved changes
5. **No Undo/Retry:** Errors left user stuck with no recovery path

**Solution with Complex useReducer:**

```javascript
// ✅ GOOD: Comprehensive state machine with useReducer

const STEP_NAMES = ['account', 'profile', 'preferences', 'integrations', 'confirmation'];

const STEP_STATUS = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  SAVING: 'saving',
  COMPLETED: 'completed',
  ERROR: 'error',
  SKIPPED: 'skipped'
};

const initialState = {
  currentStepIndex: 0,

  steps: {
    account: {
      status: STEP_STATUS.IDLE,
      data: {},
      errors: {},
      savedData: null,
      lastValidated: null
    },
    profile: {
      status: STEP_STATUS.IDLE,
      data: {},
      errors: {},
      savedData: null,
      lastValidated: null
    },
    preferences: {
      status: STEP_STATUS.IDLE,
      data: {},
      errors: {},
      savedData: null,
      lastValidated: null
    },
    integrations: {
      status: STEP_STATUS.IDLE,
      data: {},
      errors: {},
      savedData: null,
      lastValidated: null
    }
  },

  // Request tracking
  activeRequests: {
    validation: null,
    save: null
  },

  // Navigation history for undo
  history: [],

  // Global state
  canNavigate: true,
  hasUnsavedChanges: false
};

function onboardingReducer(state, action) {
  switch (action.type) {
    case 'FIELD_UPDATE': {
      const { step, field, value } = action.payload;

      return {
        ...state,
        steps: {
          ...state.steps,
          [step]: {
            ...state.steps[step],
            data: {
              ...state.steps[step].data,
              [field]: value
            },
            // Clear field-specific error
            errors: {
              ...state.steps[step].errors,
              [field]: undefined
            }
          }
        },
        hasUnsavedChanges: true,
        history: [...state.history, {
          type: 'FIELD_UPDATE',
          timestamp: Date.now(),
          step,
          field,
          previousValue: state.steps[step].data[field],
          newValue: value
        }]
      };
    }

    case 'VALIDATION_START': {
      const { step, requestId } = action.payload;

      return {
        ...state,
        steps: {
          ...state.steps,
          [step]: {
            ...state.steps[step],
            status: STEP_STATUS.VALIDATING,
            errors: {}
          }
        },
        activeRequests: {
          ...state.activeRequests,
          validation: requestId
        },
        canNavigate: false,
        history: [...state.history, {
          type: 'VALIDATION_START',
          timestamp: Date.now(),
          step,
          requestId
        }]
      };
    }

    case 'VALIDATION_SUCCESS': {
      const { step, requestId } = action.payload;

      // Ignore if not the current request
      if (state.activeRequests.validation !== requestId) {
        console.log('Ignoring outdated validation response:', requestId);
        return state;
      }

      return {
        ...state,
        steps: {
          ...state.steps,
          [step]: {
            ...state.steps[step],
            status: STEP_STATUS.IDLE,
            lastValidated: Date.now()
          }
        },
        activeRequests: {
          ...state.activeRequests,
          validation: null
        },
        canNavigate: true,
        history: [...state.history, {
          type: 'VALIDATION_SUCCESS',
          timestamp: Date.now(),
          step,
          requestId
        }]
      };
    }

    case 'VALIDATION_ERROR': {
      const { step, errors, requestId } = action.payload;

      // Ignore if not the current request
      if (state.activeRequests.validation !== requestId) {
        return state;
      }

      return {
        ...state,
        steps: {
          ...state.steps,
          [step]: {
            ...state.steps[step],
            status: STEP_STATUS.ERROR,
            errors
          }
        },
        activeRequests: {
          ...state.activeRequests,
          validation: null
        },
        canNavigate: true,
        history: [...state.history, {
          type: 'VALIDATION_ERROR',
          timestamp: Date.now(),
          step,
          errors,
          requestId
        }]
      };
    }

    case 'SAVE_START': {
      const { step, requestId } = action.payload;

      return {
        ...state,
        steps: {
          ...state.steps,
          [step]: {
            ...state.steps[step],
            status: STEP_STATUS.SAVING
          }
        },
        activeRequests: {
          ...state.activeRequests,
          save: requestId
        },
        canNavigate: false,
        history: [...state.history, {
          type: 'SAVE_START',
          timestamp: Date.now(),
          step,
          requestId
        }]
      };
    }

    case 'SAVE_SUCCESS': {
      const { step, savedData, requestId } = action.payload;

      if (state.activeRequests.save !== requestId) {
        return state;
      }

      return {
        ...state,
        currentStepIndex: state.currentStepIndex + 1,
        steps: {
          ...state.steps,
          [step]: {
            ...state.steps[step],
            status: STEP_STATUS.COMPLETED,
            savedData,
            data: savedData // Sync data with saved
          }
        },
        activeRequests: {
          ...state.activeRequests,
          save: null
        },
        canNavigate: true,
        hasUnsavedChanges: false,
        history: [...state.history, {
          type: 'SAVE_SUCCESS',
          timestamp: Date.now(),
          step,
          requestId
        }]
      };
    }

    case 'SAVE_ERROR': {
      const { step, error, requestId } = action.payload;

      if (state.activeRequests.save !== requestId) {
        return state;
      }

      return {
        ...state,
        steps: {
          ...state.steps,
          [step]: {
            ...state.steps[step],
            status: STEP_STATUS.ERROR,
            errors: { _form: error }
          }
        },
        activeRequests: {
          ...state.activeRequests,
          save: null
        },
        canNavigate: true,
        history: [...state.history, {
          type: 'SAVE_ERROR',
          timestamp: Date.now(),
          step,
          error,
          requestId
        }]
      };
    }

    case 'SKIP_STEP': {
      const { step } = action.payload;

      return {
        ...state,
        currentStepIndex: state.currentStepIndex + 1,
        steps: {
          ...state.steps,
          [step]: {
            ...state.steps[step],
            status: STEP_STATUS.SKIPPED
          }
        },
        hasUnsavedChanges: false,
        history: [...state.history, {
          type: 'SKIP_STEP',
          timestamp: Date.now(),
          step
        }]
      };
    }

    case 'JUMP_TO_STEP': {
      const { stepIndex } = action.payload;

      // Validate navigation
      if (stepIndex < 0 || stepIndex >= STEP_NAMES.length) {
        console.warn('Invalid step index:', stepIndex);
        return state;
      }

      // Prevent jumping ahead of completed steps
      const maxAllowedStep = Math.max(
        ...Object.keys(state.steps)
          .filter(key => [STEP_STATUS.COMPLETED, STEP_STATUS.SKIPPED].includes(state.steps[key].status))
          .map(key => STEP_NAMES.indexOf(key))
      ) + 1;

      if (stepIndex > maxAllowedStep) {
        console.warn('Cannot jump ahead of completed steps');
        return state;
      }

      // Warn about unsaved changes
      const currentStep = STEP_NAMES[state.currentStepIndex];
      if (state.hasUnsavedChanges) {
        // In production, show confirmation modal
        console.warn('Unsaved changes will be lost');
      }

      return {
        ...state,
        currentStepIndex: stepIndex,
        hasUnsavedChanges: false,
        history: [...state.history, {
          type: 'JUMP_TO_STEP',
          timestamp: Date.now(),
          from: state.currentStepIndex,
          to: stepIndex
        }]
      };
    }

    case 'CANCEL_REQUESTS': {
      return {
        ...state,
        activeRequests: {
          validation: null,
          save: null
        },
        canNavigate: true
      };
    }

    case 'RESET_ONBOARDING': {
      return initialState;
    }

    default:
      return state;
  }
}

function OnboardingWizard() {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  const currentStep = STEP_NAMES[state.currentStepIndex];
  const currentStepData = state.steps[currentStep];

  // Abort controllers for request cancellation
  const abortControllers = useRef({
    validation: null,
    save: null
  });

  const handleFieldChange = (field, value) => {
    dispatch({
      type: 'FIELD_UPDATE',
      payload: { step: currentStep, field, value }
    });
  };

  const handleNext = async () => {
    // Cancel any ongoing validation
    abortControllers.current.validation?.abort();

    const requestId = Date.now();
    const controller = new AbortController();
    abortControllers.current.validation = controller;

    dispatch({
      type: 'VALIDATION_START',
      payload: { step: currentStep, requestId }
    });

    try {
      const errors = await validateStep(
        currentStep,
        currentStepData.data,
        { signal: controller.signal }
      );

      if (Object.keys(errors).length === 0) {
        // Validation successful, now save
        dispatch({
          type: 'VALIDATION_SUCCESS',
          payload: { step: currentStep, requestId }
        });

        // Cancel any ongoing save
        abortControllers.current.save?.abort();

        const saveRequestId = Date.now();
        const saveController = new AbortController();
        abortControllers.current.save = saveController;

        dispatch({
          type: 'SAVE_START',
          payload: { step: currentStep, requestId: saveRequestId }
        });

        const savedData = await saveStepData(
          currentStep,
          currentStepData.data,
          { signal: saveController.signal }
        );

        dispatch({
          type: 'SAVE_SUCCESS',
          payload: { step: currentStep, savedData, requestId: saveRequestId }
        });

        analytics.track('onboarding_step_completed', {
          step: currentStep,
          stepIndex: state.currentStepIndex
        });
      } else {
        dispatch({
          type: 'VALIDATION_ERROR',
          payload: { step: currentStep, errors, requestId }
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request cancelled');
        return;
      }

      dispatch({
        type: 'VALIDATION_ERROR',
        payload: {
          step: currentStep,
          errors: { _form: err.message },
          requestId
        }
      });

      errorReporter.log('onboarding_validation_error', {
        step: currentStep,
        error: err.message,
        history: state.history
      });
    }
  };

  const handleSkipStep = () => {
    dispatch({
      type: 'SKIP_STEP',
      payload: { step: currentStep }
    });

    analytics.track('onboarding_step_skipped', {
      step: currentStep,
      stepIndex: state.currentStepIndex
    });
  };

  const handleJumpToStep = (stepIndex) => {
    if (state.hasUnsavedChanges) {
      // Show confirmation modal
      if (!confirm('You have unsaved changes. Continue?')) {
        return;
      }
    }

    dispatch({
      type: 'JUMP_TO_STEP',
      payload: { stepIndex }
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllers.current.validation?.abort();
      abortControllers.current.save?.abort();
    };
  }, []);

  // Prevent navigation if busy
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (state.hasUnsavedChanges || !state.canNavigate) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges, state.canNavigate]);

  return (
    <div className="onboarding-wizard">
      <ProgressIndicator
        steps={STEP_NAMES}
        currentStep={state.currentStepIndex}
        stepStatuses={state.steps}
        onStepClick={handleJumpToStep}
      />

      <div className="step-content">
        {state.currentStepIndex === 0 && (
          <AccountStep
            data={currentStepData.data}
            errors={currentStepData.errors}
            onChange={handleFieldChange}
            disabled={!state.canNavigate}
          />
        )}

        {state.currentStepIndex === 1 && (
          <ProfileStep
            data={currentStepData.data}
            errors={currentStepData.errors}
            onChange={handleFieldChange}
            disabled={!state.canNavigate}
          />
        )}

        {state.currentStepIndex === 2 && (
          <PreferencesStep
            data={currentStepData.data}
            errors={currentStepData.errors}
            onChange={handleFieldChange}
            disabled={!state.canNavigate}
          />
        )}

        {state.currentStepIndex === 3 && (
          <IntegrationsStep
            data={currentStepData.data}
            errors={currentStepData.errors}
            onChange={handleFieldChange}
            disabled={!state.canNavigate}
          />
        )}

        {state.currentStepIndex === 4 && (
          <ConfirmationStep
            steps={state.steps}
            onEdit={handleJumpToStep}
          />
        )}
      </div>

      <div className="step-actions">
        {state.currentStepIndex > 0 && (
          <button
            onClick={() => handleJumpToStep(state.currentStepIndex - 1)}
            disabled={!state.canNavigate}
          >
            Back
          </button>
        )}

        {state.currentStepIndex < 4 && (
          <>
            <button
              onClick={handleSkipStep}
              disabled={!state.canNavigate}
              className="secondary"
            >
              Skip
            </button>

            <button
              onClick={handleNext}
              disabled={!state.canNavigate}
            >
              {currentStepData.status === STEP_STATUS.VALIDATING
                ? 'Validating...'
                : currentStepData.status === STEP_STATUS.SAVING
                ? 'Saving...'
                : 'Next'}
            </button>
          </>
        )}

        {state.currentStepIndex === 4 && (
          <button
            onClick={() => {
              analytics.track('onboarding_completed', {
                duration: calculateDuration(state.history)
              });
              router.push('/dashboard');
            }}
          >
            Complete Setup
          </button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <h4>State Debug</h4>
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

**Results After Fix:**
- Error rate: 12.4% → 1.8% (85% reduction)
- Completion rate: 47% → 82% (74% improvement)
- Support tickets: 230 → 31/month (87% reduction)
- Average time: 8.3 → 4.9 minutes (41% faster)
- Data loss: 15% → 0.2% (99% improvement)
- Race condition bugs: Eliminated entirely

**Key Improvements:**
1. Request cancellation prevented race conditions
2. Request ID tracking ensured only latest response processed
3. State machine prevented invalid state transitions
4. History tracking enabled debugging and analytics
5. Atomic updates eliminated data inconsistency
6. hasUnsavedChanges flag improved UX

---

### ⚖️ Trade-offs

**Simple Reducer vs Complex Reducer with Immer:**

| Aspect | Simple Reducer | Reducer + Immer |
|--------|----------------|------------------|
| **Bundle Size** | 0 KB (built-in) | +14 KB (Immer) |
| **Learning Curve** | Standard JS | Learn Immer API |
| **Code Readability** | Verbose nested spreads | Clean "mutations" |
| **Performance** | Fast for shallow updates | Slightly slower, but optimized |
| **Deep Updates** | Very verbose and error-prone | Simple and safe |
| **Use Case** | Shallow state, small team | Deep state, complex updates |

**Comparison:**

```javascript
// Complex nested update scenario

const complexState = {
  user: {
    profile: {
      settings: {
        notifications: {
          email: { enabled: true, frequency: 'daily' },
          push: { enabled: false, frequency: 'instant' },
          sms: { enabled: false, frequency: 'weekly' }
        }
      }
    }
  }
};

// ❌ Simple reducer: Error-prone and unreadable
function simpleReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_EMAIL_NOTIFICATIONS':
      return {
        ...state,
        user: {
          ...state.user,
          profile: {
            ...state.user.profile,
            settings: {
              ...state.user.profile.settings,
              notifications: {
                ...state.user.profile.settings.notifications,
                email: {
                  ...state.user.profile.settings.notifications.email,
                  enabled: !state.user.profile.settings.notifications.email.enabled
                }
              }
            }
          }
        }
      };

    // Easy to miss a spread operator and mutate state
    // Hard to review in code review
    // Typos cause bugs
  }
}

// ✅ With Immer: Readable and safe
import { produce } from 'immer';

const immerReducer = produce((draft, action) => {
  switch (action.type) {
    case 'TOGGLE_EMAIL_NOTIFICATIONS':
      draft.user.profile.settings.notifications.email.enabled =
        !draft.user.profile.settings.notifications.email.enabled;
      break;

    // Clear, obvious, safe
    // Immer handles immutability internally
  }
});
```

**Normalized vs Denormalized State:**

| Aspect | Normalized | Denormalized |
|--------|-----------|--------------|
| **Data Duplication** | None (single source of truth) | Data repeated in multiple places |
| **Update Performance** | Fast (update one entity) | Slow (update all copies) |
| **Read Performance** | Requires denormalization (selectors) | Direct access (faster reads) |
| **Consistency** | Guaranteed (one place to update) | Risk of stale/inconsistent data |
| **Complexity** | Higher (need selectors, normalization utils) | Lower (straightforward structure) |
| **Use Case** | Relational data, large datasets | Simple hierarchies, small datasets |

**Example:**

```javascript
// Scenario: User posts with comments

// ❌ Denormalized: Simple reads, complex updates
const denormalizedState = {
  posts: [
    {
      id: 1,
      title: 'Post 1',
      author: { id: 10, name: 'John' },
      comments: [
        { id: 100, text: 'Great!', author: { id: 10, name: 'John' } },
        { id: 101, text: 'Thanks!', author: { id: 11, name: 'Jane' } }
      ]
    },
    {
      id: 2,
      title: 'Post 2',
      author: { id: 11, name: 'Jane' },
      comments: []
    }
  ]
};

// Problem: If John changes name, must update multiple places
function updateUserName(state, userId, newName) {
  return {
    ...state,
    posts: state.posts.map(post => ({
      ...post,
      author: post.author.id === userId ? { ...post.author, name: newName } : post.author,
      comments: post.comments.map(comment => ({
        ...comment,
        author: comment.author.id === userId ? { ...comment.author, name: newName } : comment.author
      }))
    }))
  };

  // Slow: O(posts × comments) complexity
  // Error-prone: Easy to miss a place
}

// ✅ Normalized: Complex reads, simple updates
const normalizedState = {
  entities: {
    users: {
      10: { id: 10, name: 'John' },
      11: { id: 11, name: 'Jane' }
    },
    posts: {
      1: { id: 1, title: 'Post 1', authorId: 10, commentIds: [100, 101] },
      2: { id: 2, title: 'Post 2', authorId: 11, commentIds: [] }
    },
    comments: {
      100: { id: 100, text: 'Great!', authorId: 10, postId: 1 },
      101: { id: 101, text: 'Thanks!', authorId: 11, postId: 1 }
    }
  }
};

// Simple: Update in one place
function updateUserName(state, userId, newName) {
  return {
    ...state,
    entities: {
      ...state.entities,
      users: {
        ...state.entities.users,
        [userId]: {
          ...state.entities.users[userId],
          name: newName
        }
      }
    }
  };

  // Fast: O(1) complexity
  // Safe: Only one place to update
}

// Need selectors for reads
function selectPostWithDetails(state, postId) {
  const post = state.entities.posts[postId];
  return {
    ...post,
    author: state.entities.users[post.authorId],
    comments: post.commentIds.map(id => ({
      ...state.entities.comments[id],
      author: state.entities.users[state.entities.comments[id].authorId]
    }))
  };
}
```

**useReducer + Context vs Redux:**

| Aspect | useReducer + Context | Redux |
|--------|----------------------|-------|
| **Setup Complexity** | Simple (no extra libraries) | Complex (store, provider, middleware) |
| **DevTools** | Limited (custom logging) | Excellent (Redux DevTools) |
| **Performance** | Can cause unnecessary re-renders | Optimized with selectors |
| **Middleware** | Manual implementation | Rich ecosystem |
| **Type Safety** | Good with TypeScript | Excellent with Redux Toolkit |
| **Learning Curve** | Low | High |
| **Use Case** | Feature-level state | Global app state |

**Performance Comparison:**

```javascript
// useReducer + Context: Re-renders all consumers

const UserContext = createContext();

function App() {
  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      <Header /> {/* Re-renders on ANY state change */}
      <Sidebar /> {/* Re-renders on ANY state change */}
      <Content /> {/* Re-renders on ANY state change */}
    </UserContext.Provider>
  );
}

// Even if Header only needs user.name, it re-renders when user.email changes

// ✅ Optimization: Split contexts
const UserDataContext = createContext();
const UserActionsContext = createContext();

function App() {
  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserActionsContext.Provider value={dispatch}>
      <UserDataContext.Provider value={state}>
        <Header />
        <Sidebar />
        <Content />
      </UserDataContext.Provider>
    </UserActionsContext.Provider>
  );
}

// Components can use useMemo to prevent re-renders
function Header() {
  const userData = useContext(UserDataContext);
  const userName = useMemo(() => userData.name, [userData.name]);

  // Only re-renders when name changes
  return <h1>{userName}</h1>;
}

// Redux: Selector-based subscriptions (better performance)
function Header() {
  const userName = useSelector(state => state.user.name);

  // Automatically only re-renders when name changes
  // No manual memoization needed
  return <h1>{userName}</h1>;
}
```

**When to Use What:**

**Use Simple useReducer (no Immer, no normalization):**
- Shallow state structure (1-2 levels deep)
- Few related state values (< 5 properties)
- Simple state transitions
- Small team familiar with vanilla JS

**Use useReducer + Immer:**
- Deep state structure (3+ levels)
- Frequent nested updates
- Readability matters (code reviews, maintenance)
- Team size > 3 developers

**Use useReducer + Normalization:**
- Relational data (users, posts, comments)
- Large datasets (> 100 entities)
- Frequent updates to individual entities
- Need to avoid data duplication

**Use Redux (or Zustand):**
- State needed across many distant components
- Complex async logic (side effects, caching)
- Need advanced debugging (time-travel, replays)
- Large app (> 10 routes, > 20 components)
- Team experienced with Redux patterns

---

### 💬 Explain to Junior

**Simple Analogy:**

Imagine you're managing a restaurant's order system:

**Simple useState = Whiteboard:**
You write down orders on a whiteboard:
- "Table 5: Add burger"
- "Table 5: Add fries"
- "Table 5: Remove burger (customer changed mind)"
- "Table 5: Calculate total"

Each change is a separate note. It works, but gets messy with many tables and orders.

**Complex useReducer = Order Management System:**
You have a proper POS (point of sale) system with:
- Structured order forms (normalized state)
- Business rules (reducer logic)
- Order history (state history)
- Automatic calculations (derived state)

When a customer changes their order, the system:
1. Validates the change (can they still cancel that item?)
2. Updates the order (atomically, no partial changes)
3. Recalculates total (automatically)
4. Records the history (for disputes)

All the complexity is handled by the system, not by individual waiters remembering rules.

**Real Code Example:**

```javascript
// Complex example: Shopping cart with inventory, discounts, taxes

const initialState = {
  // Normalized: Products separate from cart items
  products: {
    1: { id: 1, name: 'Laptop', price: 1000, stock: 5 },
    2: { id: 2, name: 'Mouse', price: 50, stock: 20 },
    3: { id: 3, name: 'Keyboard', price: 100, stock: 10 }
  },

  // Cart items reference products by ID
  cartItems: {
    1: { productId: 1, quantity: 1 },
    3: { productId: 3, quantity: 2 }
  },

  // Discount state
  discountCode: null,
  discountPercent: 0,

  // UI state
  isCheckingOut: false,
  checkoutError: null
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { productId, quantity } = action.payload;
      const product = state.products[productId];

      // Business rule: Check stock availability
      const currentQuantity = state.cartItems[productId]?.quantity || 0;
      const newQuantity = currentQuantity + quantity;

      if (newQuantity > product.stock) {
        console.warn('Not enough stock');
        return state; // No change
      }

      // Add or update cart item
      return {
        ...state,
        cartItems: {
          ...state.cartItems,
          [productId]: {
            productId,
            quantity: newQuantity
          }
        }
      };
    }

    case 'REMOVE_FROM_CART': {
      const { productId } = action.payload;
      const newCartItems = { ...state.cartItems };
      delete newCartItems[productId];

      return {
        ...state,
        cartItems: newCartItems
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      const product = state.products[productId];

      // Business rule: Check stock
      if (quantity > product.stock) {
        console.warn('Not enough stock');
        return state;
      }

      // Business rule: Remove if quantity is 0
      if (quantity === 0) {
        const newCartItems = { ...state.cartItems };
        delete newCartItems[productId];
        return { ...state, cartItems: newCartItems };
      }

      return {
        ...state,
        cartItems: {
          ...state.cartItems,
          [productId]: {
            ...state.cartItems[productId],
            quantity
          }
        }
      };
    }

    case 'APPLY_DISCOUNT': {
      const { code } = action.payload;

      // Business rule: Validate discount code
      const validCodes = {
        'SAVE10': 10,
        'SAVE20': 20,
        'SAVE30': 30
      };

      const discountPercent = validCodes[code];

      if (!discountPercent) {
        console.warn('Invalid discount code');
        return state;
      }

      return {
        ...state,
        discountCode: code,
        discountPercent
      };
    }

    case 'CHECKOUT_START': {
      return {
        ...state,
        isCheckingOut: true,
        checkoutError: null
      };
    }

    case 'CHECKOUT_SUCCESS': {
      // Clear cart after successful checkout
      return {
        ...state,
        cartItems: {},
        discountCode: null,
        discountPercent: 0,
        isCheckingOut: false
      };
    }

    case 'CHECKOUT_ERROR': {
      return {
        ...state,
        isCheckingOut: false,
        checkoutError: action.payload
      };
    }

    default:
      return state;
  }
}

function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Derived state: Calculate totals (not stored in state!)
  const subtotal = Object.values(state.cartItems).reduce((sum, item) => {
    const product = state.products[item.productId];
    return sum + (product.price * item.quantity);
  }, 0);

  const discountAmount = subtotal * (state.discountPercent / 100);
  const tax = (subtotal - discountAmount) * 0.1; // 10% tax
  const total = subtotal - discountAmount + tax;

  const cartItemCount = Object.values(state.cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleAddToCart = (productId) => {
    dispatch({ type: 'ADD_TO_CART', payload: { productId, quantity: 1 } });
  };

  const handleUpdateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const handleApplyDiscount = (code) => {
    dispatch({ type: 'APPLY_DISCOUNT', payload: { code } });
  };

  const handleCheckout = async () => {
    dispatch({ type: 'CHECKOUT_START' });

    try {
      await submitOrder({
        items: state.cartItems,
        discountCode: state.discountCode,
        total
      });

      dispatch({ type: 'CHECKOUT_SUCCESS' });
      alert('Order placed successfully!');
    } catch (err) {
      dispatch({ type: 'CHECKOUT_ERROR', payload: err.message });
    }
  };

  return (
    <div>
      <h2>Shopping Cart ({cartItemCount} items)</h2>

      {/* Product list */}
      <div className="products">
        {Object.values(state.products).map(product => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            <p>Stock: {product.stock}</p>
            <button onClick={() => handleAddToCart(product.id)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Cart items */}
      <div className="cart">
        <h3>Cart</h3>
        {Object.values(state.cartItems).map(item => {
          const product = state.products[item.productId];
          return (
            <div key={item.productId}>
              <span>{product.name}</span>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleUpdateQuantity(
                  item.productId,
                  parseInt(e.target.value) || 0
                )}
                min="0"
                max={product.stock}
              />
              <span>${product.price * item.quantity}</span>
              <button onClick={() => dispatch({
                type: 'REMOVE_FROM_CART',
                payload: { productId: item.productId }
              })}>
                Remove
              </button>
            </div>
          );
        })}
      </div>

      {/* Discount */}
      <div className="discount">
        <input
          type="text"
          placeholder="Discount code"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleApplyDiscount(e.target.value);
            }
          }}
        />
        {state.discountCode && (
          <p>Discount applied: {state.discountPercent}% off</p>
        )}
      </div>

      {/* Totals */}
      <div className="totals">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        {state.discountPercent > 0 && (
          <p>Discount: -${discountAmount.toFixed(2)}</p>
        )}
        <p>Tax (10%): ${tax.toFixed(2)}</p>
        <h3>Total: ${total.toFixed(2)}</h3>
      </div>

      {/* Checkout */}
      <button
        onClick={handleCheckout}
        disabled={cartItemCount === 0 || state.isCheckingOut}
      >
        {state.isCheckingOut ? 'Processing...' : 'Checkout'}
      </button>

      {state.checkoutError && (
        <p className="error">{state.checkoutError}</p>
      )}
    </div>
  );
}
```

**Key Patterns Explained:**

1. **Normalized State:**
   - Products and cart items are separate
   - Cart items reference products by ID
   - If product price changes, cart automatically reflects it

2. **Business Rules in Reducer:**
   - Stock validation happens in reducer
   - Discount code validation in reducer
   - All rules in one place = consistent behavior

3. **Derived State (Not Stored):**
   - Don't store subtotal, tax, total in state
   - Calculate from cart items every render
   - Guaranteed to be correct (no sync issues)

4. **Immutable Updates:**
   - Never do `state.cartItems[id] = newItem`
   - Always return new object: `{ ...state, cartItems: {...} }`
   - React detects changes and re-renders

5. **Action Payload Structure:**
   - Actions describe "what happened"
   - Payload contains data needed for update
   - Reducer decides "how to update state"

**Interview Answer Template:**

"For complex state logic with useReducer, I follow these principles:

First, I normalize the state structure. Instead of nested objects, I store entities separately with ID references. This prevents data duplication and makes updates efficient.

Second, I put business rules in the reducer. Stock validation, discount logic, permission checks - all in the reducer. This centralizes logic and ensures consistency.

Third, I use derived state for calculations. Instead of storing subtotals and totals in state, I calculate them from cart items. This guarantees they're always correct.

Fourth, I handle async operations outside the reducer. Dispatch 'START' actions before API calls, then dispatch 'SUCCESS' or 'ERROR' based on results. The reducer stays pure.

For deeply nested updates, I often use Immer to write cleaner code. For relational data, I normalize it like Redux patterns. For side effects, I use middleware patterns or useEffect.

The goal is to make state updates predictable, testable, and maintainable. Complex logic in one place beats scattered `setState` calls."

**Common Interview Questions:**

1. **When would you use useReducer over useState for complex state?**
   - Multiple related state values that update together
   - Next state depends on previous in non-trivial ways
   - Need centralized logic for testing
   - Deep nested state structures

2. **How do you handle async actions with useReducer?**
   - Dispatch START action before async operation
   - Perform async work in useEffect or event handler
   - Dispatch SUCCESS/ERROR action when complete
   - Reducer handles all three states synchronously

3. **What is normalized state and why use it?**
   - Store entities separately with ID references
   - Prevents data duplication (single source of truth)
   - Makes updates efficient (O(1) vs O(n))
   - Example: Redux patterns for relational data

4. **How to optimize performance with useReducer?**
   - dispatch is stable (never changes)
   - Split large state into multiple reducers
   - Use useMemo for derived state
   - Combine with Context carefully (split contexts)

5. **What is Immer and when would you use it?**
   - Library for "mutating" code that produces immutable updates
   - Use for deep nested state (3+ levels)
   - Cleaner than manual spread operators
   - Small bundle size tradeoff for better DX
