# React State Management - Context

> Context API and state management with Context

---

## Question 1: Context API - When to Use It

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Meta, Google, Amazon

### Question
Explain React Context API. When should you use it vs prop drilling vs external state management?

### Answer

**Context API** - Share data across component tree without prop drilling.

```jsx
// 1. Create Context
const ThemeContext = React.createContext('light');

// 2. Provider
function App() {
  const [theme, setTheme] = useState('dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Dashboard />
    </ThemeContext.Provider>
  );
}

// 3. Consumer (using useContext hook)
function Button() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button className={theme}>
      Toggle: {theme}
    </button>
  );
}
```

**When to Use:**
- ✅ Theme, locale, auth (rarely changing, widely needed)
- ✅ Avoid prop drilling 3+ levels
- ❌ Frequently changing data (performance issues)
- ❌ Complex state logic (use Redux/Zustand)

### Resources
- [React Context](https://react.dev/reference/react/useContext)

---

