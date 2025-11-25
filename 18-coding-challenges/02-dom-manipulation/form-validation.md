# Form Validation Component

## Problem Statement

Implement a production-ready form validation system with real-time validation, custom rules, async validators (email uniqueness), and comprehensive error handling. The validator should be reusable, accessible, and support multiple validation strategies (on blur, on input, on submit).

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 30-40 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix, Airbnb (every company with forms!)

## Requirements

- [ ] Real-time validation (on input, on blur, on submit)
- [ ] Built-in validators (required, email, minLength, maxLength, pattern, match)
- [ ] Custom validation rules
- [ ] Async validation (email uniqueness, username availability)
- [ ] Clear, accessible error messages
- [ ] Field-level and form-level validation
- [ ] Error state management
- [ ] ARIA attributes for accessibility
- [ ] Debounced async validators
- [ ] Cancel previous async validations
- [ ] Prevent form submission on validation errors
- [ ] Support for custom error rendering

## Example Usage

```html
<form id="signup-form">
  <div class="form-group">
    <label for="email">Email</label>
    <input type="text" name="email" id="email" />
    <span class="error-message"></span>
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <input type="password" name="password" id="password" />
    <span class="error-message"></span>
  </div>

  <div class="form-group">
    <label for="confirmPassword">Confirm Password</label>
    <input type="password" name="confirmPassword" id="confirmPassword" />
    <span class="error-message"></span>
  </div>

  <div class="form-group">
    <label for="username">Username</label>
    <input type="text" name="username" id="username" />
    <span class="error-message"></span>
  </div>

  <button type="submit">Sign Up</button>
</form>

<script>
const validator = new FormValidator(
  document.getElementById('signup-form'),
  {
    email: [
      { required: true, message: 'Email is required' },
      { email: true, message: 'Please enter a valid email' },
      {
        validator: async (email) => {
          const response = await fetch(`/api/check-email?email=${email}`);
          const { available } = await response.json();
          return available;
        },
        message: 'Email already exists'
      }
    ],
    password: [
      { required: true },
      { minLength: 8, message: 'Password must be at least 8 characters' },
      {
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message: 'Password must contain uppercase, lowercase, number, and special character'
      }
    ],
    confirmPassword: [
      { required: true },
      { match: 'password', message: 'Passwords do not match' }
    ],
    username: [
      { required: true },
      { minLength: 3 },
      { maxLength: 20 },
      { pattern: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, and underscores allowed' }
    ]
  },
  {
    validateOnBlur: true,
    validateOnInput: true,
    debounceTime: 300
  }
);
</script>
```

## Solution 1: Inline Validation (Beginner)

```javascript
// ❌ ANTI-PATTERN: Inline validation with if/else
// Issues: Repetitive, not reusable, hard to test, no async support

const form = document.getElementById('signup-form');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Email validation
  const email = form.elements.email.value;
  if (!email) {
    showError('email', 'Email is required');
    return;
  }
  if (!email.includes('@')) {
    showError('email', 'Invalid email format');
    return;
  }

  // Password validation
  const password = form.elements.password.value;
  if (!password) {
    showError('password', 'Password is required');
    return;
  }
  if (password.length < 8) {
    showError('password', 'Password must be at least 8 characters');
    return;
  }
  if (!/[A-Z]/.test(password)) {
    showError('password', 'Password must contain uppercase letter');
    return;
  }
  // ... more repetitive checks

  // Confirm password validation
  const confirmPassword = form.elements.confirmPassword.value;
  if (password !== confirmPassword) {
    showError('confirmPassword', 'Passwords do not match');
    return;
  }

  // Submit form
  console.log('Form is valid!');
});

function showError(fieldName, message) {
  const field = form.elements[fieldName];
  const errorSpan = field.parentElement.querySelector('.error-message');
  errorSpan.textContent = message;
  field.classList.add('invalid');
}

// Problems:
// - No real-time validation
// - No reusability
// - Hard to maintain
// - No async validation
// - No debouncing
// - Poor UX (errors only on submit)
```

## Solution 2: Constraint Validation API (Intermediate)

```javascript
// Uses HTML5 built-in validation + setCustomValidity
// Better but limited customization

class BasicValidator {
  constructor(form) {
    this.form = form;
    this.init();
  }

  init() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    // Validate on blur
    this.form.addEventListener('blur', this.handleBlur.bind(this), true);
  }

  handleSubmit(e) {
    if (!this.form.checkValidity()) {
      e.preventDefault();
      this.showAllErrors();
    }
  }

  handleBlur(e) {
    if (e.target.tagName === 'INPUT') {
      this.validateField(e.target);
    }
  }

  validateField(field) {
    // Use built-in validation
    const isValid = field.checkValidity();

    if (!isValid) {
      const errorMessage = field.validationMessage;
      this.showFieldError(field, errorMessage);
    } else {
      this.clearFieldError(field);
    }
  }

  showFieldError(field, message) {
    field.classList.add('invalid');
    field.setAttribute('aria-invalid', 'true');

    const errorSpan = field.parentElement.querySelector('.error-message');
    if (errorSpan) {
      errorSpan.textContent = message;
    }
  }

  clearFieldError(field) {
    field.classList.remove('invalid');
    field.setAttribute('aria-invalid', 'false');

    const errorSpan = field.parentElement.querySelector('.error-message');
    if (errorSpan) {
      errorSpan.textContent = '';
    }
  }

  showAllErrors() {
    const inputs = this.form.querySelectorAll('input');
    inputs.forEach(input => {
      if (!input.checkValidity()) {
        this.validateField(input);
      }
    });
  }
}

// Usage
const validator = new BasicValidator(document.getElementById('signup-form'));

// Limitations:
// - Limited to HTML5 validation rules
// - No custom async validators
// - No match validation (password confirmation)
// - Limited error message customization
// - No debouncing
```

## Solution 3: Production-Grade Validator ✅ (Advanced)

```javascript
class FormValidator {
  constructor(form, rules, options = {}) {
    this.form = form;
    this.rules = rules;
    this.errors = {};
    this.asyncValidators = new Map(); // Track pending async validations

    // Options
    this.validateOnBlur = options.validateOnBlur !== false;
    this.validateOnInput = options.validateOnInput !== false;
    this.debounceTime = options.debounceTime || 300;
    this.debounceTimers = new Map();

    this.init();
  }

  init() {
    // Submit handler
    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    // Blur handler (validate field on blur)
    if (this.validateOnBlur) {
      this.form.addEventListener('blur', this.handleBlur.bind(this), true);
    }

    // Input handler (clear errors on input)
    if (this.validateOnInput) {
      this.form.addEventListener('input', this.handleInput.bind(this));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const isValid = await this.validate();

    if (isValid) {
      this.clearAllErrors();
      // Submit form
      console.log('Form submitted:', this.getFormData());
      // this.form.submit(); // Uncomment in production
    } else {
      this.showAllErrors();
      // Focus first invalid field
      this.focusFirstInvalidField();
    }
  }

  async handleBlur(e) {
    if (e.target.name && this.rules[e.target.name]) {
      await this.validateField(e.target.name, e.target.value);
      this.showFieldError(e.target.name);
    }
  }

  async handleInput(e) {
    const fieldName = e.target.name;

    if (!fieldName || !this.rules[fieldName]) return;

    // Clear previous debounce timer
    if (this.debounceTimers.has(fieldName)) {
      clearTimeout(this.debounceTimers.get(fieldName));
    }

    // If field was previously invalid, revalidate
    if (this.errors[fieldName]) {
      // Debounce async validators, instant for sync validators
      const hasAsyncValidator = this.hasAsyncValidator(fieldName);

      if (hasAsyncValidator) {
        const timer = setTimeout(async () => {
          await this.validateField(fieldName, e.target.value);
          this.showFieldError(fieldName);
        }, this.debounceTime);

        this.debounceTimers.set(fieldName, timer);
      } else {
        await this.validateField(fieldName, e.target.value);
        this.showFieldError(fieldName);
      }
    }
  }

  hasAsyncValidator(fieldName) {
    const fieldRules = this.rules[fieldName];
    return fieldRules.some(rule => rule.validator && rule.validator.constructor.name === 'AsyncFunction');
  }

  async validate() {
    this.errors = {};

    const formData = this.getFormData();

    // Validate all fields
    const validationPromises = Object.keys(this.rules).map(async (fieldName) => {
      await this.validateField(fieldName, formData[fieldName]);
    });

    await Promise.all(validationPromises);

    return Object.keys(this.errors).length === 0;
  }

  async validateField(fieldName, value) {
    const fieldRules = this.rules[fieldName];

    if (!fieldRules) return;

    // Clear previous error
    delete this.errors[fieldName];

    // Cancel previous async validation if exists
    if (this.asyncValidators.has(fieldName)) {
      this.asyncValidators.get(fieldName).cancelled = true;
    }

    // Run all rules in sequence (stop at first error)
    for (const rule of fieldRules) {
      const error = await this.runRule(rule, value, fieldName);

      if (error) {
        this.errors[fieldName] = error;
        break; // Stop at first error
      }
    }
  }

  async runRule(rule, value, fieldName) {
    // REQUIRED validator
    if (rule.required && !value.trim()) {
      return rule.message || 'This field is required';
    }

    // Skip remaining validators if field is empty and not required
    if (!value.trim() && !rule.required) {
      return null;
    }

    // EMAIL validator
    if (rule.email && !this.isValidEmail(value)) {
      return rule.message || 'Invalid email format';
    }

    // MIN LENGTH validator
    if (rule.minLength !== undefined && value.length < rule.minLength) {
      return rule.message || `Minimum ${rule.minLength} characters required`;
    }

    // MAX LENGTH validator
    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      return rule.message || `Maximum ${rule.maxLength} characters allowed`;
    }

    // PATTERN validator
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || 'Invalid format';
    }

    // MATCH validator (confirm password)
    if (rule.match) {
      const matchField = this.form.elements[rule.match];
      if (matchField && value !== matchField.value) {
        return rule.message || `Must match ${rule.match}`;
      }
    }

    // CUSTOM ASYNC validator
    if (rule.validator) {
      // Create cancellable validation
      const validationId = { cancelled: false };
      this.asyncValidators.set(fieldName, validationId);

      try {
        const isValid = await rule.validator(value, fieldName, this.getFormData());

        // Check if validation was cancelled
        if (validationId.cancelled) {
          return null; // Ignore result
        }

        if (!isValid) {
          return rule.message || 'Validation failed';
        }
      } catch (error) {
        console.error(`Validation error for ${fieldName}:`, error);
        return 'Validation error occurred';
      } finally {
        this.asyncValidators.delete(fieldName);
      }
    }

    return null;
  }

  isValidEmail(email) {
    // RFC 5322 simplified regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  showFieldError(fieldName) {
    const field = this.form.elements[fieldName];
    if (!field) return;

    const errorContainer = field.parentElement.querySelector('.error-message');

    if (this.errors[fieldName]) {
      // Show error
      field.classList.add('invalid');
      field.classList.remove('valid');
      field.setAttribute('aria-invalid', 'true');

      if (errorContainer) {
        errorContainer.textContent = this.errors[fieldName];
        errorContainer.style.display = 'block';
        errorContainer.setAttribute('role', 'alert');
      }
    } else {
      // Clear error
      field.classList.remove('invalid');
      field.classList.add('valid');
      field.setAttribute('aria-invalid', 'false');

      if (errorContainer) {
        errorContainer.textContent = '';
        errorContainer.style.display = 'none';
        errorContainer.removeAttribute('role');
      }
    }
  }

  showAllErrors() {
    Object.keys(this.rules).forEach(fieldName => {
      this.showFieldError(fieldName);
    });
  }

  clearAllErrors() {
    this.errors = {};
    Object.keys(this.rules).forEach(fieldName => {
      this.showFieldError(fieldName);
    });
  }

  focusFirstInvalidField() {
    const firstInvalidField = Object.keys(this.errors)[0];
    if (firstInvalidField) {
      const field = this.form.elements[firstInvalidField];
      if (field) {
        field.focus();
      }
    }
  }

  getFormData() {
    const formData = {};
    const elements = this.form.elements;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.name) {
        formData[element.name] = element.value;
      }
    }

    return formData;
  }

  // Public API: Programmatic validation
  async isValid() {
    return await this.validate();
  }

  // Public API: Get errors
  getErrors() {
    return { ...this.errors };
  }

  // Public API: Destroy validator
  destroy() {
    // Clear timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();

    // Cancel async validators
    this.asyncValidators.forEach(validation => {
      validation.cancelled = true;
    });
    this.asyncValidators.clear();

    // Remove event listeners
    this.form.removeEventListener('submit', this.handleSubmit);
    this.form.removeEventListener('blur', this.handleBlur, true);
    this.form.removeEventListener('input', this.handleInput);
  }
}

// Advanced Usage Examples

// 1. REGISTRATION FORM
const registrationValidator = new FormValidator(
  document.getElementById('signup-form'),
  {
    email: [
      { required: true, message: 'Email is required' },
      { email: true, message: 'Please enter a valid email address' },
      {
        validator: async (email) => {
          // Simulate API call with debouncing
          const response = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
          const { available } = await response.json();
          return available;
        },
        message: 'This email is already registered'
      }
    ],
    password: [
      { required: true },
      { minLength: 8, message: 'Password must be at least 8 characters' },
      {
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message: 'Password must contain uppercase, lowercase, number, and special character'
      }
    ],
    confirmPassword: [
      { required: true, message: 'Please confirm your password' },
      { match: 'password', message: 'Passwords do not match' }
    ],
    username: [
      { required: true },
      { minLength: 3, message: 'Username must be at least 3 characters' },
      { maxLength: 20, message: 'Username must not exceed 20 characters' },
      {
        pattern: /^[a-zA-Z0-9_]+$/,
        message: 'Username can only contain letters, numbers, and underscores'
      },
      {
        validator: async (username) => {
          const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
          const { available } = await response.json();
          return available;
        },
        message: 'This username is already taken'
      }
    ],
    age: [
      { required: true },
      {
        validator: (age) => {
          const ageNum = parseInt(age, 10);
          return ageNum >= 18 && ageNum <= 120;
        },
        message: 'You must be between 18 and 120 years old'
      }
    ]
  },
  {
    validateOnBlur: true,
    validateOnInput: true,
    debounceTime: 500 // Longer debounce for async validators
  }
);

// 2. CHECKOUT FORM
const checkoutValidator = new FormValidator(
  document.getElementById('checkout-form'),
  {
    cardNumber: [
      { required: true, message: 'Card number is required' },
      {
        pattern: /^\d{16}$/,
        message: 'Card number must be 16 digits'
      },
      {
        validator: (cardNumber) => {
          // Luhn algorithm for card validation
          let sum = 0;
          let isEven = false;

          for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber[i], 10);

            if (isEven) {
              digit *= 2;
              if (digit > 9) digit -= 9;
            }

            sum += digit;
            isEven = !isEven;
          }

          return sum % 10 === 0;
        },
        message: 'Invalid card number'
      }
    ],
    cvv: [
      { required: true },
      { pattern: /^\d{3,4}$/, message: 'CVV must be 3 or 4 digits' }
    ],
    expiryDate: [
      { required: true },
      {
        validator: (expiry) => {
          // Format: MM/YY
          const [month, year] = expiry.split('/').map(s => parseInt(s, 10));
          const now = new Date();
          const currentYear = now.getFullYear() % 100;
          const currentMonth = now.getMonth() + 1;

          if (month < 1 || month > 12) return false;
          if (year < currentYear) return false;
          if (year === currentYear && month < currentMonth) return false;

          return true;
        },
        message: 'Card has expired or invalid date'
      }
    ]
  }
);

// 3. CUSTOM ERROR RENDERING
class CustomFormValidator extends FormValidator {
  showFieldError(fieldName) {
    const field = this.form.elements[fieldName];
    if (!field) return;

    // Custom error rendering with toast notification
    if (this.errors[fieldName]) {
      field.classList.add('invalid');

      // Show toast notification
      this.showToast(this.errors[fieldName], 'error');

      // Custom error tooltip
      this.createErrorTooltip(field, this.errors[fieldName]);
    } else {
      field.classList.remove('invalid');
      this.removeErrorTooltip(field);
    }
  }

  showToast(message, type) {
    // Custom toast implementation
    console.log(`[${type.toUpperCase()}]`, message);
  }

  createErrorTooltip(field, message) {
    // Remove existing tooltip
    this.removeErrorTooltip(field);

    const tooltip = document.createElement('div');
    tooltip.className = 'error-tooltip';
    tooltip.textContent = message;
    tooltip.setAttribute('role', 'alert');

    field.parentElement.style.position = 'relative';
    field.parentElement.appendChild(tooltip);
  }

  removeErrorTooltip(field) {
    const tooltip = field.parentElement.querySelector('.error-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }
}
```

## Test Cases

```javascript
describe('FormValidator', () => {
  let form;
  let validator;

  beforeEach(() => {
    // Create test form
    document.body.innerHTML = `
      <form id="test-form">
        <div>
          <input type="text" name="email" />
          <span class="error-message"></span>
        </div>
        <div>
          <input type="password" name="password" />
          <span class="error-message"></span>
        </div>
        <div>
          <input type="password" name="confirmPassword" />
          <span class="error-message"></span>
        </div>
        <button type="submit">Submit</button>
      </form>
    `;

    form = document.getElementById('test-form');
  });

  afterEach(() => {
    if (validator) {
      validator.destroy();
    }
  });

  test('validates required fields', async () => {
    validator = new FormValidator(form, {
      email: [{ required: true, message: 'Email is required' }]
    });

    const isValid = await validator.validate();

    expect(isValid).toBe(false);
    expect(validator.getErrors().email).toBe('Email is required');
  });

  test('validates email format', async () => {
    validator = new FormValidator(form, {
      email: [{ email: true, message: 'Invalid email' }]
    });

    form.elements.email.value = 'invalid-email';
    const isValid = await validator.validate();

    expect(isValid).toBe(false);
    expect(validator.getErrors().email).toBe('Invalid email');
  });

  test('validates password strength', async () => {
    validator = new FormValidator(form, {
      password: [
        { minLength: 8 },
        { pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/ }
      ]
    });

    form.elements.password.value = 'weak';
    const isValid = await validator.validate();

    expect(isValid).toBe(false);
  });

  test('validates password match', async () => {
    validator = new FormValidator(form, {
      password: [{ required: true }],
      confirmPassword: [{ match: 'password', message: 'Passwords must match' }]
    });

    form.elements.password.value = 'Password123!';
    form.elements.confirmPassword.value = 'Different123!';

    const isValid = await validator.validate();

    expect(isValid).toBe(false);
    expect(validator.getErrors().confirmPassword).toBe('Passwords must match');
  });

  test('handles async validation', async () => {
    validator = new FormValidator(form, {
      email: [
        {
          validator: async (email) => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 100));
            return email !== 'taken@example.com';
          },
          message: 'Email already exists'
        }
      ]
    });

    form.elements.email.value = 'taken@example.com';
    const isValid = await validator.validate();

    expect(isValid).toBe(false);
    expect(validator.getErrors().email).toBe('Email already exists');
  });

  test('cancels previous async validations', async () => {
    let validationCount = 0;

    validator = new FormValidator(form, {
      email: [
        {
          validator: async (email) => {
            validationCount++;
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
          }
        }
      ]
    }, { debounceTime: 50 });

    // Trigger multiple validations quickly
    form.elements.email.value = 'test1@example.com';
    await validator.validateField('email', 'test1@example.com');

    form.elements.email.value = 'test2@example.com';
    await validator.validateField('email', 'test2@example.com');

    form.elements.email.value = 'test3@example.com';
    await validator.validateField('email', 'test3@example.com');

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 200));

    // Only the last validation should complete
    expect(validationCount).toBeLessThan(3);
  });

  test('shows errors on blur', async () => {
    validator = new FormValidator(form, {
      email: [{ required: true, message: 'Email is required' }]
    }, { validateOnBlur: true });

    const input = form.elements.email;
    input.focus();
    input.blur();

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(input.classList.contains('invalid')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  test('clears errors on valid input', async () => {
    validator = new FormValidator(form, {
      email: [{ email: true }]
    }, { validateOnInput: true });

    const input = form.elements.email;

    // Trigger invalid state
    input.value = 'invalid';
    await validator.validateField('email', 'invalid');
    validator.showFieldError('email');

    expect(validator.getErrors().email).toBeDefined();

    // Fix the input
    input.value = 'valid@example.com';
    await validator.validateField('email', 'valid@example.com');

    expect(validator.getErrors().email).toBeUndefined();
  });

  test('prevents form submission when invalid', async () => {
    validator = new FormValidator(form, {
      email: [{ required: true }]
    });

    const submitHandler = jest.fn();
    form.addEventListener('submit', submitHandler);

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(submitEvent.defaultPrevented).toBe(true);
  });

  test('focuses first invalid field on submit', async () => {
    validator = new FormValidator(form, {
      email: [{ required: true }],
      password: [{ required: true }]
    });

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(document.activeElement).toBe(form.elements.email);
  });

  test('cleans up on destroy', () => {
    validator = new FormValidator(form, {
      email: [{ required: true }]
    });

    validator.destroy();

    expect(validator.debounceTimers.size).toBe(0);
    expect(validator.asyncValidators.size).toBe(0);
  });
});
```

## Complexity Analysis

**Time Complexity:**
- Validation per field: O(r × v) where r = number of rules, v = validator complexity
- Async validators: O(1) + network latency
- Form validation: O(n × r × v) where n = number of fields
- Debouncing: Reduces validations from O(k) to O(1) where k = keystrokes

**Space Complexity:**
- Errors object: O(n) where n = number of fields
- Debounce timers: O(n)
- Async validator tracking: O(a) where a = active async validations
- Total: O(n)

**Performance Optimizations:**
1. Debouncing async validators (reduces API calls by 90%+)
2. Cancelling previous async validations (prevents race conditions)
3. Lazy validation (only validate dirty fields on input)
4. Early exit on first error (stop at first rule failure)

## Common Mistakes

- ❌ **Mistake:** Validating on every keystroke without debouncing
  ```javascript
  // Causes 100+ API calls while typing "example@gmail.com"
  input.addEventListener('input', async (e) => {
    await checkEmailAvailability(e.target.value);
  });
  ```

- ❌ **Mistake:** Not cancelling previous async validations
  ```javascript
  // Race condition: slow validation completes after fast one
  // User sees wrong error message
  async validateField(value) {
    const result = await slowAPICall(value); // Takes 2 seconds
    this.errors.email = result.error; // Overwrites newer validation!
  }
  ```

- ❌ **Mistake:** Not handling edge cases (whitespace, special characters)
  ```javascript
  // Allows "   " as valid input
  if (value) {
    return true; // Should use value.trim()
  }
  ```

- ❌ **Mistake:** Not showing which field failed or where
  ```javascript
  // Generic error, user doesn't know what to fix
  alert('Form validation failed');
  ```

- ❌ **Mistake:** Validating only on submit (poor UX)
  ```javascript
  // User fills entire form, clicks submit, sees 10 errors
  // Better: Validate on blur, show errors immediately
  ```

- ✅ **Correct:** Real-time validation with debouncing
  ```javascript
  const validator = new FormValidator(form, rules, {
    validateOnBlur: true,
    validateOnInput: true,
    debounceTime: 300 // Wait 300ms after user stops typing
  });
  ```

- ✅ **Correct:** Cancel previous async validations
  ```javascript
  async validateField(fieldName, value) {
    // Cancel previous validation
    if (this.asyncValidators.has(fieldName)) {
      this.asyncValidators.get(fieldName).cancelled = true;
    }

    const validationId = { cancelled: false };
    this.asyncValidators.set(fieldName, validationId);

    const result = await apiCall(value);

    if (validationId.cancelled) return; // Ignore outdated result

    this.errors[fieldName] = result.error;
  }
  ```

- ✅ **Correct:** Clear, accessible error messages with ARIA
  ```javascript
  showFieldError(fieldName) {
    const errorSpan = field.parentElement.querySelector('.error-message');
    errorSpan.textContent = this.errors[fieldName];
    errorSpan.setAttribute('role', 'alert'); // Screen reader announces
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorSpan.id);
  }
  ```

- ✅ **Correct:** Focus first invalid field on submit
  ```javascript
  async handleSubmit(e) {
    e.preventDefault();
    const isValid = await this.validate();

    if (!isValid) {
      this.focusFirstInvalidField(); // Improves UX
    }
  }
  ```

## Real-World Applications

**1. User Registration Forms**
- Email uniqueness check (async validation)
- Password strength requirements
- Password confirmation matching
- Username availability
- Age verification
- Terms acceptance

**2. E-commerce Checkout**
- Credit card validation (Luhn algorithm)
- CVV validation
- Expiry date validation
- Billing address validation
- Shipping address validation
- Phone number format

**3. Contact Forms**
- Email format validation
- Phone number validation
- Message length limits
- CAPTCHA verification
- File upload validation

**4. Profile Update Forms**
- Optional field validation
- Conditional validation (if field A, then field B required)
- Image upload validation (size, format)
- URL validation
- Date range validation

**5. Survey Forms**
- Dynamic validation rules
- Conditional questions
- Multiple choice validation
- Rating validation
- Open-ended response length

## Follow-up Questions

**1. How do you add debouncing for async validators?**

```javascript
async handleInput(e) {
  const fieldName = e.target.name;

  // Clear previous timer
  if (this.debounceTimers.has(fieldName)) {
    clearTimeout(this.debounceTimers.get(fieldName));
  }

  // Debounce async validation
  const timer = setTimeout(async () => {
    await this.validateField(fieldName, e.target.value);
    this.showFieldError(fieldName);
  }, this.debounceTime);

  this.debounceTimers.set(fieldName, timer);
}
```

**2. How do you validate file uploads (size, type)?**

```javascript
const validator = new FormValidator(form, {
  avatar: [
    { required: true },
    {
      validator: (value, fieldName) => {
        const file = form.elements[fieldName].files[0];
        return file && file.size <= 5 * 1024 * 1024; // 5MB
      },
      message: 'File size must be less than 5MB'
    },
    {
      validator: (value, fieldName) => {
        const file = form.elements[fieldName].files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        return file && allowedTypes.includes(file.type);
      },
      message: 'Only JPEG, PNG, and GIF images are allowed'
    }
  ]
});
```

**3. How do you validate dependent fields (conditional validation)?**

```javascript
const validator = new FormValidator(form, {
  hasAddress: [{ required: true }],
  streetAddress: [
    {
      validator: (value, fieldName, formData) => {
        // Only required if hasAddress is checked
        if (formData.hasAddress === 'yes') {
          return value.trim().length > 0;
        }
        return true; // Not required otherwise
      },
      message: 'Street address is required when address is provided'
    }
  ]
});
```

**4. How do you add custom error rendering (tooltips, toasts)?**

See Solution 3 "Custom Error Rendering" example above (CustomFormValidator class).

**5. How do you handle form-level validation (not just field-level)?**

```javascript
class FormValidator {
  // ... existing code ...

  setFormValidator(validator, message) {
    this.formValidator = { validator, message };
  }

  async validate() {
    // Validate all fields first
    await this.validateAllFields();

    // Then run form-level validation
    if (this.formValidator) {
      const formData = this.getFormData();
      const isValid = await this.formValidator.validator(formData);

      if (!isValid) {
        this.formError = this.formValidator.message;
        return false;
      }
    }

    return Object.keys(this.errors).length === 0;
  }
}

// Usage: Validate total cart value
validator.setFormValidator(
  (formData) => {
    const total = parseFloat(formData.totalAmount);
    return total >= 10; // Minimum order $10
  },
  'Minimum order total is $10'
);
```

## Resources

- [MDN: Form Validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)
- [MDN: Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation)
- [ARIA: Form Properties](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)
- [HTML5 Form Validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation)
- [Luhn Algorithm](https://en.wikipedia.org/wiki/Luhn_algorithm)

---
