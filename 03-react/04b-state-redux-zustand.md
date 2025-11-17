# React State Management - Redux and Zustand

> Redux, Zustand, and other state management libraries

---

## Question 2: Context Performance Optimization

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Meta, Netflix, Performance-critical apps

### Question
What are the performance pitfalls of React Context and how do you optimize it?

### Answer

**Context Performance Issue** - Every context value change re-renders ALL consumers, even if they only use part of the value.

### Code Example

```jsx
// ❌ BAD: Single context with multiple values
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);

  // New object on every render!
  const value = { user, setUser, theme, setTheme, notifications, setNotifications };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Problem: Changing theme re-renders ALL components using AppContext

// ✅ SOLUTION 1: Split contexts
const UserContext = createContext();
const ThemeContext = createContext();
const NotificationContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <NotificationContext.Provider value={{ notifications, setNotifications }}>
          {children}
        </NotificationContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

// Now components only re-render when their specific context changes

// ✅ SOLUTION 2: Memoize context value
function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({ user, setUser }),
    [user] // Only create new object when user changes
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// ✅ SOLUTION 3: Separate state and dispatch
const StateContext = createContext();
const DispatchContext = createContext();

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// Components that only dispatch don't re-render when state changes!
function Button() {
  const dispatch = useContext(DispatchContext);
  // No re-render when state changes
  return <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>;
}

// ✅ SOLUTION 4: Selector pattern
function useAppSelector(selector) {
  const state = useContext(StateContext);
  return selector(state);
}

function UserName() {
  // Only re-renders when user.name changes
  const name = useAppSelector(state => state.user.name);
  return <div>{name}</div>;
}
```

### Resources
- [Context Performance](https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions)

---

## Question 3: When to Use Redux vs Zustand vs Context?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** All companies with complex state

### Question
Compare React Context, Redux, and Zustand. When should you use each?

### Answer

**Key Differences:**
- **Context**: Built-in, simple, good for infrequent updates
- **Redux**: Powerful, lots of boilerplate, time-travel debugging
- **Zustand**: Minimal boilerplate, hooks-based, good middle ground

### Code Example

```jsx
// 1. REACT CONTEXT (Simple state)
const TodoContext = createContext();

function TodoProvider({ children }) {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, done: false }]);
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo }}>
      {children}
    </TodoContext.Provider>
  );
}

// 2. ZUSTAND (Medium complexity)
import create from 'zustand';

const useTodoStore = create((set) => ({
  todos: [],
  addTodo: (text) =>
    set((state) => ({
      todos: [...state.todos, { id: Date.now(), text, done: false }]
    })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    }))
}));

// Usage
function TodoList() {
  const todos = useTodoStore(state => state.todos); // Selector!
  const addTodo = useTodoStore(state => state.addTodo);

  return (
    <div>
      {todos.map(todo => <TodoItem key={todo.id} todo={todo} />)}
      <button onClick={() => addTodo('New task')}>Add</button>
    </div>
  );
}

// 3. REDUX TOOLKIT (Complex state)
import { createSlice, configureStore } from '@reduxjs/toolkit';

const todoSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      state.push({ id: Date.now(), text: action.payload, done: false });
    },
    toggleTodo: (state, action) => {
      const todo = state.find(t => t.id === action.payload);
      if (todo) todo.done = !todo.done;
    }
  }
});

const store = configureStore({ reducer: { todos: todoSlice.reducer } });

// Usage
import { useSelector, useDispatch } from 'react-redux';

function TodoList() {
  const todos = useSelector(state => state.todos);
  const dispatch = useDispatch();

  return (
    <div>
      {todos.map(todo => <TodoItem key={todo.id} todo={todo} />)}
      <button onClick={() => dispatch(addTodo('New task'))}>Add</button>
    </div>
  );
}

// DECISION MATRIX
// Context: Theme, auth, locale (rarely changes, widely needed)
// Zustand: Medium apps, simple global state, good DX
// Redux: Large apps, complex state, time-travel, middleware needs
```

### Resources
- [Zustand](https://github.com/pmndrs/zustand)
- [Redux Toolkit](https://redux-toolkit.js.org/)

---

**[← Back to React README](./README.md)**
