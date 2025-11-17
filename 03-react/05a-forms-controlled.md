# React Forms - Controlled Components

> Controlled vs uncontrolled components

---

## Question 1: Controlled vs Uncontrolled Components

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Meta, Google, Amazon

### Question
What's the difference between controlled and uncontrolled components in React?

### Answer

**Controlled Components** - React state is the "single source of truth" for form input values.
**Uncontrolled Components** - DOM manages form data; use refs to access values when needed.

**Key Points:**
1. **Controlled** - React state drives the input value via `value` prop
2. **Validation** - Controlled components enable instant validation
3. **Multiple inputs** - Easier to manage with controlled approach
4. **Performance** - Uncontrolled can be slightly faster (no re-renders on each keystroke)
5. **React way** - Controlled components are the recommended React pattern

### Code Example

```jsx
// ❌ UNCONTROLLED (avoid in most cases)
function UncontrolledForm() {
  const nameRef = useRef();
  const emailRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Access values only on submit
    console.log({
      name: nameRef.current.value,
      email: emailRef.current.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} defaultValue="" />
      <input ref={emailRef} defaultValue="" />
      <button type="submit">Submit</button>
    </form>
  );
}

// ✅ CONTROLLED (React way)
function ControlledForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

// ✅ REAL-WORLD: Validation with controlled inputs
function FormWithValidation() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (value) => {
    if (!value.includes('@')) {
      setError('Invalid email');
    } else {
      setError('');
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={handleChange}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

// ✅ WHEN TO USE UNCONTROLLED: File inputs
function FileUpload() {
  const fileInputRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    // File inputs are always uncontrolled
    const file = fileInputRef.current.files[0];
    uploadFile(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" ref={fileInputRef} />
      <button type="submit">Upload</button>
    </form>
  );
}
```

### Common Mistakes

- ❌ Mixing controlled and uncontrolled (switching from undefined to value)
- ❌ Using both `value` and `defaultValue` props
- ❌ Forgetting to prevent default on form submit
- ✅ Always use controlled for complex forms with validation
- ✅ Use uncontrolled only for file inputs or non-React integrations

### Follow-up Questions

1. How do you handle multiple form inputs efficiently?
2. What happens if you switch from uncontrolled to controlled?
3. When would you use `defaultValue` vs `value`?

### Resources
- [React Forms](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)
- [Controlled vs Uncontrolled](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components)

---

