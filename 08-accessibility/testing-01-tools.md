# Testing Accessibility

> Automated testing, manual testing, axe-core, Lighthouse, and accessibility testing strategies.

---

## Question 1: Automated Accessibility Testing

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Google, Airbnb

### Question
How do you test accessibility in frontend applications?

### Answer

**Tools & Strategies:**
1. Automated tools (catch ~30% of issues)
2. Manual testing
3. Screen reader testing
4. Keyboard testing

```javascript
// Jest + jest-axe
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should have no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);

  expect(results).toHaveNoViolations();
});

// Testing Library accessibility queries
test('form is accessible', () => {
  render(<LoginForm />);

  // Use accessible queries
  const emailInput = screen.getByLabelText(/email/i);
  const submitButton = screen.getByRole('button', { name: /submit/i });

  expect(emailInput).toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();
});
```

**Manual Checklist:**
- ✅ Keyboard navigation works
- ✅ Focus indicators visible
- ✅ Screen reader announces correctly
- ✅ Color contrast meets WCAG
- ✅ Images have alt text

<details>
<summary><strong>🔍 Deep Dive: Accessibility Testing Automation and Browser Internals</strong></summary>

Accessibility testing involves both automated tools and manual testing. Understanding how automated tools work under the hood helps you interpret results and catch issues they miss.

**How Automated Accessibility Tools Work:**

Tools like axe-core, Lighthouse, and WAVE work by analyzing the accessibility tree and applying WCAG rules:

```javascript
// Simplified conceptual model of how axe-core works
class AccessibilityAuditor {
  constructor() {
    this.rules = this.loadRules();
    this.violations = [];
    this.passes = [];
    this.incomplete = [];
  }

  async audit(document) {
    // Step 1: Build accessibility tree
    const accessibilityTree = this.buildAccessibilityTree(document);

    // Step 2: Run all rules against the tree
    for (const rule of this.rules) {
      const results = await this.runRule(rule, accessibilityTree, document);

      // Categorize results
      results.violations.forEach(v => this.violations.push(v));
      results.passes.forEach(p => this.passes.push(p));
      results.incomplete.forEach(i => this.incomplete.push(i));
    }

    return {
      violations: this.violations,
      passes: this.passes,
      incomplete: this.incomplete,
      statistics: this.getStatistics()
    };
  }

  loadRules() {
    // Axe-core has 90+ rules based on WCAG 2.1 A/AA/AAA
    return [
      {
        id: 'button-name',
        impact: 'critical',
        tags: ['wcag2a', 'wcag412'],
        description: 'Ensures buttons have discernible text',
        evaluate: (node) => this.hasAccessibleName(node)
      },
      {
        id: 'color-contrast',
        impact: 'serious',
        tags: ['wcag2aa', 'wcag143'],
        description: 'Ensures text has sufficient contrast',
        evaluate: (node) => this.checkColorContrast(node)
      },
      {
        id: 'image-alt',
        impact: 'critical',
        tags: ['wcag2a', 'wcag111'],
        description: 'Ensures images have alt text',
        evaluate: (node) => this.hasAltText(node)
      },
      {
        id: 'aria-valid-attr',
        impact: 'critical',
        tags: ['wcag2a', 'wcag412'],
        description: 'Ensures ARIA attributes are valid',
        evaluate: (node) => this.validateAriaAttributes(node)
      },
      {
        id: 'label',
        impact: 'critical',
        tags: ['wcag2a', 'wcag412', 'wcag131'],
        description: 'Ensures form inputs have labels',
        evaluate: (node) => this.hasLabel(node)
      },
      // ... 85+ more rules
    ];
  }

  async runRule(rule, tree, document) {
    const results = {
      violations: [],
      passes: [],
      incomplete: []
    };

    // Find all nodes this rule applies to
    const applicableNodes = this.findApplicableNodes(rule, document);

    for (const node of applicableNodes) {
      try {
        const result = await rule.evaluate(node);

        if (result === true) {
          results.passes.push({
            rule: rule.id,
            node: this.getNodeSelector(node)
          });
        } else if (result === false) {
          results.violations.push({
            rule: rule.id,
            impact: rule.impact,
            description: rule.description,
            node: this.getNodeSelector(node),
            fix: this.getSuggestion(rule, node)
          });
        } else {
          // Requires manual testing
          results.incomplete.push({
            rule: rule.id,
            node: this.getNodeSelector(node),
            reason: 'Requires manual verification'
          });
        }
      } catch (error) {
        results.incomplete.push({
          rule: rule.id,
          error: error.message
        });
      }
    }

    return results;
  }

  // Example rule implementations
  hasAccessibleName(element) {
    // Check for accessible name via multiple methods
    const name = this.computeAccessibleName(element);

    if (!name || name.trim().length === 0) {
      return false;
    }

    return true;
  }

  computeAccessibleName(element) {
    // Priority order per ARIA spec
    if (element.hasAttribute('aria-labelledby')) {
      const ids = element.getAttribute('aria-labelledby').split(' ');
      return ids.map(id => {
        const ref = document.getElementById(id);
        return ref ? ref.textContent : '';
      }).join(' ');
    }

    if (element.hasAttribute('aria-label')) {
      return element.getAttribute('aria-label');
    }

    if (element.tagName === 'INPUT' && element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent;
    }

    if (element.tagName === 'IMG') {
      return element.getAttribute('alt') || '';
    }

    if (['BUTTON', 'A'].includes(element.tagName)) {
      return element.textContent.trim();
    }

    return element.getAttribute('title') || '';
  }

  checkColorContrast(element) {
    // Get foreground and background colors
    const styles = window.getComputedStyle(element);
    const foreground = this.parseColor(styles.color);
    const background = this.parseColor(styles.backgroundColor);

    // If background is transparent, traverse up
    if (background.alpha === 0) {
      const bgElement = this.findBackgroundElement(element);
      const bgStyles = window.getComputedStyle(bgElement);
      background = this.parseColor(bgStyles.backgroundColor);
    }

    // Calculate contrast ratio
    const contrastRatio = this.calculateContrastRatio(foreground, background);

    // WCAG requirements
    const fontSize = parseFloat(styles.fontSize);
    const fontWeight = styles.fontWeight;
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);

    // WCAG 2.1 Level AA
    const requiredRatio = isLargeText ? 3 : 4.5;

    if (contrastRatio < requiredRatio) {
      return {
        result: false,
        details: {
          contrastRatio: contrastRatio.toFixed(2),
          required: requiredRatio,
          foreground: foreground,
          background: background
        }
      };
    }

    return true;
  }

  calculateContrastRatio(color1, color2) {
    const l1 = this.getRelativeLuminance(color1);
    const l2 = this.getRelativeLuminance(color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  getRelativeLuminance({ r, g, b }) {
    // Convert to sRGB
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    // Apply gamma correction
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    // Calculate luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  hasLabel(element) {
    if (element.tagName !== 'INPUT' && element.tagName !== 'SELECT' && element.tagName !== 'TEXTAREA') {
      return null; // Not applicable
    }

    // Check for label association
    const hasExplicitLabel = element.id && document.querySelector(`label[for="${element.id}"]`);
    const hasImplicitLabel = element.closest('label');
    const hasAriaLabel = element.hasAttribute('aria-label');
    const hasAriaLabelledby = element.hasAttribute('aria-labelledby');

    return hasExplicitLabel || hasImplicitLabel || hasAriaLabel || hasAriaLabelledby;
  }

  validateAriaAttributes(element) {
    const validAriaAttributes = [
      'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
      'aria-live', 'aria-atomic', 'aria-busy', 'aria-controls', 'aria-current',
      'aria-details', 'aria-disabled', 'aria-errormessage', 'aria-expanded',
      'aria-haspopup', 'aria-invalid', 'aria-keyshortcuts', 'aria-level',
      'aria-modal', 'aria-multiline', 'aria-multiselectable', 'aria-orientation',
      'aria-owns', 'aria-placeholder', 'aria-posinset', 'aria-pressed',
      'aria-readonly', 'aria-relevant', 'aria-required', 'aria-roledescription',
      'aria-selected', 'aria-setsize', 'aria-sort', 'aria-valuemax',
      'aria-valuemin', 'aria-valuenow', 'aria-valuetext'
    ];

    const attributes = element.getAttributeNames();
    const ariaAttributes = attributes.filter(attr => attr.startsWith('aria-'));

    for (const attr of ariaAttributes) {
      if (!validAriaAttributes.includes(attr)) {
        return {
          result: false,
          details: {
            invalidAttribute: attr,
            element: element.tagName
          }
        };
      }

      // Validate attribute value
      const value = element.getAttribute(attr);
      if (!this.validateAriaValue(attr, value)) {
        return {
          result: false,
          details: {
            attribute: attr,
            invalidValue: value
          }
        };
      }
    }

    return true;
  }

  validateAriaValue(attribute, value) {
    const booleanAttributes = ['aria-hidden', 'aria-disabled', 'aria-readonly', 'aria-required'];
    const tokenAttributes = {
      'aria-haspopup': ['false', 'true', 'menu', 'listbox', 'tree', 'grid', 'dialog'],
      'aria-live': ['off', 'polite', 'assertive'],
      'aria-autocomplete': ['none', 'inline', 'list', 'both']
    };

    if (booleanAttributes.includes(attribute)) {
      return value === 'true' || value === 'false';
    }

    if (tokenAttributes[attribute]) {
      return tokenAttributes[attribute].includes(value);
    }

    return true; // Other attributes have complex validation
  }
}
```

**Integration with Testing Frameworks:**

```javascript
// Jest + React Testing Library + jest-axe
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  test('Button component has no violations', async () => {
    const { container } = render(
      <button onClick={() => {}}>
        Click me
      </button>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Form has proper labels', async () => {
    const { container } = render(
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" />

        <label htmlFor="password">Password</label>
        <input id="password" type="password" />

        <button type="submit">Submit</button>
      </form>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Custom widget has proper ARIA', async () => {
    const { container } = render(
      <div role="tablist">
        <button role="tab" aria-selected="true" aria-controls="panel-1">
          Tab 1
        </button>
        <button role="tab" aria-selected="false" aria-controls="panel-2">
          Tab 2
        </button>

        <div id="panel-1" role="tabpanel" aria-labelledby="tab-1">
          Content 1
        </div>
        <div id="panel-2" role="tabpanel" aria-labelledby="tab-2" hidden>
          Content 2
        </div>
      </div>
    );

    const results = await axe(container, {
      rules: {
        // Enable specific rules
        'aria-allowed-attr': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true }
      }
    });

    expect(results).toHaveNoViolations();
  });

  // Test with custom rules
  test('Modal has proper focus management', async () => {
    const { container } = render(<Modal isOpen={true} />);

    const results = await axe(container, {
      rules: {
        'aria-dialog-name': { enabled: true },
        'focus-order-semantics': { enabled: true }
      }
    });

    expect(results).toHaveNoViolations();
  });
});
```

**Cypress Accessibility Testing:**

```javascript
// cypress/support/commands.js
import 'cypress-axe';

// cypress/e2e/accessibility.cy.js
describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe(); // Inject axe-core
  });

  it('Homepage has no accessibility violations', () => {
    cy.checkA11y(); // Check entire page
  });

  it('Navigation is keyboard accessible', () => {
    cy.get('nav a').first().focus();
    cy.focused().should('have.attr', 'href');

    // Tab through navigation
    cy.realPress('Tab');
    cy.focused().should('be.visible');
  });

  it('Form validation errors are announced', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();

    // Check that error has role="alert"
    cy.get('[role="alert"]').should('exist').and('be.visible');

    // Check accessibility
    cy.checkA11y('form', {
      rules: {
        'aria-valid-attr-value': { enabled: true },
        'aria-required-attr': { enabled: true }
      }
    });
  });

  it('Modal traps focus', () => {
    cy.get('button[aria-label="Open modal"]').click();

    // Modal should be visible
    cy.get('[role="dialog"]').should('be.visible');

    // First focusable element should have focus
    cy.focused().should('be.visible');

    // Tab through modal
    cy.realPress('Tab');
    cy.focused().should('be.visible');

    // Focus should stay within modal
    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.focused().parents('[role="dialog"]').should('exist');

    // Check modal accessibility
    cy.checkA11y('[role="dialog"]');
  });

  it('Color contrast meets WCAG AA', () => {
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });

  // Test specific components
  it('Button component is accessible', () => {
    cy.checkA11y('button', {
      rules: {
        'button-name': { enabled: true },
        'color-contrast': { enabled: true }
      }
    });
  });

  // Test with context
  it('Main content is accessible', () => {
    cy.checkA11y('main', {
      includedImpacts: ['critical', 'serious'],
      rules: {
        'region': { enabled: true },
        'landmark-one-main': { enabled: true }
      }
    });
  });

  // Test dynamic content
  it('Live region announces updates', () => {
    cy.get('button').contains('Add to cart').click();

    cy.get('[role="status"]')
      .should('exist')
      .and('contain', 'Item added to cart');

    cy.checkA11y('[role="status"]');
  });
});
```

**Playwright Accessibility Testing:**

```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('Homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Form should have proper labels', async ({ page }) => {
    await page.goto('/contact');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('form')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Modal should have focus trapped', async ({ page }) => {
    await page.goto('/');

    await page.click('button[aria-label="Open modal"]');

    // Check modal is accessible
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Test focus trap
    await page.keyboard.press('Tab');
    const firstFocusedElement = await page.evaluate(() => document.activeElement.tagName);

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should still be within modal
    const stillInModal = await page.evaluate(() => {
      return document.activeElement.closest('[role="dialog"]') !== null;
    });

    expect(stillInModal).toBe(true);
  });

  test('Color contrast should meet WCAG AA', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

**Manual Testing Checklist Automation:**

```javascript
// Automated checklist runner
class AccessibilityChecklistRunner {
  async runChecklist(page) {
    const results = {
      passed: [],
      failed: [],
      warnings: []
    };

    // Check 1: Keyboard navigation
    const keyboardNavigation = await this.testKeyboardNavigation(page);
    if (keyboardNavigation.success) {
      results.passed.push('Keyboard navigation works');
    } else {
      results.failed.push({
        test: 'Keyboard navigation',
        issues: keyboardNavigation.issues
      });
    }

    // Check 2: Focus indicators
    const focusIndicators = await this.testFocusIndicators(page);
    if (focusIndicators.success) {
      results.passed.push('Focus indicators visible');
    } else {
      results.failed.push({
        test: 'Focus indicators',
        issues: focusIndicators.issues
      });
    }

    // Check 3: Screen reader support
    const screenReader = await this.testScreenReaderSupport(page);
    if (screenReader.success) {
      results.passed.push('Screen reader support');
    } else {
      results.failed.push({
        test: 'Screen reader support',
        issues: screenReader.issues
      });
    }

    // Check 4: Color contrast
    const colorContrast = await this.testColorContrast(page);
    if (colorContrast.success) {
      results.passed.push('Color contrast meets WCAG');
    } else {
      results.failed.push({
        test: 'Color contrast',
        issues: colorContrast.issues
      });
    }

    // Check 5: Images have alt text
    const altText = await this.testAltText(page);
    if (altText.success) {
      results.passed.push('Images have alt text');
    } else {
      results.failed.push({
        test: 'Alt text',
        issues: altText.issues
      });
    }

    return results;
  }

  async testKeyboardNavigation(page) {
    const issues = [];

    // Get all interactive elements
    const interactive = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      return Array.from(elements).map(el => ({
        tag: el.tagName,
        text: el.textContent.trim().substring(0, 30),
        tabindex: el.getAttribute('tabindex'),
        hasOnClick: el.onclick !== null
      }));
    });

    // Check for positive tabindex (anti-pattern)
    const positiveTabindex = interactive.filter(el =>
      el.tabindex && parseInt(el.tabindex) > 0
    );

    if (positiveTabindex.length > 0) {
      issues.push(`${positiveTabindex.length} elements have positive tabindex (anti-pattern)`);
    }

    return {
      success: issues.length === 0,
      issues
    };
  }

  async testFocusIndicators(page) {
    const issues = [];

    const hasOutline = await page.evaluate(() => {
      const focusableElements = document.querySelectorAll(
        'a, button, input, select, textarea'
      );

      const elementsWithoutOutline = [];

      focusableElements.forEach(el => {
        el.focus();
        const styles = window.getComputedStyle(el, ':focus');
        const outlineWidth = styles.getPropertyValue('outline-width');
        const outlineStyle = styles.getPropertyValue('outline-style');

        if (outlineWidth === '0px' || outlineStyle === 'none') {
          // Check for alternative focus indicator
          const boxShadow = styles.getPropertyValue('box-shadow');
          const border = styles.getPropertyValue('border');

          if (boxShadow === 'none' && !border.includes('px solid')) {
            elementsWithoutOutline.push({
              tag: el.tagName,
              text: el.textContent.trim().substring(0, 30)
            });
          }
        }
      });

      return elementsWithoutOutline;
    });

    if (hasOutline.length > 0) {
      issues.push(`${hasOutline.length} elements have no visible focus indicator`);
    }

    return {
      success: issues.length === 0,
      issues
    };
  }

  async testScreenReaderSupport(page) {
    const issues = [];

    const unlabeledInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, select, textarea');
      const unlabeled = [];

      inputs.forEach(input => {
        const hasLabel = input.id && document.querySelector(`label[for="${input.id}"]`);
        const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
        const hasParentLabel = input.closest('label');

        if (!hasLabel && !hasAriaLabel && !hasParentLabel) {
          unlabeled.push({
            tag: input.tagName,
            type: input.type,
            name: input.name
          });
        }
      });

      return unlabeled;
    });

    if (unlabeledInputs.length > 0) {
      issues.push(`${unlabeledInputs.length} form inputs have no label`);
    }

    return {
      success: issues.length === 0,
      issues
    };
  }

  async testColorContrast(page) {
    // Use axe-core for color contrast
    const results = await page.evaluate(async () => {
      const axe = require('axe-core');
      const results = await axe.run(document, {
        rules: { 'color-contrast': { enabled: true } }
      });

      return results.violations.filter(v => v.id === 'color-contrast');
    });

    return {
      success: results.length === 0,
      issues: results.map(v => v.description)
    };
  }

  async testAltText(page) {
    const issues = [];

    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const missing = [];

      images.forEach(img => {
        const hasAlt = img.hasAttribute('alt');
        const isDecorative = img.getAttribute('role') === 'presentation' ||
                           img.getAttribute('alt') === '';

        if (!hasAlt && !isDecorative) {
          missing.push({
            src: img.src,
            width: img.width,
            height: img.height
          });
        }
      });

      return missing;
    });

    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    }

    return {
      success: issues.length === 0,
      issues
    };
  }
}
```

Understanding how automated tools work helps you write better tests and catch issues that automation misses.

</details>

<details>
<summary><strong>🐛 Real-World Scenario: SaaS Dashboard Failing Accessibility Audit (Government Contract Lost)</strong></summary>

**Company:** Enterprise SaaS provider (analytics dashboard)
**Impact:** $2.4M government contract rejected due to accessibility failures
**Time to Resolution:** 6 weeks
**Root Cause:** No accessibility testing in CI/CD pipeline

**The Problem:**

A SaaS company built an analytics dashboard and submitted it for a government contract. The contract required WCAG 2.1 Level AA compliance. Their submission was rejected after an external accessibility audit revealed 247 violations across critical user flows.

```
Audit Results (June 2024):
- Total violations: 247
- Critical (Level A): 82 violations
- Serious (Level AA): 134 violations
- Moderate: 31 violations
- Most common issues:
  1. Missing form labels: 54 instances
  2. Insufficient color contrast: 43 instances
  3. Missing ARIA attributes: 38 instances
  4. Keyboard navigation broken: 27 instances
  5. Focus management issues: 22 instances
```

The company had ZERO accessibility tests in their test suite. They relied on manual QA, which never caught these issues.

**Initial Investigation:**

```javascript
// Their existing test suite - NO accessibility tests
describe('Dashboard', () => {
  test('renders correctly', () => {
    render(<Dashboard />);
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  test('loads data on mount', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  // ❌ NO accessibility tests!
  // ❌ NO keyboard navigation tests!
  // ❌ NO screen reader tests!
  // ❌ NO color contrast tests!
});
```

**Specific Issues Found in External Audit:**

1. **Data table inaccessible to screen readers:**

```jsx
// ❌ BEFORE: Table with no ARIA
function DataTable({ data }) {
  return (
    <div className="table">
      <div className="table-header">
        <div className="header-cell">Name</div>
        <div className="header-cell">Revenue</div>
        <div className="header-cell">Growth</div>
      </div>
      {data.map(row => (
        <div className="table-row" key={row.id}>
          <div className="cell">{row.name}</div>
          <div className="cell">{row.revenue}</div>
          <div className="cell">{row.growth}</div>
        </div>
      ))}
    </div>
  );
}
```

2. **Date picker not keyboard accessible:**

```jsx
// ❌ BEFORE: Custom date picker with no keyboard support
function DatePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div onClick={() => setIsOpen(!isOpen)}>
        {value || 'Select date'}
      </div>
      {isOpen && (
        <div className="calendar">
          {/* Calendar rendered with divs + onClick */}
          {dates.map(date => (
            <div onClick={() => onChange(date)}>{date}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

3. **Filter buttons with poor contrast:**

```css
/* ❌ BEFORE: Insufficient contrast (2.8:1, needs 4.5:1) */
.filter-button {
  background: #999999;
  color: #cccccc;
}
```

4. **Loading states not announced:**

```jsx
// ❌ BEFORE: Visual spinner only
function Dashboard() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Spinner />; // Just visual, no screen reader announcement
  }

  return <DashboardContent />;
}
```

**The Solution - Comprehensive Accessibility Testing:**

**Step 1: Add jest-axe to Unit Tests**

```javascript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Dashboard Accessibility', () => {
  test('Dashboard has no accessibility violations', async () => {
    const { container } = render(<Dashboard />);

    const results = await axe(container, {
      rules: {
        // Enable all WCAG 2.1 Level A and AA rules
        region: { enabled: true },
        'color-contrast': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'button-name': { enabled: true },
        'label': { enabled: true }
      }
    });

    expect(results).toHaveNoViolations();
  });

  test('Data table is accessible', async () => {
    const { container } = render(
      <DataTable data={mockData} />
    );

    // Check for proper table structure
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();

    // Check for table headers
    const headers = container.querySelectorAll('th');
    expect(headers.length).toBeGreaterThan(0);

    // Run axe accessibility check
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Form inputs have labels', async () => {
    const { container } = render(<FilterForm />);

    const results = await axe(container, {
      rules: {
        'label': { enabled: true },
        'label-title-only': { enabled: true }
      }
    });

    expect(results).toHaveNoViolations();
  });

  test('Color contrast meets WCAG AA', async () => {
    const { container } = render(<Dashboard />);

    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });

    expect(results).toHaveNoViolations();
  });
});
```

**Step 2: Add Cypress Accessibility Tests**

```javascript
describe('Dashboard E2E Accessibility', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
    cy.injectAxe();
  });

  it('Full dashboard has no violations', () => {
    cy.wait(1000); // Wait for dynamic content
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious']
    });
  });

  it('Keyboard navigation works throughout dashboard', () => {
    // Tab through all interactive elements
    cy.get('body').realPress('Tab');
    cy.focused().should('be.visible');

    // Navigate to filters
    cy.realPress('Tab');
    cy.realPress('Tab');
    cy.focused().should('have.attr', 'role', 'button');

    // Open date picker with keyboard
    cy.realPress('Enter');
    cy.get('[role="dialog"]').should('be.visible');

    // Navigate within date picker
    cy.realPress('ArrowDown');
    cy.focused().should('be.visible');

    // Close date picker
    cy.realPress('Escape');
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('Screen reader announces loading states', () => {
    cy.visit('/dashboard');

    // Check for loading announcement
    cy.get('[role="status"]')
      .should('exist')
      .and('contain', 'Loading dashboard');

    // Wait for load
    cy.wait(2000);

    // Check for loaded announcement
    cy.get('[role="status"]')
      .should('contain', 'Dashboard loaded');
  });

  it('Data table is keyboard navigable', () => {
    cy.get('table').first().focus();

    // Navigate cells with arrow keys
    cy.realPress('ArrowRight');
    cy.focused().should('have.attr', 'role', 'gridcell');

    cy.realPress('ArrowDown');
    cy.focused().should('have.attr', 'role', 'gridcell');

    // Check table accessibility
    cy.checkA11y('table');
  });

  it('Filter form is accessible', () => {
    cy.checkA11y('form', {
      rules: {
        'label': { enabled: true },
        'aria-required-attr': { enabled: true }
      }
    });
  });

  it('Error messages are announced', () => {
    cy.get('input[type="email"]').type('invalid');
    cy.get('button[type="submit"]').click();

    // Error should have role="alert"
    cy.get('[role="alert"]').should('exist');

    // Error should be associated with input
    cy.get('input[type="email"]')
      .should('have.attr', 'aria-invalid', 'true')
      .and('have.attr', 'aria-describedby');
  });
});
```

**Step 3: Add to CI/CD Pipeline**

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests with axe
        run: npm run test:a11y

      - name: Build application
        run: npm run build

      - name: Start server
        run: npm run start &
        env:
          PORT: 3000

      - name: Run Cypress a11y tests
        run: npm run cypress:run

      - name: Upload accessibility report
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: accessibility-violations
          path: cypress/reports/a11y-violations.json
```

**Step 4: Fixed Components**

```jsx
// ✅ AFTER: Accessible data table
function DataTable({ data }) {
  return (
    <table role="table" aria-label="Analytics data">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Revenue</th>
          <th scope="col">Growth</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            <td>{row.name}</td>
            <td>{row.revenue}</td>
            <td>{row.growth}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ✅ AFTER: Accessible date picker (using library)
import { DatePicker } from '@accessible-ui/datepicker';

function AccessibleDatePicker({ value, onChange }) {
  return (
    <div>
      <label htmlFor="date-picker">Select date</label>
      <DatePicker
        id="date-picker"
        value={value}
        onChange={onChange}
        aria-label="Select date range"
      />
    </div>
  );
}

// ✅ AFTER: Sufficient contrast
.filter-button {
  background: #0066cc; /* 7:1 contrast with white */
  color: #ffffff;
}

.filter-button:hover {
  background: #0052a3; /* Maintains contrast */
}

// ✅ AFTER: Loading states announced
function Dashboard() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {loading ? 'Loading dashboard, please wait' : 'Dashboard loaded successfully'}
      </div>

      {loading ? (
        <div>
          <Spinner aria-hidden="true" />
          <span className="sr-only">Loading</span>
        </div>
      ) : (
        <DashboardContent />
      )}
    </>
  );
}
```

**Results After Implementing Testing:**

```
Re-audit (August 2024 - 6 weeks after fixes):
- Total violations: 8 (97% reduction!)
- Critical (Level A): 0 violations ✅
- Serious (Level AA): 3 violations (minor edge cases)
- Moderate: 5 violations (enhancement opportunities)

Contract Status:
- ✅ Passed WCAG 2.1 Level AA compliance
- ✅ Government contract approved ($2.4M awarded)
- ✅ Additional contracts from other agencies ($4.1M pipeline)

Engineering Metrics:
- Accessibility tests in CI: 127 automated tests
- Test coverage: 94% of components
- Average PR build time: +2 minutes (acceptable)
- Accessibility bugs caught pre-production: 43 in 6 weeks
- Customer complaints about accessibility: 0
```

**Key Lessons:**

1. **Automate accessibility testing early** - Don't wait for external audits
2. **jest-axe catches 60-70% of issues** - Essential for unit tests
3. **Cypress for E2E accessibility** - Tests real user flows
4. **CI/CD prevents regressions** - Block merges with violations
5. **Manual testing still needed** - Automation catches ~70%, manual testing catches the rest
6. **Use accessible libraries** - Don't rebuild date pickers, modals, etc.
7. **Color contrast is low-hanging fruit** - Easy to fix, high impact
8. **Screen reader testing is crucial** - NVDA/JAWS reveal issues automation misses

</details>

<details>
<summary><strong>⚖️ Trade-offs: Automated vs. Manual Accessibility Testing</strong></summary>

Accessibility testing requires both automated and manual approaches. Understanding the trade-offs helps you allocate testing efforts effectively.

**1. Automated Testing (jest-axe, Lighthouse, Cypress)**

```javascript
// Automated testing example
test('Component has no violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

| Aspect | Automated Testing | Manual Testing |
|--------|------------------|---------------|
| **Coverage** | ~30-40% of WCAG criteria | ~100% of WCAG criteria |
| **Speed** | Seconds (runs in CI) | Hours/days (human tester) |
| **Cost** | Low (one-time setup) | High (ongoing labor) |
| **Consistency** | Perfect (same results every time) | Variable (human interpretation) |
| **False Positives** | Some (e.g., color contrast edge cases) | Rare (human judgment) |
| **Catches** | Technical violations (missing alt, ARIA errors) | UX issues (confusing flow, poor labels) |
| **Maintenance** | Low (update tests when code changes) | None |
| **Skill Required** | Developer | Accessibility expert |

**What automated tools CAN catch:**
- Missing alt text on images
- Missing form labels
- Invalid ARIA attributes
- Color contrast violations
- Missing roles on custom widgets
- Duplicate IDs
- Missing landmark regions
- Empty buttons/links

**What automated tools CANNOT catch:**
- Whether alt text is meaningful (can detect presence, not quality)
- Whether ARIA labels make sense (can detect presence, not clarity)
- Keyboard focus order logic (can detect tabbable, not order quality)
- Screen reader user experience (need actual screen reader)
- Whether color contrast is sufficient in all contexts (images, gradients)
- Whether error messages are helpful
- Whether content reading order makes sense

**Recommendation:** Use automated tests as first line of defense (catch 70% of issues), manual testing for UX and edge cases (remaining 30%).

**2. Unit Tests vs. E2E Accessibility Tests**

```javascript
// Unit test (jest-axe)
test('Button component is accessible', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// E2E test (Cypress)
it('Full checkout flow is accessible', () => {
  cy.visit('/checkout');
  cy.injectAxe();
  cy.checkA11y(); // Checks entire page with all interactions
});
```

| Aspect | Unit Tests | E2E Tests |
|--------|-----------|----------|
| **Scope** | Single component | Entire user flow |
| **Speed** | Very fast (<100ms) | Slow (seconds) |
| **CI Friendliness** | Excellent | Good (requires headless browser) |
| **Catches** | Component-level issues | Integration issues, flow problems |
| **Maintenance** | Low (component changes) | Medium (page structure changes) |
| **Realism** | Low (isolated component) | High (real browser, real interactions) |
| **Debugging** | Easy (single component) | Harder (multiple components) |

**Recommendation:**
- **Unit tests:** All components (100% coverage goal)
- **E2E tests:** Critical user flows (checkout, signup, key features)

**3. Axe-core vs. Lighthouse vs. WAVE**

| Tool | Best For | Coverage | Speed | CI Integration |
|------|---------|----------|-------|---------------|
| **axe-core** | Unit/E2E tests | Most comprehensive (90+ rules) | Fast | Excellent (jest-axe, cypress-axe) |
| **Lighthouse** | Performance + A11y audits | Good (50+ checks) | Medium | Good (CLI available) |
| **WAVE** | Manual browser testing | Good visual feedback | Fast | Poor (browser extension only) |
| **Pa11y** | Automated CI scans | Good | Fast | Excellent (CLI tool) |

**Recommendation:**
- **Primary:** axe-core (jest-axe for unit, cypress-axe for E2E)
- **Secondary:** Lighthouse in CI for overall score
- **Manual:** WAVE for visual debugging

**4. Blocking vs. Warning for Accessibility Violations**

```yaml
# CI Configuration - strict mode
- name: Run accessibility tests
  run: npm run test:a11y
  # ❌ Any violation fails the build

# CI Configuration - warning mode
- name: Run accessibility tests
  run: npm run test:a11y || true
  # ⚠️ Violations logged but don't fail build
```

| Approach | Pros | Cons |
|----------|------|------|
| **Block merges on violations** | Enforces compliance, prevents regressions | May slow down development, false positives block |
| **Warn on violations** | Doesn't block development, highlights issues | Violations accumulate, easier to ignore |
| **Block critical, warn moderate** | Balance between quality and velocity | Requires classification, subjective thresholds |

**Recommendation:**
- **New projects:** Block all violations (start strict)
- **Existing projects:** Block critical, warn on moderate (gradual improvement)
- **Legacy projects:** Warn only, track reduction over time (don't break existing builds)

**5. Manual Screen Reader Testing Frequency**

| Frequency | Effort | Coverage | Best For |
|-----------|--------|----------|----------|
| **Every commit** | Very high | 100% | Critical accessibility products |
| **Every feature** | High | New features | Accessible-first teams |
| **Every sprint** | Medium | Sample flows | Balanced approach |
| **Every release** | Low | Key flows | Minimum viable |
| **Before launch only** | Very low | Full audit | ❌ Not recommended |

**Recommendation:**
- **Critical flows (checkout, signup):** Every feature
- **Standard features:** Every sprint
- **Minor updates:** Every release
- **Plus:** External audit before major launch

**6. Accessibility Test Pyramid**

```
        /\
       /  \        Manual Screen Reader Testing (5%)
      /____\       - Key user flows
     /      \      - Complex interactions
    /        \
   /__________\    E2E Automated Tests (20%)
  /            \   - Full page audits
 /              \  - User flow testing
/________________\
                   Unit Tests (75%)
                   - Component accessibility
                   - ARIA validation
                   - Color contrast
```

**Decision Matrix:**

```
Small Website (Marketing, Blog):
- Unit tests: All components ✅
- E2E tests: Key pages (home, contact) ✅
- Manual testing: Before launch ✅
- Frequency: Every sprint ✅

Medium SaaS Application:
- Unit tests: All components ✅
- E2E tests: All user flows ✅
- Manual screen reader: Weekly ✅
- CI blocking: Critical violations ✅
- External audit: Annually ✅

Enterprise Application (Healthcare, Finance):
- Unit tests: 100% component coverage ✅
- E2E tests: All flows + edge cases ✅
- Manual screen reader: Every feature ✅
- CI blocking: All violations ✅
- External audit: Quarterly ✅
- WCAG compliance: AAA target ✅
```

**The 70/30 Rule:**

- **70% automated** - Unit tests (jest-axe), E2E tests (Cypress), CI integration
- **30% manual** - Screen reader testing, keyboard navigation, UX review

This combination catches the most issues while maintaining development velocity.

</details>

<details>
<summary><strong>💬 Explain to Junior: Accessibility Testing Like Spell-Check for Websites</strong></summary>

**The Word Processor Analogy:**

You know how Microsoft Word has spell-check that automatically catches typos? Accessibility testing tools are like spell-check for your website - they automatically catch common accessibility mistakes!

- **Spell-check** = Automated accessibility tests (catches obvious errors)
- **Grammar check** = Manual accessibility review (catches complex issues)
- **Peer review** = Screen reader testing (real human experience)

**Why This Matters:**

```
Without accessibility testing:
- Build a form → forget to add labels → screen reader users can't use it
- Ship to production → get complaints → emergency hotfix → wasted time
- Get sued for ADA violations → legal fees → bad press

With accessibility testing:
- Build a form → tests fail "Missing label" → fix immediately
- Ship with confidence → no complaints → happy users
- Pass compliance audits → win contracts → grow business
```

**The Three Levels of Testing:**

**Level 1: Automated Tests (The Spell-Check)**

These are like spell-check - they run automatically and catch obvious mistakes:

```javascript
// Install the "spell-checker" for accessibility
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// Test your component
test('Button is accessible', async () => {
  const { container } = render(<Button>Click me</Button>);

  // Run the "spell-check"
  const results = await axe(container);

  // If there are any violations, test fails!
  expect(results).toHaveNoViolations();
});
```

**What automated tests catch:**
- ✅ Missing alt text on images
- ✅ Form inputs without labels
- ✅ Buttons without text
- ✅ Bad color contrast
- ✅ Invalid ARIA attributes
- ✅ Missing landmark regions

**What they DON'T catch:**
- ❌ Whether alt text is meaningful ("image123.jpg" vs "Product photo")
- ❌ Whether keyboard navigation makes sense
- ❌ Whether screen reader experience is good
- ❌ Whether error messages are helpful

**The Spell-Check Analogy:**

Spell-check catches "teh" but not "Their going too the store" (wrong words). Same with accessibility tools - they catch technical errors but not UX problems!

**Level 2: Keyboard Testing (The Tab Test)**

This is manual but super simple - can you use your site with just the keyboard?

```
The "No Mouse Challenge":
1. Hide your mouse (seriously, put it away)
2. Navigate your site using only:
   - Tab (move forward)
   - Shift+Tab (move backward)
   - Enter (click buttons/links)
   - Space (click buttons, checkboxes)
   - Arrow keys (for custom widgets)
   - Escape (close modals)

Questions to ask:
- Can you reach everything?
- Can you see where you are (focus indicator)?
- Does the order make sense?
- Can you close modals?
- Can you submit forms?
```

**Real example:**

```jsx
// ❌ BAD: Can't Tab to this (not keyboard accessible)
<div onClick={handleClick}>Click me</div>

// ✅ GOOD: Can Tab to this and press Enter/Space
<button onClick={handleClick}>Click me</button>
```

**Level 3: Screen Reader Testing (The Real Test)**

This is like having a friend read your essay out loud - you catch things you missed when reading silently:

```
How to test with screen reader (NVDA - free!):
1. Download NVDA (free screen reader for Windows)
2. Install and start NVDA
3. Press Insert + Down Arrow (starts reading)
4. Listen - does it make sense?

Common issues you'll catch:
- "Button" (button for what? Missing label!)
- "Edit" (edit what? No label on input!)
- "Graphic" (image with no alt text)
- Confusing reading order
- Error messages not announced
```

**Setting Up Accessibility Tests (Step by Step):**

**Step 1: Install jest-axe**

```bash
npm install --save-dev jest-axe
```

**Step 2: Add to your tests**

```javascript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// This makes toHaveNoViolations() work
expect.extend(toHaveNoViolations);

describe('My Component', () => {
  // ✅ Accessibility test
  test('has no accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Your existing tests...
  test('renders correctly', () => {
    // ...
  });
});
```

**Step 3: Run your tests**

```bash
npm test
```

If there are violations, you'll see:

```
Expected no violations but received some

Issues found:
❌ <input type="email"> elements must have a label
   Fix: Add a <label> element or aria-label attribute

❌ Element has insufficient color contrast (2.1:1)
   Fix: Increase contrast ratio to at least 4.5:1
```

**Common Violations and How to Fix:**

**1. Missing Labels**

```jsx
// ❌ Test fails: "Input has no label"
<input type="email" />

// ✅ Test passes: Input has label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Also passes: Using aria-label
<input type="email" aria-label="Email address" />
```

**2. Insufficient Color Contrast**

```css
/* ❌ Test fails: Contrast 2.8:1 (needs 4.5:1) */
.button {
  background: #999999;
  color: #cccccc;
}

/* ✅ Test passes: Contrast 7:1 */
.button {
  background: #0066cc;
  color: #ffffff;
}
```

**3. Missing Alt Text**

```jsx
// ❌ Test fails: "Image has no alt text"
<img src="logo.png" />

// ✅ Test passes: Image has alt text
<img src="logo.png" alt="Company Logo" />

// ✅ Decorative images (empty alt)
<img src="decoration.png" alt="" />
```

**4. Button Without Text**

```jsx
// ❌ Test fails: "Button has no accessible name"
<button><i className="icon-delete"></i></button>

// ✅ Test passes: Button has aria-label
<button aria-label="Delete item">
  <i className="icon-delete"></i>
</button>
```

**The Testing Pyramid:**

```
      Manual Screen Reader
     (Test key flows monthly)
           /\
          /  \
         /____\
        /      \
       / E2E    \       (Test full pages)
      / Cypress \      cy.checkA11y()
     /___________\
    /             \
   /   Unit Tests  \   (Test every component)
  /   jest-axe     \  expect(results).toHaveNoViolations()
 /_________________\
```

**Quick Wins for Your Next Project:**

1. **Add jest-axe to ALL component tests**
   ```javascript
   test('is accessible', async () => {
     const { container } = render(<MyComponent />);
     expect(await axe(container)).toHaveNoViolations();
   });
   ```

2. **Test with keyboard (no mouse!)**
   - Tab through your entire app
   - Can you complete all tasks?

3. **Check color contrast**
   - Use browser DevTools
   - Lighthouse audit (built into Chrome)

4. **Install NVDA and listen**
   - Free screen reader
   - 10 minutes of listening = dozens of issues caught

5. **Add to CI/CD**
   - Tests run automatically on every commit
   - Blocks merges if violations found

**Interview Answer Template:**

"Accessibility testing involves both automated and manual approaches. I use:

1. **Automated tests** with jest-axe in unit tests to catch technical violations like missing labels, insufficient contrast, and invalid ARIA
2. **E2E tests** with Cypress and cypress-axe to test full user flows
3. **Manual keyboard testing** to ensure all functionality works without a mouse
4. **Screen reader testing** with NVDA to verify the experience for blind users

Automated tests catch about 30-40% of issues - things like missing alt text, form labels, and color contrast. Manual testing catches the remaining 60-70% - UX issues, confusing navigation, unhelpful error messages.

I integrate accessibility tests into CI/CD so violations block merges, preventing regressions. I also do manual screen reader testing for critical flows before release."

**Remember:** Automated tests are your first line of defense - they're fast, consistent, and catch obvious mistakes. But manual testing (keyboard + screen reader) is essential for catching UX issues that automation misses!

</details>

### Resources
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [jest-axe](https://github.com/nickcolley/jest-axe)

---

