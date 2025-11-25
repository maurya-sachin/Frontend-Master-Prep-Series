# HTTP Status Codes

> **Focus**: Understanding HTTP response status codes and their proper usage

---

## Question 1: What are HTTP status codes and when should you use each category?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** All companies (fundamental knowledge)

### Question
Explain the 5 categories of HTTP status codes (1xx, 2xx, 3xx, 4xx, 5xx) and provide examples of the most common codes in each category. When should each be used?

### Answer

HTTP status codes are three-digit numbers returned by servers to indicate the result of an HTTP request. They're grouped into five categories based on the first digit.

**Status Code Categories:**

1. **1xx (Informational)** - Request received, continuing process
2. **2xx (Success)** - Request successfully received, understood, and accepted
3. **2xx (Redirection)** - Further action needed to complete request
4. **4xx (Client Error)** - Request contains bad syntax or cannot be fulfilled
5. **5xx (Server Error)** - Server failed to fulfill valid request

**Most Common Status Codes:**

- **200 OK** - Request succeeded
- **201 Created** - Resource created successfully
- **204 No Content** - Success, no response body
- **301 Moved Permanently** - Resource permanently moved
- **302 Found** - Temporary redirect
- **304 Not Modified** - Cached version is still valid
- **400 Bad Request** - Malformed request
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Authenticated but not authorized
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Request conflicts with current state
- **422 Unprocessable Entity** - Validation failed
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Generic server error
- **502 Bad Gateway** - Invalid response from upstream server
- **503 Service Unavailable** - Server temporarily unavailable

### Code Example

**2xx Success Responses:**

```javascript
// 200 OK - Standard success response
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // ✅ 200 OK - Request succeeded
  res.status(200).json(user);
  // or simply: res.json(user) - defaults to 200
});

// 201 Created - Resource created successfully
app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body);

  // ✅ 201 Created with Location header
  res.status(201)
    .location(`/api/users/${user.id}`)
    .json(user);
});

// 204 No Content - Success without response body
app.delete('/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // ✅ 204 No Content - Deleted successfully, no body needed
  res.status(204).send();
});

// 202 Accepted - Request accepted but processing not complete
app.post('/api/reports/generate', async (req, res) => {
  const job = await Queue.add('generate-report', req.body);

  // ✅ 202 Accepted - Job queued, will process asynchronously
  res.status(202).json({
    message: 'Report generation started',
    jobId: job.id,
    statusUrl: `/api/jobs/${job.id}`
  });
});
```

**3xx Redirection Responses:**

```javascript
// 301 Moved Permanently - Resource permanently moved
app.get('/old-api/users/:id', (req, res) => {
  // ✅ 301 Permanent redirect - SEO-friendly
  res.status(301)
    .location(`/api/v2/users/${req.params.id}`)
    .send();
});

// 302 Found - Temporary redirect
app.get('/login', (req, res) => {
  if (req.user) {
    // ✅ 302 Temporary redirect - User already logged in
    return res.status(302).redirect('/dashboard');
  }

  res.render('login');
});

// 304 Not Modified - Cached version is still valid
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check ETag from client
  const clientETag = req.headers['if-none-match'];
  const serverETag = `"${user.updatedAt.getTime()}"`;

  if (clientETag === serverETag) {
    // ✅ 304 Not Modified - Client's cached version is current
    return res.status(304).end();
  }

  // Send full response with ETag
  res.status(200)
    .header('ETag', serverETag)
    .json(user);
});

// 307 Temporary Redirect (preserves method)
app.post('/api/orders', (req, res) => {
  if (maintenanceMode) {
    // ✅ 307 Temporary redirect - POST method preserved
    return res.status(307)
      .location('https://backup.example.com/api/orders')
      .send();
  }

  // Process order...
});

// 308 Permanent Redirect (preserves method)
app.post('/api/v1/users', (req, res) => {
  // ✅ 308 Permanent redirect - POST method preserved
  res.status(308)
    .location('/api/v2/users')
    .send();
});
```

**4xx Client Error Responses:**

```javascript
// 400 Bad Request - Malformed or invalid request
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;

  // ✅ 400 Bad Request - Missing required fields
  if (!name || !email) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Name and email are required',
      fields: {
        name: !name ? 'Required' : null,
        email: !email ? 'Required' : null
      }
    });
  }

  // Create user...
});

// 401 Unauthorized - Authentication required
app.get('/api/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    // ✅ 401 Unauthorized - No token provided
    return res.status(401)
      .header('WWW-Authenticate', 'Bearer realm="API"')
      .json({
        error: 'Unauthorized',
        message: 'Authentication token required'
      });
  }

  try {
    const user = jwt.verify(token, SECRET_KEY);
    res.json(user);
  } catch (err) {
    // ✅ 401 Unauthorized - Invalid token
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
});

// 403 Forbidden - Authenticated but not authorized
app.delete('/api/users/:id', async (req, res) => {
  const requestingUser = req.user;
  const targetUserId = req.params.id;

  // User is authenticated but not admin
  if (requestingUser.role !== 'admin' && requestingUser.id !== targetUserId) {
    // ✅ 403 Forbidden - Insufficient permissions
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to delete this user'
    });
  }

  // Delete user...
});

// 404 Not Found - Resource doesn't exist
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    // ✅ 404 Not Found - User doesn't exist
    return res.status(404).json({
      error: 'Not Found',
      message: `User with ID ${req.params.id} not found`
    });
  }

  res.json(user);
});

// 409 Conflict - Request conflicts with current state
app.post('/api/users', async (req, res) => {
  const { email } = req.body;

  const existing = await User.findOne({ email });

  if (existing) {
    // ✅ 409 Conflict - User with email already exists
    return res.status(409).json({
      error: 'Conflict',
      message: 'User with this email already exists',
      field: 'email'
    });
  }

  // Create user...
});

// 422 Unprocessable Entity - Validation failed
app.post('/api/users', async (req, res) => {
  const { name, email, age } = req.body;

  const errors = {};

  // Validate email format
  if (email && !email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
    errors.email = 'Invalid email format';
  }

  // Validate age range
  if (age && (age < 18 || age > 120)) {
    errors.age = 'Age must be between 18 and 120';
  }

  if (Object.keys(errors).length > 0) {
    // ✅ 422 Unprocessable Entity - Validation errors
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'Validation failed',
      errors
    });
  }

  // Create user...
});

// 429 Too Many Requests - Rate limit exceeded
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // Max 100 requests per window
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false,
  handler: (req, res) => {
    // ✅ 429 Too Many Requests - Rate limit exceeded
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Try again in 15 minutes.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

app.use('/api/', limiter);
```

**5xx Server Error Responses:**

```javascript
// 500 Internal Server Error - Generic server error
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);

  } catch (error) {
    console.error('Database error:', error);

    // ✅ 500 Internal Server Error - Unexpected error
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      // ❌ Don't expose internal details in production!
      // details: error.message
    });
  }
});

// 502 Bad Gateway - Invalid response from upstream
app.get('/api/external-data', async (req, res) => {
  try {
    const response = await fetch('https://external-api.com/data');

    if (!response.ok) {
      // ✅ 502 Bad Gateway - External API returned error
      return res.status(502).json({
        error: 'Bad Gateway',
        message: 'External service returned an error'
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    // ✅ 502 Bad Gateway - External API unreachable
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Unable to reach external service'
    });
  }
});

// 503 Service Unavailable - Temporary unavailability
app.use((req, res, next) => {
  if (maintenanceMode) {
    // ✅ 503 Service Unavailable - Maintenance mode
    return res.status(503)
      .header('Retry-After', '3600')  // Retry in 1 hour
      .json({
        error: 'Service Unavailable',
        message: 'System maintenance in progress',
        retryAfter: new Date(Date.now() + 3600000).toISOString()
      });
  }

  next();
});

// 504 Gateway Timeout - Upstream timeout
app.get('/api/slow-operation', async (req, res) => {
  const timeout = 5000;  // 5 second timeout

  try {
    const result = await Promise.race([
      performSlowOperation(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);

    res.json(result);

  } catch (error) {
    if (error.message === 'Timeout') {
      // ✅ 504 Gateway Timeout - Operation took too long
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Request took too long to process'
      });
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

**Complete Error Handling Strategy:**

```javascript
// Centralized error handler
class APIError extends Error {
  constructor(statusCode, message, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Custom error classes
class NotFoundError extends APIError {
  constructor(resource) {
    super(404, `${resource} not found`);
  }
}

class ValidationError extends APIError {
  constructor(errors) {
    super(422, 'Validation failed', { errors });
  }
}

class UnauthorizedError extends APIError {
  constructor(message = 'Authentication required') {
    super(401, message);
  }
}

class ForbiddenError extends APIError {
  constructor(message = 'Insufficient permissions') {
    super(403, message);
  }
}

// Usage in route handlers
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json(user);

  } catch (error) {
    next(error);  // Pass to error handler
  }
});

app.post('/api/users', async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Validation
    const errors = {};
    if (!name) errors.name = 'Required';
    if (!email) errors.email = 'Required';

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      throw new APIError(409, 'User already exists', { field: 'email' });
    }

    const user = await User.create({ name, email });
    res.status(201).json(user);

  } catch (error) {
    next(error);
  }
});

// Global error handler middleware
app.use((err, req, res, next) => {
  // Log error
  console.error('Error:', err);

  // Handle APIError instances
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details })
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      error: 'Validation failed',
      details: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication token'
    });
  }

  // Default to 500 Internal Server Error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred'
  });
});
```

**Status Code Selection Flow:**

```javascript
function selectStatusCode(scenario) {
  // Success scenarios
  if (scenario === 'GET_SUCCESS') return 200;  // OK
  if (scenario === 'POST_SUCCESS') return 201;  // Created
  if (scenario === 'DELETE_SUCCESS') return 204;  // No Content
  if (scenario === 'ASYNC_ACCEPTED') return 202;  // Accepted

  // Redirection scenarios
  if (scenario === 'PERMANENT_REDIRECT') return 301;  // Moved Permanently
  if (scenario === 'TEMPORARY_REDIRECT') return 302;  // Found
  if (scenario === 'NOT_MODIFIED') return 304;  // Not Modified

  // Client errors
  if (scenario === 'MALFORMED_REQUEST') return 400;  // Bad Request
  if (scenario === 'NO_AUTH_TOKEN') return 401;  // Unauthorized
  if (scenario === 'INVALID_TOKEN') return 401;  // Unauthorized
  if (scenario === 'INSUFFICIENT_PERMISSIONS') return 403;  // Forbidden
  if (scenario === 'RESOURCE_NOT_FOUND') return 404;  // Not Found
  if (scenario === 'METHOD_NOT_ALLOWED') return 405;  // Method Not Allowed
  if (scenario === 'DUPLICATE_RESOURCE') return 409;  // Conflict
  if (scenario === 'VALIDATION_FAILED') return 422;  // Unprocessable Entity
  if (scenario === 'RATE_LIMIT') return 429;  // Too Many Requests

  // Server errors
  if (scenario === 'UNEXPECTED_ERROR') return 500;  // Internal Server Error
  if (scenario === 'EXTERNAL_API_ERROR') return 502;  // Bad Gateway
  if (scenario === 'MAINTENANCE_MODE') return 503;  // Service Unavailable
  if (scenario === 'TIMEOUT') return 504;  // Gateway Timeout

  return 500;  // Default fallback
}
```

<details>
<summary><strong>🔍 Deep Dive: HTTP Status Code Semantics and Best Practices</strong></summary>

**Comprehensive Status Code Reference:**

**1xx Informational (Rarely Used in REST APIs):**

```javascript
// 100 Continue - Client should continue with request
// Used for large uploads to check if server will accept request

// Client sends headers first:
POST /api/upload HTTP/1.1
Host: example.com
Content-Length: 1073741824  // 1GB file
Expect: 100-continue

// Server responds:
HTTP/1.1 100 Continue

// Client then sends body


// 101 Switching Protocols - Upgrading to WebSocket
// Browser initiates WebSocket handshake:
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade

// Server responds:
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade

// Connection now uses WebSocket protocol


// 103 Early Hints - Preload resources while server prepares response
// Server sends early hints:
HTTP/1.1 103 Early Hints
Link: </style.css>; rel=preload; as=style
Link: </script.js>; rel=preload; as=script

// Browser starts downloading while server prepares full response
// Later, server sends:
HTTP/1.1 200 OK
Content-Type: text/html
<html>...</html>
```

**2xx Success - Detailed Usage:**

```javascript
// 200 OK - Standard success
// Use when: Request succeeded and response has body

app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);  // 200 OK
});


// 201 Created - Resource created
// Use when: POST created new resource
// MUST include Location header

app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body);

  res.status(201)
    .location(`/api/users/${user.id}`)  // ✅ Location header
    .json(user);
});


// 202 Accepted - Async processing
// Use when: Request accepted but processing not complete
// Include link to check status

app.post('/api/reports', async (req, res) => {
  const job = await Queue.add('generate-report', req.body);

  res.status(202).json({
    jobId: job.id,
    status: 'pending',
    statusUrl: `/api/jobs/${job.id}`,  // ✅ Status check URL
    estimatedCompletion: new Date(Date.now() + 300000)  // 5 min
  });
});

app.get('/api/jobs/:id', async (req, res) => {
  const job = await Queue.getJob(req.params.id);

  if (job.status === 'completed') {
    return res.status(200).json({
      status: 'completed',
      result: job.result
    });
  }

  if (job.status === 'failed') {
    return res.status(200).json({
      status: 'failed',
      error: job.error
    });
  }

  res.status(200).json({
    status: 'pending',
    progress: job.progress
  });
});


// 204 No Content - Success without body
// Use when: Success but no data to return (DELETE, PATCH with no response)

app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();  // ✅ No body
});

app.patch('/api/users/:id/archive', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { archived: true });
  res.status(204).send();  // ✅ No body needed
});


// 206 Partial Content - Range request
// Use when: Client requests part of resource (video streaming, large files)

app.get('/api/files/:id', async (req, res) => {
  const file = await File.findById(req.params.id);
  const fileSize = file.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = (end - start) + 1;

    res.status(206)  // ✅ Partial Content
      .header('Content-Range', `bytes ${start}-${end}/${fileSize}`)
      .header('Accept-Ranges', 'bytes')
      .header('Content-Length', chunkSize)
      .header('Content-Type', file.mimeType);

    const stream = fs.createReadStream(file.path, { start, end });
    stream.pipe(res);

  } else {
    res.status(200)
      .header('Content-Length', fileSize)
      .header('Content-Type', file.mimeType);

    const stream = fs.createReadStream(file.path);
    stream.pipe(res);
  }
});
```

**3xx Redirection - Proper Usage:**

```javascript
// 301 vs 302 vs 307 vs 308

// 301 Moved Permanently
// - Permanent redirect
// - Search engines update their index
// - May change method to GET (POST → GET)

app.get('/old-url', (req, res) => {
  res.status(301).location('/new-url').send();
  // Browser caches this redirect!
});


// 302 Found (Temporary Redirect)
// - Temporary redirect
// - Search engines don't update index
// - May change method to GET (POST → GET)

app.post('/submit-form', (req, res) => {
  // Process form...
  res.status(302).redirect('/success');
  // POST → GET redirect (PRG pattern: Post-Redirect-Get)
});


// 307 Temporary Redirect
// - Temporary redirect
// - Preserves HTTP method (POST stays POST)

app.post('/api/orders', (req, res) => {
  if (maintenanceMode) {
    res.status(307).location('https://backup.example.com/api/orders').send();
    // POST method preserved!
  }
});


// 308 Permanent Redirect
// - Permanent redirect
// - Preserves HTTP method (POST stays POST)

app.post('/api/v1/users', (req, res) => {
  res.status(308).location('/api/v2/users').send();
  // POST method preserved, permanent redirect
});


// 304 Not Modified - Conditional requests
// - Client's cached version is still valid
// - Reduces bandwidth usage

app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  // ETag-based caching
  const clientETag = req.headers['if-none-match'];
  const serverETag = `"${user.updatedAt.getTime()}"`;

  if (clientETag === serverETag) {
    return res.status(304).end();  // ✅ Not Modified
  }

  // Last-Modified-based caching
  const clientLastModified = req.headers['if-modified-since'];
  const serverLastModified = user.updatedAt.toUTCString();

  if (clientLastModified && new Date(clientLastModified) >= user.updatedAt) {
    return res.status(304).end();  // ✅ Not Modified
  }

  res.status(200)
    .header('ETag', serverETag)
    .header('Last-Modified', serverLastModified)
    .header('Cache-Control', 'private, max-age=3600')
    .json(user);
});
```

**4xx Client Errors - Detailed Distinction:**

```javascript
// 400 vs 422 - When to use which?

// 400 Bad Request - Syntax error in request
// - Malformed JSON
// - Invalid headers
// - Missing required headers

app.post('/api/users', (req, res) => {
  // Malformed JSON
  if (req.body === undefined) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON syntax'
    });
  }

  // Missing Content-Type header
  if (!req.headers['content-type']?.includes('application/json')) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Content-Type must be application/json'
    });
  }
});


// 422 Unprocessable Entity - Semantic error
// - Valid syntax but fails business logic validation
// - Invalid email format
// - Age out of range
// - Invalid enum value

app.post('/api/users', (req, res) => {
  const { name, email, age } = req.body;

  const errors = {};

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.email = 'Invalid email format';
  }

  if (age < 18 || age > 120) {
    errors.age = 'Age must be between 18 and 120';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'Validation failed',
      errors
    });
  }
});


// 401 vs 403 - Critical distinction

// 401 Unauthorized - No authentication or invalid credentials
// MUST include WWW-Authenticate header

app.get('/api/profile', (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401)
      .header('WWW-Authenticate', 'Bearer realm="API"')
      .json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
  }

  const token = req.headers.authorization.split(' ')[1];

  try {
    const user = jwt.verify(token, SECRET_KEY);
    res.json(user);
  } catch (err) {
    return res.status(401)
      .header('WWW-Authenticate', 'Bearer error="invalid_token"')
      .json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
  }
});


// 403 Forbidden - Authenticated but not authorized
// User is logged in but doesn't have permission

app.delete('/api/admin/users/:id', (req, res) => {
  const user = req.user;  // Authenticated user from middleware

  if (user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin role required for this operation'
    });
  }

  // Delete user...
});


// 404 vs 410 - Resource not found vs gone

// 404 Not Found - Resource doesn't exist (may never have existed)
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'User not found'
    });
  }

  res.json(user);
});


// 410 Gone - Resource existed but has been permanently removed
app.get('/api/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post && post.deleted) {
    return res.status(410).json({
      error: 'Gone',
      message: 'This post has been permanently deleted'
    });
  }

  if (!post) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Post not found'
    });
  }

  res.json(post);
});


// 409 Conflict - Request conflicts with current state
// - Duplicate resource
// - Version conflict (optimistic locking)
// - State conflict

app.post('/api/users', async (req, res) => {
  const existing = await User.findOne({ email: req.body.email });

  if (existing) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'User with this email already exists',
      existingResourceUrl: `/api/users/${existing.id}`
    });
  }
});

app.put('/api/documents/:id', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  const clientVersion = req.headers['if-match'];

  if (clientVersion && clientVersion !== `"${doc.version}"`) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Document has been modified by another user',
      currentVersion: doc.version,
      clientVersion: clientVersion
    });
  }

  // Update document...
});


// 429 Too Many Requests - Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    res.status(429)
      .header('Retry-After', '900')  // 15 minutes
      .json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        limit: 100,
        window: '15 minutes',
        retryAfter: new Date(Date.now() + 900000)
      });
  }
}));
```

**5xx Server Errors - Proper Handling:**

```javascript
// 500 vs 502 vs 503 vs 504

// 500 Internal Server Error - Your server's fault
// - Database error
// - Unhandled exception
// - Code bug

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Database error:', error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      // Don't expose internals in production!
      requestId: req.id  // Include for debugging
    });
  }
});


// 502 Bad Gateway - Upstream server's fault
// - External API returned error
// - Proxy received invalid response

app.get('/api/weather', async (req, res) => {
  try {
    const response = await fetch('https://weather-api.com/data');

    if (!response.ok) {
      return res.status(502).json({
        error: 'Bad Gateway',
        message: 'Weather service returned an error'
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Unable to reach weather service'
    });
  }
});


// 503 Service Unavailable - Temporary issue
// - Maintenance mode
// - Database connection pool exhausted
// - Server overloaded

app.use((req, res, next) => {
  if (maintenanceMode) {
    return res.status(503)
      .header('Retry-After', '3600')  // 1 hour
      .json({
        error: 'Service Unavailable',
        message: 'System maintenance in progress',
        estimatedCompletion: maintenanceEndTime
      });
  }

  next();
});


// 504 Gateway Timeout - Upstream timeout
// - External API took too long
// - Database query timeout

app.get('/api/analytics', async (req, res) => {
  try {
    const result = await Promise.race([
      Analytics.generateReport(req.query),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 30000)
      )
    ]);

    res.json(result);

  } catch (error) {
    if (error.message === 'Timeout') {
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Report generation took too long'
      });
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

**Status Code Selection Decision Tree:**

```
Request successful?
├─ YES
│  ├─ Created new resource? → 201 Created
│  ├─ Async processing? → 202 Accepted
│  ├─ No content to return? → 204 No Content
│  ├─ Cached version valid? → 304 Not Modified
│  └─ Standard success → 200 OK
│
└─ NO
   ├─ Client's fault?
   │  ├─ YES (4xx)
   │  │  ├─ Malformed request? → 400 Bad Request
   │  │  ├─ Not authenticated? → 401 Unauthorized
   │  │  ├─ Not authorized? → 403 Forbidden
   │  │  ├─ Resource not found? → 404 Not Found
   │  │  ├─ Wrong HTTP method? → 405 Method Not Allowed
   │  │  ├─ Duplicate resource? → 409 Conflict
   │  │  ├─ Validation failed? → 422 Unprocessable Entity
   │  │  └─ Rate limited? → 429 Too Many Requests
   │  │
   │  └─ NO (5xx)
   │     ├─ Server error? → 500 Internal Server Error
   │     ├─ Upstream error? → 502 Bad Gateway
   │     ├─ Temporarily down? → 503 Service Unavailable
   │     └─ Upstream timeout? → 504 Gateway Timeout
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Debugging Incorrect Status Code Usage</strong></summary>

**Scenario**: Your REST API is returning incorrect status codes, causing client applications to malfunction. Mobile apps are incorrectly caching error responses (because 200 is returned for errors), retry logic isn't working (because 500 is used for client errors), and monitoring dashboards show misleading error rates.

**Production Metrics (Before Fix):**
- False positive error alerts: 120/day (monitoring thinks everything is 200 OK)
- Failed client retries: 45/day (clients retry 5xx when they shouldn't)
- Incorrect cached errors: 30/day (clients cache error responses thinking they're success)
- Support tickets: 18/day (confused about error messages)
- Developer productivity: -30% (time wasted debugging status code issues)

**The Problem (Incorrect Status Codes):**

```javascript
// ❌ CRITICAL BUGS: Wrong status codes throughout API

// BUG 1: Returning 200 for errors
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    // ❌ WRONG: Returning 200 with error message
    return res.status(200).json({
      success: false,
      error: 'User not found'
    });
  }

  res.status(200).json({ success: true, user });
});

// Impact:
// - Clients think request succeeded
// - Error responses get cached
// - Monitoring shows 100% success rate (false metric!)


// BUG 2: Returning 500 for validation errors
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    // ❌ WRONG: 500 for client error
    return res.status(500).json({
      error: 'Name and email are required'
    });
  }

  const user = await User.create({ name, email });
  res.status(200).json(user);
});

// Impact:
// - Clients retry (thinking server failed)
// - Monitoring shows server errors (false alarm!)
// - Wastes server resources on unnecessary retries


// BUG 3: Returning 200 for authentication failures
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !user.comparePassword(password)) {
    // ❌ WRONG: 200 for authentication failure
    return res.status(200).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  const token = jwt.sign({ userId: user.id }, SECRET_KEY);
  res.status(200).json({ success: true, token });
});

// Impact:
// - Clients can't distinguish success from failure
// - Security monitoring doesn't catch brute force attacks
// - No rate limiting triggers (looks like successful requests)


// BUG 4: Wrong status for created resources
app.post('/api/posts', async (req, res) => {
  const post = await Post.create(req.body);

  // ❌ WRONG: 200 instead of 201
  res.status(200).json(post);
});

// Impact:
// - Semantic incorrectness (not following REST conventions)
// - Clients can't tell if resource was created or already existed


// BUG 5: No status code for deletions
app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);

  // ❌ WRONG: 200 with empty body
  res.status(200).json({});
  // Should be 204 No Content
});
```

**Debugging Process:**

**Step 1: Analyze Client Error Logs**

```javascript
// Client-side log analysis revealed confusion

// Mobile app log:
// "Received 200 OK but response contains error field"
// "Caching error response for 1 hour (Cache-Control header present)"
// "Retry attempt 1/5 for status 500 (validation error)"

// The problem:
fetch('/api/users/999')
  .then(res => {
    console.log('Status:', res.status);  // 200
    return res.json();
  })
  .then(data => {
    console.log('Data:', data);  // { success: false, error: "User not found" }

    // ❌ Client assumes success because status is 200
    if (data.user) {
      displayUser(data.user);
    } else {
      // Never reaches here because client expects .user field for 200 OK
      displayError(data.error);
    }
  });
```

**Step 2: Audit All API Endpoints**

```javascript
// Script to analyze status code usage

const axios = require('axios');

const testCases = [
  { url: '/api/users/999', expected: 404, description: 'User not found' },
  { url: '/api/users', method: 'POST', body: {}, expected: 400, description: 'Missing fields' },
  { url: '/api/users', method: 'POST', body: { name: 'Test', email: 'invalid' }, expected: 422, description: 'Invalid email' },
  { url: '/api/protected', expected: 401, description: 'No auth token' },
  { url: '/api/admin/users', expected: 403, description: 'Not admin' }
];

const results = [];

for (const test of testCases) {
  try {
    const response = await axios({
      method: test.method || 'GET',
      url: `http://localhost:3000${test.url}`,
      data: test.body,
      validateStatus: () => true  // Don't throw on any status
    });

    const passed = response.status === test.expected;

    results.push({
      test: test.description,
      expected: test.expected,
      actual: response.status,
      passed,
      response: response.data
    });

  } catch (error) {
    results.push({
      test: test.description,
      error: error.message
    });
  }
}

console.table(results);

// Output revealed:
// ┌────────────────────────┬──────────┬────────┬────────┐
// │      Description       │ Expected │ Actual │ Passed │
// ├────────────────────────┼──────────┼────────┼────────┤
// │ User not found         │   404    │  200   │  ❌    │
// │ Missing fields         │   400    │  500   │  ❌    │
// │ Invalid email          │   422    │  500   │  ❌    │
// │ No auth token          │   401    │  200   │  ❌    │
// │ Not admin              │   403    │  200   │  ❌    │
// └────────────────────────┴──────────┴────────┴────────┘
// 0% pass rate! 🚨
```

**Step 3: Fix Status Codes Systematically**

```javascript
// ✅ FIXED: Correct status codes throughout API

// Create standardized error responses
class APIResponse {
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json(data);
  }

  static created(res, data, location) {
    return res.status(201)
      .location(location)
      .json(data);
  }

  static noContent(res) {
    return res.status(204).send();
  }

  static badRequest(res, message, details = {}) {
    return res.status(400).json({
      error: 'Bad Request',
      message,
      ...details
    });
  }

  static unauthorized(res, message = 'Authentication required') {
    return res.status(401)
      .header('WWW-Authenticate', 'Bearer')
      .json({
        error: 'Unauthorized',
        message
      });
  }

  static forbidden(res, message = 'Insufficient permissions') {
    return res.status(403).json({
      error: 'Forbidden',
      message
    });
  }

  static notFound(res, resource = 'Resource') {
    return res.status(404).json({
      error: 'Not Found',
      message: `${resource} not found`
    });
  }

  static conflict(res, message, details = {}) {
    return res.status(409).json({
      error: 'Conflict',
      message,
      ...details
    });
  }

  static unprocessableEntity(res, errors) {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'Validation failed',
      errors
    });
  }

  static tooManyRequests(res, retryAfter) {
    return res.status(429)
      .header('Retry-After', retryAfter)
      .json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter
      });
  }

  static internalServerError(res, requestId) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      requestId
    });
  }

  static badGateway(res, message = 'External service error') {
    return res.status(502).json({
      error: 'Bad Gateway',
      message
    });
  }

  static serviceUnavailable(res, retryAfter) {
    return res.status(503)
      .header('Retry-After', retryAfter)
      .json({
        error: 'Service Unavailable',
        message: 'Service temporarily unavailable',
        retryAfter
      });
  }
}

// Fixed endpoints:

// ✅ FIX 1: 404 for not found
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return APIResponse.notFound(res, 'User');  // ✅ 404
  }

  return APIResponse.success(res, user);  // ✅ 200
});


// ✅ FIX 2: 400 for missing fields, 422 for validation
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;

  // Missing required fields → 400 Bad Request
  if (!name || !email) {
    return APIResponse.badRequest(res, 'Name and email are required', {
      fields: {
        name: !name ? 'Required' : null,
        email: !email ? 'Required' : null
      }
    });
  }

  // Invalid email format → 422 Unprocessable Entity
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return APIResponse.unprocessableEntity(res, {
      email: 'Invalid email format'
    });
  }

  // Duplicate email → 409 Conflict
  const existing = await User.findOne({ email });
  if (existing) {
    return APIResponse.conflict(res, 'User already exists', {
      field: 'email',
      existingResourceUrl: `/api/users/${existing.id}`
    });
  }

  const user = await User.create({ name, email });
  return APIResponse.created(res, user, `/api/users/${user.id}`);  // ✅ 201
});


// ✅ FIX 3: 401 for authentication failures
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !user.comparePassword(password)) {
    return APIResponse.unauthorized(res, 'Invalid credentials');  // ✅ 401
  }

  const token = jwt.sign({ userId: user.id }, SECRET_KEY);
  return APIResponse.success(res, { token });  // ✅ 200
});


// ✅ FIX 4: 204 for successful deletions
app.delete('/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return APIResponse.notFound(res, 'User');  // ✅ 404
  }

  return APIResponse.noContent(res);  // ✅ 204
});


// ✅ FIX 5: 403 for authorization failures
app.delete('/api/admin/users/:id', (req, res) => {
  if (req.user.role !== 'admin') {
    return APIResponse.forbidden(res, 'Admin role required');  // ✅ 403
  }

  // Delete user...
});
```

**Step 4: Update Client-Side Error Handling**

```javascript
// ✅ Updated client to handle status codes correctly

async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);

    // Success (2xx)
    if (response.ok) {
      // 204 No Content
      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json();
      return { success: true, data, status: response.status };
    }

    // Client errors (4xx)
    if (response.status >= 400 && response.status < 500) {
      const error = await response.json();

      // Don't retry client errors
      return {
        success: false,
        error: error.message || error.error,
        status: response.status,
        retryable: false
      };
    }

    // Server errors (5xx)
    if (response.status >= 500) {
      const error = await response.json().catch(() => ({}));

      // Retry server errors
      return {
        success: false,
        error: error.message || 'Server error',
        status: response.status,
        retryable: true
      };
    }

  } catch (error) {
    // Network error - retryable
    return {
      success: false,
      error: 'Network error',
      retryable: true
    };
  }
}

// Usage:
const result = await apiRequest('/api/users/999');

if (result.success) {
  displayUser(result.data);
} else {
  displayError(result.error);

  if (result.retryable) {
    // Retry logic for 5xx errors
    await retryRequest('/api/users/999');
  }
}
```

**Production Results (After Fix):**

```javascript
const before = {
  falsePositiveAlerts: 120,     // per day
  failedRetries: 45,            // per day
  incorrectCachedErrors: 30,    // per day
  supportTickets: 18,           // per day
  developerProductivity: 70,    // percentage
  monitoringAccuracy: 40        // percentage
};

const after = {
  falsePositiveAlerts: 2,       // per day (99% reduction!)
  failedRetries: 0,             // per day (100% reduction!)
  incorrectCachedErrors: 0,     // per day (100% reduction!)
  supportTickets: 3,            // per day (83% reduction!)
  developerProductivity: 95,    // percentage (+25 points!)
  monitoringAccuracy: 98        // percentage (+58 points!)
};

// Impact:
const improvements = {
  correctErrorHandling: '100%',
  monitoringReliability: '+145%',
  developerTimeRecovered: '6 hours/day',
  clientExperienceImprovement: '+85%',
  falseAlertReduction: '98%'
};

// Cost: 2 days to fix + document
// Benefit: Ongoing reliability and developer productivity
```

**Key Learnings:**

1. **Use correct status codes** - Semantic meaning matters
2. **4xx for client errors** - Don't use 500 for validation
3. **5xx for server errors** - Only for actual server failures
4. **201 for resource creation** - Not 200
5. **204 for no content** - Empty success responses
6. **401 vs 403** - Authentication vs authorization
7. **422 vs 400** - Validation vs malformed request
8. **Test status codes** - Automated testing prevents regressions

</details>

<details>
<summary><strong>⚖️ Trade-offs: Status Code Selection</strong></summary>

**Decision Matrix:**

| Situation | Status Code | Reasoning |
|-----------|-------------|-----------|
| GET request successful | 200 OK | Standard success |
| POST created resource | 201 Created | Semantic correctness, includes Location |
| DELETE successful | 204 No Content | No body needed |
| Async processing | 202 Accepted | Processing not complete |
| Resource not found | 404 Not Found | Standard not found |
| Missing auth token | 401 Unauthorized | Need authentication |
| Invalid token | 401 Unauthorized | Authentication failed |
| Valid token, wrong role | 403 Forbidden | Authorized but not permitted |
| Missing required field | 400 Bad Request | Malformed request |
| Invalid email format | 422 Unprocessable Entity | Validation failed |
| Duplicate resource | 409 Conflict | Resource already exists |
| Rate limit exceeded | 429 Too Many Requests | Client exceeded quota |
| Database error | 500 Internal Server Error | Server-side failure |
| External API failed | 502 Bad Gateway | Upstream error |
| Maintenance mode | 503 Service Unavailable | Temporary unavailability |

</details>

<details>
<summary><strong>💬 Explain to Junior: HTTP Status Codes</strong></summary>

**Simple Explanation:**

HTTP status codes are like package delivery notifications:

- **2xx (Success)**: "Package delivered successfully!"
  - 200: Standard delivery
  - 201: New package created and delivered
  - 204: Delivered, no signature needed

- **3xx (Redirection)**: "Package forwarded to new address"
  - 301: Permanent new address (update your records)
  - 302: Temporary new address (don't update records)

- **4xx (Client Error)**: "You made a mistake"
  - 400: Wrong address format
  - 401: Need to show ID
  - 403: ID shown but not authorized to receive
  - 404: Address doesn't exist
  - 429: Too many packages at once

- **5xx (Server Error)**: "We made a mistake"
  - 500: Delivery truck broke down
  - 502: Transfer station failed
  - 503: Delivery center closed temporarily

**Analogy for a PM:**

"Status codes are like restaurant order responses:

- **200 OK**: 'Here's your food!'
- **201 Created**: 'Order placed, here's your number'
- **400 Bad Request**: 'I don't understand your order'
- **401 Unauthorized**: 'Please log in to order'
- **403 Forbidden**: 'You're logged in but this dish is members-only'
- **404 Not Found**: 'We don't serve that here'
- **500 Server Error**: 'Our kitchen is broken'
- **503 Service Unavailable**: 'We're temporarily closed'"

**Interview Answer Template:**

"HTTP status codes indicate the result of a request. They're grouped into five categories:

**2xx means success** - the request worked. 200 is standard success, 201 means a resource was created, and 204 means success with no content to return.

**3xx means redirection** - the resource has moved. 301 is permanent (update your bookmarks), 302 is temporary.

**4xx means client error** - you made a mistake. 400 is a malformed request, 401 means you're not authenticated, 403 means you're authenticated but not authorized, and 404 means the resource doesn't exist.

**5xx means server error** - we made a mistake. 500 is a generic server error, 502 means an upstream service failed, and 503 means the service is temporarily unavailable.

The key is using the right code for the right situation - it affects client retry logic, caching, and monitoring. For example, clients should retry 5xx errors but not 4xx errors."

</details>

### Resources

- [MDN: HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [RFC 7231: HTTP Status Codes](https://tools.ietf.org/html/rfc7231#section-6)
- [HTTP Cats](https://http.cat/) (fun status code reference)

---
