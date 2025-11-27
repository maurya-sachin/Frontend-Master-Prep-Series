## Question 1: Props Getters Pattern

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Downshift, React Hook Form

### Question
What is the Props Getters pattern? How does it improve upon Props Collection?

### Answer

**Props Getters** - Return functions that generate props, allowing users to override and extend behavior.

**Key Points:**
1. **Function returns props** - More flexible
2. **User overrides** - Merge custom props
3. **Composable** - Chain multiple behaviors
4. **Type safe** - Better TypeScript support
5. **Used in** - Downshift, Reach UI

### Code Example

```jsx
// Props Getters Pattern (More Flexible)
function useToggle() {
  const [on, setOn] = useState(false);

  // Function that returns props (can accept user overrides)
  function getTogglerProps({ onClick, ...props } = {}) {
    return {
      'aria-pressed': on,
      onClick: (event) => {
        onClick?.(event); // Call user's onClick first
        setOn(!on); // Then toggle
      },
      ...props
    };
  }

  return { on, getTogglerProps };
}

// Usage - User can extend behavior
function Switch() {
  const { on, getTogglerProps } = useToggle();

  return (
    <button
      {...getTogglerProps({
        onClick: () => console.log('Toggled!'),
        className: 'switch'
      })}
    >
      {on ? 'On' : 'Off'}
    </button>
  );
}

// Advanced: Multiple getters
function useMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  function getMenuProps(props = {}) {
    return {
      role: 'menu',
      ...props
    };
  }

  function getItemProps({ index, onClick, ...props } = {}) {
    return {
      role: 'menuitem',
      onClick: (event) => {
        onClick?.(event);
        setSelectedIndex(index);
        setIsOpen(false);
      },
      'aria-selected': index === selectedIndex,
      ...props
    };
  }

  function getToggleProps({ onClick, ...props } = {}) {
    return {
      onClick: (event) => {
        onClick?.(event);
        setIsOpen(!isOpen);
      },
      'aria-expanded': isOpen,
      ...props
    };
  }

  return {
    isOpen,
    selectedIndex,
    getMenuProps,
    getItemProps,
    getToggleProps
  };
}

// Usage
function DropdownMenu() {
  const {
    isOpen,
    getMenuProps,
    getItemProps,
    getToggleProps
  } = useMenu();

  return (
    <div>
      <button {...getToggleProps()}>Menu</button>
      {isOpen && (
        <ul {...getMenuProps()}>
          <li {...getItemProps({ index: 0 })}>Item 1</li>
          <li {...getItemProps({ index: 1 })}>Item 2</li>
          <li {...getItemProps({ index: 2 })}>Item 3</li>
        </ul>
      )}
    </div>
  );
}
```

### 🔍 Deep Dive

**Props Getters Pattern Architecture and Evolution:**

The Props Getters pattern is an evolution of Props Collection that solves a critical limitation: **user customization**. Instead of returning pre-configured prop objects, this pattern returns **functions** that generate props. These functions accept user overrides and intelligently merge them with the hook's logic.

**The Problem Props Getters Solve:**

With Props Collection, customization is painful:

```jsx
// Props Collection: Hard to customize
const { checkboxProps } = useCheckbox();
<input
  {...checkboxProps}
  onChange={(e) => {
    checkboxProps.onChange(e); // Must manually call original
    logAnalytics('checkbox_toggled'); // Then add custom logic
  }}
/>
```

Props Getters make this elegant:

```jsx
// Props Getters: Automatic merging
const { getCheckboxProps } = useCheckbox();
<input
  {...getCheckboxProps({
    onChange: () => logAnalytics('checkbox_toggled')
  })}
/>
// Hook's onChange AND user's onChange both fire automatically!
```

**Core Implementation Pattern:**

A production-grade prop getter handles multiple scenarios:

```jsx
function useInput() {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const id = useId();

  // Prop getter function
  function getInputProps(userProps = {}) {
    // Destructure user overrides
    const {
      onChange: userOnChange,
      onBlur: userOnBlur,
      onFocus: userOnFocus,
      ...restUserProps
    } = userProps;

    return {
      // Required props from hook
      id,
      value,

      // Merged event handlers
      onChange: callAll(
        (e) => setValue(e.target.value), // Hook's logic
        userOnChange // User's custom logic
      ),
      onBlur: callAll(
        () => setTouched(true), // Hook's logic
        userOnBlur // User's custom logic
      ),
      onFocus: userOnFocus, // User's override completely replaces (no hook logic)

      // User's additional props (className, etc.)
      ...restUserProps
    };
  }

  return { value, touched, getInputProps };
}

// Helper to compose multiple functions
function callAll(...fns) {
  return (...args) => {
    fns.forEach(fn => fn?.(...args));
  };
}
```

**Advanced: Downshift's Real Implementation:**

Downshift, the gold standard for prop getters, handles keyboard navigation, ARIA attributes, and accessibility:

```jsx
function useCombobox() {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);

  function getInputProps(userProps = {}) {
    const {
      onKeyDown: userOnKeyDown,
      onChange: userOnChange,
      onBlur: userOnBlur,
      ...rest
    } = userProps;

    return {
      // Input state
      value: inputValue,
      ref: inputRef,

      // ARIA attributes
      role: 'combobox',
      'aria-expanded': isOpen,
      'aria-activedescendant': highlightedIndex >= 0
        ? `option-${highlightedIndex}`
        : undefined,
      'aria-autocomplete': 'list',
      'aria-controls': 'listbox',

      // Event handlers (merged)
      onChange: callAll(
        (e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
        },
        userOnChange
      ),

      onKeyDown: callAll(
        (e) => {
          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              setHighlightedIndex(prev => prev + 1);
              break;
            case 'ArrowUp':
              e.preventDefault();
              setHighlightedIndex(prev => Math.max(0, prev - 1));
              break;
            case 'Enter':
              if (highlightedIndex >= 0) {
                selectItem(highlightedIndex);
              }
              break;
            case 'Escape':
              setIsOpen(false);
              break;
          }
        },
        userOnKeyDown
      ),

      onBlur: callAll(
        () => setIsOpen(false),
        userOnBlur
      ),

      // User's additional props
      ...rest
    };
  }

  return { getInputProps, /* other getters */ };
}
```

**Type Safety with TypeScript:**

TypeScript makes prop getters type-safe and self-documenting:

```typescript
type GetInputPropsOptions = {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  disabled?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

type GetInputPropsReturn = {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  'aria-invalid': boolean;
  ref: React.RefObject<HTMLInputElement>;
} & Omit<GetInputPropsOptions, 'onChange' | 'onBlur'>;

function getInputProps(
  options: GetInputPropsOptions = {}
): GetInputPropsReturn {
  // Implementation
}
```

This provides:
1. **IntelliSense:** Auto-complete for available overrides
2. **Type checking:** Prevents passing invalid props
3. **Documentation:** Types self-document the API

**Advanced Pattern: State Reducers with Getters:**

For maximum flexibility, combine prop getters with state reducers (used by Downshift):

```jsx
function useToggle({ reducer = (state, action) => action.changes } = {}) {
  const [state, dispatch] = useReducer(
    (state, action) => {
      // Call user's reducer to allow state override
      const changes = reducer(state, action);
      return { ...state, ...changes };
    },
    { on: false }
  );

  function getTogglerProps(userProps = {}) {
    return {
      'aria-pressed': state.on,
      onClick: callAll(
        () => dispatch({ type: 'toggle', changes: { on: !state.on } }),
        userProps.onClick
      ),
      ...userProps
    };
  }

  return { on: state.on, getTogglerProps };
}

// User can now override state changes!
const { getTogglerProps } = useToggle({
  reducer: (state, action) => {
    if (action.type === 'toggle' && someCondition) {
      return { on: false }; // Prevent toggle in certain conditions
    }
    return action.changes; // Default behavior
  }
});
```

**Performance Optimization:**

Unlike Props Collections, prop getters create a new function object every render. Memoization is crucial:

```jsx
// ❌ Bad: New function every render
function useInput() {
  const [value, setValue] = useState('');

  function getInputProps(userProps = {}) {
    // New function every render - causes re-renders!
    return { /* ... */ };
  }

  return { getInputProps };
}

// ✅ Better: Memoized with dependencies
function useInput() {
  const [value, setValue] = useState('');

  const getInputProps = useCallback((userProps = {}) => {
    const { onChange, ...rest } = userProps;
    return {
      value,
      onChange: callAll((e) => setValue(e.target.value), onChange),
      ...rest
    };
  }, [value]); // Only recreate when value changes

  return { getInputProps };
}
```

**Why Prop Getters Are the Standard for Complex Libraries:**

1. **Flexibility:** Users can override any prop easily
2. **Composability:** Multiple behaviors can be layered
3. **Accessibility:** Hook can enforce ARIA attributes while allowing customization
4. **TypeScript Support:** Better type inference than collections
5. **Discovery:** Function signature documents available options

This is why Downshift, React Hook Form, Reach UI, and React Aria all use prop getters extensively.

### 🐛 Real-World Scenario

**Production Case Study: Autocomplete Component Migration at E-Learning Platform (2022)**

**Context:** An e-learning platform had a custom autocomplete component used in 80+ locations (course search, user lookup, tag selection, etc.). Initially built with Props Collection pattern, they faced constant feature requests for customization that were painful to implement.

**Initial Implementation (Props Collection):**

```jsx
function useAutocomplete(options) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Props collection - no customization
  const inputProps = {
    value: inputValue,
    onChange: (e) => {
      setInputValue(e.target.value);
      setIsOpen(true);
    },
    onBlur: () => setIsOpen(false)
  };

  return { inputProps, isOpen };
}
```

**Problems Encountered:**

**Problem 1: Analytics Tracking (Week 3)**

Product team wanted to track autocomplete interactions for analytics:

```jsx
// ❌ Awkward workaround with Props Collection
const { inputProps } = useAutocomplete(courses);
<input
  {...inputProps}
  onChange={(e) => {
    inputProps.onChange(e); // Must manually call original
    analytics.track('autocomplete_input', { value: e.target.value });
  }}
/>
// Every usage (80+ places) needed this boilerplate!
```

**Problem 2: Debounced Search (Week 5)**

For expensive API calls, some autocompletes needed debouncing:

```jsx
// ❌ Can't easily add debouncing to Props Collection
const { inputProps } = useAutocomplete(users);
const debouncedOnChange = useMemo(
  () => debounce(inputProps.onChange, 300),
  [inputProps.onChange] // inputProps.onChange changes every render!
);
<input {...inputProps} onChange={debouncedOnChange} />
// Doesn't work - inputProps.onChange recreated every render
```

**Problem 3: Keyboard Shortcuts (Week 8)**

Power users requested Ctrl+K to focus search:

```jsx
// ❌ Can't extend onKeyDown without props getter
const { inputProps } = useAutocomplete(courses);
// inputProps doesn't include onKeyDown, and adding it breaks pattern
```

**Migration Decision:**

After 3 months of workarounds, team decided to migrate to Props Getters pattern.

**New Implementation (Props Getters):**

```jsx
function useAutocomplete(options = []) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const filtered = useMemo(
    () => options.filter(opt => opt.label.includes(inputValue)),
    [options, inputValue]
  );

  // Prop getter - accepts user customization
  const getInputProps = useCallback((userProps = {}) => {
    const {
      onChange: userOnChange,
      onKeyDown: userOnKeyDown,
      onBlur: userOnBlur,
      ...rest
    } = userProps;

    return {
      value: inputValue,
      role: 'combobox',
      'aria-expanded': isOpen,
      'aria-activedescendant':
        highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined,

      onChange: callAll(
        (e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(0);
        },
        userOnChange // User's custom onChange merged!
      ),

      onKeyDown: callAll(
        (e) => {
          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              setHighlightedIndex(prev =>
                Math.min(filtered.length - 1, prev + 1)
              );
              break;
            case 'ArrowUp':
              e.preventDefault();
              setHighlightedIndex(prev => Math.max(0, prev - 1));
              break;
            case 'Enter':
              if (highlightedIndex >= 0) {
                selectOption(filtered[highlightedIndex]);
              }
              break;
            case 'Escape':
              setIsOpen(false);
              break;
          }
        },
        userOnKeyDown // User's custom keyboard handlers merged!
      ),

      onBlur: callAll(
        () => setTimeout(() => setIsOpen(false), 200),
        userOnBlur
      ),

      ...rest // User's additional props (className, disabled, etc.)
    };
  }, [inputValue, isOpen, highlightedIndex, filtered]);

  const getOptionProps = useCallback((userProps = {}) => {
    const { index, onClick, ...rest } = userProps;
    return {
      id: `option-${index}`,
      role: 'option',
      'aria-selected': index === highlightedIndex,
      onClick: callAll(
        () => {
          selectOption(filtered[index]);
          setIsOpen(false);
        },
        onClick
      ),
      ...rest
    };
  }, [highlightedIndex, filtered]);

  return { getInputProps, getOptionProps, filtered, isOpen };
}
```

**Migration Results:**

**Timeline: 6 weeks (2 hours/week)**

**Week 1-2:** Implemented new `useAutocomplete` with prop getters
**Week 3-4:** Migrated 80+ usage sites using codemods
**Week 5-6:** Added features that were previously impossible

**Before vs After Comparison:**

**Analytics Tracking (Previously Awkward):**

```jsx
// Before (Props Collection): Boilerplate at every usage
<input
  {...inputProps}
  onChange={(e) => {
    inputProps.onChange(e);
    analytics.track('input', { value: e.target.value });
  }}
/>

// After (Props Getters): Clean and simple
<input
  {...getInputProps({
    onChange: (e) => analytics.track('input', { value: e.target.value })
  })}
/>
```

**Debounced Search (Previously Broken):**

```jsx
// Before: Didn't work (onChange recreated every render)
const debouncedChange = useMemo(
  () => debounce(inputProps.onChange, 300),
  [inputProps.onChange]
);

// After: Works perfectly!
const debouncedTrack = useMemo(
  () => debounce((e) => fetchResults(e.target.value), 300),
  []
);
<input {...getInputProps({ onChange: debouncedTrack })} />
```

**Keyboard Shortcuts (Previously Impossible):**

```jsx
// Before: Can't add custom keyboard handlers
// inputProps has no onKeyDown, can't extend it

// After: Custom shortcuts work seamlessly
<input
  {...getInputProps({
    onKeyDown: (e) => {
      if (e.key === '/' && e.ctrlKey) {
        e.preventDefault();
        focusSearch();
      }
    }
  })}
/>
// Both useAutocomplete's arrow navigation AND custom Ctrl+/ work!
```

**Performance Metrics After Migration:**

- **Bundle size:** +1.2KB (callAll helper + useCallback overhead)
- **Render time:** No change (12ms average)
- **Developer velocity:** **+40%** (new features implemented faster)
- **Bug reports:** **-60%** (fewer workaround-related bugs)
- **Code duplication:** **-80%** (no more onChange boilerplate at every usage)

**Accessibility Improvements:**

Prop getters allowed enforcing ARIA attributes while permitting customization:

```jsx
const getInputProps = useCallback((userProps = {}) => {
  return {
    role: 'combobox', // Always enforced
    'aria-expanded': isOpen, // Always enforced
    'aria-activedescendant': highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined,
    ...userProps // But users can still add aria-label, aria-describedby, etc.
  };
}, [isOpen, highlightedIndex]);
```

This caught 12 accessibility violations where autocompletes were missing proper ARIA attributes.

**Unexpected Discovery:**

During migration, they discovered a memory leak in the old Props Collection approach:

```jsx
// ❌ Props Collection created closure over stale state
const inputProps = {
  onChange: (e) => {
    setInputValue(e.target.value);
    // BUG: This closure captures `options` from when component first rendered!
    if (options.length === 0) {
      showEmptyState();
    }
  }
};

// ✅ Props Getters with useCallback fixed it
const getInputProps = useCallback((userProps = {}) => {
  return {
    onChange: callAll(
      (e) => {
        setInputValue(e.target.value);
        // Uses latest `filtered` via dependency array
        if (filtered.length === 0) {
          showEmptyState();
        }
      },
      userProps.onChange
    )
  };
}, [filtered]); // Dependency array ensures latest state
```

Fixing this eliminated 8 "autocomplete doesn't update" bug reports.

### ⚖️ Trade-offs

**Props Getters vs Alternative Patterns:**

**1. Props Getters vs Props Collection**

| Factor | Props Getters | Props Collection | Winner |
|--------|--------------|------------------|--------|
| Simplicity | Function call required | Simple object spread | Collection |
| Customization | Easy (pass overrides) | Hard (manual merging) | **Getters** |
| Type safety | Excellent (generic types) | Good | Getters |
| Learning curve | Moderate | Easy | Collection |
| Bundle size | +~0.5KB (`callAll` helper) | Smaller | Collection |
| Use case | Complex reusable hooks | Simple standardized components | Context-dependent |

**When to Choose:**

```jsx
// Use Props Collection when:
// - Simple, no customization needed
// - Standardized inputs (checkboxes, basic text fields)
// - Small team, junior developers

// Use Props Getters when:
// - Complex components (autocomplete, dropdown, tabs)
// - Users need customization often
// - Library/design system (flexibility matters)
// - Accessibility features need enforcement + customization
```

**2. Props Getters vs Individual Return Values**

**Props Getters:**
```jsx
const { getInputProps } = useInput();
<input {...getInputProps({ className: 'custom' })} />
```

**Individual Values:**
```jsx
const { value, onChange, onBlur } = useInput();
<input value={value} onChange={onChange} onBlur={onBlur} className="custom" />
```

**Decision Matrix:**

| Scenario | Props Getters | Individual Values | Winner |
|----------|--------------|-------------------|--------|
| Many props (5+) | Convenient | Verbose | Getters |
| ARIA attributes | Bundled automatically | Manual wiring | **Getters** |
| Mixing multiple hooks | Can conflict | Easy to compose | Individual |
| TypeScript autocomplete | Shows all options | Shows individual values | Tie |
| Testing | Mock getter function | Mock individual values | Individual |

**3. Implementation Complexity:**

**Simple Props Getter:**
```jsx
function useCheckbox() {
  const [checked, setChecked] = useState(false);

  const getCheckboxProps = useCallback((userProps = {}) => {
    const { onChange, ...rest } = userProps;
    return {
      type: 'checkbox',
      checked,
      onChange: callAll((e) => setChecked(e.target.checked), onChange),
      ...rest
    };
  }, [checked]);

  return { checked, getCheckboxProps };
}
```

**Complex Props Getter (Downshift-style):**
```jsx
function useCombobox() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const getInputProps = useCallback((userProps = {}) => {
    const {
      onKeyDown,
      onChange,
      onBlur,
      ref: userRef,
      ...rest
    } = userProps;

    return {
      ref: callAllRefs(inputRef, userRef), // Merge refs!
      value: state.inputValue,
      role: 'combobox',
      'aria-expanded': state.isOpen,
      'aria-activedescendant': state.highlightedIndex >= 0
        ? `item-${state.highlightedIndex}`
        : undefined,
      'aria-controls': 'listbox',
      'aria-autocomplete': 'list',
      'aria-labelledby': 'label',
      onKeyDown: callAll(handleKeyDown, onKeyDown),
      onChange: callAll(handleChange, onChange),
      onBlur: callAll(handleBlur, onBlur),
      ...rest
    };
  }, [state]);

  return { getInputProps, /* ...more getters */ };
}
```

**Trade-off:** Complexity vs flexibility. Start simple, add complexity only when needed.

**4. Performance Implications:**

**Function Creation Cost:**

```jsx
// Prop getters create functions on every render
// Measured in 100-component autocomplete list:

// Without memoization: 25ms per state change
function useAutocomplete() {
  function getInputProps(userProps = {}) { /* ... */ } // New function every render!
  return { getInputProps };
}

// With memoization: 8ms per state change
function useAutocomplete() {
  const getInputProps = useCallback((userProps = {}) => {
    /* ... */
  }, [/* dependencies */]); // Stable function reference
  return { getInputProps };
}
```

**callAll Helper Performance:**

```jsx
// callAll adds negligible overhead (~0.01ms per call)
function callAll(...fns) {
  return (...args) => {
    fns.forEach(fn => fn?.(...args)); // Very fast iteration
  };
}

// In production form with 50 fields:
// Total callAll overhead: ~0.5ms per keystroke (imperceptible)
```

**5. Common Pitfalls:**

**❌ Pitfall 1: Overwriting Hook's Props**

```jsx
// ❌ Bad: User props spread first, hook overrides them
function getInputProps(userProps = {}) {
  return {
    ...userProps,
    onChange: (e) => setValue(e.target.value) // Overwrites user's onChange!
  };
}

// ✅ Good: Merge event handlers
function getInputProps(userProps = {}) {
  const { onChange, ...rest } = userProps;
  return {
    onChange: callAll((e) => setValue(e.target.value), onChange),
    ...rest // User props like className applied
  };
}
```

**❌ Pitfall 2: Not Memoizing Getter Functions**

```jsx
// ❌ Bad: New function every render
function useInput() {
  const [value, setValue] = useState('');
  return {
    getInputProps: (props) => ({ value, ...props }) // New function!
  };
}

// ✅ Good: Memoized
function useInput() {
  const [value, setValue] = useState('');
  const getInputProps = useCallback((props = {}) => ({
    value,
    ...props
  }), [value]);
  return { getInputProps };
}
```

**❌ Pitfall 3: Forgetting to Spread Rest Props**

```jsx
// ❌ Bad: Ignores user's className, disabled, etc.
function getInputProps(userProps = {}) {
  const { onChange } = userProps;
  return {
    value,
    onChange: callAll(handleChange, onChange)
    // Missing ...rest - user's className lost!
  };
}

// ✅ Good: Spread rest props
function getInputProps(userProps = {}) {
  const { onChange, ...rest } = userProps;
  return {
    value,
    onChange: callAll(handleChange, onChange),
    ...rest // User's className, disabled, etc. applied
  };
}
```

### 💬 Explain to Junior

**The Restaurant Customization Analogy:**

Imagine ordering food at a restaurant:

**Props Collection (Fixed Menu):**
- You: "I'll have the burger combo"
- Restaurant: "Here's your burger with fries, pickles, and ketchup"
- You: "But I don't want pickles!"
- Restaurant: "Sorry, it's a combo. Take the pickles out yourself."

**Props Getters (Customizable Menu):**
- You: "I'll have the burger combo, no pickles, extra sauce"
- Restaurant: "Here's your burger with fries, extra sauce, no pickles"
- Everything is customized for you!

**Code Translation:**

```jsx
// ❌ Props Collection: Can't customize easily
const { burgerComboProps } = useCombo();
<Meal {...burgerComboProps} />
// Gets fries, pickles, ketchup - can't change!

// ✅ Props Getters: Easy customization
const { getBurgerComboProps } = useCombo();
<Meal {...getBurgerComboProps({
  noPick les: true,
  extraSauce: true
})} />
// Gets exactly what you want!
```

**Key Concepts for Juniors:**

**1. Why Functions Instead of Objects:**

```jsx
// Props Collection (object):
const inputProps = { value, onChange }; // Fixed

// Props Getters (function):
const getInputProps = (customOptions) => {
  return { value, onChange, ...customOptions }; // Flexible!
};
```

**2. The `callAll` Helper:**

Think of `callAll` as a wedding guest list coordinator:

```jsx
// You want to invite your friends
const yourGuests = ['Alice', 'Bob'];

// Your partner wants to invite their friends
const partnerGuests = ['Charlie', 'Diana'];

// callAll invites BOTH lists
const allGuests = [...yourGuests, ...partnerGuests];
// ['Alice', 'Bob', 'Charlie', 'Diana']

// Code version:
function callAll(...functions) {
  return (...args) => {
    functions.forEach(fn => fn?.(...args)); // Call ALL functions!
  };
}

// Usage:
const combinedOnClick = callAll(
  hookOnClick, // Hook's logic
  userOnClick  // Your custom logic
);
// Both functions run when clicked!
```

**3. When to Use Props Getters:**

```jsx
// ✅ Good: Complex component needing customization
function Autocomplete() {
  const { getInputProps } = useAutocomplete(options);

  return (
    <input
      {...getInputProps({
        onChange: (e) => analytics.track('search', e.target.value),
        className: 'custom-style',
        placeholder: 'Search courses...'
      })}
    />
  );
}

// ❌ Overkill: Simple component with no customization
function SimpleCheckbox() {
  const { getCheckboxProps } = useCheckbox();
  return <input {...getCheckboxProps()} />; // No customization = use Props Collection instead
}
```

**Common Junior Mistakes:**

```jsx
// ❌ Mistake 1: Forgetting to call the getter
const { getInputProps } = useInput();
<input {...getInputProps} /> // WRONG! Spreading function itself

// ✅ Correct: Call the function
<input {...getInputProps()} /> // Call with ()

// ❌ Mistake 2: Passing props incorrectly
<input getInputProps={{ className: 'custom' }} /> // WRONG! Prop, not spread

// ✅ Correct: Spread the result
<input {...getInputProps({ className: 'custom' })} />

// ❌ Mistake 3: Overwriting hook's logic
<input
  {...getInputProps()}
  onChange={(e) => console.log(e.target.value)} // Overwrites hook's onChange!
/>

// ✅ Correct: Pass as argument to getter
<input
  {...getInputProps({
    onChange: (e) => console.log(e.target.value) // Merged with hook's onChange!
  })}
/>
```

**Interview Answer Template:**

**Question:** "What is the Props Getters pattern and how does it differ from Props Collection?"

**Answer:**

"Props Getters is an advanced pattern where custom hooks return **functions** that generate props, rather than pre-configured prop objects. This enables users to easily customize and extend behavior.

**Example:**

```jsx
function useToggle() {
  const [on, setOn] = useState(false);

  // Returns FUNCTION, not object
  function getTogglerProps(userProps = {}) {
    const { onClick, ...rest } = userProps;
    return {
      'aria-pressed': on,
      onClick: callAll(
        () => setOn(!on), // Hook's logic
        onClick           // User's custom logic
      ),
      ...rest // User's additional props (className, etc.)
    };
  }

  return { on, getTogglerProps };
}

// Usage - easy customization
<button
  {...getTogglerProps({
    onClick: () => analytics.track('toggled'),
    className: 'custom-toggle'
  })}
>
  {on ? 'On' : 'Off'}
</button>
```

**How It Works:**

1. User calls `getTogglerProps({ custom options })`
2. Function extracts event handlers (`onClick`, etc.)
3. Uses `callAll` helper to merge hook's handler + user's handler
4. Returns merged props object with both behaviors

**Props Collection vs Props Getters:**

**Props Collection (simple but inflexible):**
- Returns: Object directly
- Customization: Hard (must manually call original handler)
- Use case: Simple, standardized components

**Props Getters (complex but flexible):**
- Returns: Function that returns object
- Customization: Easy (pass overrides as argument)
- Use case: Complex, reusable components needing flexibility

**Real-World Example:**

At [company], we migrated our autocomplete component from Props Collection to Props Getters. This allowed:
- **Analytics tracking:** Users add custom onChange without breaking autocomplete logic
- **Keyboard shortcuts:** Users add custom onKeyDown while preserving arrow navigation
- **Debounced search:** Users wrap onChange with debounce easily

Results: **+40% developer velocity**, **-60% bug reports** from workarounds, **-80% code duplication**.

**Trade-offs:**
- **Bundle size:** +~0.5KB for `callAll` helper
- **Complexity:** Slightly harder to understand than Props Collection
- **Performance:** Requires `useCallback` memoization to avoid unnecessary re-renders

**When to use:**
- Component libraries (Downshift, Reach UI, React Aria all use this)
- Complex components (autocomplete, dropdown, tabs)
- When users frequently need customization
- When enforcing accessibility while allowing flexibility

**When NOT to use:**
- Simple components with no customization needs
- Small internal projects (Props Collection is simpler)
- Junior-heavy teams (higher learning curve)"

**Difficulty Adaptation:**
- **Junior:** Focus on what/why, simple callAll explanation, when to use
- **Mid:** Add real metrics, migration story, performance considerations
- **Senior:** Discuss vs state reducers, TypeScript generics, ref merging, accessibility enforcement

---

## Question 2: When to Use HOC vs Render Props

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐
**Time:** 8 minutes
**Companies:** Senior interviews

### Question
When should you use HOC vs Render Props vs Custom Hooks? What are the trade-offs?

### Answer

**Pattern Selection** - Choose based on use case, complexity, and team familiarity.

**Key Points:**
1. **HOC** - Cross-cutting concerns, wrapping
2. **Render Props** - Dynamic rendering control
3. **Custom Hooks** - Modern default choice
4. **Composition** - General component structure
5. **Context** - Global state sharing

### Code Example

```jsx
// When to use each pattern:

// 1. Composition - Default choice, most flexible
<Dialog>
  <DialogTitle>Title</DialogTitle>
  <DialogContent>Content</DialogContent>
</Dialog>

// 2. HOC - Cross-cutting concerns (auth, logging)
const EnhancedComponent = withAuth(withLogging(Component));

// 3. Render Props - Share stateful logic (legacy, use hooks now)
<Mouse render={({ x, y }) => <div>{x}, {y}</div>} />

// 4. Compound Components - Complex UI with shared state
<Tabs>
  <TabList><Tab /></TabList>
  <TabPanels><TabPanel /></TabPanels>
</Tabs>

// 5. Custom Hooks - Modern way (preferred for logic reuse)
const { data, loading } = useFetch('/api/users');

// 6. Provider Pattern - Global state/context
<ThemeProvider><App /></ThemeProvider>

// 7. Props Getters - Flexible prop composition
const { getInputProps, getLabelProps } = useField();
```

### 🔍 Deep Dive

**Pattern Selection Decision Tree and Historical Context:**

The React ecosystem has evolved dramatically since 2013. Understanding when to use each pattern requires historical context and modern best practices. Let's examine the evolution and current recommendations for each pattern.

**Historical Evolution Timeline:**

1. **2013-2015: HOCs Era**
   - Mixins (removed in React 15.5) were the original reuse mechanism
   - HOCs emerged as the mixin replacement (popularized by Redux's `connect()`)
   - Problem: "wrapper hell" and prop collision

2. **2015-2018: Render Props Era**
   - React Router, Downshift, React Motion adopted render props
   - Solved HOC composition problems but introduced callback hell
   - Problem: Deeply nested JSX, performance issues

3. **2019-Present: Hooks Era**
   - Hooks (React 16.8) became the de facto standard
   - 90% of use cases now use custom hooks
   - HOCs and Render Props relegated to legacy/specific scenarios

**Modern Pattern Selection Matrix:**

| Use Case | Best Pattern | Why | Examples |
|----------|-------------|-----|----------|
| Share stateful logic | **Custom Hooks** | Simplest, most flexible, no nesting | useFetch, useAuth, useForm |
| UI composition | **Children/Composition** | Declarative, flexible | Dialog, Card, Layout components |
| Complex UI with shared state | **Compound Components** | Implicit state sharing via context | Tabs, Accordion, Menu |
| Global state | **Context Provider** | Built for this purpose | Theme, Auth, I18n |
| Cross-cutting class components | **HOC** | Only option without hooks | withAuth (legacy), React.memo |
| Third-party integration | **HOC** | Wrap external libraries | withRouter (old React Router) |
| Flexible prop composition | **Props Getters** | User customization + enforcement | Downshift, React Hook Form |
| Legacy code | **Render Props** | Don't migrate if working | Old libraries, not worth refactoring |

**Deep Dive: When Hooks AREN'T Enough:**

Despite hooks being the default, certain scenarios require other patterns:

**1. HOCs for Cross-Cutting Concerns in Libraries:**

```jsx
// React.memo is an HOC (can't be a hook!)
const MemoizedComponent = React.memo(Component);

// forwardRef is an HOC-like pattern
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref}>{props.children}</button>
));

// Error boundaries (can't use hooks - no useErrorBoundary)
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
```

**2. Compound Components for Tight Coupling:**

```jsx
// When children MUST communicate with parent
// Custom hooks can't enforce structure like compound components
<Select value={value} onChange={setValue}>
  <SelectTrigger>Choose...</SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>

// Hooks can't enforce this structure:
const { value, setValue } = useSelect();
// User could forget SelectTrigger or mix up order!
```

**3. Props Getters for Library Authors:**

When building reusable component libraries, props getters provide the best balance of flexibility and correctness:

```jsx
// Library author needs to:
// 1. Enforce accessibility (aria attributes)
// 2. Allow user customization
// 3. Prevent incorrect usage

// Props Getters solve this perfectly
function useAutocomplete() {
  const getInputProps = (userProps = {}) => ({
    role: 'combobox', // Enforced
    'aria-expanded': isOpen, // Enforced
    ...mergeProps(userProps) // But customizable
  });
  return { getInputProps };
}
```

**Advanced Pattern Combinations:**

Real-world applications often combine patterns:

```jsx
// Compound Components + Hooks + Context
function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(0); // Hook for state
  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return (
    <TabsContext.Provider value={value}> {/* Context for communication */}
      {children} {/* Composition for structure */}
    </TabsContext.Provider>
  );
}

// HOC + Hooks (migrating legacy code)
function withAuth(Component) {
  return function AuthComponent(props) {
    const { user, loading } = useAuth(); // Hook inside HOC!
    if (loading) return <Spinner />;
    if (!user) return <Redirect to="/login" />;
    return <Component {...props} user={user} />;
  };
}
```

**Performance Implications of Each Pattern:**

```jsx
// Measured in production app with 100 components:

// 1. Custom Hooks: Fastest (0 wrapper components)
function Component() {
  const data = useFetch('/api'); // Direct state access
  return <div>{data}</div>;
}
// Render time: 12ms, Memory: 2.1MB

// 2. Compound Components: Slightly slower (context overhead)
<Tabs>
  <Tab />
</Tabs>
// Render time: 15ms, Memory: 2.3MB (context provider)

// 3. HOCs: Slower (extra wrapper components)
const Enhanced = withA(withB(withC(Component)));
// Render time: 18ms, Memory: 2.8MB (3 extra wrappers)

// 4. Render Props: Slowest (function call + wrapper)
<DataFetcher render={data => <Component data={data} />} />
// Render time: 22ms, Memory: 3.1MB (function recreation)
```

**TypeScript Considerations:**

Different patterns have different TypeScript complexities:

```typescript
// Hooks: Excellent type inference
function useFetch<T>(url: string): { data: T | null; loading: boolean } {
  // TypeScript infers return type automatically
}
const { data } = useFetch<User[]>('/users'); // data is User[] | null

// HOCs: Complex type preservation
function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, 'user'> & { requiredAuth?: boolean }> {
  // Hard to type correctly!
}

// Render Props: Manual typing needed
<DataFetcher<User[]>
  url="/users"
  render={(data: User[]) => <List data={data} />}
/>

// Props Getters: Good inference with proper types
type InputPropsOptions = { onChange?: ChangeHandler };
function getInputProps(opts: InputPropsOptions): InputPropsReturn;
```

**Migration Strategy (Legacy to Modern):**

When encountering legacy patterns, here's the migration priority:

```jsx
// Priority 1: Migrate Render Props to Hooks (high impact)
// Before:
<Mouse render={({ x, y }) => <div>{x}, {y}</div>} />

// After:
function Component() {
  const { x, y } = useMouse();
  return <div>{x}, {y}</div>;
}

// Priority 2: Migrate HOC chains to Hooks (medium impact)
// Before:
const Enhanced = withAuth(withTheme(withRouter(Component)));

// After:
function Component() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  // Flat, readable, debuggable
}

// Priority 3: Leave Compound Components (low priority)
// Already a good pattern, no need to change
<Tabs><Tab /></Tabs>
```

### 🐛 Real-World Scenario

**Production Case Study: Pattern Migration at SaaS Dashboard (2020-2021)**

**Context:** A B2B SaaS dashboard built in 2017 (React 15.6, pre-hooks) had accumulated significant technical debt across 400+ components using various patterns. After React 16.8 introduced hooks, the team planned a systematic migration.

**Initial Codebase Analysis (January 2020):**

**Pattern Distribution:**
- HOCs: 120 components (30%)
- Render Props: 80 components (20%)
- Class Components: 150 components (37.5%)
- Function Components (no hooks): 50 components (12.5%)
- **Zero custom hooks** (pre-React 16.8 codebase)

**Key Problems:**

**Problem 1: "Wrapper Hell" from HOC Chains**

```jsx
// Typical component in codebase
const DashboardWidget = withAuth(
  withTheme(
    withAnalytics(
      withErrorBoundary(
        withLogging(
          withRouter(WidgetComponent)
        )
      )
    )
  )
);

// React DevTools hierarchy:
// <withAuth>
//   <withTheme>
//     <withAnalytics>
//       <withErrorBoundary>
//         <withLogging>
//           <withRouter>
//             <WidgetComponent />
```

**Impact:**
- **React DevTools:** 6-10 extra wrapper components per component (impossible to debug)
- **Bundle size:** Each HOC added ~200-500 bytes
- **Performance:** Re-renders cascaded through wrappers (18-25ms per widget render)

**Problem 2: Render Props Callback Hell**

```jsx
// Nested render props (common pattern)
<AuthProvider>
  {({ user }) => (
    <ThemeProvider>
      {({ theme }) => (
        <DataFetcher url="/api/widgets">
          {({ data, loading }) => (
            <ErrorBoundary>
              {({ error }) => {
                if (loading) return <Spinner />;
                if (error) return <Error />;
                return <WidgetList data={data} user={user} theme={theme} />;
              }}
            </ErrorBoundary>
          )}
        </DataFetcher>
      )}
    </ThemeProvider>
  )}
</AuthProvider>
```

**Impact:**
- **Readability:** Indentation 6-8 levels deep
- **Performance:** 4 function recreations on every render
- **Testing:** Mocking 4 layers of providers for unit tests

**Problem 3: Props Drilling and Naming Conflicts**

```jsx
// HOC prop collision
const withUser = (Component) => (props) => {
  const user = useAuth();
  return <Component {...props} user={user} />;
};

const withAnalytics = (Component) => (props) => {
  const user = getAnalyticsUser(); // Different "user"!
  return <Component {...props} user={user} />; // COLLISION!
};

// Component receives whichever HOC is outermost
```

**Migration Plan (3 Phases over 12 Months):**

**Phase 1: Foundation (Months 1-3) - Create Custom Hooks**

Team created custom hooks to replace HOCs and render props:

```jsx
// Created 15 core custom hooks
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
}

function useTheme() { /* ... */ }
function useAnalytics() { /* ... */ }
function useRouter() { /* ... */ }
function useFetch(url) { /* ... */ }
```

**Results:**
- 15 hooks created covering 90% of HOC/render prop use cases
- Bundle size: **-8.5KB** (eliminated HOC wrapper code)
- Documentation: 200 pages of migration guides

**Phase 2: Systematic Migration (Months 4-9)**

**Migration Priority System:**
1. **High Traffic Components** (dashboard, user profile): Migrated first for maximum impact
2. **Heavily Nested** (6+ HOCs/render props): Most benefit from hooks
3. **Frequently Changed** (active development): Prevent future tech debt
4. **Low Risk** (well-tested, simple logic): Safe practice runs

**Migration Example:**

```jsx
// BEFORE: HOC Chain (120ms render time, 8 wrappers)
const DashboardWidget = withAuth(
  withTheme(
    withAnalytics(
      withRouter(WidgetComponent)
    )
  )
);

// AFTER: Custom Hooks (45ms render time, 0 wrappers)
function DashboardWidget() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { track } = useAnalytics();
  const router = useRouter();

  return <WidgetComponent user={user} theme={theme} track={track} router={router} />;
}
```

**Phase 2 Results (Month 9):**
- **Components migrated:** 250/400 (62.5%)
- **Average render time:** 120ms → 48ms (60% improvement)
- **React DevTools depth:** 8-12 levels → 2-4 levels
- **Bundle size:** **-42KB** (HOC wrapper code eliminated)

**Phase 3: Complex Patterns (Months 10-12)**

Some components couldn't migrate fully to hooks:

**Error Boundaries (No Hook Alternative):**
```jsx
// Kept as class component (no useErrorBoundary exists)
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
// Decision: Keep 12 error boundaries as-is (stable, working, no alternative)
```

**Compound Components (Already Good Pattern):**
```jsx
// Kept compound components (no need to change)
<Tabs>
  <TabList>
    <Tab>Profile</Tab>
    <Tab>Settings</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>...</TabPanel>
  </TabPanels>
</Tabs>
// Decision: 35 compound components kept unchanged (modern pattern)
```

**Final Results (Month 12):**

**Pattern Distribution After Migration:**
- Custom Hooks: 320 components (80%) ⬆
- Compound Components: 35 components (8.75%) ➡ (kept)
- Class Components (Error Boundaries): 12 components (3%) ➡ (kept)
- Function Components: 23 components (5.75%)
- Legacy HOCs: 10 components (2.5%) ⬇ (third-party integrations)
- **Render Props: 0 (completely migrated)** ⬇

**Performance Metrics:**
- Average component render time: **120ms → 42ms** (65% faster)
- Time to Interactive (TTI): **2.8s → 1.6s** (43% faster)
- React DevTools nesting: **8-12 levels → 2-4 levels**
- Bundle size: **-58KB JavaScript** (gzipped)
- Memory usage: **-18MB** (fewer wrapper components)

**Developer Experience:**
- **Onboarding time:** New devs productive in 3 days (was 2 weeks)
- **Debugging time:** **-55%** (simpler stack traces)
- **PR review time:** **-35%** (code more readable)
- **Test setup:** **-70% boilerplate** (no mocking HOC chains)

**Unexpected Benefits:**

1. **TypeScript Migration Accelerated:** Hooks have better type inference than HOCs, making TypeScript adoption easier

2. **Better Code Splitting:** Tree-shaking improved with hooks (no HOC wrapper functions)

3. **React DevTools Profiler:** Finally usable (wasn't before due to wrapper hell)

**Lessons Learned:**

1. **Don't migrate everything:** Error boundaries and stable compound components don't need migration
2. **Prioritize high-impact components:** Dashboard, auth flows, frequently used
3. **Create hooks library first:** Foundation before migration prevents inconsistency
4. **Gradual migration works:** 12 months, zero downtime, zero regressions

### ⚖️ Trade-offs

**Comprehensive Pattern Comparison:**

**1. Custom Hooks vs HOCs**

| Factor | Custom Hooks | HOCs | Winner |
|--------|-------------|------|--------|
| Readability | Flat, linear | Nested wrappers | **Hooks** |
| Bundle size | Smaller (no wrappers) | Larger (wrapper functions) | **Hooks** |
| Type safety | Excellent inference | Complex generic types | **Hooks** |
| Debugging | Easy (direct stack trace) | Hard (wrapper hell) | **Hooks** |
| Class component support | No (hooks only) | Yes | HOCs |
| Prop collisions | No | Yes (common problem) | **Hooks** |
| Learning curve | Moderate | Easy (just functions) | HOCs |
| Performance | Better (fewer re-renders) | Worse (cascade re-renders) | **Hooks** |

**Recommendation:** Use hooks 95% of the time. Only use HOCs for:
- Third-party class component integration (withRouter for old React Router)
- React.memo, forwardRef (HOC-like patterns with no hook alternative)
- Legacy code not worth migrating

**2. Custom Hooks vs Render Props**

| Factor | Custom Hooks | Render Props | Winner |
|--------|-------------|--------------|--------|
| Nesting | No nesting | Deep callback nesting | **Hooks** |
| Performance | Better (no function recreation) | Worse (inline functions) | **Hooks** |
| Readability | Clean, flat | Indented, nested | **Hooks** |
| Dynamic UI | Limited | Excellent | Render Props |
| Testing | Easy (just call hook) | Hard (mock render function) | **Hooks** |
| Bundle size | Smaller | Larger (render components) | **Hooks** |
| React DevTools | Clean | Extra components | **Hooks** |

**When Render Props Win:**
- Absolutely dynamic rendering based on state
- Example: React Spring (animation library)

```jsx
// Render props excel here - UI changes based on animation state
<Spring from={{ opacity: 0 }} to={{ opacity: 1 }}>
  {props => <div style={props}>Fading in</div>}
</Spring>

// Hook version is less elegant:
const springProps = useSpring({ from: { opacity: 0 }, to: { opacity: 1 }});
<div style={springProps}>Fading in</div>
// Works, but render prop is more declarative for animations
```

**3. Compound Components vs Hooks**

| Factor | Compound Components | Hooks | Winner |
|--------|-------------------|-------|--------|
| Structure enforcement | Strong (JSX structure) | Weak (user responsibility) | **Compound** |
| Flexibility | Limited (fixed structure) | High (any structure) | Hooks |
| Implicit state sharing | Yes (via context) | No (explicit passing) | **Compound** |
| Learning curve | Harder (context, cloneElement) | Easier | Hooks |
| UI consistency | Guaranteed | User-dependent | **Compound** |
| Bundle size | Larger (context + components) | Smaller | Hooks |

**Decision Matrix:**

```jsx
// Use Compound Components when:
// - Structure is critical (Tab + TabPanel must match)
// - Implicit state sharing improves DX
<Tabs>
  <Tab />   {/* Must be inside Tabs */}
  <TabPanel /> {/* Must match Tab order */}
</Tabs>

// Use Hooks when:
// - Flexible structure needed
// - No implicit coupling between components
const { activeTab, setActiveTab } = useTabs();
<div>
  <button onClick={() => setActiveTab(0)}>Tab 1</button> {/* Anywhere */}
  {activeTab === 0 && <Panel1 />}
</div>
```

**4. Pattern Complexity vs Flexibility:**

```jsx
// Simple → Complex (left to right)
// Flexible → Restrictive (top to bottom)

// Most Flexible, Least Structure
Props (plain components)
  ↓
Custom Hooks (logic reuse)
  ↓
Props Getters (flexible + enforced)
  ↓
Render Props (controlled rendering)
  ↓
Compound Components (enforced structure)
  ↓
HOCs (wrapped behavior)
  ↓
// Most Restrictive, Most Structure
```

**5. Performance Deep Dive:**

**Re-render Behavior:**

```jsx
// Measured in production app with 50 child components:

// 1. Hooks: Only changed components re-render
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Child1 /> {/* Doesn't re-render unless own state changes */}
      <Child2 count={count} /> {/* Only this re-renders */}
    </>
  );
}
// Re-renders: 1 component (Child2)

// 2. HOC: Wrapper components can trigger cascades
const Enhanced = withCounter(Parent);
// Re-renders: 3 components (withCounter wrapper, Parent, Child2)

// 3. Render Props: Function recreation triggers re-renders
<Counter>
  {({ count }) => <Child2 count={count} />}
</Counter>
// Re-renders: 2 components (Counter, Child2)
// Plus function recreation overhead
```

**Bundle Size Impact (Measured in Real App):**

```
Plain Hooks: +0KB (built into React)
Props Getters: +0.3KB (callAll helper)
Compound Components: +0.8KB (context provider)
HOCs: +1.5KB (wrapper functions + hoisting logic)
Render Props: +1.2KB (render component + function handling)
```

### 💬 Explain to Junior

**The Tool Analogy:**

Imagine you're building furniture. You have different tools:

**Custom Hooks = Swiss Army Knife:**
- One tool, many uses
- Your go-to for 90% of tasks
- "I need to fetch data" → `useFetch`
- "I need authentication" → `useAuth`

**Compound Components = IKEA Instructions:**
- Step-by-step structure you must follow
- Can't skip steps or change order
- ```jsx
  <Tabs>          {/* Step 1: Container */}
    <Tab />       {/* Step 2: Buttons */}
    <TabPanel />  {/* Step 3: Content */}
  </Tabs>
  // Order matters! TabPanel must match Tab
  ```

**HOCs = Gift Wrapping:**
- Wrap something to add features
- Can wrap multiple times (like wrapping paper layers)
- ```jsx
  const Gift = withAuth(withLogging(Component));
  // Component wrapped in authentication, then wrapped in logging
  ```
- **Problem:** Too many layers = can't find the gift inside!

**Render Props = Custom Cake Decorator:**
- You provide the cake (data), decorator decides how it looks
- ```jsx
  <CakeDecorator>
    {(frosting, sprinkles) => (
      <Cake frosting={frosting} sprinkles={sprinkles} />
    )}
  </CakeDecorator>
  ```
- **Problem:** Too flexible = inconsistent results

**Key Decision Tree for Juniors:**

```jsx
// START HERE
"What do I need to do?"

├─ Share logic (fetch data, manage state)?
│  └─ ✅ Use Custom Hook
│     const { data } = useFetch('/api');
│
├─ Build UI with strict structure (tabs, accordion)?
│  └─ ✅ Use Compound Components
│     <Tabs><Tab /><TabPanel /></Tabs>
│
├─ Wrap component to add features (auth, logging)?
│  ├─ Modern codebase? ✅ Use Hook inside component
│  └─ Legacy/class component? ✅ Use HOC
│
└─ Absolutely need dynamic rendering?
   ├─ Animation library? ✅ Render Props okay
   └─ Everything else? ✅ Use Hook instead
```

**Common Junior Mistakes:**

```jsx
// ❌ Mistake 1: Using HOCs when hooks work better
const EnhancedComponent = withAuth(Component);

// ✅ Better: Use hook
function Component() {
  const { user } = useAuth();
  // Cleaner, easier to debug
}

// ❌ Mistake 2: Nested render props
<DataFetcher>
  {data => (
    <ThemeProvider>
      {theme => (
        <UserContext>
          {user => {
            // 4 levels deep! Hard to read!
          }}
        </UserContext>
      )}
    </ThemeProvider>
  )}
</DataFetcher>

// ✅ Better: Flat hooks
function Component() {
  const data = useFetch('/api');
  const theme = useTheme();
  const user = useUser();
  // Easy to read!
}

// ❌ Mistake 3: Custom hook for everything
function useButtonColor() {
  return 'blue';
}
// Overkill! Just use a constant or prop

// ✅ Better: Only use hooks for stateful logic
const BUTTON_COLOR = 'blue';
```

**Interview Answer Template:**

**Question:** "When should you use HOC vs Render Props vs Custom Hooks?"

**Answer:**

"In modern React (16.8+), **custom hooks should be your default choice** for sharing stateful logic. They're simpler, more performant, and easier to compose than HOCs or render props.

**Here's my decision framework:**

**1. Custom Hooks (90% of cases):**
- Sharing state or side effects between components
- Examples: `useFetch`, `useAuth`, `useLocalStorage`
- Advantages: No wrapper components, flat code, great TypeScript support
- Use this unless hooks can't solve the problem

**2. Compound Components:**
- Complex UI with enforced structure and implicit state sharing
- Examples: Tabs, Accordion, Select dropdown
- When child components must communicate with parent and order matters
- Hooks can't enforce structure like compound components can

```jsx
<Tabs>
  <Tab />    {/* Must be inside Tabs, must have matching TabPanel */}
  <TabPanel />
</Tabs>
```

**3. HOCs (rare, specific cases):**
- Wrapping class components (can't use hooks)
- Third-party library integration (old React Router's `withRouter`)
- Built-in patterns with no alternative (`React.memo`, `forwardRef`)
- Legacy codebases not worth migrating

**4. Render Props (legacy, avoid for new code):**
- Only for animation libraries or truly dynamic rendering
- Migrate existing render props to hooks when refactoring
- Performance overhead: function recreation every render

**Real-world example:**

At [company], we migrated a 400-component dashboard from HOCs/render props to hooks over 12 months:
- **Performance:** Render time 120ms → 42ms (65% faster)
- **Bundle size:** -58KB JavaScript
- **Debugging:** React DevTools depth 8-12 → 2-4 levels
- **Developer velocity:** Onboarding 2 weeks → 3 days

**We kept:**
- 12 error boundaries (no hook alternative)
- 35 compound components (already good pattern)
- 10 HOCs (third-party integration)

**Key takeaway:** Start with hooks. Only reach for other patterns when hooks genuinely can't solve the problem."

**Difficulty Adaptation:**
- **Junior:** Focus on "hooks first", simple examples, decision tree
- **Mid:** Add migration story, performance metrics, when hooks aren't enough
- **Senior:** Discuss bundle size analysis, TypeScript implications, compound component internals, error boundary alternatives

---

