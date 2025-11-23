# React Accessibility - ARIA and Testing

## Question 1: How do you make React applications accessible with ARIA, semantic HTML, and keyboard navigation?

**Answer:**

Making React applications accessible involves three core pillars: semantic HTML, ARIA attributes, and keyboard navigation support. Accessibility (a11y) ensures your application is usable by everyone, including people with disabilities.

**Semantic HTML Foundation**

Start with semantic HTML elements (`<button>`, `<nav>`, `<header>`, `<main>`, `<form>`) instead of divs. These elements provide built-in accessibility features and communicate intent to assistive technologies.

```javascript
// ❌ Not accessible - divs with onclick
function LoginForm() {
  return (
    <div onClick={handleLogin}>
      Login
    </div>
  );
}

// ✅ Accessible - semantic button element
function LoginForm() {
  return (
    <button type="button" onClick={handleLogin}>
      Login
    </button>
  );
}
```

**ARIA Attributes**

ARIA (Accessible Rich Internet Applications) attributes enhance semantic HTML when native elements aren't sufficient. Key ARIA attributes include:

- `aria-label`: Provides accessible name for elements without visible text
- `aria-labelledby`: Links element to label via ID
- `aria-describedby`: Provides additional description
- `aria-live`: Announces dynamic content updates to screen readers
- `aria-expanded`: Indicates if collapsible content is expanded/collapsed
- `aria-hidden`: Hides decorative elements from screen readers

```javascript
// ARIA example for custom dropdown
function AccessibleDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = 'menu-' + Math.random();

  return (
    <div>
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen(!isOpen)}
      >
        Options
      </button>
      {isOpen && (
        <ul id={menuId} role="menu">
          <li role="menuitem"><button>Edit</button></li>
          <li role="menuitem"><button>Delete</button></li>
        </ul>
      )}
    </div>
  );
}
```

**Keyboard Navigation**

Ensure all interactive elements are keyboard accessible:

- Tab order: Use `tabIndex` strategically (only positive values 0 or 1)
- Focus management: Move focus to new content when it appears
- Escape key: Close modals/dropdowns
- Arrow keys: Navigate lists and menus

```javascript
function AccessibleModal({ isOpen, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Trap focus inside modal
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };

      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();

      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  return isOpen ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <h2 id="modal-title">Confirm Action</h2>
      <p>Are you sure?</p>
      <button onClick={onClose}>Close</button>
    </div>
  ) : null;
}
```

**Live Regions for Dynamic Content**

Use `aria-live` regions to announce dynamic updates without requiring users to refresh or navigate:

```javascript
function NotificationCenter() {
  const [messages, setMessages] = useState([]);

  return (
    <>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {messages.map(msg => msg.text).join('. ')}
      </div>
      <ul>
        {messages.map(msg => (
          <li key={msg.id}>{msg.text}</li>
        ))}
      </ul>
    </>
  );
}
```

Focus management, ARIA attributes, and semantic HTML work together to create accessible React applications that serve all users.

---

### 🔍 Deep Dive: ARIA Implementation Patterns and Screen Reader Integration

**Understanding ARIA Roles**

ARIA roles define what an element is and how it should be interpreted by assistive technologies. There are four role categories:

1. **Landmark Roles**: `banner`, `contentinfo`, `main`, `navigation`, `search` - Help users navigate page structure
2. **Document Structure Roles**: `article`, `heading`, `list`, `region` - Define content organization
3. **Widget Roles**: `button`, `checkbox`, `dialog`, `menu`, `tab` - Define interactive components
4. **Abstract Roles**: `command`, `composite`, `input`, `landmark` - Base roles for inheritance

**Complex ARIA Patterns**

**Combobox with ARIA**

A combobox combines a text input with a popup listbox. Proper ARIA implementation requires careful role and attribute coordination:

```javascript
function AccessibleCombobox() {
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const options = ['Apple', 'Banana', 'Cherry', 'Date'];
  const filtered = options.filter(o =>
    o.toLowerCase().includes(value.toLowerCase())
  );

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        setIsOpen(true);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          setValue(filtered[selectedIndex]);
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="combobox-container">
      <label htmlFor="fruit-input">Select fruit:</label>
      <input
        id="fruit-input"
        ref={inputRef}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="fruit-listbox"
        aria-activedescendant={
          selectedIndex >= 0 ? `option-${selectedIndex}` : ''
        }
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <ul
          id="fruit-listbox"
          ref={listRef}
          role="listbox"
        >
          {filtered.map((option, idx) => (
            <li
              key={option}
              id={`option-${idx}`}
              role="option"
              aria-selected={selectedIndex === idx}
              onClick={() => {
                setValue(option);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Tab Interface with ARIA**

Tab interfaces require specific ARIA attributes to communicate structure to screen readers:

```javascript
function AccessibleTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: 'Profile', id: 'tab-profile' },
    { label: 'Settings', id: 'tab-settings' },
    { label: 'Security', id: 'tab-security' }
  ];

  const handleKeyDown = (e, index) => {
    let newIndex = index;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      newIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = tabs.length - 1;
    }

    setActiveTab(newIndex);
    // Focus the newly activated tab
    document.getElementById(`tab-button-${newIndex}`)?.focus();
  };

  return (
    <div className="tabs">
      <div role="tablist" aria-label="Content tabs">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            id={`tab-button-${idx}`}
            role="tab"
            aria-selected={activeTab === idx}
            aria-controls={tab.id}
            tabIndex={activeTab === idx ? 0 : -1}
            onClick={() => setActiveTab(idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, idx) => (
        <div
          key={tab.id}
          id={tab.id}
          role="tabpanel"
          aria-labelledby={`tab-button-${idx}`}
          hidden={activeTab !== idx}
        >
          Content for {tab.label}
        </div>
      ))}
    </div>
  );
}
```

**Screen Reader Testing**

Screen readers like NVDA (Windows), JAWS (Windows), and VoiceOver (Mac) interpret ARIA attributes and semantic HTML to communicate content structure to blind/low-vision users. Test your implementation by:

1. Enable screen reader: VoiceOver (Cmd+F5 on Mac), NVDA (free Windows), JAWS (paid)
2. Navigate with Tab key to test focus order
3. Use screen reader commands to explore structure (headings, landmarks, lists)
4. Test dynamic content updates with `aria-live` regions
5. Verify form labels and error messages are associated correctly

**Focus Management Strategies**

Proper focus management is critical for keyboard users:

```javascript
// Focus trapping in modals
function FocusTrap({ children, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) || [];

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    containerRef.current?.addEventListener('keydown', handleKeyDown);
    firstElementRef?.focus?.();

    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

**Live Regions for Dynamic Updates**

Live regions announce content changes to screen reader users automatically:

```javascript
function FormWithErrors() {
  const [errors, setErrors] = useState([]);

  const validate = (data) => {
    const newErrors = [];
    if (!data.email) newErrors.push('Email is required');
    if (!data.password) newErrors.push('Password is required');
    setErrors(newErrors);
  };

  return (
    <>
      {/* aria-live="polite" waits for user to pause, "assertive" interrupts */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {errors.length > 0 && (
          <ul>
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        )}
      </div>
      <form onSubmit={(e) => {
        e.preventDefault();
        validate(new FormData(e.target));
      }}>
        {/* form fields */}
      </form>
    </>
  );
}
```

---

### 🐛 Real-World Scenario: Debugging Accessibility Violations in Production

**Scenario: E-commerce Product Filter with WCAG 2.1 AA Violations**

A client reports that blind users cannot use the product filter feature. Investigation reveals multiple accessibility issues:

```javascript
// ❌ INACCESSIBLE: Original broken implementation
function ProductFilter() {
  const [filters, setFilters] = useState({
    category: '',
    price: [0, 1000],
    inStock: false
  });

  return (
    <div className="filter-panel">
      <div className="filter-section">
        <div className="category-label">Category</div> {/* Not associated with select */}
        <select
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value })
          }
        >
          <option>All Categories</option>
          <option>Electronics</option>
          <option>Clothing</option>
        </select>
      </div>

      <div className="price-filter">
        <span>Price: ${filters.price[0]} - ${filters.price[1]}</span>
        <input
          type="range"
          min="0"
          max="1000"
          onChange={(e) => {
            setFilters({
              ...filters,
              price: [0, parseInt(e.target.value)]
            });
          }}
        />
      </div>

      <div className="stock-filter" onClick={() =>
        setFilters({ ...filters, inStock: !filters.inStock })
      }>
        <span>In Stock</span> {/* Not a real checkbox */}
      </div>
    </div>
  );
}
```

**Issues Found (WCAG violations):**
1. Select has no associated label (1.3.1 - Info and Relationships)
2. Range slider has no accessible name/value updates (1.3.1)
3. Checkbox div is not keyboard accessible (2.1.1 - Keyboard)
4. No indication that filters have changed (4.1.3 - Status Messages)

**Debugging Steps:**
1. Run axe DevTools: Identifies missing labels, missing role semantics
2. Test with screen reader: Confirms elements are not announced properly
3. Test keyboard navigation: Tab doesn't reach filter div
4. Check color contrast: Price range display might be insufficient contrast

**Solution:**

```javascript
// ✅ ACCESSIBLE: Fixed implementation with WCAG 2.1 AA compliance
function ProductFilter() {
  const [filters, setFilters] = useState({
    category: '',
    price: [0, 1000],
    inStock: false
  });
  const [filterChangeAnnouncement, setFilterChangeAnnouncement] = useState('');

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setFilters({ ...filters, category: newCategory });
    announceChange(`Filter changed to ${newCategory}`);
  };

  const handlePriceChange = (e) => {
    const newPrice = parseInt(e.target.value);
    setFilters({ ...filters, price: [0, newPrice] });
    announceChange(`Price filter updated to $0 - $${newPrice}`);
  };

  const handleStockChange = () => {
    setFilters({ ...filters, inStock: !filters.inStock });
    announceChange(`In Stock filter ${!filters.inStock ? 'enabled' : 'disabled'}`);
  };

  const announceChange = (message) => {
    setFilterChangeAnnouncement(message);
    // Clear after announcement
    setTimeout(() => setFilterChangeAnnouncement(''), 1000);
  };

  return (
    <div className="filter-panel" aria-label="Product filters">
      {/* Status messages for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {filterChangeAnnouncement}
      </div>

      {/* Category filter with proper label */}
      <fieldset>
        <legend>Category</legend>
        <select
          id="category-select"
          value={filters.category}
          onChange={handleCategoryChange}
          aria-describedby="category-help"
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
        </select>
        <small id="category-help">Select a product category to filter results</small>
      </fieldset>

      {/* Price range with accessible slider */}
      <fieldset>
        <legend>Price Range</legend>
        <div className="price-display" aria-live="polite">
          Price: <span id="price-min">${filters.price[0]}</span> -
          <span id="price-max">${filters.price[1]}</span>
        </div>
        <label htmlFor="price-slider">Maximum Price</label>
        <input
          id="price-slider"
          type="range"
          min="0"
          max="1000"
          step="50"
          value={filters.price[1]}
          onChange={handlePriceChange}
          aria-valuemin="0"
          aria-valuemax="1000"
          aria-valuenow={filters.price[1]}
          aria-valuetext={`$${filters.price[1]}`}
          aria-describedby="price-help"
        />
        <small id="price-help">Adjust slider to filter by maximum price</small>
      </fieldset>

      {/* In Stock checkbox with proper label */}
      <fieldset>
        <legend>Availability</legend>
        <div className="checkbox-wrapper">
          <input
            id="in-stock-checkbox"
            type="checkbox"
            checked={filters.inStock}
            onChange={handleStockChange}
            aria-describedby="stock-help"
          />
          <label htmlFor="in-stock-checkbox">In Stock Only</label>
        </div>
        <small id="stock-help">Show only products currently in stock</small>
      </fieldset>
    </div>
  );
}
```

**Testing with axe-core (automated):**

```javascript
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

test('ProductFilter has no accessibility violations', async () => {
  const { container } = render(<ProductFilter />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Manual testing with VoiceOver (Mac):**

1. Enable VoiceOver: Cmd + F5
2. Navigate: VO + Right arrow
3. Expected: "Category, popup button, collapsed" then each field announced properly
4. Verify: Range slider announces current value as you adjust it
5. Confirm: Filter changes announced immediately via `aria-live="polite"`

**Metrics After Fix:**
- Accessibility audit score: 95/100 (from 42/100)
- Screen reader compatibility: 100% of features accessible
- Keyboard navigation: All filters reachable with Tab key
- WCAG 2.1 AA compliance: All criteria met
- User report: Blind users successfully filter products

---

### ⚖️ Trade-offs: ARIA vs Semantic HTML, Manual vs Automated Testing

**ARIA vs Semantic HTML: When to Use Each**

| Aspect | Semantic HTML | ARIA |
|--------|--------------|------|
| **Use When** | Native element exists for your content | Native element doesn't exist for complex widget |
| **Examples** | `<button>`, `<nav>`, `<form>`, `<input>` | Custom dropdown, menu bar, tabs, combobox |
| **Screen Reader Support** | Built-in, no extra work | Requires correct implementation |
| **Keyboard Support** | Automatic for most elements | Must implement manually |
| **JavaScript Overhead** | Minimal | Significant for complex widgets |
| **Maintenance** | Less error-prone | More code to maintain |
| **Performance** | Slightly faster (less JS) | Slightly slower (more JS) |

**Best Practice Matrix:**

```javascript
// ✅ CORRECT: Use semantic HTML when possible
<button onClick={handleClick}>Delete</button>
<nav aria-label="Main navigation">{/* ... */}</nav>
<form onSubmit={handleSubmit}>{/* ... */}</form>
<main>{/* ... */}</main>

// ⚠️ ARIA NECESSARY: Only when semantic HTML unavailable
<div
  role="menubar"
  aria-label="File operations"
  onKeyDown={handleMenuKeyboard}
>
  {/* custom menu implementation */}
</div>

// ❌ WRONG: Using ARIA when semantic HTML exists
<div role="button" onClick={handleClick}>
  Delete {/* Use <button> instead */}
</div>

// ❌ WRONG: Redundant ARIA on semantic elements
<button role="button" aria-label="Delete">
  Delete {/* Redundant: button already has role and accessible name */}
</button>
```

**Accessibility Testing Trade-offs**

| Testing Method | Coverage | Cost | Speed | Setup |
|----------------|----------|------|-------|-------|
| **Automated (axe-core)** | ~30% of issues | $0-500 | Fast (ms) | 5 min |
| **Manual (Screen reader)** | ~70% of issues | $0-2000 | Slow (hours) | 30 min |
| **User Testing** | ~100% of issues | $5000-20000 | Very slow | Days |
| **Linting (eslint-plugin-jsx-a11y)** | ~15% of issues | $0 | Immediate | 2 min |

**Automated Testing with axe-core:**

```javascript
// Setup in test file
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// Basic test
test('component is accessible', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Advanced: Test with specific rules
test('component meets WCAG 2.1 AA', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: true },
      'aria-required-attr': { enabled: true }
    }
  });
  expect(results).toHaveNoViolations();
});

// Catch violations early
test('catches accessibility regressions', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);

  if (results.violations.length > 0) {
    console.error('Accessibility violations found:');
    results.violations.forEach(violation => {
      console.error(`- ${violation.id}: ${violation.help}`);
      violation.nodes.forEach(node => {
        console.error(`  at: ${node.html}`);
      });
    });
  }

  expect(results).toHaveNoViolations();
});
```

**Manual Screen Reader Testing Workflow:**

```javascript
// Test checklist for each interactive component:
// 1. Keyboard navigation (Tab, Shift+Tab, Arrow keys, Enter, Escape)
// 2. Screen reader announcement (role, state, label)
// 3. Focus visibility (outline or visual indicator)
// 4. Dynamic content (aria-live announcements)
// 5. Error messages (associated with form fields)

// Example test flow for modal dialog
async function testModalAccessibility() {
  // 1. Open modal
  // VoiceOver announces: "Dialog, [Title], [Content]"

  // 2. Tab through focusable elements
  // Should only reach elements inside modal (focus trap)

  // 3. Press Escape
  // Should close modal and return focus to trigger button

  // 4. Arrow keys
  // Should navigate buttons/list items if present

  // 5. Screen reader rotor (VO+U)
  // Should show all headings, links, buttons
}
```

**Trade-off Decision Tree:**

```
Building new component?
├─ Does semantic HTML element exist?
│  ├─ YES → Use semantic element (button, input, select, etc.)
│  └─ NO → Implement ARIA
├─ Need automated testing?
│  ├─ YES → Add jest-axe + eslint-plugin-jsx-a11y
│  └─ NO → Plan manual testing
├─ Supporting screen readers?
│  ├─ Required → Budget 2-4 hours testing per feature
│  └─ Nice-to-have → Reduce to 1-2 hours
└─ Timeline tight?
   ├─ YES → Use automation + linting only
   └─ NO → Include manual testing with real assistive tech
```

---

### 💬 Explain to Junior: Accessibility Fundamentals for Interviews

**What is Accessibility and Why Does It Matter?**

Think of accessibility like wheelchair ramps for your website. Just as a building becomes more usable for everyone when it has ramps (not just wheelchair users, but also parents with strollers and delivery people with carts), accessible websites benefit all users:

- **Screen reader users**: Blind or low-vision people
- **Keyboard-only users**: People with motor disabilities or prefer keyboard navigation
- **Deaf users**: Need captions for audio/video content
- **Cognitive disabilities**: Benefit from clear, simple language and structure
- **Aging populations**: Need larger fonts and high contrast

About 1 in 4 adults have some form of disability, so accessibility directly impacts your user base and company revenue.

**Interview Answer Template 1: Explain ARIA**

"ARIA stands for Accessible Rich Internet Applications. It's a set of HTML attributes that enhance semantic meaning for assistive technologies like screen readers.

The key principle is: **use semantic HTML first, add ARIA only when necessary**. For example, a `<button>` element is already keyboard accessible and screen reader friendly—adding `role="button"` to a div is redundant and wrong.

Common ARIA attributes include `aria-label` (provides accessible name), `aria-live` (announces dynamic updates), and `aria-expanded` (indicates if content is expanded). I'd use ARIA mainly for complex custom components like custom dropdowns or menu bars where native HTML elements don't exist.

The most important thing is testing with real screen readers—that's how you verify your ARIA implementation actually works."

**Interview Answer Template 2: Explain Keyboard Navigation**

"Keyboard navigation is critical because some users can't use a mouse. At minimum, every interactive element should be reachable with the Tab key and operable with Enter/Space.

For custom components, you often need to implement arrow key navigation. For example, in a custom menu, left/right arrows should move between menu items. Focus should be visible (not hidden by CSS outlines), and focus should move logically—usually top-to-bottom, left-to-right.

One advanced technique is focus trapping in modals—when a modal opens, focus should be trapped inside so Tab doesn't escape into the background page. When the modal closes, focus returns to the element that opened it. This prevents confusion for screen reader users."

**Interview Answer Template 3: Accessibility Testing**

"Testing accessibility involves both automated and manual approaches. Automated tools like axe-core and Jest-Axe catch about 30% of issues quickly—things like missing labels or contrast problems. They're great for catching regressions in CI/CD.

But 70% of issues require manual testing with real assistive technologies. I'd use:
- NVDA (free) on Windows or VoiceOver (built-in) on Mac to test screen readers
- Just keyboard navigation (disable mouse) to test keyboard access
- Browser DevTools accessibility inspector to check labels and roles

The best validation is actual users with disabilities testing your app. Some companies hire accessibility specialists or user testing services for this."

**Interview Answer Template 4: WCAG Compliance Levels**

"WCAG (Web Content Accessibility Guidelines) has three conformance levels:

**Level A**: Basic accessibility (minimum standard). Examples: text alternatives for images, keyboard accessibility.

**Level AA**: Enhanced accessibility (what most companies aim for). Adds requirements like color contrast ratios (4.5:1 for text) and better keyboard support.

**Level AAA**: Advanced accessibility (rarely required). Includes things like sign language videos, extended audio descriptions.

For most commercial websites, WCAG 2.1 Level AA is the target. It's a good balance between user benefit and implementation effort."

**Common Junior Mistakes to Avoid:**

1. **Adding ARIA without semantic HTML**: Using `<div role="button">` instead of `<button>`
2. **Hiding focus indicators**: Never do `outline: none` without replacing with a visible alternative
3. **Forgetting form labels**: `<input>` without `<label htmlFor>` association
4. **Not testing with real assistive tech**: Assuming code is accessible without verification
5. **Using divs for interactive elements**: Always use semantic HTML (`<button>`, `<input>`, `<a>`) first
6. **Forgetting keyboard handlers**: Implementing click handlers without Enter/Space support
7. **Missing error messages**: Form errors not associated with fields via `aria-describedby`

**Quick Accessibility Checklist (What to Mention in Interviews):**

- [ ] All images have alt text
- [ ] Form labels associated with inputs (`htmlFor`)
- [ ] Color not the only way to convey information
- [ ] Keyboard accessible (Tab, Enter, Escape, arrows)
- [ ] Focus visible and in logical order
- [ ] Contrast ratio ≥ 4.5:1 for normal text
- [ ] Heading hierarchy correct (h1 → h2 → h3, no skipping)
- [ ] No content autoplay (video/audio)
- [ ] Dynamic updates announced (aria-live)
- [ ] Tested with real screen reader

---

## Question 2: How do you test accessibility in React applications? (Tools, automation, manual testing)

**Answer:**

Testing accessibility requires a multi-layered approach combining automated scanning, linting, manual verification, and ideally user testing with people who have disabilities. React developers should test accessibility at multiple stages: development, component testing, integration testing, and manual UAT.

**Automated Testing with Jest-Axe**

Jest-Axe integrates the axe-core accessibility engine with Jest and React Testing Library, catching common violations automatically:

```javascript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button component accessibility', () => {
  test('primary button has no violations', async () => {
    const { container } = render(
      <button className="btn-primary">Click me</button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('disabled button is properly marked', async () => {
    const { container } = render(
      <button disabled>Click me</button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Static Linting with eslint-plugin-jsx-a11y**

This ESLint plugin catches accessibility issues during development before runtime:

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['jsx-a11y'],
  extends: ['plugin:jsx-a11y/recommended'],
  rules: {
    'jsx-a11y/alt-text': 'error',              // Images need alt text
    'jsx-a11y/label-has-associated-control': 'error', // Form labels
    'jsx-a11y/click-events-have-key-events': 'error', // Divs with onClick
    'jsx-a11y/no-static-element-interactions': 'error' // Interactive divs
  }
};

// Example: ESLint catches these issues
// ❌ Missing alt text
<img src="profile.jpg" />

// ❌ Unassociated label
<label>Email</label>
<input type="email" />

// ❌ div with click handler needs keyboard events
<div onClick={handleDelete}>Delete</div>
```

**Keyboard Navigation Testing**

Verify keyboard accessibility by disabling the mouse and testing all interactions:

```javascript
function KeyboardNavigationTest() {
  // Test checklist:
  // 1. Tab through all interactive elements
  // 2. Verify focus is visible
  // 3. Verify focus order makes sense
  // 4. Test Enter/Space on buttons
  // 5. Test Arrow keys on custom components
  // 6. Test Escape to close modals/dropdowns
  // 7. Verify focus trap in modals
  // 8. Verify focus returns after modal closes

  const [testResult, setTestResult] = useState('');

  return (
    <div>
      <button onClick={() => setTestResult('Button 1 pressed')}>
        Button 1
      </button>
      <button onClick={() => setTestResult('Button 2 pressed')}>
        Button 2
      </button>
      <input type="text" placeholder="Type here" />
      <p>{testResult}</p>
    </div>
  );
}
```

**Screen Reader Testing Procedure**

Use free screen readers to verify content is properly announced:

```javascript
// VoiceOver (Mac) Test Steps:
// 1. Enable: Cmd+F5
// 2. Navigation: VO+Right arrow to move forward, VO+Left to go back
// 3. Rotor: VO+U to see all headings, links, buttons
// 4. Read: VO+A to read entire page
// 5. Expected: Component name, role, state properly announced

// Example: Testing a button
// Expected screen reader output:
// "Delete button, activate with button"
// (If there's a tooltip: "Delete button, remove selected items, activate with button")

// Example: Testing a form input
// Expected screen reader output:
// "Email edit text, required, enter your email address"
```

**Using axe DevTools Browser Extension**

The axe DevTools extension provides real-time accessibility scanning in the browser:

```javascript
// Install in Chrome/Firefox
// 1. Right-click element → "Inspect with axe DevTools"
// 2. See violations with severity levels and how to fix
// 3. Get color contrast warnings
// 4. View accessibility tree

// Common violations caught:
// - Missing form label associations
// - Insufficient color contrast
// - Missing alt text on images
// - Missing ARIA attributes on custom components
// - Heading hierarchy issues
// - Missing button/link purpose
```

**Programmatic Accessibility Testing**

Write tests to verify accessibility features programmatically:

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Modal accessibility', () => {
  test('modal traps focus', async () => {
    const { container } = render(
      <Modal isOpen={true}>
        <button>Confirm</button>
        <button>Cancel</button>
      </Modal>
    );

    const firstButton = screen.getByText('Confirm');
    const lastButton = screen.getByText('Cancel');

    // Focus on last button
    lastButton.focus();
    expect(document.activeElement).toBe(lastButton);

    // Shift+Tab should move to first button (focus trap)
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(firstButton);
  });

  test('modal has proper ARIA attributes', async () => {
    const { container } = render(
      <Modal isOpen={true} title="Confirm Action">
        Are you sure?
      </Modal>
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby');
  });

  test('closing modal returns focus to trigger', async () => {
    const { rerender } = render(
      <>
        <button>Open Modal</button>
        <Modal isOpen={false}>Content</Modal>
      </>
    );

    const trigger = screen.getByText('Open Modal');
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    // Open modal
    rerender(
      <>
        <button>Open Modal</button>
        <Modal isOpen={true}>Content</Modal>
      </>
    );
    expect(document.activeElement).not.toBe(trigger);

    // Close modal
    rerender(
      <>
        <button>Open Modal</button>
        <Modal isOpen={false}>Content</Modal>
      </>
    );
    expect(document.activeElement).toBe(trigger);
  });

  test('no accessibility violations', async () => {
    const { container } = render(
      <Modal isOpen={true}>Content</Modal>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Integration Testing with Accessibility Focus**

```javascript
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Accessible form submission', () => {
  test('form validation errors announced to screen readers', async () => {
    const user = userEvent.setup();
    const { container } = render(<LoginForm />);

    const submitButton = screen.getByText('Login');
    await user.click(submitButton);

    // Error messages should be in alert live region
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Email is required');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  test('form labels associated with inputs', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveAttribute('id');

    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('htmlFor', emailInput.id);
  });

  test('submit button disabled during submission', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const button = screen.getByText('Login');
    expect(button).toHaveAttribute('aria-disabled', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
```

Combining automated, linting, keyboard, and screen reader testing creates comprehensive accessibility validation in your React applications.

---

### 🔍 Deep Dive: Advanced Accessibility Testing Patterns and Integration

**Test-Driven Accessibility (TDAA)**

Write accessibility tests before implementing features (similar to TDD):

```javascript
// 1. Define accessibility requirements in tests
describe('DataTable with accessibility requirements', () => {
  test('table has proper semantic structure', () => {
    render(<DataTable data={mockData} />);

    // Verify semantic elements exist
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(screen.getAllByRole('row')).toHaveLength(5);
  });

  test('sort buttons announce current state', async () => {
    render(<DataTable data={mockData} />);

    const sortButton = screen.getByRole('button', {
      name: /sort by name/i
    });

    expect(sortButton).toHaveAttribute(
      'aria-sort',
      'none'
    );

    await userEvent.click(sortButton);
    expect(sortButton).toHaveAttribute(
      'aria-sort',
      'ascending'
    );

    await userEvent.click(sortButton);
    expect(sortButton).toHaveAttribute(
      'aria-sort',
      'descending'
    );
  });

  test('pagination controls are keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<DataTable data={mockData} />);

    const nextButton = screen.getByRole('button', {
      name: /next page/i
    });

    expect(nextButton).toHaveFocus() || nextButton.parentElement.hasAttribute('tabindex');

    await user.tab();
    expect(document.activeElement).toBe(nextButton);

    await user.keyboard('{Enter}');
    expect(screen.getByText('Page 2')).toBeInTheDocument();
  });
});
```

**Custom Accessibility Matchers**

Create reusable Jest matchers for common accessibility checks:

```javascript
// customA11yMatchers.js
expect.extend({
  toBeAccessibleButton(received) {
    const hasRole = received.getAttribute('role') === 'button' ||
                    received.tagName.toLowerCase() === 'button';
    const hasClickHandler = received.getAttribute('onclick') ||
                           received.onclick;
    const isKeyboardAccessible = received.getAttribute('tabindex') === '0' ||
                                received.getAttribute('tabindex') === null;

    const pass = hasRole && isKeyboardAccessible;

    return {
      pass,
      message: () => `Expected element to be an accessible button
        - Has button role/tag: ${hasRole}
        - Is keyboard accessible: ${isKeyboardAccessible}
        - Has click handler: ${hasClickHandler}`
    };
  },

  toHaveAccessibleLabel(received) {
    const label = received.getAttribute('aria-label') ||
                  received.getAttribute('aria-labelledby') ||
                  (received.labels && received.labels[0]?.textContent);

    return {
      pass: !!label,
      message: () => `Expected element to have an accessible label`
    };
  },

  toHaveProperFocusOutline(received) {
    const styles = window.getComputedStyle(received);
    const hasOutline = styles.outline !== 'none';
    const hasVisibleBorder = styles.borderWidth !== '0px' ||
                            styles.boxShadow !== 'none';

    return {
      pass: hasOutline || hasVisibleBorder,
      message: () => `Expected element to have visible focus outline`
    };
  }
});

// Usage in tests
test('button is accessible', () => {
  render(<CustomButton>Delete</CustomButton>);
  const button = screen.getByRole('button');

  expect(button).toBeAccessibleButton();
  expect(button).toHaveAccessibleLabel();
  expect(button).toHaveProperFocusOutline();
});
```

**Accessibility Snapshot Testing**

Test accessibility tree changes using snapshots:

```javascript
import { axe } from 'jest-axe';

test('accessibility tree matches snapshot', async () => {
  const { container } = render(<ComplexForm />);

  // Get accessibility tree
  const a11yTree = await axe(container);

  expect({
    violations: a11yTree.violations,
    incomplete: a11yTree.incomplete,
    passes: a11yTree.passes.length
  }).toMatchSnapshot();
});

// snapshot file
exports[`accessibility tree matches snapshot 1`] = `
Object {
  "incomplete": Array [],
  "passes": 14,
  "violations": Array [],
}
`;
```

**Headless Browser Testing with Playwright + axe**

Test accessibility across browsers and devices:

```javascript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('form is accessible in Chrome', async ({ page }) => {
  await page.goto('http://localhost:3000/form');

  // Inject axe-core
  await injectAxe(page);

  // Check accessibility
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true
    }
  });
});

test('keyboard navigation works on mobile', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000');

  // Simulate keyboard only (no touch)
  await page.evaluate(() => {
    document.documentElement.style.touchAction = 'none';
  });

  // Tab through all elements
  await page.press('body', 'Tab');
  let focused = await page.evaluate(() => document.activeElement.className);
  expect(focused).toBeDefined();

  await context.close();
});
```

**Automated Visual Regression with axe**

Combine visual regression testing with accessibility:

```javascript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('button states are accessible and visually correct', async ({ page }) => {
  await page.goto('http://localhost:3000/button-showcase');

  // Check accessibility first
  await injectAxe(page);
  await checkA11y(page);

  // Then check visual regression
  await expect(page).toHaveScreenshot('button-default.png');

  // Hover state
  await page.hover('button:first-of-type');
  await expect(page).toHaveScreenshot('button-hover.png');

  // Focus state (important for a11y)
  await page.focus('button:first-of-type');
  await expect(page).toHaveScreenshot('button-focus.png');

  // Disabled state
  await page.click('button.toggle-disabled');
  await expect(page).toHaveScreenshot('button-disabled.png');
});
```

**E2E Testing with Screen Reader Simulation**

While true screen reader testing requires real assistive tech, you can simulate some behaviors:

```javascript
import { render, screen } from '@testing-library/react';
import { getByRole } from '@testing-library/dom';

function simulateScreenReaderAccess(container) {
  // Extract accessibility tree
  const tree = [];

  function walk(node, depth = 0) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const role = node.getAttribute('role') || node.tagName.toLowerCase();
      const label = node.getAttribute('aria-label') ||
                   node.textContent?.trim() ||
                   node.getAttribute('title');

      tree.push({
        depth,
        role,
        label,
        visible: node.offsetParent !== null
      });
    }

    for (let child of node.childNodes) {
      walk(child, depth + 1);
    }
  }

  walk(container);
  return tree;
}

test('form is properly structured for screen readers', () => {
  const { container } = render(
    <form>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
      <label htmlFor="password">Password</label>
      <input id="password" type="password" />
      <button type="submit">Login</button>
    </form>
  );

  const a11yTree = simulateScreenReaderAccess(container);

  // Verify structure
  expect(a11yTree[0].role).toBe('form');
  expect(a11yTree.map(n => n.role)).toEqual([
    'form',
    'label',
    'input',
    'label',
    'input',
    'button'
  ]);
});
```

**Continuous Accessibility Monitoring**

Integrate accessibility testing into CI/CD pipeline:

```yaml
# .github/workflows/a11y.yml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm install
      - run: npm run lint:a11y  # eslint-plugin-jsx-a11y
      - run: npm run test:a11y  # jest with jest-axe
      - run: npm run test:e2e   # playwright + axe

      - name: Generate accessibility report
        if: always()
        run: npm run report:a11y

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: a11y-report
          path: reports/a11y.html
```

**Monitoring Runtime Accessibility**

Track accessibility issues in production:

```javascript
// accessibility-monitor.js
class AccessibilityMonitor {
  constructor() {
    this.violations = [];
    this.initializeMonitoring();
  }

  async initializeMonitoring() {
    // Load axe-core dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js';
    document.head.appendChild(script);

    script.onload = () => {
      // Run initial scan
      this.scanPage();

      // Re-scan on DOM changes
      const observer = new MutationObserver(() => {
        this.scanPage();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-label', 'aria-hidden', 'role']
      });
    };
  }

  async scanPage() {
    if (typeof axe !== 'undefined') {
      const results = await axe.run();

      if (results.violations.length > 0) {
        this.violations = results.violations;
        this.reportToAnalytics(results);
      }
    }
  }

  reportToAnalytics(results) {
    // Send to monitoring service
    fetch('/api/a11y-report', {
      method: 'POST',
      body: JSON.stringify({
        url: window.location.href,
        violations: results.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          count: v.nodes.length
        })),
        timestamp: new Date().toISOString()
      })
    });
  }
}

// Initialize in production
if (process.env.NODE_ENV === 'production') {
  new AccessibilityMonitor();
}
```

---

### 🐛 Real-World Scenario: Building Accessible Data Tables with Complex Interactions

**Scenario: Financial Dashboard with Real-Time Data Table**

A fintech company needs an accessible data table for stock portfolios with sorting, filtering, pagination, and real-time updates. Requirements:

- Screen reader accessible (announces new data)
- Keyboard navigation (Tab, Arrow keys, Enter)
- Visible focus indicators
- WCAG 2.1 AA compliant
- 50+ rows of data
- Column sorting and filtering
- Real-time price updates

```javascript
// ❌ INACCESSIBLE: Original broken implementation
function StockPortfolioTable({ stocks }) {
  const [sort, setSort] = useState({ column: 'symbol', order: 'asc' });

  return (
    <div className="portfolio">
      <div className="filters">
        <input
          type="text"
          placeholder="Filter by symbol"
          onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}
        />
        <span onClick={() => setSortOrder('asc')}>Sort A-Z</span> {/* Not a button */}
      </div>

      <div className="table">
        <div className="header-row">
          <div className="cell">Symbol</div>
          <div className="cell">Price</div>
          <div className="cell">Change</div>
        </div>

        {stocks.map(stock => (
          <div className="data-row" key={stock.id}>
            <div className="cell">{stock.symbol}</div>
            <div className="cell" style={{ color: stock.priceChange > 0 ? 'green' : 'red' }}>
              ${stock.price}
            </div>
            <div className="cell">{stock.priceChange}%</div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <span onClick={() => setPage(page - 1)}>←</span>
        <span>{page}</span>
        <span onClick={() => setPage(page + 1)}>→</span>
      </div>
    </div>
  );
}
```

**Issues Found:**
1. Table is just divs (no semantic `<table>`)
2. Headers not marked as headers
3. Sort buttons are spans (not keyboard accessible)
4. No announce of real-time price updates
5. Pagination controls not semantic
6. Color used alone to indicate positive/negative
7. No focus management

**Debugging Process:**

```javascript
// Step 1: ESLint catches issues
// Error: jsx-a11y/click-events-have-key-events
// "Sort A-Z" element has click handler but no keyboard events

// Step 2: axe DevTools scan reveals:
// - Missing table role
// - Missing headers association
// - Insufficient color contrast
// - Missing form labels

// Step 3: Screen reader test shows:
// Expected: "Table, 3 columns, 50 rows"
// Actual: Just announces text "Symbol Price Change..."

// Step 4: Keyboard test shows:
// Expected: Tab to navigate controls
// Actual: Keyboard doesn't reach sort or pagination
```

**Solution: Fully Accessible Data Table**

```javascript
import { useState, useRef, useEffect } from 'react';

function AccessibleStockTable({ initialStocks }) {
  const [stocks, setStocks] = useState(initialStocks);
  const [sort, setSort] = useState({ column: 'symbol', order: 'asc' });
  const [filter, setFilter] = useState({ symbol: '', minPrice: 0 });
  const [page, setPage] = useState(1);
  const [sortAnnouncement, setSortAnnouncement] = useState('');
  const [updateAnnouncement, setUpdateAnnouncement] = useState('');
  const tableRef = useRef(null);
  const itemsPerPage = 10;

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => ({
        ...stock,
        price: stock.price + (Math.random() - 0.5) * 2,
        priceChange: (stock.priceChange || 0) + (Math.random() - 0.5)
      })));
      setUpdateAnnouncement('Stock prices updated');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter stocks
  const filtered = stocks.filter(stock =>
    stock.symbol.toUpperCase().includes(filter.symbol.toUpperCase()) &&
    stock.price >= filter.minPrice
  );

  // Sort stocks
  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sort.column];
    const bVal = b[sort.column];
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sort.order === 'asc' ? comparison : -comparison;
  });

  // Paginate
  const paginatedStocks = sorted.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  const handleSort = (column) => {
    const newOrder = sort.column === column && sort.order === 'asc' ? 'desc' : 'asc';
    setSort({ column, order: newOrder });
    setSortAnnouncement(
      `Table sorted by ${column} in ${newOrder === 'asc' ? 'ascending' : 'descending'} order`
    );
  };

  const handleKeyDown = (e, column) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSort(column);
    }
  };

  return (
    <div className="stock-portfolio">
      {/* Announcements for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {sortAnnouncement}
      </div>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {updateAnnouncement}
      </div>

      {/* Filter Controls */}
      <fieldset className="filters" aria-label="Table filters">
        <legend>Filter stocks</legend>

        <div className="filter-group">
          <label htmlFor="symbol-filter">Filter by symbol:</label>
          <input
            id="symbol-filter"
            type="text"
            value={filter.symbol}
            onChange={(e) => {
              setFilter({ ...filter, symbol: e.target.value });
              setPage(1); // Reset to first page on filter
            }}
            placeholder="Enter symbol (e.g., AAPL)"
            aria-describedby="symbol-help"
          />
          <small id="symbol-help">Enter stock ticker symbol</small>
        </div>

        <div className="filter-group">
          <label htmlFor="price-filter">Minimum price:</label>
          <input
            id="price-filter"
            type="number"
            value={filter.minPrice}
            onChange={(e) => {
              setFilter({ ...filter, minPrice: parseFloat(e.target.value) });
              setPage(1);
            }}
            min="0"
            step="0.01"
            aria-describedby="price-help"
          />
          <small id="price-help">Filter by minimum stock price</small>
        </div>
      </fieldset>

      {/* Results Count */}
      <div
        role="status"
        aria-live="polite"
        className="results-info"
      >
        Showing {paginatedStocks.length} of {sorted.length} stocks
      </div>

      {/* Accessible Table */}
      <div className="table-container" ref={tableRef}>
        <table
          role="table"
          aria-label="Stock portfolio"
          aria-describedby="table-help"
        >
          <caption id="table-help">
            Real-time stock prices for your portfolio. Click column headers to sort.
          </caption>

          <thead>
            <tr>
              <th
                scope="col"
                role="columnheader"
                aria-sort={sort.column === 'symbol' ? sort.order : 'none'}
              >
                <button
                  className="sort-button"
                  onClick={() => handleSort('symbol')}
                  onKeyDown={(e) => handleKeyDown(e, 'symbol')}
                  aria-pressed={sort.column === 'symbol'}
                >
                  Symbol {sort.column === 'symbol' && (
                    <span aria-label={`sorted ${sort.order === 'asc' ? 'ascending' : 'descending'}`}>
                      {sort.order === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </button>
              </th>
              <th
                scope="col"
                role="columnheader"
                aria-sort={sort.column === 'price' ? sort.order : 'none'}
              >
                <button
                  className="sort-button"
                  onClick={() => handleSort('price')}
                  onKeyDown={(e) => handleKeyDown(e, 'price')}
                  aria-pressed={sort.column === 'price'}
                >
                  Price {sort.column === 'price' && (
                    <span aria-label={`sorted ${sort.order === 'asc' ? 'ascending' : 'descending'}`}>
                      {sort.order === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </button>
              </th>
              <th
                scope="col"
                role="columnheader"
                aria-sort={sort.column === 'priceChange' ? sort.order : 'none'}
              >
                <button
                  className="sort-button"
                  onClick={() => handleSort('priceChange')}
                  onKeyDown={(e) => handleKeyDown(e, 'priceChange')}
                  aria-pressed={sort.column === 'priceChange'}
                >
                  Change % {sort.column === 'priceChange' && (
                    <span aria-label={`sorted ${sort.order === 'asc' ? 'ascending' : 'descending'}`}>
                      {sort.order === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedStocks.map((stock) => (
              <tr key={stock.id}>
                <td data-label="Symbol">{stock.symbol}</td>
                <td data-label="Price">${stock.price.toFixed(2)}</td>
                <td
                  data-label="Change"
                  className={stock.priceChange > 0 ? 'positive' : 'negative'}
                  aria-label={`${stock.priceChange > 0 ? 'Up' : 'Down'} ${Math.abs(stock.priceChange).toFixed(2)}%`}
                >
                  {stock.priceChange > 0 ? '▲' : '▼'} {Math.abs(stock.priceChange).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Accessible Pagination */}
      <nav aria-label="Table pagination">
        <ul className="pagination" role="list">
          <li role="listitem">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              ← Previous
            </button>
          </li>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <li key={p} role="listitem">
              <button
                onClick={() => setPage(p)}
                aria-current={page === p ? 'page' : undefined}
                aria-label={`Go to page ${p}${page === p ? ' (current page)' : ''}`}
              >
                {p}
              </button>
            </li>
          ))}

          <li role="listitem">
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              Next →
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
```

**Testing the Accessible Implementation:**

```javascript
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('AccessibleStockTable', () => {
  const mockStocks = [
    { id: 1, symbol: 'AAPL', price: 150.25, priceChange: 2.5 },
    { id: 2, symbol: 'GOOGL', price: 2800.50, priceChange: -1.2 },
  ];

  test('table has proper semantic structure', async () => {
    const { container } = render(
      <AccessibleStockTable initialStocks={mockStocks} />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 data rows
  });

  test('sort buttons are keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<AccessibleStockTable initialStocks={mockStocks} />);

    const symbolButton = screen.getByText(/Symbol/);

    // Focus with Tab
    await user.tab();
    expect(symbolButton).toHaveFocus();

    // Activate with Enter
    await user.keyboard('{Enter}');
    expect(screen.getByText(/Table sorted by symbol/)).toBeInTheDocument();
  });

  test('pagination is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<AccessibleStockTable initialStocks={mockStocks} />);

    const nextButton = screen.getByText('Next →');

    // Tab to pagination
    while (document.activeElement !== nextButton) {
      await user.tab();
    }

    await user.keyboard('{Enter}');
    expect(screen.getByLabelText('Go to page 2 (current page)')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  test('filter changes announce to screen readers', async () => {
    const user = userEvent.setup();
    render(<AccessibleStockTable initialStocks={mockStocks} />);

    const filterInput = screen.getByLabelText('Filter by symbol:');
    await user.type(filterInput, 'AAPL');

    expect(screen.getByText(/Showing 1 of 1 stocks/)).toBeInTheDocument();
  });

  test('real-time updates announce to screen readers', async () => {
    const user = userEvent.setup();
    jest.useFakeTimers();

    render(<AccessibleStockTable initialStocks={mockStocks} />);

    // Wait for price update
    jest.advanceTimersByTime(5000);

    expect(screen.getByText(/Stock prices updated/)).toBeInTheDocument();

    jest.useRealTimers();
  });

  test('no accessibility violations', async () => {
    const { container } = render(
      <AccessibleStockTable initialStocks={mockStocks} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Manual Testing Checklist:**

- [ ] Enable VoiceOver (Mac) or NVDA (Windows)
- [ ] Navigate table with arrow keys within table
- [ ] Tab to sort buttons, activate with Enter/Space
- [ ] Verify sort announcement via screen reader
- [ ] Tab to pagination buttons
- [ ] Verify current page announced
- [ ] Type in filter input, verify results update
- [ ] Verify all buttons have visible focus
- [ ] Check color contrast with axe DevTools
- [ ] Disable mouse, verify all interactions work with keyboard

**Results After Implementation:**
- Accessibility score: 100/100
- WCAG 2.1 AA compliant
- Screen reader compatible
- Fully keyboard navigable
- Real-time updates announced
- Users with disabilities can effectively use portfolio tracking

---

### ⚖️ Trade-offs: Manual vs Automated Testing, Real Screen Readers vs Simulation

**Testing Method Comparison Table**

| Aspect | Automated (Axe) | ESLint Plugin | Manual (NVDA/VO) | User Testing |
|--------|-----------------|---------------|------------------|--------------|
| **Detection Rate** | 30% of issues | 15% of issues | 70% of issues | 100% of issues |
| **Setup Time** | 5 min | 2 min | 30 min | Days |
| **Runtime** | <100ms | Immediate | 30-60 min/test | Weeks |
| **Cost** | Free | Free | Free | $5-20k |
| **False Positives** | High (25-40%) | Low (5-10%) | None | None |
| **Language Support** | All | All | Varies | Varies |
| **Coverage** | Structural issues | Code patterns | Real experience | Real usage |
| **CI/CD Friendly** | Yes | Yes | No | No |

**Practical Recommendations:**

```javascript
// DEVELOPMENT PHASE: Use ESLint + LSP feedback
// - eslint-plugin-jsx-a11y catches issues in editor
// - Immediate feedback prevents mistakes
// - Zero runtime cost
// Example config:
{
  "extends": ["plugin:jsx-a11y/recommended"]
}

// COMPONENT TESTING: Use Jest + jest-axe
// - Automated scans catch 30% of issues
// - Fast CI/CD integration
// - Good ROI for effort spent
// Example:
test('no a11y violations', async () => {
  const { container } = render(<Component />);
  expect(await axe(container)).toHaveNoViolations();
});

// INTEGRATION TESTING: Use keyboard navigation tests
// - Verify tab order and focus behavior
// - Test keyboard-specific interactions
// - More reliable than automated scanning
// Example:
test('modal traps focus', async () => {
  const user = userEvent.setup();
  // ... tab through modal, verify focus trapped
});

// FINAL VALIDATION: Manual screen reader testing
// - Test with real assistive technologies
// - Verify announcements sound natural
// - Check edge cases automation misses
// - Required before release to production
// Minimum 2-4 hours per major feature

// OPTIONAL: User testing with real users
// - Identify usability issues beyond WCAG
// - Understand pain points
// - Validate design decisions
// - Reserve for high-value products
```

**Decision Tree for Testing Strategy:**

```
How critical is accessibility?
├─ Regulatory requirement (UK/EU/US)
│  └─ Do: Full testing suite (automated + manual + user testing)
├─ Legal liability (ADA lawsuit risk)
│  └─ Do: Automated + manual testing, budget $2-5k/year
├─ User inclusivity (moral/ethical)
│  └─ Do: Automated + manual, user testing optional
└─ Nice-to-have
   └─ Do: ESLint + automated testing (zero cost)
```

**Return on Investment Analysis:**

```javascript
// Automated Testing with Axe
Cost: $0 (jest-axe is free)
Time: 5 minutes setup + 2 hours integration
Catches: 30% of issues = ~10 issues
Cost per issue caught: $0
ROI: Infinite (prevents expensive lawsuits)

// Manual Testing with Screen Reader
Cost: $0 (NVDA free on Windows)
Time: 2-4 hours per major feature
Catches: 70% of issues = ~20 issues
Cost per issue caught: $5-10/issue
ROI: Very high (catches real problems)

// Professional Accessibility Audit
Cost: $2,000-5,000
Time: 2-3 weeks
Catches: 95%+ of issues = ~30 issues
Cost per issue caught: $70-170/issue
ROI: Moderate (comprehensive, expensive)

// User Testing with Real Users (Disabled Users)
Cost: $5,000-20,000
Time: 4-8 weeks
Catches: 100% of issues + usability insights
Cost per issue caught: $50-200/issue
ROI: High for mission-critical products
```

**Best Practice Recommendation:**

1. **All projects**: Use ESLint plugin (free, immediate feedback)
2. **All projects**: Use jest-axe in CI/CD (free, catches regressions)
3. **Components with complex interactions**: Add manual keyboard testing
4. **Before major releases**: 2-4 hours manual screen reader testing
5. **High-value products**: Budget for professional audit + user testing

---

### 💬 Explain to Junior: Testing Accessibility Like a Pro

**What is Automated Accessibility Testing?**

Automated testing means letting a computer scan your code and UI for accessibility problems, similar to how spell-check finds typos. Tools like axe-core examine HTML structure and compare it against accessibility guidelines.

**Interview Answer Template 1: Automated vs Manual Testing**

"Automated accessibility testing catches about 30% of issues—mainly structural problems like missing labels or improper heading hierarchy. It's fast (milliseconds) and free, making it perfect for CI/CD pipelines.

However, 70% of issues require manual testing. For example, a screen reader might not announce a dynamic update properly even if the HTML structure is correct. This is why I combine approaches:

1. **ESLint plugin** during development (catches issues as I code)
2. **Automated scanning** in CI/CD (prevents regressions)
3. **Manual keyboard testing** for complex components (verify real behavior)
4. **Screen reader testing** before release (ensure proper announcements)

The most important is testing with real assistive technologies. Using NVDA or VoiceOver for 2-4 hours catches problems automation misses."

**Interview Answer Template 2: Setting Up jest-axe**

"Jest-axe integrates the axe-core accessibility engine with Jest and React Testing Library. Here's how I set it up:

```javascript
// Install
npm install jest-axe

// In test file
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// Write test
test('component has no violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

It's straightforward to add to existing tests and catches regressions automatically. I usually run it on all components with interactive elements."

**Interview Answer Template 3: Manual Keyboard Testing**

"Manual keyboard testing means disabling your mouse and interacting with the app purely with keyboard. This reveals problems automation misses:

1. **Tab order**: Is the focus order logical and visible?
2. **Keyboard shortcuts**: Do all controls respond to keyboard (Enter, Space, Escape, arrows)?
3. **Focus trapping**: In modals, does Tab escape to background content?
4. **Focus management**: When content changes (modal opens, item deleted), does focus move appropriately?

I usually dedicate 1-2 hours before release to this testing. Most accessibility bugs only show up this way."

**Interview Answer Template 4: Screen Reader Testing**

"Screen readers like NVDA (Windows) or VoiceOver (Mac) read content aloud to blind/low-vision users. I test by:

1. Enabling the screen reader
2. Navigating the page using keyboard shortcuts specific to that reader
3. Verifying announcements match what I expect

For example, a form field should announce: 'Email, required, edit text'. If it announces just 'Email edit text', the required indicator is missing.

The key insight: **if a screen reader user can't do something, it's a bug**, even if the HTML looks correct. That's why real testing is essential before shipping."

**Common Junior Testing Mistakes:**

1. **Only relying on automated tools**: Missing 70% of issues
2. **Not testing with real screen readers**: Thinking simulation is enough
3. **Forgetting focus management**: Keyboard navigation works but focus appears in wrong place
4. **Not testing dynamic content**: New content isn't announced to screen readers
5. **Testing only on desktop**: Forgetting mobile/touch device accessibility
6. **Assuming accessibility = a11y score**: High scores can still have usability problems
7. **Never testing with real users**: Only 55% of disabled users can use inaccessible sites

**Quick Testing Checklist (For Interviews):**

```javascript
// Automated
- [ ] eslint-plugin-jsx-a11y installed and passing
- [ ] jest-axe tests pass
- [ ] No console warnings about accessibility

// Manual Keyboard
- [ ] All interactive elements reachable with Tab
- [ ] Focus visible (not just a subtle outline)
- [ ] Tab order matches visual order
- [ ] All keyboard interactions work (Enter, Space, Escape, arrows)

// Manual Screen Reader
- [ ] Role and label announced correctly
- [ ] State/value announced (checked, disabled, etc.)
- [ ] Dynamic updates announced
- [ ] Form errors associated with fields
- [ ] Lists properly structured

// User Testing
- [ ] Tested with real screen reader user (if possible)
- [ ] Keyboard-only user can complete key tasks
- [ ] No frustration with focus management
```

---

**Summary: Making React Apps Accessible**

Accessibility in React requires thinking beyond code—it's about creating experiences that work for everyone. The technical aspects (ARIA, semantic HTML, keyboard navigation) are just tools. The real goal is ensuring people with disabilities can use your application effectively.

Testing is where theory meets reality. Automated tools are great for catching obvious issues, but manual testing with real assistive technologies is where you discover the problems that actually affect users. Combine both approaches for comprehensive coverage.

Remember: accessibility isn't an afterthought or nice-to-have. It's a fundamental part of user experience and increasingly a legal requirement. Every React application should be built with accessibility in mind from day one.
