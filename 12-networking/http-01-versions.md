# HTTP Protocol Versions

> **Focus**: Understanding HTTP/1.1, HTTP/2, and HTTP/3 differences and evolution

---

## Question 1: What are the key differences between HTTP/1.1, HTTP/2, and HTTP/3?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon, Netflix, Cloudflare

### Question
Explain the evolution of HTTP protocols and the key improvements in HTTP/2 and HTTP/3. What problems did each version solve?

### Answer

HTTP has evolved significantly to address performance bottlenecks and improve web application speed. Each version introduced major architectural changes to overcome limitations of its predecessor.

**HTTP/1.1 (1997-present):**
- **One request per TCP connection** (or sequential with Keep-Alive)
- Text-based protocol
- Header repetition on every request
- No built-in compression for headers
- Head-of-Line (HOL) blocking at application layer

**HTTP/2 (2015):**
- **Multiplexing**: Multiple requests/responses over single TCP connection
- Binary framing protocol (more efficient parsing)
- Header compression (HPACK algorithm)
- Server Push capability
- Request prioritization
- Still suffers from TCP-level HOL blocking

**HTTP/3 (2022):**
- **QUIC protocol** over UDP instead of TCP
- Eliminates TCP HOL blocking
- Faster connection establishment (0-RTT)
- Better handling of packet loss
- Connection migration support (survives IP changes)
- Built-in encryption (TLS 1.3)

### Code Example

**HTTP/1.1 Waterfall (Sequential Requests):**

```javascript
// HTTP/1.1 behavior - requests are serialized
// Browser opens 6 parallel connections max per domain

// Timeline with HTTP/1.1:
// Connection 1: GET /index.html     [====] 200ms
// Connection 2: GET /style.css      [====] 180ms
// Connection 3: GET /script.js      [====] 190ms
// Connection 4: GET /logo.png       [====] 150ms
// Connection 5: GET /bg.jpg         [====] 220ms
// Connection 6: GET /font.woff      [====] 160ms
// Wait for connection... GET /icon.svg [====] 140ms
// Wait for connection... GET /data.json [====] 130ms
// Total time: ~500ms (sequential waterfall)

// Each connection overhead:
// - TCP handshake: 1 RTT
// - TLS handshake: 2 RTT
// - Request/Response: 1+ RTT
// Total per connection: 4+ RTT minimum
```

**HTTP/2 Multiplexing:**

```javascript
// HTTP/2 - single connection, multiplexed streams

// Timeline with HTTP/2:
// Single Connection:
//   Stream 1: GET /index.html   [====]
//   Stream 2: GET /style.css    [====]
//   Stream 3: GET /script.js    [===]
//   Stream 4: GET /logo.png     [===]
//   Stream 5: GET /bg.jpg       [====]
//   Stream 6: GET /font.woff    [===]
//   Stream 7: GET /icon.svg     [==]
//   Stream 8: GET /data.json    [==]
// All concurrent! Total time: ~220ms (50% faster)

// Benefits:
// - One TCP connection (saves RTT)
// - All resources load in parallel
// - No connection limit bottleneck
// - Shared compression context

// Example: Express server with HTTP/2
const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem')
});

server.on('stream', (stream, headers) => {
  // Handle multiplexed stream
  stream.respond({
    'content-type': 'text/html',
    ':status': 200
  });

  stream.end('<html><body>HTTP/2 Response</body></html>');
});

server.listen(443);
```

**HTTP/3 with QUIC:**

```javascript
// HTTP/3 - QUIC protocol over UDP

// Timeline with HTTP/3:
// 0-RTT connection establishment (vs 3 RTT for HTTP/2)
// Immediate data transmission
// No HOL blocking even with packet loss

// Simulating HTTP/3 benefits
const simulatePacketLoss = () => {
  // HTTP/2 (TCP):
  // Packet loss at stream 3 BLOCKS all subsequent streams
  // Streams 4,5,6,7,8 must wait for retransmission

  // HTTP/3 (QUIC):
  // Packet loss at stream 3 only affects stream 3
  // Streams 4,5,6,7,8 continue unaffected

  console.log('HTTP/2 with 1% packet loss: 450ms');
  console.log('HTTP/3 with 1% packet loss: 230ms (2x faster!)');
};

// Node.js with experimental HTTP/3 support
// (Requires Node 16+ with --experimental-quic flag)
const { createQuicSocket } = require('net');

const socket = createQuicSocket({
  port: 443,
  endpoint: { port: 0 }
});

socket.on('session', (session) => {
  session.on('stream', (stream) => {
    stream.respond({
      ':status': 200,
      'content-type': 'text/html'
    });
    stream.end('HTTP/3 response');
  });
});
```

**Real-World Configuration (Nginx):**

```nginx
# Enable HTTP/2
server {
  listen 443 ssl http2;
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  # HTTP/2 optimizations
  http2_push_preload on;  # Enable server push
  http2_max_concurrent_streams 128;

  location / {
    # Server push critical resources
    http2_push /css/critical.css;
    http2_push /js/app.js;
    root /var/www/html;
  }
}

# Enable HTTP/3 (QUIC)
server {
  listen 443 ssl http3 reuseport;
  listen 443 ssl http2;  # Fallback to HTTP/2

  # QUIC/HTTP3 headers
  add_header Alt-Svc 'h3=":443"; ma=86400';

  ssl_protocols TLSv1.3;  # HTTP/3 requires TLS 1.3
  ssl_early_data on;      # Enable 0-RTT
}
```

**Browser Detection:**

```javascript
// Detect HTTP version in browser

// Method 1: Check from Network tab
performance.getEntriesByType('navigation')[0].nextHopProtocol;
// Returns: "http/1.1", "h2" (HTTP/2), or "h3" (HTTP/3)

// Method 2: Feature detection
const supportsHTTP2 = 'fetch' in window &&
  performance.getEntriesByType('navigation')[0].nextHopProtocol === 'h2';

const supportsHTTP3 = performance.getEntriesByType('navigation')[0]
  .nextHopProtocol === 'h3';

console.log('Protocol:', performance.getEntriesByType('navigation')[0].nextHopProtocol);
// Example output: "h2" for HTTP/2

// Method 3: Analyze resource timing
const resources = performance.getEntriesByType('resource');
resources.forEach(resource => {
  console.log(`${resource.name}: ${resource.nextHopProtocol}`);
});
// Output:
// https://example.com/style.css: h2
// https://example.com/script.js: h2
// https://cdn.example.com/font.woff: http/1.1 (different domain)
```

<details>
<summary><strong>🔍 Deep Dive: Protocol Internals and Performance Impact</strong></summary>

**HTTP/1.1 Architecture and Limitations:**

HTTP/1.1, standardized in 1997, was revolutionary for its time but has fundamental architectural limitations that impact modern web performance.

**Head-of-Line Blocking Problem:**

```
HTTP/1.1 Request Pipeline:

Client sends:
GET /index.html HTTP/1.1    ─┐
GET /style.css HTTP/1.1     ─┤ Pipelined requests
GET /script.js HTTP/1.1     ─┘

Server must respond IN ORDER:
Response 1: index.html [====]     200ms
Response 2: style.css  [waiting...][====] 180ms (blocked!)
Response 3: script.js  [waiting............][====] 190ms (blocked!)

Total time: 570ms (serial processing)

Problem: If index.html is slow, style.css and script.js must wait
even if they're cached or small. This is application-layer HOL blocking.
```

**Why HTTP/1.1 Uses Multiple Connections:**

```javascript
// Browsers open 6-8 parallel connections to work around HOL blocking
// Chrome/Edge: 6 connections per domain
// Firefox: 6 connections per domain
// Safari: 6 connections per domain

// Example: Loading 20 resources over HTTP/1.1
const resourceLoadTimes = [
  // Connection 1: [res1, res7, res13, res19]
  // Connection 2: [res2, res8, res14, res20]
  // Connection 3: [res3, res9, res15]
  // Connection 4: [res4, res10, res16]
  // Connection 5: [res5, res11, res17]
  // Connection 6: [res6, res12, res18]
];

// Each connection has overhead:
// - TCP handshake (SYN, SYN-ACK, ACK): 1 RTT
// - TLS handshake (ClientHello, ServerHello, etc.): 2 RTT
// - Total setup overhead: 3 RTT × 6 connections = 18 RTT

// With 50ms RTT:
const setupOverhead = 3 * 50 * 6; // 900ms wasted on handshakes!
```

**HTTP/1.1 Header Overhead:**

```
Request headers sent with EVERY request (no compression):

GET /api/users HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
Accept: application/json
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9
Cookie: session=abc123; userId=456; preferences=xyz789...
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Referer: https://example.com/dashboard
Cache-Control: no-cache

Total header size: ~1,500 bytes per request

For 100 API calls:
- Header overhead: 150,000 bytes (146 KB)
- Over mobile (4G, 10 Mbps up): 117ms wasted on redundant headers
- Over slow connection (3G, 1 Mbps): 1,200ms wasted!
```

**HTTP/2 Binary Framing Layer:**

HTTP/2 introduces a binary framing layer that solves HTTP/1.1's problems through multiplexing and header compression.

**Frame Structure:**

```
HTTP/2 Frame Format (9-byte header + payload):

+-----------------------------------------------+
|                 Length (24)                   |
+---------------+---------------+---------------+
|   Type (8)    |   Flags (8)   |
+-+-------------+---------------+-------------------------------+
|R|                 Stream Identifier (31)                      |
+=+=============================================================+
|                   Frame Payload (0...)                      ...
+---------------------------------------------------------------+

Frame Types:
- DATA: Application data (request/response body)
- HEADERS: HTTP headers
- PRIORITY: Stream priority information
- RST_STREAM: Terminate stream
- SETTINGS: Connection configuration
- PUSH_PROMISE: Server push notification
- PING: Connection liveness check
- GOAWAY: Graceful connection shutdown
- WINDOW_UPDATE: Flow control
- CONTINUATION: Header continuation
```

**Multiplexing in Action:**

```
HTTP/2 Multiplexed Streams over Single Connection:

Time →
  0ms    50ms   100ms  150ms  200ms  250ms
  |      |      |      |      |      |
  ├──────┴──────┴──────┴──────┴──────┤ TCP Connection

Stream 1 (index.html):  [H][D][D][D]................
Stream 2 (style.css):   ...[H][D][D][D]..............
Stream 3 (script.js):   ......[H][D][D][D]...........
Stream 4 (logo.png):    .........[H][D][D][D][D].....
Stream 5 (api/data):    ............[H][D]...........

Legend:
[H] = HEADERS frame
[D] = DATA frame

All streams interleaved on same connection!
Server can send frames from any stream at any time.
```

**HPACK Header Compression:**

```
HTTP/1.1 (1,500 bytes per request):
GET /api/users HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
Accept: application/json
Cookie: session=abc123; userId=456; preferences=xyz789...
[... full headers repeated every time ...]

HTTP/2 with HPACK (first request: 1,500 bytes, subsequent: ~50 bytes):

Request 1: Full headers (1,500 bytes)
┌─────────────────────────────────────────┐
│ :method: GET                            │
│ :path: /api/users                       │
│ :authority: api.example.com             │
│ user-agent: Mozilla/5.0...              │
│ cookie: session=abc123; userId=456...   │
└─────────────────────────────────────────┘
Indexed in dynamic table with IDs

Request 2: Indexed references (50 bytes)
┌─────────────────────────────────────────┐
│ :method: GET               → Index #2   │
│ :path: /api/posts          → NEW        │
│ :authority: ...            → Index #1   │
│ user-agent: ...            → Index #58  │
│ cookie: ...                → Index #60  │
└─────────────────────────────────────────┘

Compression ratio: 97% reduction for subsequent requests!
```

**HTTP/2 Stream Priority:**

```javascript
// Stream priority example

// Critical resources (high priority)
Stream 1 (HTML):      Priority: Weight 256 (highest)
Stream 2 (CSS):       Priority: Weight 220 (high)
Stream 3 (JS):        Priority: Weight 220 (high)

// Lower priority resources
Stream 4 (Images):    Priority: Weight 110 (medium)
Stream 5 (Fonts):     Priority: Weight 147 (medium)
Stream 6 (Analytics): Priority: Weight 32 (low)

// Server allocates bandwidth proportionally:
// HTML gets 256/1025 = 25% of bandwidth
// CSS gets 220/1025 = 21% of bandwidth
// Images get 110/1025 = 11% of bandwidth
// etc.

// Priority tree (dependencies):
//       Stream 0 (connection)
//           |
//      ┌────┴────┐
//      │ Stream 1│ (HTML) - Weight: 256
//      └────┬────┘
//      ┌────┴────┬─────────┐
//   Stream 2  Stream 3  Stream 4
//    (CSS)      (JS)    (Images)
//  Weight: 220  220      110

// Stream 2 & 3 depend on Stream 1 completing first
// Browser sends: "Don't send CSS/JS until HTML headers received"
```

**HTTP/2 Server Push:**

```
Server Push Flow:

1. Client requests index.html:
   HEADERS frame (Stream 1)
   :method: GET
   :path: /

2. Server responds with PUSH_PROMISE:
   PUSH_PROMISE frame (Stream 1, promised Stream 2)
   :method: GET
   :path: /style.css
   "I'm going to send you /style.css on Stream 2"

3. Server sends pushed resource:
   HEADERS frame (Stream 2)
   :status: 200
   DATA frame (Stream 2)
   [CSS content]

4. Server sends original response:
   HEADERS frame (Stream 1)
   :status: 200
   DATA frame (Stream 1)
   <link rel="stylesheet" href="/style.css">

Client receives CSS BEFORE parsing HTML!
Eliminates round-trip for critical resources.
```

**TCP Head-of-Line Blocking (HTTP/2's Remaining Problem):**

```
TCP Layer (affects HTTP/2):

Packets sent over network:
┌────┬────┬────┬────┬────┬────┬────┬────┐
│ P1 │ P2 │ P3 │ P4 │ P5 │ P6 │ P7 │ P8 │
└────┴────┴────┴────┴────┴────┴────┴────┘

Packet 3 lost! TCP detects missing sequence number.

TCP buffer at receiver:
┌────┬────┬────┬────┬────┬────┬────┬────┐
│ P1 │ P2 │ ?? │ P4 │ P5 │ P6 │ P7 │ P8 │
└────┴────┴────┴────┴────┴────┴────┴────┘
         ↑
      BLOCKED!

TCP blocks delivery of P4-P8 until P3 is retransmitted.
Application layer (HTTP/2) sees no data until retransmit completes.

Impact:
- All multiplexed streams frozen
- Even streams that don't need P3 data are blocked
- On lossy networks (1% loss): 25-50% performance degradation
```

**HTTP/3 and QUIC Architecture:**

HTTP/3 solves TCP HOL blocking by using QUIC protocol over UDP with stream-level independence.

**QUIC Connection Establishment (0-RTT):**

```
HTTP/2 (TCP + TLS 1.2) - 3 RTT:

Client                           Server
  |                                |
  |--- TCP SYN ------------------>|  RTT 1
  |<-- TCP SYN-ACK --------------|
  |--- TCP ACK ------------------>|
  |                                |
  |--- TLS ClientHello ---------->|  RTT 2
  |<-- TLS ServerHello -----------|
  |                                |
  |--- TLS Finished ------------->|  RTT 3
  |<-- TLS Finished --------------|
  |                                |
  |--- HTTP GET / --------------->|  RTT 4
  |<-- HTTP Response --------------|

Total: 4 RTT before data transfer


HTTP/3 (QUIC) - 0-RTT or 1-RTT:

First connection (1-RTT):
Client                           Server
  |--- QUIC Initial + TLS CH ---->|  RTT 1
  |<-- QUIC Handshake + TLS SH ---|
  |--- QUIC + HTTP GET / -------->|
  |<-- HTTP Response --------------|

Total: 1 RTT before data transfer (4x faster!)


Subsequent connections (0-RTT):
Client                           Server
  |--- QUIC + TLS Resumed ------->|  RTT 0
  |    + HTTP GET /               |  (sent together!)
  |<-- HTTP Response --------------|

Total: 0 RTT (instant!) - Client sends request immediately
using cached session ticket and resumption secret.
```

**QUIC Stream Independence:**

```
QUIC solves HOL blocking with independent streams:

Packets sent:
┌────┬────┬────┬────┬────┬────┬────┬────┐
│ S1 │ S2 │ S3 │ S1 │ S2 │ S3 │ S1 │ S2 │
│ P1 │ P1 │ P1 │ P2 │ P2 │ P2 │ P3 │ P3 │
└────┴────┴────┴────┴────┴────┴────┴────┘

S3-P1 lost!

QUIC buffer at receiver:
Stream 1: [P1][P2][P3] ✅ Complete, delivered to app
Stream 2: [P1][P2][P3] ✅ Complete, delivered to app
Stream 3: [??][P2] ❌ Waiting for P1 retransmit

Only Stream 3 is blocked. Streams 1 & 2 proceed normally!

Benefit:
- Image loading doesn't block JavaScript
- API call loss doesn't freeze CSS rendering
- 1% packet loss: 5-10% performance impact (vs 50% for HTTP/2)
```

**QUIC Connection Migration:**

```
Connection Migration (unique to QUIC):

Scenario: User on phone switches from WiFi to cellular

TCP/HTTP2:
  WiFi network (IP: 192.168.1.50)
  ↓ Connection established
  [Active HTTP/2 streams...]
  ↓ Switch to cellular (IP: 10.0.0.123)
  ❌ All connections lost! TCP uses IP for connection identity
  ↓ Must re-establish connection (3 RTT)
  [Restart all requests...]

QUIC/HTTP3:
  WiFi network (IP: 192.168.1.50)
  ↓ Connection established (Connection ID: abc123)
  [Active HTTP/3 streams...]
  ↓ Switch to cellular (IP: 10.0.0.123)
  ✅ Connection maintained! QUIC uses Connection ID, not IP
  [All streams continue seamlessly]

Benefit:
- No interruption during network changes
- Mobile users experience zero latency on network switch
- Essential for modern mobile web apps
```

**Performance Benchmarks (Real-World):**

```javascript
// Performance comparison across protocols
// Test: Load 100 resources (HTML, CSS, JS, images, fonts)
// Network: 100ms RTT, 10 Mbps bandwidth, 1% packet loss

const benchmarks = {
  'HTTP/1.1': {
    totalTime: 4800,          // ms
    connectionSetup: 1800,    // 6 connections × 3 RTT × 100ms
    headerOverhead: 950,      // Uncompressed headers
    holBlocking: 1200,        // Serial requests + packet loss
    transferTime: 850
  },

  'HTTP/2': {
    totalTime: 2100,          // ms (2.3x faster!)
    connectionSetup: 300,     // 1 connection × 3 RTT × 100ms
    headerOverhead: 120,      // HPACK compression
    holBlocking: 800,         // TCP-level blocking only
    transferTime: 880
  },

  'HTTP/3': {
    totalTime: 1200,          // ms (4x faster than HTTP/1.1!)
    connectionSetup: 0,       // 0-RTT resumption
    headerOverhead: 100,      // QPACK compression
    holBlocking: 150,         // Stream-level blocking only
    transferTime: 950
  }
};

// First Contentful Paint (FCP):
// HTTP/1.1: 1,850ms
// HTTP/2:     950ms (49% faster)
// HTTP/3:     420ms (78% faster)

// Time to Interactive (TTI):
// HTTP/1.1: 4,800ms
// HTTP/2:   2,100ms (56% faster)
// HTTP/3:   1,200ms (75% faster)
```

**Protocol Negotiation (ALPN):**

```
TLS ALPN (Application-Layer Protocol Negotiation):

Client → Server (TLS ClientHello):
┌──────────────────────────────────────┐
│ TLS Extensions:                      │
│   ALPN: [h2, http/1.1]              │ Client supports HTTP/2
│         ↑ preferred                  │
└──────────────────────────────────────┘

Server → Client (TLS ServerHello):
┌──────────────────────────────────────┐
│ TLS Extensions:                      │
│   ALPN: h2                           │ Server chooses HTTP/2
└──────────────────────────────────────┘

Result: Connection uses HTTP/2


For HTTP/3 (Alt-Svc header):
Initial HTTP/2 connection:
Client ← Server (HTTP/2 response):
┌──────────────────────────────────────┐
│ HTTP/2 200 OK                        │
│ Alt-Svc: h3=":443"; ma=86400         │ "Try HTTP/3 on port 443"
│                                      │ "Cache this for 24h"
└──────────────────────────────────────┘

Next request: Client attempts QUIC connection
If successful: Use HTTP/3
If fails: Fallback to HTTP/2
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Migrating Large SPA from HTTP/1.1 to HTTP/2</strong></summary>

**Scenario**: Your e-commerce SPA loads 150+ assets per page (CSS, JS chunks, images, fonts, API calls). Users on mobile report slow load times (5-8 seconds). Your site is currently on HTTP/1.1 with domain sharding (assets split across 4 CDN subdomains). Management wants to improve mobile conversion rate by reducing load time to under 2 seconds.

**Current Production Metrics (HTTP/1.1):**
- Average page load time: 6,200ms
- P95 page load time: 8,400ms
- First Contentful Paint (FCP): 2,800ms
- Time to Interactive (TTI): 6,800ms
- Mobile bounce rate: 38%
- Mobile conversion rate: 1.2%
- CDN bandwidth costs: $4,200/month
- Number of assets loaded: 157 resources

**The Problem (HTTP/1.1 Architecture):**

```javascript
// Current setup: Domain sharding to work around connection limits
const assetDomains = [
  'https://cdn1.example.com',  // Images
  'https://cdn2.example.com',  // JavaScript
  'https://cdn3.example.com',  // CSS
  'https://cdn4.example.com'   // Fonts
];

// Each domain requires separate connection
// Total connections: 4 domains × 6 connections = 24 parallel connections

// Connection overhead per domain:
const connectionCost = {
  dnsLookup: 80,      // DNS resolution
  tcpHandshake: 150,  // SYN, SYN-ACK, ACK (50ms RTT × 3)
  tlsHandshake: 200,  // TLS 1.2 negotiation (50ms RTT × 4)
  total: 430          // 430ms per domain!
};

// Total connection overhead: 430ms × 4 domains = 1,720ms wasted!

// Resource loading pattern (Chrome DevTools waterfall):
/*
0ms          500ms       1000ms      1500ms      2000ms      2500ms
|-------------|-----------|-----------|-----------|-----------|

cdn1.example.com (DNS + TLS):           [===430ms===]
  Connection 1: image1.jpg                          [==200ms==]
  Connection 2: image2.jpg                          [==180ms==]
  Connection 3: image3.jpg                          [==190ms==]
  Connection 4: image4.jpg                          [==210ms==]
  Connection 5: image5.jpg                          [==170ms==]
  Connection 6: image6.jpg                          [==160ms==]
  Waiting...    image7.jpg                                     [==150ms==]
  Waiting...    image8.jpg                                        [==140ms==]

cdn2.example.com (DNS + TLS):           [===430ms===]
  Connection 1: app.js                              [==300ms==]
  Connection 2: vendor.js                           [==280ms==]
  Connection 3: chunk1.js                           [==120ms==]
  ...

Total waterfall: 6,200ms with massive connection overhead
*/
```

**Debugging Process:**

**Step 1: Analyze with WebPageTest**

```javascript
// WebPageTest.org results (HTTP/1.1):

{
  loadTime: 6247,
  firstByte: 234,
  startRender: 2789,
  fullyLoaded: 6813,
  bytesIn: 2847523,
  requestsCount: 157,

  breakdown: {
    dns: 312,        // 4 domains × ~80ms average
    connect: 1654,   // 24 connections × ~69ms average
    ssl: 1876,       // 24 TLS handshakes × ~78ms average
    wait: 892,       // Server processing
    receive: 1513    // Download time
  },

  // Critical finding: 3,842ms (62%) spent on connection overhead!
  connectionOverhead: 3842,
  actualTransferTime: 2405
}

// Chrome DevTools Performance tab:
// - Main thread idle: 1,850ms (waiting for resources)
// - Parser blocked: 1,420ms (waiting for CSS/JS)
// - Layout thrashing: 6 forced reflows (image loading)
```

**Step 2: Identify Specific Bottlenecks**

```javascript
// Analyze with Chrome DevTools Network tab

const resourceTimings = performance.getEntriesByType('resource');

const analysis = resourceTimings.reduce((acc, resource) => {
  const timing = {
    name: resource.name,
    dns: resource.domainLookupEnd - resource.domainLookupStart,
    tcp: resource.connectEnd - resource.connectStart,
    ssl: resource.secureConnectionStart > 0
      ? resource.connectEnd - resource.secureConnectionStart
      : 0,
    ttfb: resource.responseStart - resource.requestStart,
    download: resource.responseEnd - resource.responseStart,
    total: resource.responseEnd - resource.startTime
  };

  acc.push(timing);
  return acc;
}, []);

// Group by domain
const byDomain = analysis.reduce((acc, timing) => {
  const url = new URL(timing.name);
  const domain = url.hostname;

  if (!acc[domain]) {
    acc[domain] = {
      count: 0,
      totalDNS: 0,
      totalSSL: 0,
      totalDownload: 0
    };
  }

  acc[domain].count++;
  acc[domain].totalDNS += timing.dns;
  acc[domain].totalSSL += timing.ssl;
  acc[domain].totalDownload += timing.download;

  return acc;
}, {});

console.log(byDomain);
/*
{
  'cdn1.example.com': {
    count: 43,
    totalDNS: 3440,      // DNS called 43 times (not cached!)
    totalSSL: 8040,      // TLS negotiated 24 times (connection limits)
    totalDownload: 5623
  },
  'cdn2.example.com': { count: 38, totalDNS: 3040, totalSSL: 7104, ... },
  'cdn3.example.com': { count: 51, totalDNS: 4080, totalSSL: 9792, ... },
  'cdn4.example.com': { count: 25, totalDNS: 2000, totalSSL: 4800, ... }
}

Total wasted on DNS: 12,560ms
Total wasted on TLS: 29,736ms
Combined overhead: 42,296ms (!!)

Root cause: Browser opens new connections because of 6-connection limit
per domain, requiring repeated DNS + TLS handshakes.
*/
```

**Step 3: Test HTTP/2 in Staging**

```javascript
// Configure Nginx for HTTP/2
// /etc/nginx/sites-available/example.com

server {
  listen 443 ssl http2;
  server_name www.example.com;

  # Consolidate all assets to single domain (remove sharding)
  # cdn1, cdn2, cdn3, cdn4 → www.example.com

  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

  # HTTP/2 optimizations
  http2_push_preload on;
  http2_max_concurrent_streams 256;  # Default: 128
  http2_recv_timeout 30s;

  # Enable server push for critical resources
  location = /index.html {
    add_header Link "</css/critical.css>; rel=preload; as=style";
    add_header Link "</js/app.js>; rel=preload; as=script";
    add_header Link "</fonts/main.woff2>; rel=preload; as=font; crossorigin";

    http2_push /css/critical.css;
    http2_push /js/app.js;

    root /var/www/html;
  }

  # Aggressive caching for static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}

# Redirect HTTP/1.1 requests to HTTPS
server {
  listen 80;
  server_name www.example.com;
  return 301 https://$server_name$request_uri;
}
```

**Step 4: Optimize Application for HTTP/2**

```javascript
// BEFORE (HTTP/1.1): Domain sharding and concatenation

// webpack.config.js (old)
module.exports = {
  output: {
    filename: 'bundle.js',  // Single concatenated file
    publicPath: 'https://cdn2.example.com/'
  },
  optimization: {
    splitChunks: false  // No code splitting (bad for HTTP/1.1)
  }
};

// Result:
// - bundle.js: 1.2MB (blocks parser for 800ms!)
// - All code loads even if not needed
// - Cache invalidation invalidates entire bundle


// AFTER (HTTP/2): Code splitting and single domain

// webpack.config.js (new)
module.exports = {
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    publicPath: 'https://www.example.com/'  // Single domain!
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor code (rarely changes)
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10
        },

        // Common code (shared across routes)
        common: {
          minChunks: 2,
          name: 'common',
          priority: 5
        }
      }
    },

    // Separate runtime for better caching
    runtimeChunk: 'single'
  }
};

// Result:
// - runtime.abc123.js: 5KB (webpack runtime)
// - vendor.def456.js: 400KB (React, libraries)
// - common.ghi789.js: 150KB (shared utilities)
// - home.jkl012.chunk.js: 80KB (Home route)
// - product.mno345.chunk.js: 120KB (Product route)
// - checkout.pqr678.chunk.js: 95KB (Checkout route)

// Benefits:
// - Parallel loading over HTTP/2 (6 files in ~400ms vs 1 file in 800ms)
// - Better caching (vendor changes rarely)
// - Lazy loading (only load route chunks when needed)
```

**Step 5: Implement Resource Hints**

```html
<!-- index.html optimized for HTTP/2 -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">

  <!-- DNS prefetch for external domains (analytics, etc.) -->
  <link rel="dns-prefetch" href="https://analytics.google.com">

  <!-- Preconnect for critical third-party resources -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Preload critical assets (HTTP/2 server push alternative) -->
  <link rel="preload" href="/css/critical.css" as="style">
  <link rel="preload" href="/js/runtime.abc123.js" as="script">
  <link rel="preload" href="/js/vendor.def456.js" as="script">
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

  <!-- Critical CSS inline (above-the-fold) -->
  <style>
    /* Inline critical CSS (2-3KB) */
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .header { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    /* ... */
  </style>

  <!-- Load non-critical CSS async -->
  <link rel="preload" href="/css/app.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/css/app.css"></noscript>

  <title>Example Shop</title>
</head>
<body>
  <div id="root"></div>

  <!-- Scripts with optimal loading -->
  <script src="/js/runtime.abc123.js" defer></script>
  <script src="/js/vendor.def456.js" defer></script>
  <script src="/js/common.ghi789.js" defer></script>
  <script src="/js/home.jkl012.chunk.js" defer></script>
</body>
</html>
```

**Step 6: Measure Results**

```javascript
// Production metrics after HTTP/2 migration

const before = {
  avgPageLoad: 6200,
  p95PageLoad: 8400,
  fcp: 2800,
  tti: 6800,
  connectionOverhead: 3842,
  mobileConversion: 1.2,
  bounceRate: 38
};

const after = {
  avgPageLoad: 1850,  // 70% improvement!
  p95PageLoad: 2450,  // 71% improvement!
  fcp: 680,           // 76% improvement!
  tti: 1950,          // 71% improvement!
  connectionOverhead: 320,  // 92% reduction!
  mobileConversion: 2.8,    // 133% increase!
  bounceRate: 12            // 68% reduction!
};

// Financial impact:
const metrics = {
  monthlyUsers: 450000,

  // Conversion improvement
  conversionBefore: 450000 * 0.012,  // 5,400 conversions
  conversionAfter: 450000 * 0.028,   // 12,600 conversions
  additionalConversions: 7200,
  avgOrderValue: 85,
  additionalRevenue: 7200 * 85,      // $612,000/month!

  // CDN cost reduction (removed 3 extra domains)
  cdnCostBefore: 4200,
  cdnCostAfter: 1800,  // Single domain, better compression
  cdnSavings: 2400,    // $2,400/month saved

  // ROI
  implementationCost: 15000,  // Developer time + testing
  monthlyBenefit: 612000 + 2400,
  paybackPeriod: 15000 / 614400,  // 0.024 months (< 1 day!)
  annualBenefit: 614400 * 12      // $7.37M/year
};
```

**Common Issues Encountered:**

```javascript
// Issue 1: Server push over-pushing resources
// PROBLEM: Pushed resources the client already has cached

// ❌ BAD: Always push same resources
location = /index.html {
  http2_push /css/app.css;  // Client may have this cached!
  http2_push /js/vendor.js;
}

// ✅ GOOD: Use preload hints, let client decide
location = /index.html {
  add_header Link "</css/app.css>; rel=preload; as=style";
  add_header Link "</js/vendor.js>; rel=preload; as=script";
  # Server pushes only if client doesn't have in cache
  http2_push_preload on;
}


// Issue 2: Connection coalescing not working
// PROBLEM: Multiple certificates, browser can't reuse connection

// ❌ BAD: Separate cert for www and cdn
www.example.com → Certificate: [www.example.com]
cdn.example.com → Certificate: [cdn.example.com]
# Browser opens 2 connections

// ✅ GOOD: Wildcard or SAN certificate
Certificate: [*.example.com, example.com]
# Browser reuses single connection for all subdomains


// Issue 3: Priority issues with third-party scripts
// PROBLEM: Analytics blocking critical resources

// ❌ BAD: Analytics in <head>
<script src="https://analytics.example.com/track.js"></script>
<link rel="stylesheet" href="/css/critical.css">

// ✅ GOOD: Defer non-critical scripts
<link rel="stylesheet" href="/css/critical.css">
<script src="https://analytics.example.com/track.js" defer></script>
# Or async for independent scripts
<script src="https://analytics.example.com/track.js" async></script>
```

**Key Learnings:**

1. **Remove domain sharding for HTTP/2** - Single connection is faster than multiple connections
2. **Enable code splitting** - Small files benefit from HTTP/2 multiplexing
3. **Use resource hints strategically** - Preload critical resources, prefetch/preconnect for others
4. **Monitor server push carefully** - Can waste bandwidth if over-used
5. **Prioritize critical resources** - Use Link rel=preload for above-the-fold assets
6. **Test on real mobile networks** - HTTP/2 benefits are most visible on high-latency connections

**Migration Checklist:**

```javascript
const migrationChecklist = {
  infrastructure: [
    'Update web server to support HTTP/2 (Nginx 1.9.5+, Apache 2.4.17+)',
    'Obtain TLS certificate (HTTP/2 requires HTTPS)',
    'Configure ALPN for protocol negotiation',
    'Enable HTTP/2 in server configuration',
    'Set optimal http2_max_concurrent_streams (128-256)'
  ],

  application: [
    'Remove domain sharding (consolidate to single domain)',
    'Enable code splitting in bundler',
    'Add resource hints (preload, prefetch, dns-prefetch)',
    'Inline critical CSS',
    'Implement lazy loading for routes',
    'Configure server push or preload headers'
  ],

  testing: [
    'Test with Chrome DevTools (Network → Protocol column)',
    'Verify ALPN negotiation (openssl s_client -alpn h2)',
    'Run WebPageTest.org comparison',
    'Check mobile performance (4G throttling)',
    'Validate resource prioritization',
    'Monitor server push effectiveness'
  ],

  monitoring: [
    'Track protocol distribution (h2 vs http/1.1)',
    'Monitor connection reuse metrics',
    'Measure FCP, LCP, TTI improvements',
    'Track bandwidth usage (server push overhead)',
    'Monitor conversion rate changes',
    'Set up alerting for HTTP/2 errors'
  ]
};
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: HTTP/1.1 vs HTTP/2 vs HTTP/3</strong></summary>

**Comprehensive Comparison Matrix:**

| Feature | HTTP/1.1 | HTTP/2 | HTTP/3 (QUIC) |
|---------|----------|--------|---------------|
| **Transport** | TCP | TCP | UDP (QUIC) |
| **Encryption** | Optional (HTTPS) | Required (TLS 1.2+) | Required (TLS 1.3) |
| **Connection Setup** | 3 RTT (TCP + TLS 1.2) | 3 RTT (TCP + TLS 1.2) | 0-1 RTT (QUIC + TLS 1.3) |
| **Multiplexing** | ❌ No (serial or pipelined) | ✅ Yes (streams over 1 connection) | ✅ Yes (streams over 1 connection) |
| **HOL Blocking** | ❌ Application + TCP layer | ⚠️ TCP layer only | ✅ None (stream-level independence) |
| **Header Compression** | ❌ No | ✅ Yes (HPACK) | ✅ Yes (QPACK, improved) |
| **Server Push** | ❌ No | ✅ Yes | ✅ Yes (improved) |
| **Connection Migration** | ❌ No | ❌ No | ✅ Yes (Connection ID) |
| **0-RTT Resumption** | ❌ No | ⚠️ TLS 1.3 only | ✅ Yes (built-in) |
| **Browser Support** | 100% | 97%+ | 75%+ (growing) |
| **CDN Support** | 100% | 95%+ | 60%+ (growing) |
| **Complexity** | Low | Medium | High |
| **Debugging** | Easy (text-based) | Harder (binary) | Hardest (encrypted + UDP) |

**Performance Trade-offs:**

```javascript
// Ideal use cases for each protocol

const useCases = {
  'HTTP/1.1': {
    goodFor: [
      'Legacy systems (no TLS support)',
      'Very simple websites (1-5 resources)',
      'Internal tools with minimal resources',
      'Debugging (human-readable headers)'
    ],

    badFor: [
      'Modern SPAs (100+ resources)',
      'Mobile applications',
      'Real-time applications',
      'High-latency networks'
    ],

    performance: {
      fastConnection: 'Decent',  // Low latency, few resources
      slowConnection: 'Poor',    // High latency, many resources
      lossyNetwork: 'Poor'       // Packet loss impacts all connections
    }
  },

  'HTTP/2': {
    goodFor: [
      'Modern web applications (many resources)',
      'Mobile applications',
      'Content-heavy sites (images, videos)',
      'Production with existing TLS infrastructure',
      'When debugging tools are available'
    ],

    badFor: [
      'Very simple sites (overhead not worth it)',
      'Lossy networks (>1% packet loss)',
      'Legacy infrastructure (no TLS)',
      'When server push is over-used'
    ],

    performance: {
      fastConnection: 'Excellent',     // Multiplexing shines
      slowConnection: 'Good',          // Header compression helps
      lossyNetwork: 'Fair to Poor'     // TCP HOL blocking hurts
    }
  },

  'HTTP/3': {
    goodFor: [
      'Mobile applications (network changes)',
      'Lossy networks (cellular, Wi-Fi)',
      'Real-time applications',
      'Global applications (high latency)',
      'Video streaming services',
      'Gaming platforms'
    ],

    badFor: [
      'Corporate networks (UDP blocked)',
      'Legacy systems',
      'When debugging is critical',
      'Limited CDN HTTP/3 support'
    ],

    performance: {
      fastConnection: 'Excellent',     // 0-RTT connection
      slowConnection: 'Excellent',     // No HOL blocking
      lossyNetwork: 'Excellent'        // Stream independence
    }
  }
};
```

**Migration Decision Tree:**

```javascript
function shouldMigrate(currentProtocol, targetProtocol, context) {
  // HTTP/1.1 → HTTP/2
  if (currentProtocol === 'HTTP/1.1' && targetProtocol === 'HTTP/2') {
    if (context.resourceCount < 10) {
      return {
        recommendation: 'MAYBE',
        reason: 'Low resource count - minimal benefit',
        estimatedImprovement: '5-15%'
      };
    }

    if (!context.hasTLS) {
      return {
        recommendation: 'REQUIRES_TLS',
        reason: 'HTTP/2 requires HTTPS - factor in TLS setup cost',
        prerequisite: 'Set up TLS certificate first'
      };
    }

    if (context.resourceCount > 30) {
      return {
        recommendation: 'STRONGLY_RECOMMEND',
        reason: 'High resource count - significant multiplexing benefit',
        estimatedImprovement: '40-70%'
      };
    }

    return {
      recommendation: 'RECOMMEND',
      reason: 'Moderate resource count - good improvement expected',
      estimatedImprovement: '20-40%'
    };
  }

  // HTTP/2 → HTTP/3
  if (currentProtocol === 'HTTP/2' && targetProtocol === 'HTTP/3') {
    if (context.packetLoss > 0.5) {
      return {
        recommendation: 'STRONGLY_RECOMMEND',
        reason: 'High packet loss - HTTP/3 solves TCP HOL blocking',
        estimatedImprovement: '50-100%'
      };
    }

    if (context.mobileTraffic > 60) {
      return {
        recommendation: 'RECOMMEND',
        reason: 'High mobile traffic - connection migration helps',
        estimatedImprovement: '20-40%'
      };
    }

    if (!context.cdnSupportsHTTP3) {
      return {
        recommendation: 'WAIT',
        reason: 'CDN doesn\'t support HTTP/3 yet - wait for support',
        estimatedImprovement: 'N/A'
      };
    }

    return {
      recommendation: 'OPTIONAL',
      reason: 'Incremental improvement - not critical',
      estimatedImprovement: '10-25%'
    };
  }
}

// Example usage:
const spaContext = {
  resourceCount: 120,
  hasTLS: true,
  packetLoss: 0.8,
  mobileTraffic: 75,
  cdnSupportsHTTP3: true
};

console.log(shouldMigrate('HTTP/1.1', 'HTTP/2', spaContext));
// {
//   recommendation: 'STRONGLY_RECOMMEND',
//   reason: 'High resource count - significant multiplexing benefit',
//   estimatedImprovement: '40-70%'
// }

console.log(shouldMigrate('HTTP/2', 'HTTP/3', spaContext));
// {
//   recommendation: 'STRONGLY_RECOMMEND',
//   reason: 'High packet loss - HTTP/3 solves TCP HOL blocking',
//   estimatedImprovement: '50-100%'
// }
```

**Cost-Benefit Analysis:**

```javascript
const migrationCost = {
  'HTTP/1.1_to_HTTP/2': {
    infrastructure: {
      serverUpgrade: 500,        // Nginx/Apache update
      tlsCertificate: 0,         // Let's Encrypt free
      loadTesting: 1000,         // Staging environment
      monitoring: 500            // New metrics setup
    },

    development: {
      configChanges: 2000,       // 2 days × $1000/day
      assetOptimization: 4000,   // 4 days (code splitting, etc.)
      testing: 3000,             // 3 days (cross-browser, mobile)
      documentation: 1000        // 1 day
    },

    total: 12000,
    timeline: '2-3 weeks',

    expectedBenefit: {
      loadTimeReduction: '40-70%',
      conversionIncrease: '15-30%',
      bandwidthSavings: '10-20%',
      paybackPeriod: '1-2 months (typical SaaS)'
    }
  },

  'HTTP/2_to_HTTP/3': {
    infrastructure: {
      serverUpgrade: 2000,       // QUIC support may need newer server
      cdnUpgrade: 3000,          // CDN provider with HTTP/3 support
      firewallConfig: 1000,      // Allow UDP traffic
      monitoring: 1500           // QUIC-specific metrics
    },

    development: {
      configChanges: 3000,       // 3 days (more complex)
      fallbackLogic: 2000,       // 2 days (HTTP/2 fallback)
      testing: 4000,             // 4 days (UDP, connection migration)
      documentation: 1500        // 1.5 days
    },

    total: 18000,
    timeline: '3-4 weeks',

    expectedBenefit: {
      loadTimeReduction: '10-30%',
      mobileExperienceImprovement: '20-50%',
      connectionStability: 'Significant',
      paybackPeriod: '3-6 months (mobile-heavy traffic)'
    }
  }
};
```

</details>

<details>
<summary><strong>💬 Explain to Junior: HTTP Protocol Evolution</strong></summary>

**Simple Explanation:**

Think of HTTP protocols like different versions of a highway system for delivering packages (web resources).

**HTTP/1.1 - The Old Highway (1997):**

Imagine you need to pick up groceries, and you can only carry **one item per trip** from the store to your car:

1. Walk to store, grab bread, walk back to car
2. Walk to store, grab milk, walk back to car
3. Walk to store, grab eggs, walk back to car

That's **super inefficient**, right? So HTTP/1.1 lets you make **6 trips at the same time** (6 parallel connections), but you still can only carry one item per trip.

```
Trip 1: [bread]
Trip 2: [milk]
Trip 3: [eggs]
Trip 4: [cheese]
Trip 5: [butter]
Trip 6: [yogurt]
Waiting... Trip 7: [juice]  (have to wait for a trip to finish)
```

**HTTP/2 - The Modern Highway (2015):**

Now imagine you have a **conveyor belt** that runs continuously between the store and your car. You can put **all items on the belt at once**, and they all move together:

```
Conveyor belt:
[bread] [milk] [eggs] [cheese] [butter] [yogurt] [juice] [cereal]
All moving simultaneously! 3x faster!
```

This is **multiplexing** - multiple resources travel over one connection.

**HTTP/3 - The Flying Drone (2022):**

Now imagine each item has its **own drone** flying to your car. If one drone has a problem (like a bird hits it), the other drones keep flying just fine!

```
Drone 1: [bread] ✅ Delivered
Drone 2: [milk] ✅ Delivered
Drone 3: [eggs] ❌ Hit by bird, retrying
Drone 4: [cheese] ✅ Delivered (didn't wait for eggs!)
Drone 5: [butter] ✅ Delivered
```

This solves **head-of-line blocking** - one problem doesn't stop everything else.

**Real-World Analogy for a PM:**

"Think of it like Amazon delivery:

- **HTTP/1.1**: Delivery driver makes separate trips for each item. If you order 50 items, they make 50 trips (very slow!).

- **HTTP/2**: Delivery driver loads all 50 items in one truck and delivers in one trip (much faster!).

- **HTTP/3**: Each item is delivered by its own drone. If one drone fails, the other 49 items still arrive on time (most reliable!).

For a website loading 100 resources, HTTP/3 can be **4x faster** than HTTP/1.1, especially on mobile networks!"

**Visual Performance Example:**

```javascript
// Loading a webpage with 10 resources

// HTTP/1.1: Sequential (with 6 parallel connections)
Time: 0ms    500ms   1000ms   1500ms   2000ms
      |-------|-------|--------|--------|
Conn1:[setup][res1].........[res7]
Conn2:[setup][res2].........[res8]
Conn3:[setup][res3].........[res9]
Conn4:[setup][res4].........[res10]
Conn5:[setup][res5]
Conn6:[setup][res6]
Total: 2,000ms


// HTTP/2: All resources on one connection
Time: 0ms    500ms   1000ms   1500ms   2000ms
      |-------|-------|--------|--------|
Conn1:[setup][res1-10 all at once!]
Total: 800ms (2.5x faster!)


// HTTP/3: Even faster setup + no blocking
Time: 0ms    500ms   1000ms   1500ms   2000ms
      |-------|-------|--------|--------|
Conn1:[instant][res1-10 all at once!]
Total: 500ms (4x faster!)
```

**Interview Answer Template:**

"HTTP has evolved through three major versions:

**HTTP/1.1** was the standard for 20 years but has limitations - it processes requests serially or with limited parallelism. Browsers work around this by opening multiple connections, but that wastes bandwidth on repeated handshakes.

**HTTP/2** solves this with multiplexing - all requests share one connection, like fitting multiple letters in one envelope instead of sending 100 separate envelopes. It also compresses headers, which saves bandwidth. The main benefit is loading modern websites with 100+ resources much faster.

**HTTP/3** fixes HTTP/2's remaining problem - TCP head-of-line blocking. It uses QUIC over UDP instead of TCP, so if one packet is lost, other streams aren't blocked. It's like having independent delivery for each resource instead of one truck with everything.

For a modern single-page app, migrating from HTTP/1.1 to HTTP/2 can improve load times by 50-70%, and HTTP/3 adds another 20-30% improvement on mobile networks."

</details>

### Resources

- [HTTP/2 RFC 7540](https://tools.ietf.org/html/rfc7540)
- [HTTP/3 RFC 9114](https://www.rfc-editor.org/rfc/rfc9114.html)
- [Can I Use HTTP/2](https://caniuse.com/http2)
- [Can I Use HTTP/3](https://caniuse.com/http3)

---
