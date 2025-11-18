# React Forms - Validation

> Form validation and form libraries

---

## Question 2: React Hook Form - Modern Form Management

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Netflix, Airbnb, Stripe

### Question
How does React Hook Form work and why is it better than managing form state manually?

### Answer

**React Hook Form** - Performant, flexible form validation library with minimal re-renders.

**Key Points:**
1. **Uncontrolled under the hood** - Uses refs, fewer re-renders
2. **Built-in validation** - Integrates with schema libraries (Zod, Yup)
3. **Performance** - Only re-renders when needed
4. **TypeScript support** - Excellent type inference
5. **Bundle size** - Small (~8KB) compared to Formik (~15KB)

### Code Example

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// 1. BASIC USAGE
function BasicForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters'
          }
        })}
        type="password"
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}

// 2. WITH ZOD VALIDATION (Recommended)
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type FormData = z.infer<typeof schema>;

function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    await createUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <input {...register('confirmPassword')} type="password" placeholder="Confirm" />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Loading...' : 'Sign Up'}
      </button>
    </form>
  );
}

// 3. WATCH VALUES (conditional rendering)
function ConditionalForm() {
  const { register, watch } = useForm();
  const showAdditional = watch('hasAddress');

  return (
    <form>
      <label>
        <input {...register('hasAddress')} type="checkbox" />
        Add address details
      </label>

      {showAdditional && (
        <div>
          <input {...register('street')} placeholder="Street" />
          <input {...register('city')} placeholder="City" />
        </div>
      )}
    </form>
  );
}

// 4. FIELD ARRAY (dynamic form fields)
import { useFieldArray } from 'react-hook-form';

function DynamicFieldsForm() {
  const { register, control } = useForm({
    defaultValues: {
      users: [{ name: '', email: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'users'
  });

  return (
    <form>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`users.${index}.name`)} placeholder="Name" />
          <input {...register(`users.${index}.email`)} placeholder="Email" />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '', email: '' })}>
        Add User
      </button>
    </form>
  );
}
```

### Common Mistakes

- ❌ Using `value` prop with `register()` (conflicts with uncontrolled approach)
- ❌ Not handling async validation properly
- ❌ Forgetting to use `control` prop with `Controller` for custom components
- ✅ Use `Controller` for controlled UI libraries (MUI, Ant Design)
- ✅ Leverage TypeScript for type-safe forms

### Follow-up Questions

1. How does React Hook Form achieve better performance than Formik?
2. When would you use `Controller` vs `register`?
3. How do you handle async validation (e.g., check if username exists)?

### Resources
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Integration](https://github.com/colinhacks/zod)

---

## Question 3: Form Validation Strategies

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** All companies

### Question
What are the different approaches to form validation in React? What are the trade-offs?

### Answer

**Validation Strategies:**
1. **Manual validation** - Custom logic in event handlers
2. **Schema validation** - Zod, Yup for declarative validation
3. **HTML5 validation** - Built-in browser validation
4. **Real-time validation** - Validate on every keystroke
5. **On-blur validation** - Validate when field loses focus

**Key Points:**
1. **User experience** - Balance between helpful and annoying
2. **Performance** - Debounce expensive validations
3. **Accessibility** - Proper error announcements for screen readers
4. **Backend validation** - Always validate on server too
5. **Error display** - Show errors at the right time

### Code Example

```jsx
// 1. MANUAL VALIDATION (simple forms)
function ManualValidation() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      submitForm({ email });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={validate}
      />
      {errors.email && <span>{errors.email}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}

// 2. SCHEMA VALIDATION WITH ZOD
import { z } from 'zod';

const userSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  age: z.number()
    .min(18, 'Must be at least 18 years old')
    .max(120, 'Invalid age'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  website: z.string().url('Invalid URL').optional()
});

// 3. REAL-TIME VALIDATION WITH DEBOUNCE
import { useDebounce } from './hooks/useDebounce';

function RealtimeValidation() {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);

  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    if (debouncedUsername) {
      setIsChecking(true);
      checkUsernameAvailability(debouncedUsername)
        .then(available => {
          setIsAvailable(available);
          setIsChecking(false);
        });
    }
  }, [debouncedUsername]);

  return (
    <div>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {isChecking && <span>Checking...</span>}
      {!isChecking && isAvailable === false && (
        <span className="error">Username taken</span>
      )}
      {!isChecking && isAvailable === true && (
        <span className="success">Username available</span>
      )}
    </div>
  );
}

// 4. ACCESSIBLE FORM WITH ERROR ANNOUNCEMENTS
function AccessibleForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleBlur = () => {
    if (!email.includes('@')) {
      setError('Invalid email format');
    } else {
      setError('');
    }
  };

  return (
    <div>
      <label htmlFor="email">
        Email <span aria-label="required">*</span>
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={handleBlur}
        aria-invalid={!!error}
        aria-describedby={error ? 'email-error' : undefined}
      />
      {error && (
        <span
          id="email-error"
          role="alert"
          className="error"
        >
          {error}
        </span>
      )}
    </div>
  );
}

// 5. VALIDATION TIMING STRATEGIES
function ValidationTiming() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    // Validation logic
    if (field === 'email' && !value.includes('@')) {
      return 'Invalid email';
    }
    if (field === 'password' && value.length < 8) {
      return 'Password too short';
    }
    return null;
  };

  const handleBlur = (field) => {
    // Validate on blur (after user leaves field)
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validate(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Only show errors after field has been touched
    if (touched[field]) {
      const error = validate(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  return (
    <form>
      <input
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
      />
      {touched.email && errors.email && <span>{errors.email}</span>}

      <input
        type="password"
        value={formData.password}
        onChange={(e) => handleChange('password', e.target.value)}
        onBlur={() => handleBlur('password')}
      />
      {touched.password && errors.password && <span>{errors.password}</span>}
    </form>
  );
}
```

### Common Mistakes

- ❌ Showing errors immediately on page load
- ❌ Not validating on the server (client validation can be bypassed)
- ❌ Expensive validation on every keystroke without debouncing
- ❌ Poor error messages ("Invalid input" instead of "Email must contain @")
- ✅ Show errors after blur or submit attempt
- ✅ Provide clear, actionable error messages
- ✅ Always validate on both client and server

### Follow-up Questions

1. How would you handle async validation (e.g., checking if email exists)?
2. What's the difference between validation on change vs on blur?
3. How do you prevent form submission with invalid data?

### Resources
- [Form Validation Best Practices](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/)
- [Zod Documentation](https://zod.dev/)

---

**[← Back to React README](./README.md)**
