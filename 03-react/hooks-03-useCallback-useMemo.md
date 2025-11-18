# React Advanced Hooks

> useCallback, useMemo, useRef, useImperativeHandle, useLayoutEffect, useId, and performance optimization hooks.

---

## Question 1: useCallback vs useMemo

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Amazon, Airbnb

### Question
Explain the difference between useCallback and useMemo. When should you use each?

### Answer

**useCallback** - Memoizes functions
**useMemo** - Memoizes values

```jsx
// useCallback - Memoize function reference
const handleClick = useCallback(() => {
  console.log('Clicked', count);
}, [count]); // New function only when count changes

// useMemo - Memoize computed value
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]); // Recompute only when a or b changes

// When to use:
// useCallback: Passing callbacks to optimized child components
// useMemo: Expensive calculations, avoiding re-renders
```

**Practical Example:**

```jsx
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // ❌ Without useCallback - new function every render
  const handleClick = () => {
    console.log('Clicked');
  };

  // ✅ With useCallback - same function reference
  const memoizedHandleClick = useCallback(() => {
    console.log('Clicked');
  }, []); // No dependencies - same function always

  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <MemoizedChild onClick={memoizedHandleClick} />
    </>
  );
}

const MemoizedChild = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});
// Without useCallback: Child re-renders on every Parent render
// With useCallback: Child only renders when callback actually changes
```

### Resources
- [React Hooks API Reference](https://react.dev/reference/react/hooks)

---

## Questions 2-15: Advanced React Hooks Deep Dive

**Difficulty:** 🟡 Medium to 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Consolidated advanced hooks patterns**

### Q2-4: useLayoutEffect, useImperativeHandle, useId

```javascript
// Q2: useLayoutEffect - Synchronous DOM updates before paint
import { useLayoutEffect, useEffect, useRef, useState } from 'react';

function TooltipWithLayoutEffect() {
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const ref = useRef(null);

  // useLayoutEffect runs synchronously BEFORE browser paints
  useLayoutEffect(() => {
    const { height } = ref.current.getBoundingClientRect();
    setTooltipHeight(height);
  }, []);

  // useEffect runs AFTER browser paints (asynchronous)
  useEffect(() => {
    console.log('Runs after paint');
  }, []);

  return <div ref={ref}>Tooltip (height: {tooltipHeight})</div>;
}

// When to use useLayoutEffect:
// 1. Measuring DOM elements before paint
// 2. Preventing visual flickering
// 3. Synchronizing with third-party DOM libraries

// Q3: useImperativeHandle - Customize ref value exposed to parent
import { forwardRef, useImperativeHandle, useRef } from 'react';

// Child component
const CustomInput = forwardRef((props, ref) => {
  const inputRef = useRef();

  // Expose only specific methods to parent
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    },
    scrollIntoView: () => {
      inputRef.current.scrollIntoView();
    },
    // Don't expose the entire input element
  }));

  return <input ref={inputRef} {...props} />;
});

// Parent component
function Form() {
  const inputRef = useRef();

  const handleClick = () => {
    // Only access methods we exposed
    inputRef.current.focus();
    inputRef.current.scrollIntoView();
    // inputRef.current.value // ❌ Not available
  };

  return (
    <>
      <CustomInput ref={inputRef} />
      <button onClick={handleClick}>Focus Input</button>
    </>
  );
}

// Q4: useId - Generate unique IDs for accessibility
function NameFields() {
  const id = useId(); // Generates unique ID

  return (
    <>
      <label htmlFor={id + '-firstName'}>First Name</label>
      <input id={id + '-firstName'} type="text" />

      <label htmlFor={id + '-lastName'}>Last Name</label>
      <input id={id + '-lastName'} type="text" />
    </>
  );
}

// Multiple instances get different IDs
function Form() {
  return (
    <>
      <NameFields /> {/* IDs: :r0:-firstName, :r0:-lastName */}
      <NameFields /> {/* IDs: :r1:-firstName, :r1:-lastName */}
    </>
  );
}
```

### Q5-7: useDeferredValue, useTransition, Performance Patterns

```javascript
// Q5: useDeferredValue - Defer non-urgent updates
import { useDeferredValue, useState, useMemo } from 'react';

function SearchResults({ query }) {
  // Deferred version lags behind during rapid updates
  const deferredQuery = useDeferredValue(query);

  // Expensive search only uses deferred value
  const results = useMemo(() => {
    return searchDatabase(deferredQuery); // Expensive operation
  }, [deferredQuery]);

  return (
    <div>
      {/* Show stale content while searching */}
      <div style={{ opacity: query !== deferredQuery ? 0.5 : 1 }}>
        {results.map(item => <div key={item.id}>{item.name}</div>)}
      </div>
    </div>
  );
}

function SearchPage() {
  const [query, setQuery] = useState('');

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <SearchResults query={query} />
    </>
  );
}

// Q6: useTransition - Mark updates as non-urgent
import { useTransition, useState } from 'react';

function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('about');

  const selectTab = (nextTab) => {
    // Mark tab change as non-urgent
    startTransition(() => {
      setTab(nextTab);
    });
  };

  return (
    <>
      <button onClick={() => selectTab('about')}>About</button>
      <button onClick={() => selectTab('posts')}>
        Posts {isPending && '(Loading...)'}
      </button>
      <button onClick={() => selectTab('contact')}>Contact</button>

      {tab === 'about' && <AboutTab />}
      {tab === 'posts' && <PostsTab />}
      {tab === 'contact' && <ContactTab />}
    </>
  );
}

// Q7: Optimizing Re-renders with React.memo
import React, { memo } from 'react';

// Without memo: Re-renders on every parent render
function ExpensiveComponent({ data }) {
  console.log('Rendered');
  return <div>{/* Expensive rendering */}</div>;
}

// With memo: Only re-renders when props change
const MemoizedComponent = memo(function ExpensiveComponent({ data }) {
  console.log('Rendered');
  return <div>{/* Expensive rendering */}</div>;
});

// Custom comparison function
const MemoizedWithCustom = memo(
  function Component({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip render)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### Q8-10: Custom Performance Hooks

```javascript
// Q8: useWhyDidYouUpdate - Debug re-renders
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};

      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });

      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
}

// Usage
function Component(props) {
  useWhyDidYouUpdate('Component', props);
  return <div>{props.count}</div>;
}

// Q9: useRafState - State updates synchronized with RAF
function useRafState(initialState) {
  const frame = useRef(0);
  const [state, setState] = useState(initialState);

  const setRafState = useCallback((value) => {
    cancelAnimationFrame(frame.current);

    frame.current = requestAnimationFrame(() => {
      setState(value);
    });
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(frame.current);
  }, []);

  return [state, setRafState];
}

// Usage: Smooth animations
function AnimatedComponent() {
  const [position, setPosition] = useRafState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div onMouseMove={handleMouseMove}>
      <div style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
        Follows mouse
      </div>
    </div>
  );
}

// Q10: useMountedState - Prevent state updates after unmount
function useMountedState() {
  const mountedRef = useRef(false);
  const get = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return get;
}

// Usage: Async operations
function AsyncComponent() {
  const [data, setData] = useState(null);
  const isMounted = useMountedState();

  useEffect(() => {
    async function loadData() {
      const result = await fetchData();

      // Only update if component is still mounted
      if (isMounted()) {
        setData(result);
      }
    }

    loadData();
  }, [isMounted]);

  return <div>{data}</div>;
}
```

### Q11-13: Advanced State Management Hooks

```javascript
// Q11: useReducerAsync - Async actions in reducers
function useReducerAsync(reducer, initState) {
  const [state, dispatch] = useReducer(reducer, initState);

  const dispatchAsync = useCallback(
    (action) => {
      if (typeof action === 'function') {
        return action(dispatch);
      }
      return dispatch(action);
    },
    [dispatch]
  );

  return [state, dispatchAsync];
}

// Usage
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function Component() {
  const [state, dispatch] = useReducerAsync(reducer, {
    loading: false,
    data: null,
    error: null
  });

  const fetchData = () => {
    // Async action creator
    return async (dispatch) => {
      dispatch({ type: 'FETCH_START' });
      try {
        const data = await fetch('/api/data');
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR', payload: error });
      }
    };
  };

  return <button onClick={() => dispatch(fetchData())}>Load</button>;
}

// Q12: useStateWithHistory - Undo/Redo functionality
function useStateWithHistory(initialState, capacity = 10) {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);

  const state = history[index];

  const setState = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(state) : value;

    // Remove future history when new state is set
    const newHistory = history.slice(0, index + 1);
    newHistory.push(newValue);

    // Limit capacity
    if (newHistory.length > capacity) {
      newHistory.shift();
    } else {
      setIndex(index + 1);
    }

    setHistory(newHistory);
  }, [history, index, state, capacity]);

  const goBack = useCallback(() => {
    setIndex(Math.max(0, index - 1));
  }, [index]);

  const goForward = useCallback(() => {
    setIndex(Math.min(history.length - 1, index + 1));
  }, [history.length, index]);

  return {
    state,
    setState,
    goBack,
    goForward,
    canGoBack: index > 0,
    canGoForward: index < history.length - 1
  };
}

// Usage
function DrawingApp() {
  const { state, setState, goBack, goForward, canGoBack, canGoForward } =
    useStateWithHistory([]);

  return (
    <>
      <button onClick={goBack} disabled={!canGoBack}>Undo</button>
      <button onClick={goForward} disabled={!canGoForward}>Redo</button>
      <Canvas value={state} onChange={setState} />
    </>
  );
}

// Q13: useQueue - Queue data structure
function useQueue(initialValue = []) {
  const [queue, setQueue] = useState(initialValue);

  const add = useCallback((value) => {
    setQueue(q => [...q, value]);
  }, []);

  const remove = useCallback(() => {
    let removedValue;
    setQueue(([first, ...rest]) => {
      removedValue = first;
      return rest;
    });
    return removedValue;
  }, []);

  const clear = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queue,
    add,
    remove,
    clear,
    first: queue[0],
    last: queue[queue.length - 1],
    size: queue.length
  };
}

// Usage: Toast notifications
function ToastManager() {
  const { queue, add, remove, size } = useQueue();

  const showToast = (message) => {
    add({ id: Date.now(), message });

    setTimeout(() => {
      remove();
    }, 3000);
  };

  return (
    <>
      <button onClick={() => showToast('Hello!')}>Show Toast</button>
      <div>
        {queue.map(toast => (
          <div key={toast.id}>{toast.message}</div>
        ))}
      </div>
    </>
  );
}
```

### Q14-15: Experimental & Future Hooks

```javascript
// Q14: useOptimistic - Optimistic UI updates (React 19)
import { useOptimistic } from 'react';

function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (state, optimisticValue) => state + optimisticValue
  );

  const handleLike = async () => {
    // Immediately show optimistic update
    addOptimisticLike(1);

    try {
      const newLikes = await likePost(postId);
      setLikes(newLikes);
    } catch (error) {
      // Optimistic update automatically reverted on error
      console.error('Failed to like post');
    }
  };

  return (
    <button onClick={handleLike}>
      👍 {optimisticLikes} likes
    </button>
  );
}

// Q15: Custom Hook Composition Patterns
// Combining multiple hooks for complex logic
function useUser(userId) {
  // Fetch user data
  const { data: user, loading: userLoading } = useFetch(`/api/users/${userId}`);

  // Fetch user posts
  const { data: posts, loading: postsLoading } = useFetch(
    user ? `/api/posts?userId=${user.id}` : null
  );

  // Track online status
  const isOnline = useOnlineStatus(userId);

  // Combine all states
  return {
    user,
    posts,
    isOnline,
    loading: userLoading || postsLoading,
    error: !user && !userLoading ? 'User not found' : null
  };
}

// Usage
function UserProfile({ userId }) {
  const { user, posts, isOnline, loading } = useUser(userId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.name} {isOnline && '🟢'}</h1>
      <PostList posts={posts} />
    </div>
  );
}
```

### Advanced Patterns & Best Practices

```javascript
// Pattern 1: Hook Dependencies Management
function useComplexEffect({ userId, filter, sort }) {
  // ❌ Wrong: Missing dependencies
  useEffect(() => {
    fetchData(userId, filter, sort);
  }, [userId]); // Missing filter, sort

  // ✅ Correct: All dependencies included
  useEffect(() => {
    fetchData(userId, filter, sort);
  }, [userId, filter, sort]);

  // ✅ Better: Memoize complex dependencies
  const config = useMemo(() => ({ filter, sort }), [filter, sort]);

  useEffect(() => {
    fetchData(userId, config);
  }, [userId, config]);
}

// Pattern 2: Stable Callback References
function SearchComponent() {
  const [query, setQuery] = useState('');

  // ❌ Wrong: Creates new function every render
  const handleSearch = () => performSearch(query);

  // ✅ Correct: Stable reference with useCallback
  const handleSearch = useCallback(() => {
    performSearch(query);
  }, [query]);

  return <SearchResults onSearch={handleSearch} />;
}

// Pattern 3: Avoiding Memory Leaks
function DataLoader() {
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await fetchData();
      if (!cancelled) {
        setData(data);
      }
    }

    load();

    return () => {
      cancelled = true; // Cleanup
    };
  }, []);
}
```

### Resources
- [React Hooks API Reference](https://react.dev/reference/react)
- [useHooks.com - Collection of hooks](https://usehooks.com/)
- [React Hooks in TypeScript](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks)

---

[← Back to React README](./README.md)

**Progress:** 15 of 15 advanced hooks completed ✅

