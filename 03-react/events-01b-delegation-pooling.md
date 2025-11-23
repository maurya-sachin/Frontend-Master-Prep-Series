# React Event Delegation and Pooling

## Question 1: What are event delegation and event pooling in React?

**Answer:**

Event delegation is a pattern where React attaches a single event listener to a parent element (the React root container) instead of attaching individual listeners to each child element. When an event occurs on any child element, it bubbles up to the parent, and React determines which handler to call based on the event target. This dramatically reduces the number of event listeners needed, improving memory usage and performance, especially for large lists or frequently updated components.

Event pooling was a performance optimization in React versions prior to React 17 where the SyntheticEvent object was reused for multiple events. After an event handler finished executing, React would nullify all properties of the event object and return it to a pool for reuse. This reduced garbage collection overhead but caused issues when accessing event properties asynchronously (like in setTimeout or promises). Developers had to call `event.persist()` to remove the event from the pool and prevent nullification.

In React 17+, event pooling was completely removed because modern JavaScript engines handle object allocation efficiently, and the complexity/bugs it introduced outweighed the performance benefits. Events now persist automatically, so you can access event properties asynchronously without calling `persist()`. The event delegation system was also updated to attach listeners to the React root container instead of the document, improving support for multiple React roots and integration with other frameworks.

Understanding these concepts is crucial for debugging event-related issues and optimizing performance in React applications, especially when working with large lists, dynamic content, or integrating with third-party libraries.

---

### 🔍 Deep Dive

**Event Delegation Architecture:**

**1. React 16 vs React 17+ Event Delegation:**

```javascript
// React 16: Events attached to document
<div id="root">
  <button onClick={handleClick}>Click</button>
</div>

// Internally:
document.addEventListener('click', (nativeEvent) => {
  // React's event handler
  dispatchEvent(nativeEvent);
});

// React 17+: Events attached to root container
<div id="root">
  <button onClick={handleClick}>Click</button>
</div>

// Internally:
const rootContainer = document.getElementById('root');
rootContainer.addEventListener('click', (nativeEvent) => {
  // React's event handler
  dispatchEvent(nativeEvent);
});
```

**Why the change?** Multiple React versions on the same page would conflict when all listening to document. Now each root has its own event listeners.

**2. Event Delegation Flow:**

```javascript
// Step-by-step event delegation process

// User clicks a button:
<div id="root">
  <div className="container" onClick={handleContainerClick}>
    <button onClick={handleButtonClick}>Click me</button>
  </div>
</div>

// 1. Native click event fires on <button>
// 2. Event bubbles up to root container
// 3. Root listener catches the event
// 4. React determines the fiber node that corresponds to the target
// 5. React walks up the fiber tree collecting all relevant handlers
// 6. React creates a SyntheticEvent wrapper
// 7. React calls handlers in order (target → root)

// Simplified internal process:
function dispatchEvent(nativeEvent) {
  const target = nativeEvent.target;

  // Find React fiber node for this DOM element
  const targetFiber = getClosestFiberFromDOM(target);

  // Collect all event handlers from target to root
  const listeners = [];
  let fiber = targetFiber;

  while (fiber) {
    if (fiber.onClick) {
      listeners.push({ instance: fiber, handler: fiber.onClick });
    }
    fiber = fiber.return; // Parent fiber
  }

  // Create synthetic event
  const syntheticEvent = new SyntheticEvent(nativeEvent);

  // Execute handlers in order
  for (const { instance, handler } of listeners) {
    if (syntheticEvent.isPropagationStopped()) break;

    syntheticEvent.currentTarget = instance.stateNode; // DOM node
    handler.call(instance.stateNode, syntheticEvent);
  }
}
```

**3. Event Pooling (Legacy - React <17):**

```javascript
// React <17: Event pooling for performance

// Pool of reusable event objects
const eventPool = [];

function getEventFromPool(nativeEvent) {
  let syntheticEvent;

  if (eventPool.length > 0) {
    // Reuse existing event from pool
    syntheticEvent = eventPool.pop();
    syntheticEvent.nativeEvent = nativeEvent;
    syntheticEvent.target = nativeEvent.target;
    syntheticEvent.currentTarget = nativeEvent.currentTarget;
    // ... set other properties
  } else {
    // Create new event
    syntheticEvent = new SyntheticEvent(nativeEvent);
  }

  return syntheticEvent;
}

function releaseEventToPool(syntheticEvent) {
  // Nullify all properties
  syntheticEvent.nativeEvent = null;
  syntheticEvent.target = null;
  syntheticEvent.currentTarget = null;
  syntheticEvent.type = null;
  // ... nullify other properties

  // Return to pool for reuse
  if (eventPool.length < 10) {
    eventPool.push(syntheticEvent);
  }
}

function dispatchEvent(nativeEvent) {
  const syntheticEvent = getEventFromPool(nativeEvent);

  try {
    // Execute handlers
    executeHandlers(syntheticEvent);
  } finally {
    // Always return to pool (unless persist() was called)
    if (!syntheticEvent.isPersistent()) {
      releaseEventToPool(syntheticEvent);
    }
  }
}
```

**4. Event Persistence:**

```javascript
// React <17: Must call persist() for async access
class Form extends React.Component {
  handleChange = (event) => {
    // ❌ BAD: Async access without persist
    setTimeout(() => {
      console.log(event.target.value); // null!
    }, 100);

    // ✅ GOOD: Call persist() first
    event.persist();
    setTimeout(() => {
      console.log(event.target.value); // Works!
    }, 100);

    // ✅ BETTER: Extract value immediately
    const value = event.target.value;
    setTimeout(() => {
      console.log(value); // Works!
    }, 100);
  };

  render() {
    return <input onChange={this.handleChange} />;
  }
}

// React 17+: No pooling, persist() is no-op
function Form() {
  const handleChange = (event) => {
    // ✅ GOOD: Works without persist()
    setTimeout(() => {
      console.log(event.target.value); // Works!
    }, 100);
  };

  return <input onChange={handleChange} />;
}
```

**5. Custom Event Delegation:**

```javascript
// Advanced: Manual event delegation for optimized large lists

function VirtualizedList({ items }) {
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    // Single delegated handler for all list items
    const handleClick = (event) => {
      // Find the closest list item
      const item = event.target.closest('[data-item-id]');
      if (!item) return;

      const itemId = item.dataset.itemId;
      const action = event.target.dataset.action;

      // Route based on action
      switch (action) {
        case 'delete':
          handleDelete(itemId);
          break;
        case 'edit':
          handleEdit(itemId);
          break;
        case 'view':
          handleView(itemId);
          break;
      }
    };

    // Single listener for entire list
    list.addEventListener('click', handleClick);

    return () => {
      list.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div ref={listRef} className="list">
      {items.map(item => (
        <div key={item.id} data-item-id={item.id}>
          <span>{item.name}</span>
          <button data-action="view">View</button>
          <button data-action="edit">Edit</button>
          <button data-action="delete">Delete</button>
        </div>
      ))}
    </div>
  );
}
```

**6. Event Priority System (React 18+):**

```javascript
// React 18: Events have different priorities

// Discrete events (high priority):
// - click, keydown, keyup, input, change, etc.
// - Block rendering, processed immediately

// Continuous events (lower priority):
// - scroll, mousemove, touchmove, drag, etc.
// - Can be throttled, don't block rendering

// Example: Scroll events don't block urgent updates
function App() {
  const [urgentState, setUrgentState] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleClick = () => {
    // Discrete event: processed immediately
    setUrgentState(u => u + 1);
  };

  const handleScroll = () => {
    // Continuous event: can be deferred
    setScrollPosition(window.scrollY);
  };

  return (
    <div onScroll={handleScroll}>
      <button onClick={handleClick}>Urgent: {urgentState}</button>
      <div>Scroll: {scrollPosition}</div>
    </div>
  );
}
```

**7. Event Batching:**

```javascript
// React automatically batches state updates within event handlers

function Counter() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  const handleClick = () => {
    // React <18: Only batched in React event handlers
    setCount(c => c + 1);  // |
    setFlag(f => !f);      // } Batched into 1 render

    // React <18: NOT batched in promises/setTimeout
    setTimeout(() => {
      setCount(c => c + 1);  // Render 1
      setFlag(f => !f);      // Render 2 (not batched!)
    }, 100);

    // React 18+: Automatic batching everywhere
    setTimeout(() => {
      setCount(c => c + 1);  // |
      setFlag(f => !f);      // } Batched into 1 render!
    }, 100);
  };

  console.log('Render'); // How many times?

  return <button onClick={handleClick}>Click</button>;
}
```

---

### 🐛 Real-World Scenario

**Scenario:** Large data table with 10,000 rows experiencing severe performance issues due to improper event handling.

**Problem Detected:**
- Page freezes for 3-4 seconds when table loads
- Chrome DevTools shows 10,000+ event listeners
- Memory usage: 450MB for the table alone
- Scroll performance: 15 FPS (should be 60 FPS)
- User complaints: "The table is unusable with large datasets"

**Investigation:**

```javascript
// ❌ BAD: Attaching individual listeners to every row
function DataTable({ data }) {
  // 10,000 rows × 4 buttons = 40,000 event listeners!

  const handleEdit = (id) => {
    console.log('Edit', id);
  };

  const handleDelete = (id) => {
    console.log('Delete', id);
  };

  const handleView = (id) => {
    console.log('View', id);
  };

  const handleSelect = (id) => {
    console.log('Select', id);
  };

  return (
    <table>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            <td>
              {/* New function created for EACH row on EVERY render */}
              <button onClick={() => handleEdit(row.id)}>Edit</button>
              <button onClick={() => handleDelete(row.id)}>Delete</button>
              <button onClick={() => handleView(row.id)}>View</button>
              <input
                type="checkbox"
                onChange={() => handleSelect(row.id)}
              />
            </td>
            <td>{row.name}</td>
            <td>{row.email}</td>
            <td>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Debugging Process:**

```javascript
// Step 1: Count event listeners
function countEventListeners() {
  const listeners = window.getEventListeners?.(document.body);
  console.log('Total listeners:',
    Object.values(listeners || {}).reduce((sum, arr) => sum + arr.length, 0)
  );
}

// Step 2: Profile memory usage
// Chrome DevTools → Memory → Heap Snapshot
// Look for "Detached" event listeners

// Step 3: Profile render performance
function DataTable({ data }) {
  const renderStart = performance.now();

  useEffect(() => {
    const renderTime = performance.now() - renderStart;
    console.log(`Render took ${renderTime}ms`);
  });

  // ... component code
}

// Step 4: Use React DevTools Profiler
// Record component renders, identify slow components
```

**Metrics Analysis:**
```
Before Optimization:
- Initial render: 3,847ms
- Memory usage: 451MB
- Event listeners: 40,127
- Scroll FPS: 15 FPS
- Re-render on data update: 2,341ms

Issues Identified:
1. 40,000+ inline arrow functions created on every render
2. 40,000+ event listeners attached
3. No event delegation
4. No memoization
5. Synchronous state updates blocking render
```

**Solution:**

```javascript
// ✅ GOOD: Event delegation with data attributes
function DataTable({ data }) {
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Single delegated handler for entire table
  const handleTableClick = useCallback((event) => {
    const target = event.target;
    const row = target.closest('tr[data-row-id]');

    if (!row) return;

    const rowId = parseInt(row.dataset.rowId, 10);
    const action = target.dataset.action;

    // Route based on action
    switch (action) {
      case 'edit':
        handleEdit(rowId);
        break;
      case 'delete':
        handleDelete(rowId);
        break;
      case 'view':
        handleView(rowId);
        break;
      case 'select':
        handleSelect(rowId, target.checked);
        break;
    }
  }, []);

  const handleEdit = useCallback((id) => {
    console.log('Edit', id);
    // Open edit modal
  }, []);

  const handleDelete = useCallback((id) => {
    console.log('Delete', id);
    // Show delete confirmation
  }, []);

  const handleView = useCallback((id) => {
    console.log('View', id);
    // Navigate to detail page
  }, []);

  const handleSelect = useCallback((id, checked) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  // Single onClick handler for entire table
  return (
    <table onClick={handleTableClick}>
      <tbody>
        {data.map(row => (
          <tr key={row.id} data-row-id={row.id}>
            <td>
              {/* No inline functions! Use data-action attributes */}
              <button data-action="edit">Edit</button>
              <button data-action="delete">Delete</button>
              <button data-action="view">View</button>
              <input
                type="checkbox"
                data-action="select"
                checked={selectedRows.has(row.id)}
                onChange={() => {}} // Handled by delegation
              />
            </td>
            <td>{row.name}</td>
            <td>{row.email}</td>
            <td>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Advanced: Virtualized List with Event Delegation:**

```javascript
// ✅ EXCELLENT: Combine virtualization + event delegation
import { FixedSizeList } from 'react-window';

function VirtualizedDataTable({ data }) {
  const listRef = useRef(null);

  // Single delegated handler
  const handleAction = useCallback((action, rowId) => {
    switch (action) {
      case 'edit':
        openEditModal(rowId);
        break;
      case 'delete':
        deleteRow(rowId);
        break;
      case 'view':
        viewDetails(rowId);
        break;
    }
  }, []);

  // Row component (memoized)
  const Row = memo(({ index, style }) => {
    const row = data[index];

    return (
      <div style={style} data-row-id={row.id}>
        <button onClick={() => handleAction('edit', row.id)}>Edit</button>
        <button onClick={() => handleAction('delete', row.id)}>Delete</button>
        <button onClick={() => handleAction('view', row.id)}>View</button>
        <span>{row.name}</span>
        <span>{row.email}</span>
      </div>
    );
  });

  return (
    <FixedSizeList
      ref={listRef}
      height={600}
      itemCount={data.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

**Handling Event Pooling Issues (React <17):**

```javascript
// React <17: Common pooling bugs and solutions

// ❌ BAD: Async access without persist
function SearchInput() {
  const [query, setQuery] = useState('');

  const handleChange = (event) => {
    // Debounce with setTimeout
    setTimeout(() => {
      setQuery(event.target.value); // null! Event was pooled
    }, 300);
  };

  return <input onChange={handleChange} />;
}

// ✅ GOOD: Extract value immediately
function SearchInput() {
  const [query, setQuery] = useState('');
  const timeoutRef = useRef(null);

  const handleChange = (event) => {
    const value = event.target.value; // Extract immediately!

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setQuery(value); // Works!
    }, 300);
  };

  return <input onChange={handleChange} />;
}

// ✅ ALTERNATIVE: Use persist() (React <17 only)
function SearchInput() {
  const [query, setQuery] = useState('');
  const timeoutRef = useRef(null);

  const handleChange = (event) => {
    event.persist(); // Prevent pooling

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setQuery(event.target.value); // Works!
    }, 300);
  };

  return <input onChange={handleChange} />;
}
```

**Results After Optimization:**

```
After Optimization:
- Initial render: 124ms (31× faster)
- Memory usage: 47MB (90% reduction)
- Event listeners: 127 (99.7% reduction)
- Scroll FPS: 60 FPS (4× improvement)
- Re-render on data update: 89ms (26× faster)

Business Impact:
- Page load time: 3.8s → 0.9s (76% faster)
- User satisfaction: 62% → 94%
- Support tickets (performance): -87%
- Bounce rate: 34% → 12%
```

---

### ⚖️ Trade-offs

**1. Event Delegation vs Individual Listeners**

| Aspect | Event Delegation | Individual Listeners |
|--------|-----------------|---------------------|
| **Performance** | ✅ Fewer listeners, less memory | ❌ More listeners, more memory |
| **Scalability** | ✅ Constant listeners (large lists) | ❌ O(n) listeners |
| **Code Simplicity** | ⚠️ More complex routing logic | ✅ Simple, direct handlers |
| **Dynamic Content** | ✅ Works with added/removed elements | ❌ Must attach/detach manually |
| **Event Target Access** | ⚠️ Need to find actual target | ✅ Direct access to element |
| **Debugging** | ⚠️ Harder to trace event flow | ✅ Easier to debug |

**When to Use Event Delegation:**

```javascript
// ✅ GOOD: Large lists with many items
function TodoList({ todos }) {
  // 1000 todos = 1 listener (not 1000)
  const handleClick = (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const id = parseInt(button.closest('[data-id]').dataset.id, 10);

    if (action === 'delete') deleteTodo(id);
    if (action === 'edit') editTodo(id);
  };

  return (
    <ul onClick={handleClick}>
      {todos.map(todo => (
        <li key={todo.id} data-id={todo.id}>
          <span>{todo.text}</span>
          <button data-action="edit">Edit</button>
          <button data-action="delete">Delete</button>
        </li>
      ))}
    </ul>
  );
}

// ✅ GOOD: Dynamic content (items added/removed frequently)
function DynamicList() {
  const [items, setItems] = useState([]);

  const handleListClick = (e) => {
    // Works for dynamically added items
    const item = e.target.closest('[data-item]');
    if (item) handleItemClick(item.dataset.item);
  };

  return <div onClick={handleListClick}>...</div>;
}
```

**When to Use Individual Listeners:**

```javascript
// ✅ GOOD: Few static elements
function Navigation() {
  // Only 3-4 buttons, individual listeners are fine
  return (
    <nav>
      <button onClick={handleHome}>Home</button>
      <button onClick={handleAbout}>About</button>
      <button onClick={handleContact}>Contact</button>
    </nav>
  );
}

// ✅ GOOD: Complex interactive components
function Slider({ value, onChange }) {
  // Specific event handling logic
  const handleMouseDown = (e) => { /* ... */ };
  const handleMouseMove = (e) => { /* ... */ };
  const handleMouseUp = (e) => { /* ... */ };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      ...
    </div>
  );
}
```

**2. Event Pooling: React <17 vs React 17+**

| Aspect | React <17 (Pooling) | React 17+ (No Pooling) |
|--------|-------------------|----------------------|
| **Performance** | ✅ Less GC, reuses objects | ⚠️ More GC (minimal in practice) |
| **Async Access** | ❌ Must call persist() | ✅ Always works |
| **Developer Experience** | ❌ Confusing, easy to bug | ✅ Intuitive, predictable |
| **Memory Usage** | ✅ Slightly lower | ⚠️ Slightly higher (negligible) |
| **Debugging** | ❌ Hard to debug pooled events | ✅ Events persist in debugger |

```javascript
// React <17: Must handle pooling
function Form() {
  const handleSubmit = async (event) => {
    event.preventDefault();
    event.persist(); // Required for async!

    const formData = new FormData(event.target);
    await submitForm(formData);

    console.log(event.target); // Now works
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// React 17+: Pooling removed, always works
function Form() {
  const handleSubmit = async (event) => {
    event.preventDefault();
    // No persist() needed!

    const formData = new FormData(event.target);
    await submitForm(formData);

    console.log(event.target); // Works automatically
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**3. Inline Handlers vs Delegation in Lists**

```javascript
// Scenario: 1000-item list with action buttons

// ❌ BAD: Inline handlers (1000+ new functions per render)
function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <button onClick={() => handleEdit(item.id)}>Edit</button>
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
// Performance: ~180ms render time, 450MB memory

// ⚠️ BETTER: useCallback (still 1000+ stable references)
function List({ items }) {
  const handleEdit = useCallback((id) => { /* ... */ }, []);
  const handleDelete = useCallback((id) => { /* ... */ }, []);

  return (
    <ul>
      {items.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}
// Performance: ~95ms render time, 280MB memory

// ✅ BEST: Event delegation (1 listener)
function List({ items }) {
  const handleClick = useCallback((e) => {
    const action = e.target.dataset.action;
    const id = parseInt(e.target.closest('[data-id]').dataset.id, 10);

    if (action === 'edit') handleEdit(id);
    if (action === 'delete') handleDelete(id);
  }, []);

  return (
    <ul onClick={handleClick}>
      {items.map(item => (
        <li key={item.id} data-id={item.id}>
          <button data-action="edit">Edit</button>
          <button data-action="delete">Delete</button>
        </li>
      ))}
    </ul>
  );
}
// Performance: ~28ms render time, 89MB memory
```

**Decision Matrix:**

```
Use Event Delegation when:
- Large lists (100+ items)
- Dynamic content (frequent adds/removes)
- Performance is critical
- Memory constraints exist

Use Individual Listeners when:
- Small number of elements (<20)
- Complex event logic per element
- Need direct element reference
- Readability > micro-optimization

Use event.persist() (React <17) when:
- Accessing event asynchronously
- Storing event in state
- Passing event to callbacks

Extract values immediately when:
- Working with React <17
- Don't need full event object
- Simpler than persist()
- Better performance

Upgrade to React 17+ when:
- Event pooling causes bugs
- Want simpler async event handling
- Need gradual React version adoption
- Want event listeners on root (not document)
```

---

### 💬 Explain to Junior

**Simple Explanation:**

Event delegation is like having a teacher (parent) watch the entire classroom instead of hiring a tutor for each student (child element).

**The Classroom Analogy:**

```javascript
// ❌ Without delegation (inefficient)
// Hiring a tutor for each of 30 students
students.forEach(student => {
  student.addEventListener('question', answerQuestion);
}); // 30 tutors needed!

// ✅ With delegation (efficient)
// One teacher watches the whole class
classroom.addEventListener('question', (event) => {
  const student = event.target; // Who asked?
  answerQuestion(student);
}); // Only 1 teacher needed!
```

**Event Pooling - The Rental Car Analogy:**

React <17 treated events like rental cars:

```javascript
// React <17: Event pooling

// You rent a car (event object) for a trip
function handleClick(event) {
  console.log(event.target); // Using the car right now - works!

  // Try to use the car later...
  setTimeout(() => {
    console.log(event.target); // Car returned to rental company - null!
  }, 100);

  // Solution 1: Buy the car (persist)
  event.persist(); // Now it's yours to keep!

  // Solution 2: Take a photo (extract data)
  const target = event.target; // Save what you need
  setTimeout(() => {
    console.log(target); // Photo still works!
  }, 100);
}

// React 17+: You own the car
function handleClick(event) {
  // No rental, no return - it's yours!
  setTimeout(() => {
    console.log(event.target); // Still works!
  }, 100);
}
```

**Key Concepts in Simple Terms:**

**1. Event Delegation:**

```javascript
// Instead of this (100 listeners):
{items.map(item => (
  <button onClick={() => handleClick(item.id)}>
    Click {item.id}
  </button>
))}

// Do this (1 listener):
<div onClick={handleClick}>
  {items.map(item => (
    <button data-id={item.id}>
      Click {item.id}
    </button>
  ))}
</div>

function handleClick(event) {
  const id = event.target.dataset.id;
  console.log('Clicked:', id);
}
```

**2. Finding the Right Target:**

```javascript
// When you click, you might click the icon inside the button
<button data-action="delete">
  <Icon /> {/* You clicked this */}
  Delete
</button>

// Use .closest() to find the actual button
function handleClick(event) {
  // Find the nearest button, even if you clicked the icon
  const button = event.target.closest('button[data-action]');
  if (!button) return; // Clicked something else

  const action = button.dataset.action;
  console.log('Action:', action); // "delete"
}
```

**3. Common Patterns:**

```javascript
// Pattern 1: Simple delegation
function List() {
  const handleClick = (e) => {
    const id = e.target.dataset.id;
    if (id) console.log('Clicked:', id);
  };

  return (
    <ul onClick={handleClick}>
      <li data-id="1">Item 1</li>
      <li data-id="2">Item 2</li>
      <li data-id="3">Item 3</li>
    </ul>
  );
}

// Pattern 2: Different actions
function List() {
  const handleClick = (e) => {
    const action = e.target.dataset.action;
    const id = e.target.closest('[data-id]').dataset.id;

    if (action === 'edit') editItem(id);
    if (action === 'delete') deleteItem(id);
  };

  return (
    <ul onClick={handleClick}>
      <li data-id="1">
        Item 1
        <button data-action="edit">Edit</button>
        <button data-action="delete">Delete</button>
      </li>
    </ul>
  );
}

// Pattern 3: Preventing unwanted clicks
function List() {
  const handleClick = (e) => {
    // Only handle button clicks
    const button = e.target.closest('button');
    if (!button) return; // Ignore other clicks

    const action = button.dataset.action;
    handleAction(action);
  };

  return (
    <div onClick={handleClick}>
      <h2>Title</h2> {/* Clicking this does nothing */}
      <button data-action="submit">Submit</button>
    </div>
  );
}
```

**4. Event Pooling (React <17 only):**

```javascript
// The "rental car" problem
function Input() {
  const handleChange = (event) => {
    // Right now: event works
    console.log(event.target.value); // "hello"

    // Later: event returned to pool
    setTimeout(() => {
      console.log(event.target.value); // null!
    }, 100);
  };

  return <input onChange={handleChange} />;
}

// Solution 1: Take what you need immediately
function Input() {
  const handleChange = (event) => {
    const value = event.target.value; // Save it!

    setTimeout(() => {
      console.log(value); // Works!
    }, 100);
  };

  return <input onChange={handleChange} />;
}

// Solution 2: Keep the event (React <17)
function Input() {
  const handleChange = (event) => {
    event.persist(); // Don't return to pool

    setTimeout(() => {
      console.log(event.target.value); // Works!
    }, 100);
  };

  return <input onChange={handleChange} />;
}
```

**Interview Answer Template:**

"Event delegation is a pattern where React attaches event listeners to a parent element instead of individual child elements. When you click a child, the event bubbles up to the parent, and React determines which handler to call based on the event target. This improves performance because you only need one listener instead of hundreds or thousands.

Event pooling was a performance optimization in React 16 and earlier where React reused event objects to reduce garbage collection. After your event handler finished, React would nullify the event properties and return it to a pool for reuse. This caused issues when accessing events asynchronously - you had to call `event.persist()` to keep the event alive. In React 17+, event pooling was removed because modern JavaScript engines are efficient enough that the performance benefit wasn't worth the confusion.

For example, in a list of 1000 items, instead of creating 1000 click handlers, you can use event delegation to attach one handler to the parent and use `event.target.dataset` to identify which item was clicked. This dramatically reduces memory usage and improves render performance."

**Common Mistakes:**

```javascript
// Mistake 1: Not checking if target exists
function handleClick(e) {
  const id = e.target.dataset.id; // What if no data-id?
  console.log(id); // undefined!
}

// Fix: Check before using
function handleClick(e) {
  const element = e.target.closest('[data-id]');
  if (!element) return; // Exit early

  const id = element.dataset.id;
  console.log(id); // Safe!
}

// Mistake 2: Forgetting stopPropagation
function Parent() {
  return (
    <div onClick={() => console.log('Parent')}>
      <button onClick={() => console.log('Child')}>
        Click
      </button>
    </div>
  );
}
// Clicking button logs: "Child" then "Parent" (bubbles up!)

// Fix: Stop propagation if needed
function Parent() {
  return (
    <div onClick={() => console.log('Parent')}>
      <button onClick={(e) => {
        e.stopPropagation(); // Stop bubbling
        console.log('Child');
      }}>
        Click
      </button>
    </div>
  );
}
// Now only logs: "Child"

// Mistake 3: Async event access (React <17)
function handleSubmit(event) {
  event.preventDefault();

  // ❌ BAD
  fetch('/api').then(() => {
    console.log(event.target); // null!
  });

  // ✅ GOOD
  const form = event.target;
  fetch('/api').then(() => {
    console.log(form); // Works!
  });
}
```

**When to Use What:**

```
Small list (< 20 items):
→ Individual handlers are fine
→ More readable, easier to debug

Large list (100+ items):
→ Use event delegation
→ Much better performance

React <17:
→ Extract values immediately for async
→ Or use event.persist() if you need the whole event

React 17+:
→ Events work everywhere
→ No need for persist()
```
