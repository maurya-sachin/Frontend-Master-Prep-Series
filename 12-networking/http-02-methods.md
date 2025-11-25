# HTTP Methods

> **Focus**: Understanding HTTP verbs and their semantic meanings

---

## Question 1: What are HTTP methods and when should you use each?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Amazon, Microsoft, all companies

### Question
Explain the main HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS) and their proper use cases. What are idempotent methods?

### Answer

HTTP methods (also called HTTP verbs) define the action to perform on a resource. Choosing the correct method is crucial for building RESTful APIs that follow semantic standards.

**Main HTTP Methods:**

1. **GET** - Retrieve data (read-only)
   - Idempotent: Yes
   - Safe: Yes (no side effects)
   - Cacheable: Yes

2. **POST** - Create new resource or submit data
   - Idempotent: No
   - Safe: No (has side effects)
   - Cacheable: Rarely (if includes freshness info)

3. **PUT** - Replace entire resource
   - Idempotent: Yes
   - Safe: No (has side effects)
   - Cacheable: No

4. **PATCH** - Partially update resource
   - Idempotent: Should be (depends on implementation)
   - Safe: No (has side effects)
   - Cacheable: No

5. **DELETE** - Remove resource
   - Idempotent: Yes
   - Safe: No (has side effects)
   - Cacheable: No

6. **OPTIONS** - Describe communication options
   - Idempotent: Yes
   - Safe: Yes
   - Cacheable: No

**Idempotent**: Multiple identical requests have same effect as single request

### Code Example

**GET - Retrieve Data:**

```javascript
// GET request - retrieve user data
// Idempotent: YES (calling it 10 times returns same result)
// Safe: YES (doesn't modify server state)

// Client side
fetch('/api/users/123')
  .then(res => res.json())
  .then(user => console.log(user));

// Express server
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// ✅ GOOD: Query parameters for filtering/sorting
GET /api/users?role=admin&sort=name&limit=10

// ❌ BAD: Using GET to modify data
GET /api/users/delete/123  // Wrong! Use DELETE instead
GET /api/orders/create?product=abc  // Wrong! Use POST instead
```

**POST - Create New Resource:**

```javascript
// POST request - create new user
// Idempotent: NO (calling it 10 times creates 10 users)
// Safe: NO (modifies server state)

// Client side
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Alice',
    email: 'alice@example.com'
  })
})
  .then(res => res.json())
  .then(newUser => console.log(newUser));

// Express server
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;

  // Validate input
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  // Create new user
  const user = await User.create({ name, email });

  // Return 201 Created with Location header
  res.status(201)
    .location(`/api/users/${user.id}`)
    .json(user);
});

// ✅ GOOD: POST for non-idempotent operations
POST /api/orders (creates new order each time)
POST /api/payments (processes payment each time)

// ✅ GOOD: POST for complex queries (when URL would be too long)
POST /api/search
Body: { filters: { ... }, sort: { ... }, pagination: { ... } }
```

**PUT - Replace Entire Resource:**

```javascript
// PUT request - replace entire user object
// Idempotent: YES (calling it 10 times results in same final state)
// Safe: NO (modifies server state)

// Client side - MUST send complete resource
fetch('/api/users/123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: 123,
    name: 'Alice Updated',
    email: 'alice.new@example.com',
    role: 'admin',
    createdAt: '2023-01-01'
    // All fields must be included!
  })
})
  .then(res => res.json());

// Express server
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  // Validate all required fields present
  const requiredFields = ['name', 'email', 'role'];
  const missing = requiredFields.filter(field => !userData[field]);

  if (missing.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missing.join(', ')}`
    });
  }

  // Replace entire document
  const user = await User.findByIdAndUpdate(
    id,
    userData,
    { new: true, overwrite: true }  // overwrite: true = replace entire doc
  );

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// ✅ GOOD: PUT for complete replacement
PUT /api/users/123 (replace entire user)
PUT /api/settings (replace all settings)

// ❌ BAD: PUT for partial updates
PUT /api/users/123 { name: "Alice" }  // Wrong! Use PATCH instead
```

**PATCH - Partial Update:**

```javascript
// PATCH request - update only specific fields
// Idempotent: SHOULD BE (but depends on implementation)
// Safe: NO (modifies server state)

// Client side - only send fields to update
fetch('/api/users/123', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Alice Updated'  // Only updating name
  })
})
  .then(res => res.json());

// Express server
app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Prevent updating immutable fields
  delete updates.id;
  delete updates.createdAt;

  // Update only provided fields
  const user = await User.findByIdAndUpdate(
    id,
    { $set: updates },  // $set updates only specified fields
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// ✅ GOOD: PATCH for partial updates
PATCH /api/users/123 { name: "Alice" }
PATCH /api/posts/456 { published: true }

// ⚠️ WARNING: This PATCH is NOT idempotent
PATCH /api/users/123 { views: views + 1 }  // Increments on each call
// Better: Use POST for non-idempotent operations
POST /api/users/123/increment-views
```

**DELETE - Remove Resource:**

```javascript
// DELETE request - remove resource
// Idempotent: YES (deleting deleted resource still results in "not found")
// Safe: NO (modifies server state)

// Client side
fetch('/api/users/123', {
  method: 'DELETE'
})
  .then(res => {
    if (res.status === 204) {
      console.log('User deleted successfully');
    }
  });

// Express server
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    // Idempotent: return 404 or 204, both are acceptable
    return res.status(404).json({ error: 'User not found' });
  }

  // 204 No Content (successful deletion, no response body)
  res.status(204).send();

  // Alternative: 200 OK with deleted resource
  // res.status(200).json({ message: 'User deleted', user });
});

// ✅ GOOD: DELETE for removing resources
DELETE /api/users/123
DELETE /api/posts/456

// ✅ GOOD: Idempotent behavior
// First DELETE: 204 No Content (deleted)
// Second DELETE: 404 Not Found (already deleted)
// Both indicate resource doesn't exist → idempotent ✅

// ❌ BAD: Using query parameters
DELETE /api/users?id=123  // Avoid this, use path parameters
```

**OPTIONS - Describe Communication Options:**

```javascript
// OPTIONS request - discover allowed methods and CORS preflight
// Idempotent: YES
// Safe: YES

// Browser automatically sends OPTIONS for CORS preflight
// Preflight request before actual POST/PUT/DELETE

// Browser sends OPTIONS first:
OPTIONS /api/users/123
Origin: https://example.com
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: Content-Type, Authorization

// Express server - CORS configuration
app.options('/api/users/:id', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://example.com');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '86400');  // Cache preflight for 24h
  res.status(204).send();
});

// Or use cors middleware
const cors = require('cors');

app.use(cors({
  origin: 'https://example.com',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// Manual OPTIONS endpoint to describe API
app.options('/api/users/:id', (req, res) => {
  res.json({
    methods: ['GET', 'PUT', 'PATCH', 'DELETE'],
    description: 'User resource',
    fields: {
      name: 'string (required)',
      email: 'string (required)',
      role: 'string (optional)'
    }
  });
});
```

**HEAD - Same as GET but without body:**

```javascript
// HEAD request - like GET but only returns headers (no body)
// Used to check if resource exists or get metadata

// Client side
fetch('/api/users/123', {
  method: 'HEAD'
})
  .then(res => {
    console.log('Status:', res.status);
    console.log('Content-Length:', res.headers.get('Content-Length'));
    console.log('Last-Modified:', res.headers.get('Last-Modified'));
    // No body to read!
  });

// Express server
app.head('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).end();
  }

  // Set headers but no body
  res.status(200)
    .header('Content-Type', 'application/json')
    .header('Content-Length', JSON.stringify(user).length)
    .header('Last-Modified', user.updatedAt)
    .end();  // No send() or json()!
});

// ✅ GOOD: HEAD for checking existence without downloading
HEAD /api/files/large-video.mp4  // Check if exists without downloading 2GB
HEAD /api/users/123  // Check if user exists
```

**Complete RESTful API Example:**

```javascript
// Complete CRUD operations for a blog API

const express = require('express');
const app = express();
app.use(express.json());

// GET /api/posts - List all posts
app.get('/api/posts', async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const posts = await Post.find()
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Post.countDocuments();

  res.json({
    data: posts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// GET /api/posts/:id - Get single post
app.get('/api/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  res.json(post);
});

// POST /api/posts - Create new post
app.post('/api/posts', async (req, res) => {
  const { title, content, author } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content required' });
  }

  const post = await Post.create({ title, content, author });

  res.status(201)
    .location(`/api/posts/${post.id}`)
    .json(post);
});

// PUT /api/posts/:id - Replace entire post
app.put('/api/posts/:id', async (req, res) => {
  const { title, content, author } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content required' });
  }

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { title, content, author, updatedAt: Date.now() },
    { new: true, overwrite: true }
  );

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  res.json(post);
});

// PATCH /api/posts/:id - Partial update
app.patch('/api/posts/:id', async (req, res) => {
  const updates = req.body;
  delete updates.id;
  delete updates.createdAt;

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $set: { ...updates, updatedAt: Date.now() } },
    { new: true, runValidators: true }
  );

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  res.json(post);
});

// DELETE /api/posts/:id - Delete post
app.delete('/api/posts/:id', async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  res.status(204).send();
});

// OPTIONS /api/posts/:id - Describe methods
app.options('/api/posts/:id', (req, res) => {
  res.header('Allow', 'GET, PUT, PATCH, DELETE, OPTIONS');
  res.status(204).send();
});
```

<details>
<summary><strong>🔍 Deep Dive: HTTP Method Semantics and Idempotency</strong></summary>

**Understanding Idempotency in Depth:**

Idempotency is a critical concept in distributed systems and HTTP APIs. An operation is idempotent if calling it multiple times produces the same result as calling it once.

**Mathematical Definition:**

```
An HTTP method M is idempotent if for any resource R:

M(M(M(R))) = M(R)

In other words:
f(f(x)) = f(x)

Examples:
- DELETE(DELETE(user123)) = DELETE(user123)
  → Both result in user123 not existing ✅

- PUT(PUT(user123, data)) = PUT(user123, data)
  → Both result in user123 having same data ✅

- POST(POST(order)) ≠ POST(order)
  → First creates order #1, second creates order #2 ❌
```

**Why Idempotency Matters:**

```javascript
// Scenario: Network failure during request

// Client sends DELETE request
fetch('/api/users/123', { method: 'DELETE' });

// What happens:
// 1. Request reaches server ✅
// 2. Server deletes user ✅
// 3. Server sends 204 response ✅
// 4. Response lost in network ❌

// Client doesn't receive response!
// Client doesn't know if deletion succeeded.

// ✅ SAFE TO RETRY (idempotent):
// Client retries DELETE /api/users/123
// - If user was deleted: returns 404 (still correct state)
// - If user wasn't deleted: deletes and returns 204
// Either way, end result is same → idempotent!


// ❌ UNSAFE TO RETRY (non-idempotent):
fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify({ product: 'iPhone', quantity: 1 })
});

// Network failure after server processes request
// Client retries → CREATES DUPLICATE ORDER! ❌

// Solutions for POST:
// 1. Idempotency key
fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Idempotency-Key': 'unique-uuid-abc-123'
  },
  body: JSON.stringify({ product: 'iPhone', quantity: 1 })
});

// Server implementation:
app.post('/api/orders', async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];

  // Check if request with this key already processed
  const existing = await OrderRequest.findOne({ idempotencyKey });

  if (existing) {
    // Return cached response (idempotent!)
    return res.status(existing.status).json(existing.response);
  }

  // Process order
  const order = await Order.create(req.body);

  // Cache result for 24 hours
  await OrderRequest.create({
    idempotencyKey,
    status: 201,
    response: order,
    expiresAt: Date.now() + 86400000
  });

  res.status(201).json(order);
});
```

**HTTP Method Safety and Idempotency Table:**

```javascript
const httpMethodProperties = {
  GET: {
    safe: true,          // No side effects
    idempotent: true,    // Multiple calls = same result
    cacheable: true,     // Can be cached by browsers/proxies
    requestBody: false,  // Should not have request body
    responseBody: true,  // Should have response body
    successCodes: [200, 304],

    examples: {
      correct: [
        'GET /api/users',
        'GET /api/users/123',
        'GET /api/posts?page=2&limit=10'
      ],
      incorrect: [
        'GET /api/users/delete/123',  // ❌ Side effect (use DELETE)
        'GET /api/orders/create',      // ❌ Side effect (use POST)
        'GET /api/counter/increment'   // ❌ Side effect (use POST/PATCH)
      ]
    },

    // GET must be idempotent
    test: async () => {
      const res1 = await fetch('/api/users/123');
      const res2 = await fetch('/api/users/123');
      const res3 = await fetch('/api/users/123');

      // All responses should be identical
      assert.deepEqual(await res1.json(), await res2.json());
      assert.deepEqual(await res2.json(), await res3.json());
    }
  },

  POST: {
    safe: false,         // Has side effects
    idempotent: false,   // Multiple calls ≠ same result
    cacheable: 'rarely', // Only if response includes freshness info
    requestBody: true,   // Should have request body
    responseBody: true,  // Should have response body
    successCodes: [200, 201, 202, 204],

    examples: {
      correct: [
        'POST /api/users (create user)',
        'POST /api/orders (create order)',
        'POST /api/search (complex search)',
        'POST /api/payments (process payment)'
      ],
      incorrect: [
        'POST /api/users/update',  // ❌ Use PUT or PATCH
        'POST /api/users/delete'   // ❌ Use DELETE
      ]
    },

    // POST is NOT idempotent by default
    test: async () => {
      const data = { name: 'Alice', email: 'alice@example.com' };

      const res1 = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      const user1 = await res1.json();

      const res2 = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      const user2 = await res2.json();

      // Different IDs = not idempotent
      assert.notEqual(user1.id, user2.id);  // user1.id=1, user2.id=2
    }
  },

  PUT: {
    safe: false,         // Has side effects
    idempotent: true,    // Multiple calls = same result
    cacheable: false,
    requestBody: true,   // Should have request body (complete resource)
    responseBody: true,  // Should have response body
    successCodes: [200, 204],

    examples: {
      correct: [
        'PUT /api/users/123 (replace entire user)',
        'PUT /api/settings (replace all settings)'
      ],
      incorrect: [
        'PUT /api/users (missing ID)',  // ❌ PUT requires resource ID
        'PUT /api/users/123 { name }' // ❌ Partial update (use PATCH)
      ]
    },

    // PUT must be idempotent
    test: async () => {
      const data = { id: 123, name: 'Alice Updated', email: 'alice@example.com' };

      const res1 = await fetch('/api/users/123', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      const user1 = await res1.json();

      const res2 = await fetch('/api/users/123', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      const user2 = await res2.json();

      // Both should be identical
      assert.deepEqual(user1, user2);
    }
  },

  PATCH: {
    safe: false,           // Has side effects
    idempotent: 'should',  // SHOULD be but isn't always
    cacheable: false,
    requestBody: true,     // Should have request body (partial updates)
    responseBody: true,    // Should have response body
    successCodes: [200, 204],

    examples: {
      idempotentCorrect: [
        'PATCH /api/users/123 { name: "Alice" }',  // ✅ Idempotent
        'PATCH /api/posts/456 { published: true }'  // ✅ Idempotent
      ],
      notIdempotent: [
        'PATCH /api/users/123 { views: views + 1 }',  // ❌ Not idempotent!
        'PATCH /api/posts/456 { likes: likes + 1 }'   // ❌ Not idempotent!
      ]
    },

    // PATCH should be idempotent (but often isn't)
    test: async () => {
      // ✅ Idempotent PATCH
      const patch1 = { name: 'Alice' };

      await fetch('/api/users/123', {
        method: 'PATCH',
        body: JSON.stringify(patch1)
      });

      const res1 = await fetch('/api/users/123');
      const user1 = await res1.json();

      await fetch('/api/users/123', {
        method: 'PATCH',
        body: JSON.stringify(patch1)
      });

      const res2 = await fetch('/api/users/123');
      const user2 = await res2.json();

      // Both should have same name
      assert.equal(user1.name, user2.name);  // ✅ Idempotent


      // ❌ Non-idempotent PATCH (increment)
      await fetch('/api/users/123', {
        method: 'PATCH',
        body: JSON.stringify({ $inc: { views: 1 } })
      });
      // First call: views = 11

      await fetch('/api/users/123', {
        method: 'PATCH',
        body: JSON.stringify({ $inc: { views: 1 } })
      });
      // Second call: views = 12 (different!) ❌ Not idempotent
    }
  },

  DELETE: {
    safe: false,         // Has side effects
    idempotent: true,    // Multiple calls = same result
    cacheable: false,
    requestBody: false,  // Should not have request body
    responseBody: 'optional',
    successCodes: [200, 204, 404],

    examples: {
      correct: [
        'DELETE /api/users/123',
        'DELETE /api/posts/456'
      ],
      incorrect: [
        'DELETE /api/users?id=123',  // ❌ Use path param
        'DELETE /api/users'           // ❌ Dangerous (deletes all!)
      ]
    },

    // DELETE must be idempotent
    test: async () => {
      // First DELETE
      const res1 = await fetch('/api/users/123', { method: 'DELETE' });
      assert.equal(res1.status, 204);  // Deleted successfully

      // Second DELETE (already deleted)
      const res2 = await fetch('/api/users/123', { method: 'DELETE' });
      assert.equal(res2.status, 404);  // Not found

      // Third DELETE (still not found)
      const res3 = await fetch('/api/users/123', { method: 'DELETE' });
      assert.equal(res3.status, 404);  // Not found

      // End result: user123 doesn't exist (idempotent!) ✅
    }
  },

  OPTIONS: {
    safe: true,          // No side effects
    idempotent: true,    // Multiple calls = same result
    cacheable: false,
    requestBody: false,
    responseBody: true,  // Describes allowed methods
    successCodes: [200, 204],

    examples: {
      correct: [
        'OPTIONS /api/users/123 (CORS preflight)',
        'OPTIONS * (entire server capabilities)'
      ]
    },

    // Used for CORS preflight
    corsPreflight: {
      request: {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://example.com',
          'Access-Control-Request-Method': 'DELETE',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      },
      response: {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': 'https://example.com',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'  // Cache for 24h
        }
      }
    }
  }
};
```

**Proper HTTP Status Codes for Each Method:**

```javascript
// GET responses
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'Not Found' });
  }

  // Check if client has cached version
  const clientETag = req.headers['if-none-match'];
  const serverETag = `"${user.updatedAt.getTime()}"`;

  if (clientETag === serverETag) {
    return res.status(304).end();  // Not Modified
  }

  res.status(200)
    .header('ETag', serverETag)
    .header('Cache-Control', 'private, max-age=3600')
    .json(user);
});

// POST responses
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create(req.body);

    // 201 Created with Location header
    res.status(201)
      .location(`/api/users/${user.id}`)
      .json(user);

  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key
      return res.status(409).json({ error: 'Conflict - User already exists' });
    }

    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Bad Request', details: err.errors });
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT responses
app.put('/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, overwrite: true }
  );

  if (!user) {
    return res.status(404).json({ error: 'Not Found' });
  }

  res.status(200).json(user);  // 200 OK with updated resource
});

// PATCH responses
app.patch('/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ error: 'Not Found' });
  }

  res.status(200).json(user);  // 200 OK with updated resource
});

// DELETE responses
app.delete('/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'Not Found' });
  }

  res.status(204).send();  // 204 No Content (success, no body)
  // Alternative: res.status(200).json({ message: 'Deleted', user });
});
```

**Content Negotiation:**

```javascript
// Client specifies preferred response format

// Request with Accept header
fetch('/api/users/123', {
  headers: {
    'Accept': 'application/json'  // I prefer JSON
    // Other options: 'application/xml', 'text/html', 'text/plain'
  }
});

// Server responds based on Accept header
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'Not Found' });
  }

  const acceptHeader = req.headers.accept;

  if (acceptHeader.includes('application/json')) {
    return res.json(user);
  }

  if (acceptHeader.includes('application/xml')) {
    return res.type('application/xml').send(`
      <user>
        <id>${user.id}</id>
        <name>${user.name}</name>
        <email>${user.email}</email>
      </user>
    `);
  }

  if (acceptHeader.includes('text/html')) {
    return res.send(`
      <html>
        <body>
          <h1>${user.name}</h1>
          <p>Email: ${user.email}</p>
        </body>
      </html>
    `);
  }

  // No acceptable format
  res.status(406).json({ error: 'Not Acceptable - Supported formats: JSON, XML, HTML' });
});
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Debugging Non-Idempotent POST Causing Duplicate Orders</strong></summary>

**Scenario**: Your e-commerce checkout API is creating duplicate orders. Users report being charged twice, and customer support is handling 15-20 duplicate order complaints per day. Investigation reveals network timeouts during checkout are causing clients to retry POST requests, resulting in multiple orders for the same cart.

**Production Metrics (Before Fix):**
- Duplicate orders: 18/day average
- Refunds processed: $12,400/day
- Customer support tickets: 22/day
- Average resolution time: 45 minutes
- Customer satisfaction score: 68% (down from 89%)
- Cart abandonment rate: 34% (users afraid to retry)

**The Problem (Non-Idempotent POST):**

```javascript
// ❌ PROBLEMATIC: Non-idempotent order creation

// Client side (frontend)
async function submitOrder() {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 123,
        items: [
          { productId: 456, quantity: 1, price: 99.99 },
          { productId: 789, quantity: 2, price: 49.99 }
        ],
        total: 199.97,
        paymentMethod: 'credit_card_ending_1234'
      })
    });

    if (!response.ok) {
      throw new Error('Order failed');
    }

    const order = await response.json();
    showSuccessPage(order);

  } catch (error) {
    // ❌ CRITICAL BUG: Retrying POST creates duplicate!
    console.error('Order failed, retrying...', error);
    submitOrder();  // Recursive retry
  }
}

// What happens:
// 1. User clicks "Place Order"
// 2. POST request sent to server
// 3. Server creates order, charges card
// 4. Server sends response
// 5. Network timeout before response reaches client ❌
// 6. Client's catch block executes
// 7. Client retries POST
// 8. Server creates DUPLICATE order!
// 9. User charged twice 💸
```

**Server-Side Issue:**

```javascript
// ❌ PROBLEMATIC: No idempotency protection

app.post('/api/orders', async (req, res) => {
  const { userId, items, total, paymentMethod } = req.body;

  // Validate request
  if (!userId || !items || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Create order (NOT idempotent!)
  const order = await Order.create({
    userId,
    items,
    total,
    status: 'pending',
    createdAt: Date.now()
  });

  // Charge payment
  const payment = await stripe.charges.create({
    amount: total * 100,
    currency: 'usd',
    customer: paymentMethod,
    description: `Order ${order.id}`
  });

  // Update order status
  order.status = 'paid';
  order.paymentId = payment.id;
  await order.save();

  // Send response
  res.status(201).json(order);

  // Problem: If network fails after charging but before response,
  // client retries → creates NEW order → charges AGAIN! ❌
});
```

**Debugging Process:**

**Step 1: Identify Duplicate Orders in Database**

```javascript
// Query to find duplicate orders
const duplicates = await Order.aggregate([
  {
    $group: {
      _id: {
        userId: '$userId',
        total: '$total',
        // Group orders created within 5 seconds
        timeWindow: {
          $toDate: {
            $subtract: [
              { $toLong: '$createdAt' },
              { $mod: [{ $toLong: '$createdAt' }, 5000] }
            ]
          }
        }
      },
      count: { $sum: 1 },
      orders: { $push: '$$ROOT' }
    }
  },
  {
    $match: { count: { $gt: 1 } }  // More than 1 order in 5-second window
  },
  {
    $sort: { '_id.timeWindow': -1 }
  }
]);

console.log(`Found ${duplicates.length} sets of duplicate orders`);

// Output:
// {
//   _id: { userId: 123, total: 199.97, timeWindow: 2024-01-15T10:30:00Z },
//   count: 2,
//   orders: [
//     { id: 'order_abc', createdAt: 2024-01-15T10:30:02.134Z, ... },
//     { id: 'order_def', createdAt: 2024-01-15T10:30:03.891Z, ... }
//   ]
// }
// Found 18 sets of duplicate orders
```

**Step 2: Analyze Network Logs**

```javascript
// Express middleware to log request timing
app.use((req, res, next) => {
  const start = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.headers['user-agent']
    });
  });

  next();
});

// Logs revealed:
// POST /api/orders - 201 - 3,247ms (slow!)
// POST /api/orders - 201 - 2,891ms (duplicate, same user)
// POST /api/orders - 201 - 8,421ms (timeout territory)
// POST /api/orders - 201 - 7,654ms (duplicate, same user)

// Pattern: Requests >5 seconds often followed by duplicate within seconds
```

**Step 3: Implement Idempotency Keys**

```javascript
// ✅ FIXED: Idempotent order creation

// Client side - generate unique key per checkout session
import { v4 as uuidv4 } from 'uuid';

async function submitOrder() {
  // Generate idempotency key ONCE per checkout
  // Store in state/ref so retries use same key
  const idempotencyKey = useRef(uuidv4()).current;

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey  // ✅ Same key on retry
      },
      body: JSON.stringify({
        userId: 123,
        items: [...],
        total: 199.97,
        paymentMethod: 'credit_card_ending_1234'
      })
    });

    if (!response.ok) {
      throw new Error('Order failed');
    }

    const order = await response.json();
    showSuccessPage(order);

  } catch (error) {
    // Now safe to retry - uses same idempotency key!
    console.error('Order failed, retrying...', error);
    submitOrder();  // Uses same idempotencyKey
  }
}
```

**Server-Side Idempotency Implementation:**

```javascript
// ✅ FIXED: Idempotent POST with key-based deduplication

// MongoDB schema for idempotency tracking
const IdempotencyKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  requestHash: String,  // Hash of request body for validation
  status: { type: String, enum: ['processing', 'completed', 'failed'] },
  response: mongoose.Schema.Types.Mixed,
  statusCode: Number,
  createdAt: { type: Date, default: Date.now, expires: 86400 }  // Expire after 24h
});

const IdempotencyKey = mongoose.model('IdempotencyKey', IdempotencyKeySchema);

// Idempotency middleware
async function idempotencyMiddleware(req, res, next) {
  const idempotencyKey = req.headers['idempotency-key'];

  // Only apply to POST/PATCH methods
  if (!['POST', 'PATCH'].includes(req.method) || !idempotencyKey) {
    return next();
  }

  try {
    // Check if request with this key already exists
    const existing = await IdempotencyKey.findOne({ key: idempotencyKey });

    if (existing) {
      // Request hash validation (prevent key reuse with different payload)
      const currentHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (existing.requestHash !== currentHash) {
        return res.status(422).json({
          error: 'Idempotency key reused with different request body'
        });
      }

      // Check status
      if (existing.status === 'processing') {
        // Request still processing, ask client to retry later
        return res.status(409).json({
          error: 'Request is still being processed',
          retryAfter: 5
        });
      }

      if (existing.status === 'completed') {
        // Return cached response (idempotent!)
        console.log(`Returning cached response for key: ${idempotencyKey}`);
        return res.status(existing.statusCode).json(existing.response);
      }

      if (existing.status === 'failed') {
        // Previous attempt failed, delete and allow retry
        await IdempotencyKey.deleteOne({ key: idempotencyKey });
      }
    }

    // Create new idempotency record (status: processing)
    const requestHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(req.body))
      .digest('hex');

    await IdempotencyKey.create({
      key: idempotencyKey,
      requestHash,
      status: 'processing'
    });

    // Store original res.json to intercept response
    const originalJson = res.json.bind(res);

    res.json = async function(data) {
      // Update idempotency record with response
      await IdempotencyKey.findOneAndUpdate(
        { key: idempotencyKey },
        {
          status: 'completed',
          response: data,
          statusCode: res.statusCode
        }
      );

      return originalJson(data);
    };

    // Handle errors
    res.on('finish', async () => {
      if (res.statusCode >= 500) {
        await IdempotencyKey.findOneAndUpdate(
          { key: idempotencyKey },
          { status: 'failed' }
        );
      }
    });

    next();

  } catch (error) {
    console.error('Idempotency middleware error:', error);
    next(error);
  }
}

// Apply middleware
app.use(idempotencyMiddleware);

// Order creation endpoint (now idempotent!)
app.post('/api/orders', async (req, res) => {
  const { userId, items, total, paymentMethod } = req.body;

  // Validate request
  if (!userId || !items || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create order
    const order = await Order.create({
      userId,
      items,
      total,
      status: 'pending',
      createdAt: Date.now()
    });

    // Charge payment
    const payment = await stripe.charges.create({
      amount: total * 100,
      currency: 'usd',
      customer: paymentMethod,
      description: `Order ${order.id}`,
      idempotency_key: req.headers['idempotency-key']  // Stripe also supports idempotency keys!
    });

    // Update order status
    order.status = 'paid';
    order.paymentId = payment.id;
    await order.save();

    // Send response (will be cached by idempotency middleware)
    res.status(201).json(order);

  } catch (error) {
    console.error('Order creation error:', error);

    // Payment failed
    if (error.type === 'StripeCardError') {
      return res.status(402).json({ error: 'Payment failed', details: error.message });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Now if client retries:
// 1. First request: Creates order, charges card, saves response
// 2. Network timeout, client retries
// 3. Second request: Same idempotency key → returns cached response
// 4. No duplicate order! ✅
```

**Production Results (After Fix):**

```javascript
const before = {
  duplicateOrders: 18,          // per day
  refundsProcessed: 12400,      // USD per day
  supportTickets: 22,           // per day
  resolutionTime: 45,           // minutes
  customerSatisfaction: 68,     // percentage
  cartAbandonment: 34           // percentage
};

const after = {
  duplicateOrders: 0,           // per day (100% reduction!)
  refundsProcessed: 0,          // USD per day (100% reduction!)
  supportTickets: 2,            // per day (91% reduction, unrelated issues)
  resolutionTime: 15,           // minutes (67% improvement)
  customerSatisfaction: 94,     // percentage (+26 points!)
  cartAbandonment: 18           // percentage (47% reduction!)
};

// Financial impact:
const savings = {
  refundsSaved: 12400 * 30,           // $372,000/month
  supportCostSaved: 20 * 45 * 30,     // $27,000/month (20 tickets × 45 min × $40/hr)
  revenueRecovered: 199.97 * 16 * 30, // $95,984/month (reduced abandonment)
  totalMonthlySavings: 494984,        // $495K/month
  annualSavings: 5939808              // $5.9M/year!
};

// Implementation cost: $8,000 (1 week dev time)
// Payback period: 0.016 months (< 1 day!)
```

**Key Learnings:**

1. **Always use idempotency keys for non-idempotent operations** (POST)
2. **Store request hash** to prevent key reuse with different payloads
3. **Cache responses** for 24 hours (TTL in database)
4. **Handle "processing" state** (409 Conflict if same request in progress)
5. **Validate idempotency keys are UUIDs** (prevent collisions)
6. **Apply to payment providers too** (Stripe supports idempotency keys)

</details>

<details>
<summary><strong>⚖️ Trade-offs: PUT vs PATCH vs POST</strong></summary>

**When to Use Each Method:**

| Scenario | Recommended Method | Reason |
|----------|-------------------|--------|
| Create new user | POST /api/users | Creating new resource (non-idempotent) |
| Replace entire user | PUT /api/users/123 | Full replacement (idempotent) |
| Update user's name only | PATCH /api/users/123 | Partial update (should be idempotent) |
| Increment view count | POST /api/posts/123/views | Not idempotent (use POST not PATCH) |
| Upload profile picture | PUT /api/users/123/avatar | Replace entire avatar (idempotent) |
| Add item to cart | POST /api/cart/items | Creates new cart item |
| Update cart item quantity | PATCH /api/cart/items/456 | Partial update (idempotent) |
| Process payment | POST /api/payments | Non-idempotent (use idempotency keys) |

**Comparison Example:**

```javascript
// Initial state
const user = {
  id: 123,
  name: "Alice",
  email: "alice@example.com",
  role: "user",
  preferences: {
    theme: "dark",
    notifications: true
  }
};

// ✅ POST - Create new user
POST /api/users
Body: {
  name: "Bob",
  email: "bob@example.com"
}
Result: New user created with id: 124


// ✅ PUT - Replace entire user
PUT /api/users/123
Body: {
  id: 123,
  name: "Alice Updated",
  email: "alice.new@example.com",
  role: "admin",
  preferences: {
    theme: "light",
    notifications: false
  }
}
Result: User 123 completely replaced (all fields must be provided)


// ✅ PATCH - Update only name
PATCH /api/users/123
Body: {
  name: "Alice Modified"
}
Result: User 123 updated, other fields unchanged
{
  id: 123,
  name: "Alice Modified",  // ✅ Updated
  email: "alice@example.com",  // ✅ Unchanged
  role: "user",  // ✅ Unchanged
  preferences: { theme: "dark", notifications: true }  // ✅ Unchanged
}


// ⚠️ PUT vs PATCH difference
PUT /api/users/123
Body: {
  name: "Alice Updated"
}
Result: ❌ Validation error! PUT requires ALL fields

PATCH /api/users/123
Body: {
  name: "Alice Updated"
}
Result: ✅ Success! PATCH allows partial updates
```

</details>

<details>
<summary><strong>💬 Explain to Junior: HTTP Methods</strong></summary>

**Simple Explanation:**

Think of HTTP methods like different actions you can do with files on your computer:

- **GET** = Open and read a file (doesn't change anything)
- **POST** = Create a new file
- **PUT** = Replace a file completely (delete old one, save new one)
- **PATCH** = Edit part of a file (like changing one paragraph in a document)
- **DELETE** = Delete a file

**Analogy for a PM:**

"Imagine you're managing a filing cabinet:

- **GET**: Look at a document without taking it out
- **POST**: Add a brand new document to the cabinet
- **PUT**: Replace an entire document with a new version
- **PATCH**: Use correction tape to fix a small mistake on a document
- **DELETE**: Remove a document from the cabinet

The key rule: **Use GET when you're just looking, use the others when you're making changes**."

**Interview Answer Template:**

"HTTP methods define the type of action to perform on a resource. The most common are:

**GET** retrieves data without modifying it - it's safe and idempotent, meaning you can call it multiple times and get the same result.

**POST** creates new resources or submits data. It's not idempotent - calling it twice creates two resources.

**PUT** replaces an entire resource. It's idempotent - replacing something 10 times results in the same final state.

**PATCH** partially updates a resource. It should be idempotent, though some implementations aren't (like incrementing a counter).

**DELETE** removes a resource. It's idempotent - deleting a deleted resource still results in it being gone.

The key principle is **idempotency** - for distributed systems, being able to safely retry requests is critical. That's why GET, PUT, and DELETE should be idempotent, while POST typically isn't (though you can add idempotency keys to make it safe)."

</details>

### Resources

- [MDN: HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [RFC 7231: HTTP/1.1 Semantics](https://tools.ietf.org/html/rfc7231)
- [REST API Tutorial: HTTP Methods](https://restfulapi.net/http-methods/)

---
