# React Component Composition

> Component composition patterns and best practices

---

## Question 1: Composition vs Inheritance in React

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Meta, Google, Airbnb

### Question
Why does React favor composition over inheritance? Demonstrate composition patterns.

### Answer

**React Recommendation: Use composition, not inheritance**

```jsx
// ❌ Inheritance (Don't do this in React)
class BaseButton extends React.Component {
  handleClick() {
    // base logic
  }
}

class PrimaryButton extends BaseButton {
  // Inherits from BaseButton
}

// ✅ Composition (React way)
function Button({ variant, children, onClick }) {
  const className = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}

// Usage
<Button variant="primary">Click Me</Button>
```

**Composition Patterns:**

```jsx
// 1. Children Prop (most common)
function Dialog({ children }) {
  return (
    <div className="dialog">
      {children}
    </div>
  );
}

<Dialog>
  <h1>Title</h1>
  <p>Content</p>
</Dialog>

// 2. Specialized Components
function WelcomeDialog() {
  return (
    <Dialog>
      <h1>Welcome</h1>
      <p>Thank you for visiting</p>
    </Dialog>
  );
}

// 3. Slots Pattern
function Layout({ header, sidebar, content }) {
  return (
    <div className="layout">
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{content}</main>
    </div>
  );
}

<Layout
  header={<Header />}
  sidebar={<Sidebar />}
  content={<Content />}
/>
```

### Resources
- [React Composition](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)

---

## Question 2: What Are Higher-Order Components (HOCs)?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Meta, Netflix, Uber

### Question
What are Higher-Order Components? When would you use them and what are modern alternatives?

### Answer

**HOC** - A function that takes a component and returns a new component with additional props or behavior.

**Key Points:**
1. **Pure function** - Doesn't modify the original component
2. **Reuse logic** - Share behavior across components
3. **Convention** - Prefix with `with` (withAuth, withLoading)
4. **Modern alternative** - Custom hooks are often better
5. **Use sparingly** - Can create wrapper hell

### Code Example

```jsx
// HOC Pattern
function withLoading(Component) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <Component {...props} />;
  };
}

// Usage
function UserList({ users }) {
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

const UserListWithLoading = withLoading(UserList);

// In parent component
<UserListWithLoading isLoading={loading} users={users} />

// Real-world: Authentication HOC
function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();

    if (loading) return <Spinner />;
    if (!user) return <Redirect to="/login" />;

    return <Component {...props} user={user} />;
  };
}

const ProtectedDashboard = withAuth(Dashboard);

// Modern Alternative: Custom Hook (Preferred)
function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Redirect to="/login" />;

  return <div>Welcome {user.name}</div>;
}
```

### Resources
- [Higher-Order Components](https://react.dev/reference/react/Component#alternatives)

---

