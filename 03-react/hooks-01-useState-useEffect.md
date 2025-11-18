# React Hooks - useState and useEffect

> Master useState and useEffect hooks

---

## Question 1: What is useState and how does it work?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix

### Question
Explain the useState hook in React. How does it differ from class component state? When should you use functional updates?

### Answer

`useState` is a Hook that lets you add state to functional components.

1. **Basic Syntax**
   - Returns array: `[state, setState]`
   - State persists between re-renders
   - Triggers re-render when state changes

2. **Lazy Initialization**
   - Pass function to useState for expensive computations
   - Function only runs on initial render

3. **Functional Updates**
   - Use when new state depends on previous state
   - Guarantees correct state in async updates
   - Essential for closures and event handlers

4. **Multiple State Variables**
   - Can call useState multiple times
   - Each has independent state
   - Better than one giant object

### Code Example

```javascript
import { useState } from 'react';

// 1. BASIC USAGE
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// 2. LAZY INITIALIZATION (expensive computation)
function ExpensiveComponent() {
  const [data, setData] = useState(() => {
    console.log('Computing initial state...');
    return computeExpensiveValue(); // Only runs once
  });

  // Wrong: runs on every render
  // const [data, setData] = useState(computeExpensiveValue());
}

// 3. FUNCTIONAL UPDATES
function Counter2() {
  const [count, setCount] = useState(0);

  // ❌ Wrong: doesn't work correctly with multiple rapid clicks
  const increment = () => {
    setCount(count + 1);
    setCount(count + 1); // Still uses old count!
  };

  // ✅ Correct: functional update
  const incrementCorrect = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1); // Works correctly!
  };

  return <button onClick={incrementCorrect}>Count: {count}</button>;
}

// 4. MULTIPLE STATE VARIABLES
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);

  // Better than:
  // const [form, setForm] = useState({ name: '', email: '', age: 0 });
}

// 5. OBJECT STATE
function UserProfile() {
  const [user, setUser] = useState({ name: '', age: 0 });

  // ❌ Wrong: loses other properties
  const updateName = (name) => {
    setUser({ name }); // age is lost!
  };

  // ✅ Correct: spread existing state
  const updateNameCorrect = (name) => {
    setUser(prev => ({ ...prev, name }));
  };
}

// 6. ARRAY STATE
function TodoList() {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    // ✅ Correct: create new array
    setTodos(prev => [...prev, { id: Date.now(), text }]);
  };

  const removeTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const updateTodo = (id, newText) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };
}

// 7. TOGGLE STATE
function Toggle() {
  const [isOn, setIsOn] = useState(false);

  // ✅ Functional update for toggles
  const toggle = () => setIsOn(prev => !prev);

  return <button onClick={toggle}>{isOn ? 'ON' : 'OFF'}</button>;
}

// 8. FORM HANDLING
function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form>
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
      />
      <input
        type="checkbox"
        name="rememberMe"
        checked={formData.rememberMe}
        onChange={handleChange}
      />
    </form>
  );
}
```

### Common Mistakes

❌ **Mistake 1:** Mutating state directly
```javascript
const [items, setItems] = useState([1, 2, 3]);
items.push(4); // Wrong! Mutates state
setItems(items); // React won't detect change
```

❌ **Mistake 2:** Not using functional updates in loops
```javascript
for (let i = 0; i < 3; i++) {
  setCount(count + 1); // All use same count!
}

// ✅ Correct
for (let i = 0; i < 3; i++) {
  setCount(prev => prev + 1);
}
```

✅ **Correct:** Always create new references
```javascript
setItems(prev => [...prev, 4]); // New array reference
```

### Follow-up Questions

- "Why do we need functional updates?"
- "What's the difference between useState and useReducer?"
- "How does React know when to re-render?"
- "Can you batch multiple setState calls?"
- "What happens if you call setState with the same value?"

### Resources

- [React Docs: useState](https://react.dev/reference/react/useState)
- [useState Complete Guide](https://www.robinwieruch.de/react-usestate-hook/)

---

