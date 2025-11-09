# Frontend Architecture Patterns

> Component architecture, state management, folder structure, error handling, and modern frontend app organization.

---

## Question 1: Component Architecture - Container vs Presentational

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Airbnb

### Question
Explain the difference between container and presentational components.

### Answer

**Presentational (UI) Components:**
- Focus on appearance
- Receive data via props
- No state management logic
- Reusable and testable

**Container (Smart) Components:**
- Focus on behavior
- Manage state
- Connect to data sources
- Pass data to presentational components

### Code Example

```jsx
// Presentational Component
function UserCard({ name, email, onEdit }) {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
}

// Container Component
function UserCardContainer({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setUser);
  }, [userId]);

  const handleEdit = () => {
    // Handle edit logic
  };

  if (!user) return <Loading />;

  return <UserCard {...user} onEdit={handleEdit} />;
}
```

### Resources
- [Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)

---

*[File continues with folder structures, state patterns, etc.]*

