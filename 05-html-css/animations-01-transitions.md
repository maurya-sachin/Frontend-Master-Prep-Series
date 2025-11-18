# CSS Animations and Transitions

> Transitions, animations, keyframes, transforms, performance considerations, and modern animation techniques.

---

## Question 1: CSS Transitions vs Animations

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Airbnb

### Question
What's the difference between CSS transitions and animations? When should you use each?

### Answer

**Transitions** - Animate between two states (A → B)
**Animations** - Complex multi-step animations with keyframes

**Key Points:**

1. **Transitions** - Simple, triggered by state change (hover, focus, etc.)
2. **Animations** - Complex, can run automatically, loop, reverse
3. **Performance** - Stick to transform and opacity for 60fps
4. **Control** - Animations provide more control (play, pause, reverse)
5. **Use Cases** - Transitions for interactions, animations for ongoing effects

### Code Example

```css
/* =========================================== */
/* 1. CSS TRANSITIONS */
/* =========================================== */

.button {
  background: blue;
  color: white;
  padding: 1rem 2rem;

  /* Transition syntax: property duration timing-function delay */
  transition: background 0.3s ease;
}

.button:hover {
  background: darkblue; /* Triggers transition */
}

/* Multiple properties */
.card {
  transform: scale(1);
  opacity: 1;
  transition: transform 0.3s ease, opacity 0.3s ease;
  /* OR shorthand: */
  transition: all 0.3s ease; /* ⚠️  Avoid 'all' - specify properties */
}

.card:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

/* Individual timing */
.element {
  transition-property: transform, opacity, background;
  transition-duration: 0.3s, 0.2s, 0.5s;
  transition-timing-function: ease, ease-in, ease-out;
  transition-delay: 0s, 0.1s, 0.2s;
}
```

```css
/* =========================================== */
/* 2. CSS ANIMATIONS */
/* =========================================== */

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;

  /* Animation syntax: name duration timing-function delay iteration-count direction */
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Pulse animation */
.notification {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* Slide in animation */
.modal {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

```css
/* =========================================== */
/* 3. TIMING FUNCTIONS */
/* =========================================== */

.element {
  /* Predefined */
  transition: all 0.3s ease; /* Slow start, fast, slow end */
  transition: all 0.3s linear; /* Constant speed */
  transition: all 0.3s ease-in; /* Slow start */
  transition: all 0.3s ease-out; /* Slow end */
  transition: all 0.3s ease-in-out; /* Slow start and end */

  /* Cubic bezier (custom) */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Steps (discrete) */
  transition: all 1s steps(4); /* 4 equal steps */
}

/* Common cubic bezier curves */
:root {
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-swift: cubic-bezier(0.4, 0, 0.6, 1);
}
```

```css
/* =========================================== */
/* 4. PERFORMANCE (GPU ACCELERATION) */
/* =========================================== */

/* ✅ PERFORMANT: Use transform and opacity */
.fast {
  transform: translateX(100px);
  opacity: 0.5;
  transition: transform 0.3s, opacity 0.3s;
}

/* ❌ SLOW: Avoid animating layout properties */
.slow {
  width: 200px; /* ❌ Triggers layout */
  height: 200px; /* ❌ Triggers layout */
  margin-left: 50px; /* ❌ Triggers layout */
  left: 50px; /* ❌ Triggers layout */
  transition: all 0.3s;
}

/* Force GPU acceleration */
.gpu-accelerated {
  will-change: transform, opacity; /* Hint to browser */
  /* OR */
  transform: translateZ(0); /* Force 3D context */
}

/* ⚠️  Don't overuse will-change */
.hover-card {
  transition: transform 0.3s;
}

.hover-card:hover {
  will-change: transform; /* Only when needed */
  transform: scale(1.05);
}

.hover-card:not(:hover) {
  will-change: auto; /* Remove when done */
}
```

### Common Mistakes

❌ **Wrong**: Animating layout properties
```css
.element {
  transition: width 0.3s; /* ❌ Janky, causes reflow */
}
```

✅ **Correct**: Use transform
```css
.element {
  transition: transform 0.3s; /* ✅ Smooth, GPU accelerated */
}

.element:hover {
  transform: scaleX(1.2); /* Visually same as width change */
}
```

❌ **Wrong**: Using `transition: all`
```css
.button {
  transition: all 0.3s; /* ❌ Inefficient, unpredictable */
}
```

✅ **Correct**: Specify properties
```css
.button {
  transition: background 0.3s, transform 0.3s; /* ✅ Explicit */
}
```

### Follow-up Questions
1. "What properties can be transitioned?"
2. "How do you create a custom easing curve?"
3. "What's the difference between transform and translate?"
4. "How do you control animations with JavaScript?"

### Resources
- [MDN: CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions)
- [MDN: CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Cubic Bezier Generator](https://cubic-bezier.com/)

---

## Question 2: Transform Property and 3D Transforms

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta

### Question
Explain CSS transform property. What 2D and 3D transforms are available?

### Answer

**Transform** - Applies 2D or 3D transformations to elements without affecting document flow.

**Key Points:**

1. **Doesn't Affect Layout** - Element space reserved, transform doesn't push other elements
2. **GPU Accelerated** - Performant for animations
3. **Transform Origin** - Control pivot point for transformations
4. **3D Context** - Use perspective for 3D effects
5. **Multiple Transforms** - Space-separated, order matters

### Code Example

```css
/* =========================================== */
/* 1. 2D TRANSFORMS */
/* =========================================== */

/* Translate (move) */
.translate {
  transform: translateX(100px); /* Move right */
  transform: translateY(-50px); /* Move up */
  transform: translate(100px, -50px); /* X, Y */
}

/* Scale */
.scale {
  transform: scaleX(1.5); /* 150% width */
  transform: scaleY(0.5); /* 50% height */
  transform: scale(1.2); /* 120% both */
  transform: scale(1.5, 0.8); /* X, Y */
}

/* Rotate */
.rotate {
  transform: rotate(45deg); /* Clockwise 45° */
  transform: rotate(-45deg); /* Counter-clockwise */
}

/* Skew */
.skew {
  transform: skewX(20deg); /* Slant horizontal */
  transform: skewY(10deg); /* Slant vertical */
  transform: skew(20deg, 10deg); /* X, Y */
}

/* Combining transforms (order matters!) */
.combined {
  transform: translate(50px, 50px) rotate(45deg) scale(1.2);
  /* 1. Translate, 2. Rotate, 3. Scale */
}
```

```css
/* =========================================== */
/* 2. TRANSFORM ORIGIN */
/* =========================================== */

.element {
  /* Default: center center */
  transform-origin: center center;

  /* Rotate from top-left corner */
  transform-origin: top left;
  transform: rotate(45deg);

  /* Precise positioning */
  transform-origin: 100px 50px;
  transform-origin: 50% 100%; /* Bottom center */
}

/* Practical example: door opening */
.door {
  transform-origin: left center; /* Hinge on left */
  transition: transform 0.5s;
}

.door:hover {
  transform: rotateY(90deg); /* Swing open */
}
```

```css
/* =========================================== */
/* 3. 3D TRANSFORMS */
/* =========================================== */

/* Perspective (required for 3D) */
.container {
  perspective: 1000px; /* Distance from viewer */
  perspective-origin: center center;
}

.card {
  transform-style: preserve-3d; /* Enable 3D for children */

  /* 3D translate */
  transform: translateZ(100px); /* Toward viewer */
  transform: translate3d(50px, 50px, 100px); /* X, Y, Z */

  /* 3D rotate */
  transform: rotateX(45deg); /* Flip on X axis */
  transform: rotateY(45deg); /* Spin on Y axis */
  transform: rotateZ(45deg); /* Same as rotate() */
  transform: rotate3d(1, 1, 0, 45deg); /* Custom axis */

  /* 3D scale */
  transform: scaleZ(2);
  transform: scale3d(1.5, 1.5, 2);
}

/* Backface visibility */
.flip-card {
  backface-visibility: hidden; /* Hide back side when flipped */
}
```

```css
/* =========================================== */
/* 4. PRACTICAL EXAMPLE: FLIP CARD */
/* =========================================== */

.flip-container {
  perspective: 1000px;
  width: 300px;
  height: 200px;
}

.flip-card {
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.flip-container:hover .flip-card {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg); /* Back starts flipped */
}
```

### Common Mistakes

❌ **Wrong**: Forgetting perspective for 3D
```css
.card {
  transform: rotateY(45deg); /* ❌ Looks flat without perspective */
}
```

✅ **Correct**: Add perspective to parent
```css
.container {
  perspective: 1000px; /* ✅ Enables 3D effect */
}

.card {
  transform: rotateY(45deg); /* ✅ Looks 3D */
}
```

### Follow-up Questions
1. "What's the difference between perspective and transform: perspective()?"
2. "How does transform order affect the result?"
3. "What's the difference between translate and position?"
4. "How do 3D transforms affect stacking context?"

### Resources
- [MDN: Transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [3D Transforms](https://3dtransforms.desandro.com/)

---

## Question 3: Animation Performance and Best Practices

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Netflix

### Question
How do you optimize CSS animations for performance? What causes jank?

### Answer

**Key Points:**

1. **Stick to transform and opacity** - GPU accelerated
2. **Avoid Layout Thrashing** - Don't animate width, height, position
3. **Use will-change Sparingly** - Hints browser, but costs memory
4. **60fps Target** - 16.67ms per frame budget
5. **Reduce Paint/Layout** - Use DevTools Performance tab to profile

### Code Example

```css
/* =========================================== */
/* 1. PERFORMANT ANIMATIONS */
/* =========================================== */

/* ✅ GOOD: Transform and opacity only */
.smooth {
  transition: transform 0.3s, opacity 0.3s;
}

.smooth:hover {
  transform: scale(1.1) translateY(-10px);
  opacity: 0.9;
}

/* ❌ BAD: Causes layout/paint */
.janky {
  transition: width 0.3s, height 0.3s, top 0.3s, left 0.3s;
}

.janky:hover {
  width: 250px; /* ❌ Reflow */
  height: 250px; /* ❌ Reflow */
  top: 50px; /* ❌ Reflow */
  left: 50px; /* ❌ Reflow */
}
```

```css
/* =========================================== */
/* 2. WILL-CHANGE OPTIMIZATION */
/* =========================================== */

/* ✅ Use will-change for interactive elements */
.interactive-card {
  transition: transform 0.3s;
}

.interactive-card:hover,
.interactive-card:focus {
  will-change: transform; /* Hint to browser */
  transform: scale(1.05);
}

/* Remove when animation completes */
.interactive-card {
  will-change: auto; /* Default */
}

/* ❌ Don't overuse will-change */
.bad-example {
  will-change: transform, opacity, background, color, border;
  /* ❌ Too many properties, wastes memory */
}

/* ✅ Be specific */
.good-example {
  will-change: transform; /* ✅ Only what's needed */
}
```

```css
/* =========================================== */
/* 3. REDUCING ANIMATIONS FOR ACCESSIBILITY */
/* =========================================== */

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Or disable specific animations */
@media (prefers-reduced-motion: reduce) {
  .spinning-loader {
    animation: none;
    /* Show static state instead */
  }

  .fade-in {
    opacity: 1; /* Skip animation */
    animation: none;
  }
}
```

### Common Mistakes

❌ **Wrong**: Animating all properties
```css
.element {
  transition: all 0.3s; /* ❌ Includes layout properties */
}
```

✅ **Correct**: Animate only transform/opacity
```css
.element {
  transition: transform 0.3s, opacity 0.3s; /* ✅ GPU accelerated */
}
```

### Follow-up Questions
1. "What triggers layout, paint, and composite?"
2. "How do you debug animation performance?"
3. "What is FLIP technique?"
4. "How does requestAnimationFrame work?"

### Resources
- [High Performance Animations](https://web.dev/animations-guide/)
- [CSS Triggers](https://csstriggers.com/)

---

## Summary Table

| Topic | Best Practice | Property |
|-------|--------------|----------|
| Transitions | Simple state changes | transition: transform 0.3s |
| Animations | Complex multi-step | @keyframes + animation |
| Performance | GPU acceleration | transform, opacity |
| 3D | Add perspective | perspective: 1000px |
| Accessibility | Reduce motion | @media (prefers-reduced-motion) |

---

**Next Topics**: CSS Architecture, Modern CSS
