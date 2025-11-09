# API Integration Patterns

> REST vs GraphQL, API design, authentication, error handling, retry strategies, and best practices.

---

## Question 1: REST vs GraphQL

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon

### Question
Compare REST and GraphQL. When should you use each?

### Answer

| Feature | REST | GraphQL |
|---------|------|---------|
| Data fetching | Multiple endpoints | Single endpoint |
| Over-fetching | Common | Rare |
| Under-fetching | Common (N+1 problem) | Solved |
| Versioning | URL versioning | Schema evolution |
| Caching | HTTP caching | Complex |
| Learning curve | Easy | Moderate |

### Code Example

```javascript
// REST
// Multiple requests needed
const user = await fetch('/api/users/1');
const posts = await fetch('/api/users/1/posts');
const comments = await fetch('/api/users/1/comments');

// GraphQL
// Single request
const data = await graphql`
  query {
    user(id: 1) {
      name
      posts {
        title
        comments {
          text
        }
      }
    }
  }
`;
```

**When to Use:**
- **REST**: Simple APIs, caching important, standard HTTP
- **GraphQL**: Complex data requirements, mobile apps, flexible queries

### Resources
- [GraphQL vs REST](https://www.apollographql.com/blog/graphql-vs-rest/)

---

*[File continues with authentication patterns, error handling, etc.]*

