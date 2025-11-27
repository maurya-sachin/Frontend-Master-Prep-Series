# WebSockets with React

## Question 1: How to integrate WebSockets with React?

**Main Answer:**

Integrating WebSockets with React requires establishing a persistent bidirectional connection while managing React's component lifecycle. The primary pattern uses `useEffect` to create the connection when the component mounts and clean up when it unmounts.

```javascript
import { useEffect, useState } from 'react';

function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('Disconnected');
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []); // Empty dependency array - run once on mount

  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  };

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <ul>
        {messages.map((msg, idx) => <li key={idx}>{msg}</li>)}
      </ul>
      <button onClick={() => sendMessage('Hello')}>Send</button>
    </div>
  );
}
```

The key principle is: **WebSocket instance must persist across re-renders** but be created/destroyed with component lifecycle. Store the WebSocket reference outside state (in useEffect closure or via useRef) to avoid recreating it on every render.

---

### 🔍 Deep Dive: WebSocket Lifecycle and React Integration Architecture

<details>
<summary><strong>🔍 Deep Dive: WebSocket Lifecycle and React Integration Architecture</strong></summary>

**WebSocket Protocol Fundamentals and State Management**

The WebSocket protocol operates through a precise lifecycle that React developers must understand to prevent memory leaks, connection failures, and state synchronization issues. The WebSocket API defines four distinct connection states represented by numeric constants: CONNECTING (0), OPEN (1), CLOSING (2), and CLOSED (3). Each state has critical implications for how React components should interact with the connection.

When a WebSocket is instantiated with `new WebSocket(url)`, it immediately enters the CONNECTING state and begins the HTTP upgrade handshake. During this phase, which typically lasts 50-200ms depending on network latency, the socket cannot send or receive messages. Attempting to call `ws.send()` during CONNECTING will throw an InvalidStateError. The connection transitions to OPEN only after the server responds with the 101 Switching Protocols status code, completing the handshake.

The OPEN state is where bidirectional communication occurs. Messages can be sent and received freely, and the connection remains persistent until explicitly closed or interrupted. When `ws.close()` is called, the socket enters CLOSING state while negotiating the close handshake with the server. Finally, it reaches CLOSED state once both sides acknowledge the termination. Understanding these transitions is crucial because React components may unmount at any point in this lifecycle.

**The Critical Cleanup Problem in React Contexts**

One of the most common and dangerous mistakes in React WebSocket integration is failing to implement proper cleanup. Consider this broken pattern:

```javascript
// ❌ WRONG: Memory leak nightmare
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');
  ws.onmessage = (e) => setMessages(prev => [...prev, e.data]);
  // No cleanup! Connection persists after unmount
}, []);
```

This code creates a cascading failure scenario. When the component unmounts (user navigates away, parent re-renders, or component is conditionally hidden), the WebSocket instance remains in memory with all its event listeners intact. If the component remounts, a new WebSocket is created, leaving the old one orphaned. After 10 page navigations, you have 10 active WebSocket connections consuming memory and bandwidth, all receiving and processing messages for components that no longer exist.

The consequences are severe: browser heap grows from 45MB to 285MB in an hour, event listeners fire setState calls on unmounted components (triggering React warnings), and the server maintains unnecessary connections. In production, this manifests as users reporting "the app gets slower the longer I use it" – classic memory leak symptoms.

**The Correct Cleanup Pattern**

Proper cleanup requires returning a function from useEffect that closes the WebSocket and removes event listeners:

```javascript
// ✅ CORRECT: Proper cleanup
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');

  ws.onmessage = (e) => {
    setMessages(prev => [...prev, e.data]);
  };

  // Cleanup function runs on unmount
  return () => {
    if (ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING) {
      ws.close(1000, 'Component unmount'); // 1000 = normal closure code
    }
  };
}, []);
```

The cleanup function checks readyState before closing because calling `close()` on an already CLOSED socket throws an error. The status code 1000 indicates normal closure, which prevents the server from logging it as an abnormal disconnect.

**UseRef vs useState for WebSocket Storage**

Storing the WebSocket instance in state is a common beginner mistake:

```javascript
// ❌ PROBLEMATIC: Causes unnecessary re-renders
const [ws, setWs] = useState(null);

useEffect(() => {
  const socket = new WebSocket('ws://localhost:8080');
  setWs(socket); // Triggers re-render when socket is ready
  socket.onmessage = (e) => setMessages(e.data);
}, []);
```

The problem: setting `ws` in state triggers a re-render, which is unnecessary since the WebSocket instance itself doesn't need to be part of the render output. This creates subtle timing bugs where message handlers might reference stale closures or miss messages during the re-render cycle.

The solution is useRef, which provides a mutable container that persists across renders without triggering updates:

```javascript
// ✅ CORRECT: Stable reference with useRef
const wsRef = useRef(null);

useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');
  wsRef.current = ws; // No re-render

  ws.onmessage = (e) => {
    setMessages(prev => [...prev, e.data]);
  };

  return () => ws.close();
}, []);

const sendMessage = (msg) => {
  if (wsRef.current?.readyState === WebSocket.OPEN) {
    wsRef.current.send(msg);
  }
};
```

**Advanced Cleanup: Preventing Memory Leaks from Event Listeners**

When using addEventListener instead of property assignment, you must explicitly remove listeners to prevent memory leaks:

```javascript
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');

  const handleMessage = (e) => setMessages(prev => [...prev, e.data]);
  const handleError = (e) => console.error(e);
  const handleClose = () => setConnected(false);

  ws.addEventListener('message', handleMessage);
  ws.addEventListener('error', handleError);
  ws.addEventListener('close', handleClose);

  return () => {
    // MUST remove all listeners before closing
    ws.removeEventListener('message', handleMessage);
    ws.removeEventListener('error', handleError);
    ws.removeEventListener('close', handleClose);
    ws.close();
  };
}, []);
```

Without removeEventListener, the WebSocket object holds references to the callback functions, which in turn hold references to React's state setters and component scope. This prevents garbage collection of the entire component tree.

**Race Conditions with Async State Updates**

A subtle but critical issue occurs when messages arrive after component unmount:

```javascript
// ❌ WRONG: State update on unmounted component
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');

  ws.onmessage = (e) => {
    setMessages(prev => [...prev, e.data]); // Can fire after unmount!
  };

  return () => ws.close();
}, []);
```

The problem: closing the socket is asynchronous. Messages in the receive buffer can trigger onmessage after the cleanup function starts, causing React's "Can't perform a React state update on an unmounted component" warning.

The solution is an isMounted flag:

```javascript
// ✅ CORRECT: Use mounted flag
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');
  let isMounted = true;

  ws.onmessage = (e) => {
    if (isMounted) { // Guard against post-unmount updates
      setMessages(prev => [...prev, e.data]);
    }
  };

  return () => {
    isMounted = false; // Set flag first
    ws.close(); // Then close connection
  };
}, []);
```

**Socket.io Integration: Abstraction Benefits**

For production applications, Socket.io provides a higher-level abstraction that handles many lifecycle complexities automatically:

```javascript
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

function ChatWithSocketIO() {
  const socketRef = useRef(null);

  useEffect(() => {
    // Socket.io auto-reconnects on disconnect
    socketRef.current = io('http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('Connected:', socketRef.current.id);
    });

    socketRef.current.on('message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (...);
}
```

Socket.io advantages include automatic reconnection with exponential backoff, fallback transports (polling if WebSocket unavailable), message queuing during disconnections, and built-in acknowledgments. For simple use cases or when you need maximum control, raw WebSockets suffice. For production chat, real-time collaboration, or multiplayer games, Socket.io's battle-tested abstractions save development time and prevent subtle bugs

</details>

---

### 🐛 Real-World Scenario: Production Memory Leak Crisis in Enterprise Chat Application

<details>
<summary><strong>🐛 Real-World Scenario: Production Memory Leak Crisis in Enterprise Chat Application</strong></summary>

**Production Issue: Catastrophic Memory Leak in SaaS Chat Platform**

**Background and Initial Symptoms**

A mid-sized SaaS company launched a real-time chat feature for their project management platform, serving 50,000 daily active users. Within two weeks of launch, support tickets flooded in with complaints about browser tabs becoming "incredibly slow" and eventually crashing after extended use. The engineering team initially dismissed these as isolated browser issues until metrics revealed the severity.

**Critical Production Metrics:**
- Initial heap size on page load: 45 MB (normal baseline)
- After 1 hour of normal user navigation: 285 MB (6.3x increase, alarming)
- After 4 hours of continuous use: 780 MB (17x baseline)
- After 24 hours (power users who keep tabs open): 1.8 GB, then browser crash
- Symptom frequency: 23% of users experienced slowdowns, 8% experienced crashes
- Connection count anomaly: Backend logs showed 150,000 active WebSocket connections for only 12,000 concurrent users (12.5x multiplier)
- Browser CPU usage: Spiked from 8% to 45% after 2 hours of tab being open
- User retention impact: 15% decrease in daily active users within 3 weeks of launch

**Root Cause Analysis and Code Forensics**

The engineering team performed heap snapshots and discovered the smoking gun. The developer had implemented WebSocket connections in React components without proper cleanup:

```javascript
// ChatList.jsx - List of chat conversations (BROKEN CODE)
function ChatList() {
  useEffect(() => {
    const ws = new WebSocket('ws://api.example.com/chats');

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setChats(prev => [...prev, data]);
    };

    // CRITICAL BUG: No cleanup! User navigates away, component unmounts
    // WebSocket stays open, listener still active, consuming memory
  }, []);

  return <div>{chats.map(chat => <ChatRoom key={chat.id} {...chat} />)}</div>;
}

// ChatRoom.jsx - Individual chat room (BROKEN CODE)
function ChatRoom({ id }) {
  useEffect(() => {
    const ws = new WebSocket(`ws://api.example.com/room/${id}`);

    ws.onmessage = (e) => {
      // This closure captures 'id' and creates closure chain
      // preventing garbage collection of entire component tree
      setMessages(prev => [...prev, e.data]);
    };

    // CRITICAL BUG: No cleanup - 20+ WebSocket connections left open per session!
  }, [id]);

  return <div>{messages.map(m => <Message {...m} />)}</div>;
}
```

**The Cascade Failure Sequence:**

1. **Initial State**: User opens chat list → ChatList mounts (1 WebSocket open, heap: 48MB)
2. **Conversation Opening**: User clicks into 5 conversations → 5 ChatRoom components mount (6 WebSockets total, heap: 62MB)
3. **Navigation Leak**: User navigates to dashboard → All components unmount BUT WebSockets stay open (6 orphaned connections, heap: 75MB)
4. **Leak Accumulation**: User opens chat again → 6 old orphaned + 6 new = 12 WebSockets now consuming memory (heap: 95MB)
5. **Cascade Multiplier**: After 10 page navigations: 60+ active WebSocket connections open simultaneously (heap: 285MB)
6. **System Failure**: After 50 navigations: 300+ connections, heap exhausted (1.8GB), browser tab crashes with "Out of Memory" error

**Why This Went Undetected in Development:**

- QA testers only used the app for 10-15 minutes per session (not enough time for leak to manifest)
- Local development servers were reset frequently, masking the cumulative effect
- Chrome DevTools Memory tab wasn't part of standard testing protocol
- Load testing focused on backend performance, not frontend memory consumption
- Production users kept tabs open for 8+ hours (power users), exposing the leak

**Systematic Debugging Process**

The debugging team followed a methodical approach to identify and isolate the leak:

**Step 1: Quantify Active Connection Count**

```javascript
// Injected into production bundle via Chrome DevTools Console
const monitorConnections = setInterval(() => {
  const count = performance.getEntriesByType('resource')
    .filter(r => r.name.includes('ws://'))
    .length;
  console.log(`[${new Date().toISOString()}] Open WebSocket connections: ${count}`);
}, 5000); // Log every 5 seconds

// Results showed connection count growing monotonically:
// T+0min: 6 connections (expected)
// T+30min: 42 connections (alarming - should be 6)
// T+60min: 78 connections (critical leak confirmed)
```

**Step 2: Heap Snapshot Analysis**

Using Chrome DevTools Memory tab:
1. Took heap snapshot before navigation (Snapshot A)
2. User navigated to different page
3. Took heap snapshot after navigation (Snapshot B)
4. Compared snapshots: Showed 6 detached WebSocket objects with 1.2MB retained size each
5. Expanded detached objects: Each held references to React component closures, preventing garbage collection

**Step 3: WebSocket Lifecycle Instrumentation**

Wrapped the native WebSocket constructor to trace creation and destruction:

```javascript
// Monkey-patch injected via browser extension for debugging
if (window.WebSocket) {
  const OriginalWebSocket = window.WebSocket;
  let socketIdCounter = 0;
  const activeSockets = new Set();

  window.WebSocket = function(...args) {
    const socketId = ++socketIdCounter;
    const ws = new OriginalWebSocket(...args);
    activeSockets.add(socketId);

    console.log(`%c[WS #${socketId}] Created: ${args[0]}`, 'color: green');

    const originalClose = ws.close.bind(ws);
    ws.close = function(...closeArgs) {
      activeSockets.delete(socketId);
      console.log(`%c[WS #${socketId}] Closed. Active count: ${activeSockets.size}`, 'color: red');
      return originalClose(...closeArgs);
    };

    ws.addEventListener('error', () => {
      console.error(`[WS #${socketId}] Error occurred`);
    });

    return ws;
  };

  // Log active sockets every 10 seconds
  setInterval(() => {
    console.log(`Active WebSockets: ${activeSockets.size}`, activeSockets);
  }, 10000);
}
```

This instrumentation revealed sockets were created but **never** closed during navigation, confirming the missing cleanup bug

</details>

---

### 🐛 Real-World Scenario: Multiplayer Gaming Platform Reconnection Nightmare

<details>
<summary><strong>🐛 Real-World Scenario: Multiplayer Gaming Platform Reconnection Nightmare</strong></summary>

**Solution Implementation: Comprehensive Cleanup Strategy**

The team refactored all WebSocket-using components to include proper cleanup:

```javascript
// ChatRoom.jsx - FIXED with production-grade cleanup
import { useEffect, useState, useRef } from 'react';

function ChatRoom({ id }) {
  const wsRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const ws = new WebSocket(`ws://api.example.com/room/${id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[ChatRoom ${id}] WebSocket connected`);
    };

    ws.onmessage = (e) => {
      // Guard against race condition: message arrives after unmount
      if (isMountedRef.current) {
        setMessages(prev => [...prev, JSON.parse(e.data)]);
      }
    };

    ws.onerror = (error) => {
      console.error(`[ChatRoom ${id}] WebSocket error:`, error);
    };

    ws.onclose = () => {
      console.log(`[ChatRoom ${id}] WebSocket disconnected`);
    };

    // CRITICAL CLEANUP - This is what was missing!
    return () => {
      isMountedRef.current = false; // Set flag first to prevent state updates

      // Close socket if still open or connecting
      if (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Component unmount'); // 1000 = normal closure
      }

      wsRef.current = null; // Clear reference to aid garbage collection
    };
  }, [id]); // Re-run if room ID changes (close old connection, open new one)

  return (
    <div>
      {messages.map((m, idx) => <Message key={idx} {...m} />)}
    </div>
  );
}
```

**Verification Metrics After Fix:**
- Initial heap: 45 MB (unchanged baseline)
- After 1 hour of heavy navigation: 52 MB (7MB increase, within normal variance)
- After 8 hours continuous use: 68 MB (23MB increase, stable - no leak)
- Connection count: Always exactly equal to number of mounted ChatRoom components (1:1 ratio)
- Browser CPU usage: Stable 8-12% (down from 45%)
- User crash rate: 0.02% (down from 8%, residual crashes from unrelated issues)
- Backend WebSocket connections: 12,000 for 12,000 users (1:1 ratio restored)
- User satisfaction: Support tickets dropped 94% within 48 hours of deploy
- User retention: Recovered to pre-launch levels within one week

**Production Monitoring Implementation:**

The team also implemented ongoing monitoring to catch similar issues early:

```javascript
// Custom hook for real-time WebSocket health monitoring
function useWebSocketHealthMonitor() {
  useEffect(() => {
    const interval = setInterval(() => {
      const activeConnections = window.activeWSConnections?.size || 0; // Tracked via instrumentation
      const heapSizeMB = performance.memory?.usedJSHeapSize / 1048576; // MB
      const componentCount = document.querySelectorAll('[data-ws-component]').length;

      // Send metrics to analytics platform
      window.analytics?.track('websocket_health', {
        active_connections: activeConnections,
        heap_mb: heapSizeMB,
        ws_components: componentCount,
        ratio: activeConnections / Math.max(componentCount, 1), // Should be ~1.0
        timestamp: new Date().toISOString(),
        user_id: window.currentUser?.id
      });

      // Alert if anomaly detected
      if (activeConnections > componentCount * 1.5) {
        console.error(`WebSocket leak detected! ${activeConnections} connections for ${componentCount} components`);
        window.analytics?.track('websocket_leak_alert', {
          connections: activeConnections,
          components: componentCount
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);
}
```

**Key Learnings and Best Practices Established:**

1. **Mandatory Code Review Checklist**: All WebSocket integrations must include cleanup function
2. **Automated Testing**: Added Puppeteer tests that navigate 20 times and measure heap growth
3. **Monitoring Dashboards**: Real-time WebSocket health metrics visible to engineering team
4. **Developer Education**: Internal tech talk on React lifecycle and cleanup patterns
5. **Memory Profiling**: Made heap snapshot analysis part of standard QA workflow before production deploys

</details>

---

### ⚖️ Trade-offs: Choosing the Right Real-Time Communication Strategy

<details>
<summary><strong>⚖️ Trade-offs: Choosing the Right Real-Time Communication Strategy</strong></summary>

**WebSockets vs Polling vs Server-Sent Events: Architecture Decision Framework**

Selecting the appropriate real-time communication technology for React applications requires analyzing multiple dimensions: latency requirements, data flow direction, infrastructure constraints, browser compatibility, and operational costs. Each approach presents distinct trade-offs that directly impact user experience, development complexity, and system scalability.

**Comprehensive Technology Comparison Matrix**

| Dimension | WebSocket | Long Polling | Server-Sent Events (SSE) |
|-----------|-----------|--------------|--------------------------|
| **Connection Type** | Persistent bidirectional TCP | Repeated HTTP requests | Persistent unidirectional HTTP |
| **Typical Latency** | 20-100ms | 500ms-5s (poll interval dependent) | 50-150ms |
| **Data Flow** | Client ↔ Server (both directions) | Client → Server queries only | Server → Client pushes only |
| **CPU Overhead** | Low (event-driven) | High (constant request cycles) | Low (event-driven) |
| **Memory per Connection** | ~50KB (persistent buffer) | ~5KB (transient, per request) | ~30KB (persistent buffer) |
| **Browser Support** | IE 10+, all modern browsers | Universal (even IE 6) | All modern (IE not supported) |
| **Mobile Battery Impact** | Efficient (persistent connection) | Very poor (constant wakeups) | Efficient (persistent connection) |
| **Firewall/Proxy Issues** | Often blocked on port 80/443 | Rarely blocked (standard HTTP) | Rarely blocked (standard HTTP) |
| **Horizontal Scalability** | Complex (sticky sessions or message bus) | Simple (stateless) | Complex (sticky sessions) |
| **Message Ordering** | Guaranteed | Not guaranteed | Guaranteed |
| **Bandwidth Overhead** | ~2 bytes per frame | ~800 bytes HTTP headers per request | ~50-100 bytes per message |
| **Reconnection Complexity** | Manual exponential backoff needed | Built into polling loop | Auto-reconnect built-in |
| **Development Complexity** | High (lifecycle, cleanup, reconnection) | Low (simple fetch loop) | Medium (event handling) |
| **Ideal Use Cases** | Chat, gaming, collaboration, trading | Legacy systems, rare updates | Notifications, live feeds, dashboards |

**Detailed Decision Framework and Selection Criteria**

**Choose WebSocket When:**

The application demands true bidirectional real-time communication with latency sensitivity:

```javascript
// ✅ Ideal WebSocket scenarios
const WEBSOCKET_USE_CASES = {
  instantMessaging: {
    frequency: '100-500 messages/min per user',
    latency: '<100ms (users expect instant delivery)',
    direction: 'bidirectional (send/receive chat)',
    justification: 'User perception: delays >200ms feel "laggy"'
  },

  multiplayerGaming: {
    frequency: '60-120 game state updates/second',
    latency: '<50ms (competitive gaming standard)',
    direction: 'bidirectional (player input + world state)',
    justification: 'Frame-perfect synchronization required'
  },

  collaborativeEditing: {
    frequency: '100-1000 keystroke events/sec (peak)',
    latency: '<100ms (cursor position sync)',
    direction: 'bidirectional (local edits + remote changes)',
    justification: 'Google Docs-style real-time collaboration'
  },

  financialTrading: {
    frequency: '50-200 price updates/sec',
    latency: '<20ms (high-frequency trading)',
    direction: 'bidirectional (orders + market data)',
    justification: 'Milliseconds = money in trading contexts'
  },

  liveVideoStreaming: {
    frequency: '30-60 frames/sec metadata',
    latency: '<150ms (acceptable for live interaction)',
    direction: 'bidirectional (viewer reactions + stream control)',
    justification: 'Twitch/YouTube Live-style interactivity'
  }
};
```

**Choose Long Polling When:**

Legacy constraints or infrequent updates make WebSocket overhead unnecessary:

```javascript
// ✅ Ideal Long Polling scenarios
const POLLING_USE_CASES = {
  legacyBrowserSupport: {
    constraint: 'Must support IE 8/9 (no WebSocket)',
    frequency: '1 request/5-10 seconds',
    tolerance: '5-10 second delay acceptable',
    justification: 'Enterprise environments with old browser mandates'
  },

  restrictiveFirewalls: {
    constraint: 'Corporate firewall blocks WebSocket (non-HTTP)',
    frequency: 'Variable based on need',
    tolerance: 'Seconds of delay acceptable',
    justification: 'Banking/government networks with strict policies'
  },

  infrequentUpdates: {
    frequency: '1 check/minute or less',
    example: 'Email inbox check, calendar sync',
    tolerance: '1-5 minute delay acceptable',
    justification: 'WebSocket overhead not worth persistent connection'
  },

  statelessInfrastructure: {
    constraint: 'Serverless architecture (AWS Lambda, Cloudflare Workers)',
    frequency: 'On-demand queries',
    tolerance: 'Seconds acceptable',
    justification: 'Lambda cannot maintain persistent connections'
  },

  simpleRESTIntegration: {
    constraint: 'Existing REST API, avoid new infrastructure',
    frequency: 'Periodic data refresh',
    tolerance: 'Eventual consistency acceptable',
    justification: 'Minimal development effort, reuse existing endpoints'
  }
};
```

**Choose Server-Sent Events (SSE) When:**

Only server-to-client push is needed, with simpler implementation than WebSocket:

```javascript
// ✅ Ideal SSE scenarios
const SSE_USE_CASES = {
  liveNotifications: {
    direction: 'server → client only',
    frequency: 'Sporadic (1-10 per hour)',
    example: 'Push notifications, system alerts',
    justification: 'Auto-reconnection built-in, simpler than WebSocket'
  },

  stockTickerDashboard: {
    direction: 'server → client (price updates)',
    frequency: '1-5 updates/second per stock',
    example: 'Bloomberg Terminal-style dashboard',
    justification: 'HTTP/2 multiplexing efficient for multiple SSE streams'
  },

  activityFeedUpdates: {
    direction: 'server → client (new posts/comments)',
    frequency: '1-10 updates/minute',
    example: 'Twitter/LinkedIn feed updates',
    justification: 'EventSource API simpler than WebSocket lifecycle'
  },

  serverLogStreaming: {
    direction: 'server → client (log lines)',
    frequency: 'Continuous stream (10-100 lines/sec)',
    example: 'Real-time log viewer, monitoring dashboard',
    justification: 'Text-based streaming, no client-to-server needed'
  },

  progressUpdates: {
    direction: 'server → client (task progress)',
    frequency: '1-2 updates/second during active task',
    example: 'File upload progress, report generation status',
    justification: 'Automatic reconnection on network hiccups'
  }
};
```

**Performance Comparison: Real Infrastructure Costs (1000 Concurrent Users)**

Testing scenario: 1000 users, updates every 5 seconds for 1 hour

**WebSocket Infrastructure:**
- Server memory: 1000 connections × 50KB = 50MB RAM
- Bandwidth: 1000 users × 0.5KB/update × 720 updates/hour = 360MB/hour
- CPU load: 8-12% (event-driven, minimal processing)
- Server cost (AWS t3.medium): ~$30/month
- Advantages: Lowest latency (45ms avg), lowest bandwidth
- Disadvantages: Complex deployment (sticky sessions or Redis pub/sub)

**Long Polling Infrastructure:**
- Server memory: Minimal (stateless, <10MB)
- Bandwidth: 1000 users × 3KB/request (HTTP headers) × 720 requests/hour = 2.1GB/hour
- CPU load: 35-50% (constant request processing overhead)
- Server cost (AWS t3.large): ~$60/month (need more CPU)
- Mobile battery drain: 6x higher than WebSocket (constant radio wakeups)
- Advantages: Simple stateless deployment, works everywhere
- Disadvantages: High bandwidth costs, poor mobile UX, latency 2-5 seconds

**Server-Sent Events (SSE) Infrastructure:**
- Server memory: 1000 connections × 30KB = 30MB RAM
- Bandwidth: 1000 users × 0.4KB/update × 720 updates/hour = 288MB/hour
- CPU load: 10-15% (slightly higher than WebSocket due to HTTP overhead)
- Server cost (AWS t3.small): ~$15/month
- Advantages: Lowest cost, simplest implementation, auto-reconnect
- Disadvantages: Server→client only (need separate POST for client→server)

### Performance Comparison: Real Metrics

**Scenario: 100 concurrent users receiving updates every 5 seconds**

**WebSocket Implementation:**
```javascript
// Server load: CPU 15%, Memory 250MB (100 persistent connections)
// Bandwidth per user: 0.5 KB/sec (binary frames)
// Latency: 45ms average
```

**Polling Implementation (5 second interval):**
```javascript
// Server load: CPU 45%, Memory 150MB (stateless, request/response only)
// Bandwidth per user: 2.5 KB/sec (HTTP headers overhead)
// Latency: 2.5 second average + server response time
// Power consumption: 6x higher on mobile devices
```

**SSE Implementation:**
```javascript
// Server load: CPU 12%, Memory 200MB (100 persistent connections)
// Bandwidth per user: 0.4 KB/sec (HTTP headers cheaper than WebSocket)
// Latency: 60ms average
// Unidirectional only
```

### Hybrid Approach: Best of Both Worlds

```javascript
function SmartConnection({ direction = 'both', frequency = 'high' }) {
  const wsRef = useRef(null);
  const [useWebSocket, setUseWebSocket] = useState(true);

  useEffect(() => {
    // Detect if WebSocket supported and working
    const testWS = new WebSocket('ws://localhost:8080');

    testWS.onopen = () => {
      setUseWebSocket(true);
      testWS.close();
    };

    testWS.onerror = () => {
      // Firewall/browser issue - fallback to polling
      setUseWebSocket(false);
    };

    testWS.onclose = () => {
      // Ensure cleanup
    };

    const timeout = setTimeout(() => {
      testWS.close();
      setUseWebSocket(false); // Fallback if no response in 5s
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (useWebSocket) {
      wsRef.current = new WebSocket('ws://localhost:8080');
      wsRef.current.onmessage = (e) => handleMessage(e.data);
      return () => wsRef.current.close();
    } else {
      // Fallback to polling
      const interval = setInterval(() => {
        fetch('/api/updates').then(r => r.json()).then(handleMessage);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [useWebSocket]);

  return (...);
}
```

</details>

---

### 💬 Explain to Junior: WebSocket Integration Simplified for Beginners

<details>
<summary><strong>💬 Explain to Junior: WebSocket Integration Simplified for Beginners</strong></summary>

**Understanding Real-Time Communication with Simple Analogies**

**The Telephone Call Analogy: Three Communication Styles**

Imagine three different ways to stay in touch with a friend who might have news for you:

**HTTP Polling (Calling Repeatedly):**
```
You: "Hello? Any updates?"
Friend: "No, nothing new"
[Hang up phone]
---
[Wait 5 seconds]
You: "Hello? Any updates NOW?"
Friend: "Nope, still nothing"
[Hang up]
---
[Wait 5 more seconds]
You: "Hello? Anything?"
Friend: "YES! I have news!"
[Finally get the update]
[Hang up]
```

This is like calling your friend every few seconds to ask if they have news. It's inefficient (lots of calls with "no news" answers), but it works with any phone system, even old rotary phones. In web terms: works in every browser, even Internet Explorer 6, but wastes bandwidth and battery.

**WebSocket (Leaving Line Open):**
```
You: "I'm calling and staying on the line. Tell me updates instantly."
Friend: "Okay, I'll stay on too!"
[Connection stays active]
---
[Friend has news]
Friend: "Hey! Just got news for you!"
You: "Thanks! Here's my response..."
Friend: "Got it! Here's more..."
[Conversation continues instantly, both directions]
[Eventually]
You: "Okay, I'm hanging up now. Bye!"
```

This is like leaving the phone line open continuously. Updates arrive the instant they happen (no waiting for the next "check call"), and both people can talk freely. But if you're not actually chatting much, you're wasting the phone line just keeping it open. In web terms: fastest, most efficient for active communication, but requires both sides to maintain the connection.

**Server-Sent Events / SSE (Leaving Line Open, One Direction):**
```
You: "I'm staying on the line. You talk, I'll listen."
Friend: "Okay! Update number 1..."
Friend: "Update number 2..."
Friend: "Update number 3..."
[You can't respond on this line]
---
[If you want to say something]
You must: Hang up, make a NEW call to send your message, then re-establish the listening line
```

This is like a radio broadcast where the server (your friend) can push updates to you continuously, but you need a separate channel (HTTP POST request) to respond. Simpler than WebSocket because it's one-way, but still efficient for receiving updates.

**Why We Need the Cleanup in React**

Imagine you have a phone call open (WebSocket connection). You walk away from your computer (component unmounts) but **forget to hang up the phone**. The line stays open, using resources. If you come back and start a NEW call (component remounts), now you have TWO phone lines open to the same friend! After doing this 10 times, you have 10 phone lines open simultaneously, and your phone bill (memory usage) is astronomical.

In React terms:
```javascript
// ❌ WRONG: Forgot to "hang up the phone"
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');
  ws.onmessage = (e) => setMessages([...messages, e.data]);
  // No cleanup = phone line stays open forever!
}, []);

// ✅ CORRECT: Properly "hang up" when leaving
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');
  ws.onmessage = (e) => setMessages(prev => [...prev, e.data]);

  return () => {
    ws.close(); // "Hang up the phone" when component unmounts
  };
}, []);
```

**The Critical "Phone States" (WebSocket readyState)**

A phone call goes through states:
1. **CONNECTING (dialing)**: You've picked up the phone and are dialing. Can't talk yet.
2. **OPEN (connected)**: Friend answered! You can talk now.
3. **CLOSING (saying goodbye)**: You said "bye", waiting for friend to acknowledge.
4. **CLOSED (hung up)**: Call completely ended.

In code:
```javascript
const sendMessage = (message) => {
  // Check if "phone line is connected" before trying to talk
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(message); // ✅ Safe to send
  } else {
    console.warn("Can't send - not connected!");
    // Maybe queue the message to send later?
  }
};
```

If you try to send a message while the phone is still "dialing" (CONNECTING), it fails. You must wait for the "friend to pick up" (onopen event fires).

### Simple WebSocket Pattern for Beginners

```javascript
import { useEffect, useState } from 'react';

function SimpleChat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    // Step 1: Create connection
    const ws = new WebSocket('ws://localhost:8080');

    // Step 2: Connection opened
    ws.onopen = () => {
      setStatus('Connected!');
    };

    // Step 3: Received message
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };

    // Step 4: Error occurred
    ws.onerror = () => {
      setStatus('Error!');
    };

    // Step 5: Connection closed
    ws.onclose = () => {
      setStatus('Disconnected');
    };

    // Step 6: Cleanup when component removed
    return () => {
      ws.close();
    };
  }, []);

  // Send message function
  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
      setMessage('');
    }
  };

  return (
    <div>
      <p>Status: {status}</p>

      <div>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default SimpleChat;
```

</details>

---

### 🔍 Deep Dive: Production-Grade Reconnection Architecture and State Machines

<details>
<summary><strong>🔍 Deep Dive: Production-Grade Reconnection Architecture and State Machines</strong></summary>

**What each part does:**
1. `ws.onopen` = "Connection ready!"
2. `ws.onmessage` = "Got a message from server"
3. `ws.onerror` = "Something broke"
4. `ws.onclose` = "Connection ended"
5. `return () => ws.close()` = "Clean up when component dies"

### Common Beginner Mistakes (And How to Avoid Them)

**Mistake 1: Forgetting to close WebSocket**
```javascript
// ❌ WRONG
useEffect(() => {
  const ws = new WebSocket('ws://...');
  ws.onmessage = (...) => { ... };
}, []);

// ✅ RIGHT
useEffect(() => {
  const ws = new WebSocket('ws://...');
  ws.onmessage = (...) => { ... };
  return () => ws.close(); // Don't forget!
}, []);
```

**Mistake 2: Checking if ready before sending**
```javascript
// ❌ WRONG - Crashes if not connected
useEffect(() => {
  const ws = new WebSocket('ws://...');
  ws.send('Hello'); // Might not be ready yet!
}, []);

// ✅ RIGHT - Check first
const send = () => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send('Hello');
  }
};
```

**Mistake 3: Storing WebSocket in state**
```javascript
// ❌ WRONG - Causes re-renders
const [ws, setWs] = useState(null);
useEffect(() => {
  const socket = new WebSocket('ws://...');
  setWs(socket); // Triggers re-render!
}, []);

// ✅ RIGHT - Use useRef
const wsRef = useRef(null);
useEffect(() => {
  wsRef.current = new WebSocket('ws://...');
}, []);
```

**Interview Answer Templates for WebSocket Questions**

**Question: "Explain how you'd implement WebSocket in a React chat app"**

**Good Answer (Junior-Mid Level):**

"I'd use the `useEffect` hook to manage the WebSocket lifecycle. When the component mounts, I create a new WebSocket connection using `new WebSocket(url)` and set up event listeners:
- `onopen`: When connection succeeds, update state to show 'Connected'
- `onmessage`: When a message arrives, append it to the messages array in state
- `onerror`: Log errors for debugging
- `onclose`: Update state to show 'Disconnected'

I'd store the WebSocket reference in `useRef` instead of state, because the instance itself doesn't need to trigger re-renders. The important part is returning a cleanup function from useEffect that calls `ws.close()` when the component unmounts. This prevents memory leaks where old connections stay open even after the user navigates away.

For sending messages, I check `ws.readyState === WebSocket.OPEN` before calling `ws.send()` to avoid errors when the connection isn't ready."

**Great Answer (Senior Level, includes production concerns):**

"Beyond the basic useEffect setup, I'd implement several production-grade concerns:

1. **Proper Cleanup with Race Condition Prevention**: Use an `isMounted` ref flag to prevent state updates after unmount. Close the WebSocket in the cleanup function, checking readyState first to avoid errors on already-closed sockets.

2. **Reconnection Strategy**: Implement exponential backoff (1s, 2s, 4s, 8s, up to 30s max) with jitter to prevent thundering herd when all clients reconnect simultaneously. Track retry count and reset to 0 on successful reconnection.

3. **Message Queuing**: Queue messages sent while disconnected, then flush the queue when connection re-establishes. This prevents data loss during network hiccups.

4. **Heartbeat/Ping Mechanism**: Send periodic pings every 30 seconds to detect dead connections early, before the browser times out.

5. **Monitoring**: Track connection health metrics (connection count, reconnect attempts, queue depth) and send to analytics for operational visibility.

6. **Library Consideration**: For production, I'd evaluate Socket.io which handles reconnection, fallback transports, room management, and acknowledgments automatically. For simple use cases or maximum control, raw WebSockets work well.

The key insight is that WebSocket integration is 20% connection logic and 80% handling failure modes gracefully."

**Question: "What's the most common mistake when using WebSockets in React?"**

**Perfect Answer:**

"The most common mistake is forgetting to close the WebSocket in the useEffect cleanup function. This causes a severe memory leak where every time the component unmounts and remounts, a new WebSocket connection is created but the old ones are never closed. After 10 navigations, you have 10 active connections consuming memory and bandwidth.

I've seen this crash production apps where power users keep tabs open for 8+ hours. The browser heap grows from 45MB to over 1GB, eventually crashing the tab.

The fix is simple: always return a cleanup function from useEffect that closes the WebSocket. Also guard state updates with an `isMounted` flag to prevent race conditions where messages arrive after unmount."

</details>

---

## Question 2: How to handle WebSocket connection management and reconnection?

**Main Answer:**

Connection management requires handling multiple states: connecting, connected, reconnecting, and disconnected. Implement exponential backoff reconnection logic to avoid overwhelming the server while ensuring clients eventually reconnect after temporary network failures.

```javascript
import { useEffect, useRef, useState } from 'react';

const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting'
};

function ManagedWebSocket() {
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const [status, setStatus] = useState(CONNECTION_STATES.DISCONNECTED);
  const [messages, setMessages] = useState([]);
  const reconnectCountRef = useRef(0);
  const messageQueueRef = useRef([]);

  const calculateBackoff = () => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max)
    return Math.min(1000 * Math.pow(2, reconnectCountRef.current), 16000);
  };

  const connect = () => {
    if (status === CONNECTION_STATES.CONNECTING) return;

    setStatus(CONNECTION_STATES.CONNECTING);

    try {
      const ws = new WebSocket('ws://localhost:8080');

      ws.onopen = () => {
        setStatus(CONNECTION_STATES.CONNECTED);
        reconnectCountRef.current = 0;

        // Flush queued messages
        while (messageQueueRef.current.length > 0) {
          const msg = messageQueueRef.current.shift();
          ws.send(msg);
        }
      };

      ws.onmessage = (event) => {
        setMessages(prev => [...prev, event.data]);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        setStatus(CONNECTION_STATES.DISCONNECTED);
        scheduleReconnect();
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
    }

    const delay = calculateBackoff();
    reconnectCountRef.current++;

    setStatus(CONNECTION_STATES.RECONNECTING);
    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current})`);

    reconnectRef.current = setTimeout(() => {
      connect();
    }, delay);
  };

  const sendMessage = (message) => {
    if (status === CONNECTION_STATES.CONNECTED && wsRef.current) {
      wsRef.current.send(message);
    } else {
      // Queue message if not connected
      messageQueueRef.current.push(message);
      console.warn('Message queued, not connected');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
      }
    };
  }, []);

  return (
    <div>
      <p>Status: {status}</p>
      <p>Messages: {messages.length}</p>
      <button onClick={() => sendMessage('Test')}>Send Message</button>
    </div>
  );
}

export default ManagedWebSocket;
```

The key components are: **exponential backoff calculation**, **message queueing during disconnection**, **proper state tracking**, and **cleanup on unmount**.

---

### 🔍 Deep Dive: Production-Grade Reconnection Architecture and State Machines

**Exponential Backoff: The Mathematics and Psychology of Reconnection**

WebSocket reconnection strategies must balance two competing concerns: reconnecting quickly enough to maintain good user experience, while avoiding server overwhelm during mass disconnection events. The exponential backoff algorithm solves this through progressively increasing delays that distribute reconnection load naturally.

**Core Exponential Backoff Implementation**

The fundamental exponential backoff formula is: `delay = min(baseDelay × 2^attemptCount, maxDelay)`. This creates a geometric progression where each successive retry waits twice as long as the previous attempt, capped at a maximum to prevent indefinite delays.

```javascript
// Production-grade exponential backoff with jitter
const calculateBackoffWithJitter = (attemptCount, baseDelay = 1000, maxDelay = 32000) => {
  // Exponential calculation: 1s → 2s → 4s → 8s → 16s → 32s (cap)
  const exponentialDelay = baseDelay * Math.pow(2, attemptCount);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  // Add jitter: random ±20% variation to prevent thundering herd
  // If delay is 8000ms, jitter adds/subtracts 0-1600ms
  const jitterRange = cappedDelay * 0.2;
  const jitter = (Math.random() - 0.5) * jitterRange;

  return Math.max(0, cappedDelay + jitter); // Ensure non-negative
};

// Reconnection timeline for baseDelay=1000ms, maxDelay=32000ms:
// Attempt 1: ~1000ms ± 200ms (range: 800-1200ms)
// Attempt 2: ~2000ms ± 400ms (range: 1600-2400ms)
// Attempt 3: ~4000ms ± 800ms (range: 3200-4800ms)
// Attempt 4: ~8000ms ± 1600ms (range: 6400-9600ms)
// Attempt 5: ~16000ms ± 3200ms (range: 12800-19200ms)
// Attempt 6+: ~32000ms ± 6400ms (range: 25600-38400ms, capped)
```

**Why Jitter is Critical: The Thundering Herd Problem**

Without jitter, all clients disconnected simultaneously would retry at identical intervals, creating synchronized load spikes. Consider a server restart scenario affecting 10,000 concurrent WebSocket users:

**Without jitter (synchronized retries):**
- T+0s: Server restarts, all 10,000 clients disconnect
- T+1s: All 10,000 clients retry simultaneously → server receives 10,000 connection requests in 1ms
- Server overwhelmed → refuses connections → all clients fail
- T+2s: All 10,000 clients retry again simultaneously → server still overwhelmed
- Cascade failure continues for minutes

**With jitter (distributed retries):**
- T+0s: Server restarts, all 10,000 clients disconnect
- T+1s ±200ms: 10,000 clients retry spread over 400ms window (800ms-1200ms)
- Server receives ~25 requests/ms (10,000 / 400ms) → manageable load
- ~7,000 clients reconnect successfully
- Remaining 3,000 clients back off to 2s ±400ms (further distribution)
- All clients reconnected within 10 seconds without overwhelming server

**Advanced State Machine Approach for Reliability**

Production applications often model WebSocket connections as formal state machines to prevent invalid transitions and edge case bugs:

```javascript
// State machine representation
const WS_STATES = {
  IDLE: 'idle',               // Initial state before first connection
  CONNECTING: 'connecting',   // Connection handshake in progress
  CONNECTED: 'connected',     // Active bidirectional communication
  RECONNECTING: 'reconnecting', // Scheduled reconnection pending
  DISCONNECTED: 'disconnected', // Cleanly closed connection
  FAILED: 'failed'            // Max retries exceeded, giving up
};

// Valid state transitions (prevents bugs from invalid transitions)
const VALID_TRANSITIONS = {
  [WS_STATES.IDLE]: [WS_STATES.CONNECTING],
  [WS_STATES.CONNECTING]: [WS_STATES.CONNECTED, WS_STATES.RECONNECTING, WS_STATES.FAILED],
  [WS_STATES.CONNECTED]: [WS_STATES.DISCONNECTED, WS_STATES.RECONNECTING],
  [WS_STATES.RECONNECTING]: [WS_STATES.CONNECTING, WS_STATES.FAILED],
  [WS_STATES.DISCONNECTED]: [WS_STATES.RECONNECTING, WS_STATES.IDLE],
  [WS_STATES.FAILED]: [WS_STATES.IDLE] // Allow manual reset
};

function useWebSocketStateMachine(url, maxRetries = 10) {
  const [state, setState] = useState(WS_STATES.IDLE);
  const [retryCount, setRetryCount] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const transitionTo = useCallback((newState) => {
    const validNext = VALID_TRANSITIONS[state];
    if (!validNext.includes(newState)) {
      console.error(`Invalid state transition: ${state} → ${newState}`);
      return false;
    }
    setState(newState);
    return true;
  }, [state]);

  const connect = useCallback(() => {
    if (!transitionTo(WS_STATES.CONNECTING)) return;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      transitionTo(WS_STATES.CONNECTED);
      setRetryCount(0); // Reset retry counter on success
    };

    ws.onclose = () => {
      if (retryCount >= maxRetries) {
        transitionTo(WS_STATES.FAILED);
        return;
      }

      transitionTo(WS_STATES.RECONNECTING);
      const delay = calculateBackoffWithJitter(retryCount);
      setRetryCount(prev => prev + 1);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };

    wsRef.current = ws;
  }, [url, retryCount, maxRetries, transitionTo]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return { state, retryCount, connect };
}
```

**Heartbeat Mechanism for Proactive Dead Connection Detection**

Network failures don't always trigger immediate `onclose` events. Connections can enter "half-open" states where the client thinks it's connected but the server has dropped the connection (or vice versa). Heartbeats detect this:

```javascript
function useWebSocketWithHeartbeat(url, heartbeatInterval = 30000) {
  const wsRef = useRef(null);
  const heartbeatTimeoutRef = useRef(null);
  const missedPings = useRef(0);
  const MAX_MISSED_PINGS = 3;

  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      missedPings.current++;

      // If 3 pings unanswered, connection is dead
      if (missedPings.current >= MAX_MISSED_PINGS) {
        console.warn('Heartbeat failed, forcing reconnect');
        wsRef.current.close(); // Trigger reconnection logic
      }
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      // Start heartbeat after connection established
      heartbeatTimeoutRef.current = setInterval(sendHeartbeat, heartbeatInterval);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'pong') {
        missedPings.current = 0; // Reset counter on successful pong
      } else {
        // Handle regular messages
        handleMessage(msg);
      }
    };

    ws.onclose = () => {
      clearInterval(heartbeatTimeoutRef.current); // Stop heartbeat
      // Trigger reconnection...
    };

    wsRef.current = ws;

    return () => {
      clearInterval(heartbeatTimeoutRef.current);
      ws.close();
    };
  }, [url]);

  return wsRef;
}
```

Heartbeats detect dead connections 30-60 seconds faster than relying on TCP timeouts (which can take 2-10 minutes), dramatically improving perceived responsiveness when network issues occur

### Full-Featured Reconnection Hook

```javascript
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  url: string;
  maxReconnectAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

function useWebSocketWithReconnect({
  url,
  maxReconnectAttempts = 10,
  baseDelay = 1000,
  maxDelay = 32000,
  onMessage,
  onConnect,
  onDisconnect,
  onError
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const messageQueueRef = useRef<string[]>([]);

  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);

  const calculateBackoff = useCallback((attemptCount: number) => {
    const exponentialDelay = baseDelay * Math.pow(2, attemptCount);
    const cappedDelay = Math.min(exponentialDelay, maxDelay);
    // Add jitter
    const jitter = cappedDelay * 0.1 * Math.random();
    return cappedDelay + jitter;
  }, [baseDelay, maxDelay]);

  const flushMessageQueue = useCallback(() => {
    while (messageQueueRef.current.length > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
      const message = messageQueueRef.current.shift();
      wsRef.current.send(message!);
    }
  }, []);

  const connect = useCallback(() => {
    if (status === 'connecting') return;

    if (!isMountedRef.current) return;

    setStatus('connecting');
    setLastError(null);

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        if (!isMountedRef.current) {
          ws.close();
          return;
        }

        setStatus('connected');
        reconnectCountRef.current = 0;
        onConnect?.();

        // Flush queued messages
        flushMessageQueue();
      };

      ws.onmessage = (event) => {
        if (isMountedRef.current) {
          try {
            const data = JSON.parse(event.data);
            onMessage?.(data);
          } catch (e) {
            // Raw message if not JSON
            onMessage?.(event.data);
          }
        }
      };

      ws.onerror = (error) => {
        if (isMountedRef.current) {
          setLastError('WebSocket error occurred');
          onError?.(error);
        }
      };

      ws.onclose = (event) => {
        if (!isMountedRef.current) return;

        setStatus('disconnected');
        onDisconnect?.();

        // Don't reconnect if normal closure
        if (event.code !== 1000) {
          scheduleReconnect();
        }
      };

      wsRef.current = ws;
    } catch (error) {
      if (isMountedRef.current) {
        setLastError(`Connection failed: ${String(error)}`);
        scheduleReconnect();
      }
    }
  }, [url, status, onConnect, onMessage, onError, onDisconnect, flushMessageQueue]);

  const scheduleReconnect = useCallback(() => {
    if (!isMountedRef.current) return;

    if (reconnectCountRef.current >= maxReconnectAttempts) {
      setLastError('Max reconnection attempts reached');
      setStatus('disconnected');
      return;
    }

    const delay = calculateBackoff(reconnectCountRef.current);
    reconnectCountRef.current++;

    setStatus('reconnecting');
    console.log(`Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectCountRef.current})`);

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [maxReconnectAttempts, calculateBackoff, connect]);

  const send = useCallback((message: string | object) => {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(payload);
    } else {
      messageQueueRef.current.push(payload);
      console.warn('Message queued: connection not available');
    }
  }, []);

  const disconnect = useCallback(() => {
    isMountedRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      wsRef.current.close(1000, 'User disconnect');
    }

    wsRef.current = null;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    send,
    disconnect,
    lastError,
    isConnected: status === 'connected',
    messageQueueSize: messageQueueRef.current.length
  };
}

export default useWebSocketWithReconnect;
```

### State Machine Approach for Reliability

Some teams model WebSocket states as a formal state machine:

```javascript
import { useReducer, useEffect, useRef, useCallback } from 'react';

const WS_ACTIONS = {
  CONNECT_START: 'CONNECT_START',
  CONNECT_SUCCESS: 'CONNECT_SUCCESS',
  CONNECT_ERROR: 'CONNECT_ERROR',
  DISCONNECT: 'DISCONNECT',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  SCHEDULE_RECONNECT: 'SCHEDULE_RECONNECT',
  RESET: 'RESET'
};

const WS_STATES = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed'
};

const initialState = {
  status: WS_STATES.IDLE,
  reconnectAttempt: 0,
  messages: [],
  error: null,
  lastMessageTime: null
};

function wsReducer(state, action) {
  switch (action.type) {
    case WS_ACTIONS.CONNECT_START:
      return { ...state, status: WS_STATES.CONNECTING, error: null };

    case WS_ACTIONS.CONNECT_SUCCESS:
      return {
        ...state,
        status: WS_STATES.CONNECTED,
        reconnectAttempt: 0,
        error: null,
        lastMessageTime: Date.now()
      };

    case WS_ACTIONS.CONNECT_ERROR:
      return {
        ...state,
        status: WS_STATES.CONNECTING,
        error: action.payload,
        reconnectAttempt: state.reconnectAttempt + 1
      };

    case WS_ACTIONS.MESSAGE_RECEIVED:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        lastMessageTime: Date.now()
      };

    case WS_ACTIONS.SCHEDULE_RECONNECT:
      return {
        ...state,
        status: WS_STATES.RECONNECTING,
        error: action.payload
      };

    case WS_ACTIONS.DISCONNECT:
      return { ...state, status: WS_STATES.DISCONNECTED, reconnectAttempt: 0 };

    case WS_ACTIONS.RESET:
      return initialState;

    default:
      return state;
  }
}

function useWebSocketStateMachine(url) {
  const [state, dispatch] = useReducer(wsReducer, initialState);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    dispatch({ type: WS_ACTIONS.CONNECT_START });

    const ws = new WebSocket(url);

    ws.onopen = () => {
      dispatch({ type: WS_ACTIONS.CONNECT_SUCCESS });
    };

    ws.onmessage = (event) => {
      dispatch({
        type: WS_ACTIONS.MESSAGE_RECEIVED,
        payload: JSON.parse(event.data)
      });
    };

    ws.onerror = (error) => {
      dispatch({
        type: WS_ACTIONS.CONNECT_ERROR,
        payload: error.message
      });
    };

    ws.onclose = () => {
      if (state.reconnectAttempt < 10) {
        const delay = Math.min(1000 * Math.pow(2, state.reconnectAttempt), 32000);

        dispatch({
          type: WS_ACTIONS.SCHEDULE_RECONNECT,
          payload: `Reconnecting in ${delay}ms`
        });

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      } else {
        dispatch({ type: WS_ACTIONS.DISCONNECT });
      }
    };

    wsRef.current = ws;
  }, [url, state.reconnectAttempt]);

  useEffect(() => {
    if (state.status === WS_STATES.IDLE || state.status === WS_STATES.RECONNECTING) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, state.status]);

  return state;
}
```

### Handling Connection Loss Gracefully

Real networks experience many types of failures:

```javascript
function useRobustWebSocket(url) {
  const wsRef = useRef(null);
  const [status, setStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const messageQueueRef = useRef([]);
  const connectionTimeRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  // Heartbeat mechanism to detect dead connections
  const startHeartbeat = useCallback(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Every 30 seconds
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
  }, []);

  // Detect connection timeout
  const resetConnectionTimeout = useCallback(() => {
    if (connectionTimeRef.current) {
      clearTimeout(connectionTimeRef.current);
    }

    connectionTimeRef.current = setTimeout(() => {
      console.warn('Connection inactive for 60s, closing');
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Inactivity timeout');
      }
    }, 60000);
  }, []);

  const connect = useCallback(() => {
    setStatus('connecting');

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setStatus('connected');
        startHeartbeat();
        resetConnectionTimeout();

        // Flush queue
        while (messageQueueRef.current.length > 0) {
          ws.send(messageQueueRef.current.shift());
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'pong') {
          // Heartbeat response - connection alive
          resetConnectionTimeout();
          return;
        }

        setMessages(prev => [...prev, data]);
        resetConnectionTimeout();
      };

      ws.onclose = () => {
        stopHeartbeat();
        setStatus('reconnecting');

        // Exponential backoff reconnect
        setTimeout(connect, Math.min(1000 * Math.pow(2, retries), 32000));
      };

      wsRef.current = ws;
    } catch (error) {
      setStatus('error');
      setTimeout(connect, 1000);
    }
  }, [url, startHeartbeat, stopHeartbeat, resetConnectionTimeout]);

  useEffect(() => {
    connect();

    return () => {
      stopHeartbeat();
      if (connectionTimeRef.current) clearTimeout(connectionTimeRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return { status, messages, wsRef };
}
```

---

### 🐛 Real-World Scenario: Multiplayer Gaming Platform Reconnection Nightmare

**Production Incident: Mass Disconnection Cascade in Real-Time Game**

**Background and Business Impact**

A venture-backed gaming startup launched a real-time multiplayer battle royale game targeting 100,000 concurrent players at peak hours. The game used WebSocket connections for sub-100ms real-time state synchronization (player positions, actions, combat). Within the first week of public beta, the platform experienced catastrophic reconnection failures that threatened the company's viability.

**Critical Production Metrics:**
- **Target** concurrent users: 100,000 peak
- **Actual** stable concurrent users: 8,000-12,000 (88% shortfall)
- **Disconnect rate**: 15% per 5-minute session (expected: <2%)
- **Average session length**: 4.2 minutes (expected: 20-30 minutes for average game)
- **Player retention** (D1): 18% (industry standard: 40-60%)
- **Error logs**: 50,000+ reconnection failures logged per day
- **Support tickets**: 1,200 complaints/day about "constant disconnects"
- **App Store rating**: Dropped from 4.2 to 2.1 stars in 4 days due to connection issues
- **Churn rate**: 73% of new users never returned after first session
- **Revenue impact**: $180,000/week lost revenue (monetization impossible with unstable connections)

**Root Cause Forensics: Three Catastrophic Failures**

The engineering team conducted extensive debugging using production logs, Chrome DevTools timeline analysis, and network packet inspection. They identified three compounding failures:

**Issue #1: No Heartbeat Mechanism (Silent Connection Death)**

The client code had no proactive health checking:

```javascript
// ❌ ORIGINAL BROKEN CODE - No heartbeat detection
useEffect(() => {
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    const state = JSON.parse(event.data);
    updateGameState(state);
  };

  // Cleanup on unmount
  return () => ws.close();
}, []);
```

**The Problem**: Mobile users on spotty WiFi experienced 5-10 second connection drops. The browser didn't fire `onclose` immediately because TCP keepalive probes take 2-10 minutes to detect dead connections. During this "zombie connection" period:
- Client believed it was connected (readyState = OPEN)
- Server had dropped the socket due to inactivity timeout
- Client sent player actions into the void → actions lost
- User experienced "lag" for 2-5 minutes, then sudden disconnect
- No automatic reconnection → game permanently broken until page refresh

**Measured Impact**: 42% of disconnects were "silent failures" where the connection appeared open but was actually dead.

**The Fix**: Implement bidirectional heartbeat with timeout detection:

```javascript
// ✅ FIXED: Proactive heartbeat monitoring
useEffect(() => {
  const ws = new WebSocket(wsUrl);
  let heartbeatInterval;
  let heartbeatMissed = 0;
  const MAX_MISSED_HEARTBEATS = 3;

  ws.onopen = () => {
    // Send ping every 15 seconds
    heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        heartbeatMissed++;

        // If 3 consecutive pings unanswered, force reconnect
        if (heartbeatMissed >= MAX_MISSED_HEARTBEATS) {
          console.warn('[Heartbeat] No pong received for 45s, forcing reconnect');
          ws.close(4000, 'Heartbeat timeout'); // Custom close code
        }
      }
    }, 15000);
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'pong') {
      heartbeatMissed = 0; // Reset counter - connection alive!
      return;
    }

    updateGameState(msg);
  };

  return () => {
    clearInterval(heartbeatInterval);
    ws.close();
  };
}, []);
```

**Issue #2: Message loss during disconnection**

Players' actions (move, shoot) were lost when connection dropped mid-game.

```javascript
// ORIGINAL CODE - Message loss
const sendAction = (action) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(action));
  } else {
    // Action just drops
    console.warn('Not connected');
  }
};
```

**Solution**: Implement local action queue + server-side deduplication

```javascript
const [actionQueue, setActionQueue] = useState([]);
const actionIdRef = useRef(0);

const queueAction = useCallback((action) => {
  const actionId = actionIdRef.current++;

  const actionWithId = {
    ...action,
    id: actionId,
    timestamp: Date.now()
  };

  setActionQueue(prev => [...prev, actionWithId]);

  if (wsRef.current?.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify(actionWithId));
  }
}, []);

// When connection reestablished
ws.onopen = () => {
  // Resend all pending actions
  actionQueue.forEach(action => {
    ws.send(JSON.stringify(action));
  });

  // Server deduplicates based on action.id
  setActionQueue([]);
};

// Server-side (Node.js)
const processedActionIds = new Set();

ws.on('message', (message) => {
  const action = JSON.parse(message);

  if (processedActionIds.has(action.id)) {
    return; // Already processed, skip duplicate
  }

  processedActionIds.add(action.id);
  // Process action...
});
```

**Issue #3: Aggressive reconnection hammering server**

All 1000 players disconnected due to server maintenance. All tried reconnecting immediately → server overwhelmed → cascade failure for 30 minutes.

```javascript
// FIXED: Exponential backoff with jitter
const maxRetries = 10;
let retryCount = 0;

const scheduleReconnect = () => {
  if (retryCount >= maxRetries) return;

  const baseDelay = 1000;
  const exponentialDelay = baseDelay * Math.pow(2, retryCount);
  const capped = Math.min(exponentialDelay, 30000);

  // Add jitter (random 0-20% of delay)
  const jitter = capped * Math.random() * 0.2;
  const finalDelay = capped + jitter;

  retryCount++;

  console.log(`Reconnecting in ${Math.round(finalDelay)}ms (attempt ${retryCount})`);

  setTimeout(() => {
    ws = new WebSocket(wsUrl);
    // ... setup handlers
  }, finalDelay);
};

ws.onclose = () => {
  scheduleReconnect();
};
```

**Results after fixes:**
- Disconnect rate: 1.2% (mission accomplished!)
- Average session: 45 minutes (2.25x improvement)
- Zero reconnection errors
- Server stays healthy during maintenance windows

### Monitoring WebSocket Health in Production

```javascript
function useWebSocketAnalytics(wsRef) {
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = {
        status: wsRef.current?.readyState || 'unknown',
        messagesQueued: messageQueueRef.current?.length || 0,
        sessionDuration: Date.now() - sessionStartRef.current,
        heartbeatsMissed: heartbeatMissedRef.current,
        reconnectAttempts: reconnectCountRef.current,
        timestamp: new Date().toISOString()
      };

      // Send to analytics service
      fetch('/api/analytics/ws-health', {
        method: 'POST',
        body: JSON.stringify(metrics)
      }).catch(err => console.error('Analytics error:', err));
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);
}

// Dashboard to monitor:
// - Active connections
// - Disconnect rate by region
// - Reconnection success rate
// - Message queue depth
// - Heartbeat failure rate
```

</details>

---

### ⚖️ Trade-offs: WebSocket Reconnection Strategy Selection

<details>
<summary><strong>⚖️ Trade-offs: WebSocket Reconnection Strategy Selection</strong></summary>

**Detailed Comparison for Game Architecture**

| Aspect | WebSocket | SSE | Long Polling |
|--------|-----------|-----|--------------|
| **Setup Complexity** | Medium (bidirectional) | Low (unidirectional) | Very Low |
| **Latency** | <100ms | 100-200ms | 500ms-5s |
| **Bandwidth** | 0.5 KB/msg | 0.8 KB/msg | 3-5 KB/msg (HTTP headers) |
| **Mobile Battery** | Good | Better | Poor (constant reconnects) |
| **Firewall Issues** | Can be blocked | Usually OK | Usually OK |
| **Developer Experience** | More complex lifecycle | Simpler | Simplest |
| **Browser Support** | IE 10+ | IE not supported | All |
| **Connection Overhead** | Low | Low | High |
| **Scalability** | Need connection pooling | Scales naturally | Scales naturally |

### Decision Tree for Game Architecture

```
Game Type?
├── Real-time (gaming, trading)
│   ├── Bidirectional needed? YES → WebSocket
│   └── Server-only updates? NO
├── Push-only (notifications)
│   ├── Bidirectional needed? NO → SSE
│   └── Modern browsers? YES
├── Legacy system
│   └── Only option: Long Polling
└── Hybrid
    └── WebSocket with SSE fallback
```

### Cost Analysis: 1000 Concurrent Users

**WebSocket Infrastructure:**
```
- Connection cost: 1000 × 50KB RAM = 50MB total
- Bandwidth: 1000 × 0.5KB/sec × 60 × 60 = 1.8 GB/hour
- CPU: Low (event-driven)
- Server instances needed: 2-3
- Cost/month: ~$200
```

**SSE Infrastructure:**
```
- Connection cost: 1000 × 30KB RAM = 30MB total
- Bandwidth: 1000 × 0.8KB/sec × 60 × 60 = 2.9 GB/hour
- CPU: Low (event-driven)
- Server instances needed: 2
- Cost/month: ~$150
```

**Long Polling Infrastructure:**
```
- Connection cost: Minimal (stateless)
- Bandwidth: 1000 × 3KB/sec (headers) × 60 × 60 = 10.8 GB/hour
- CPU: High (request handling)
- Server instances needed: 10-15
- Cost/month: ~$1000+
```

### When to Use Each

**WebSocket**:
- Real-time games (latency <100ms critical)
- Collaborative editing (shared cursors)
- Financial trading (high-frequency updates)
- Chat/messaging (bidirectional)
- IoT sensor streams (continuous data)

**SSE**:
- Live notifications
- Activity feeds
- Stock price tickers (one-way updates)
- Log streaming
- Server-sent alerts

**Long Polling**:
- Legacy browser support (IE 8/9)
- Behind restrictive firewalls
- Infrequent updates (<1/minute)
- Simple stateless requirement
- Email/calendar sync (eventual consistency OK)

### Hybrid Approach: Graceful Degradation

```javascript
function useSmartTransport() {
  const [transport, setTransport] = useState(null);

  useEffect(() => {
    // Try WebSocket first
    try {
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        setTransport('websocket');
      };
      ws.onerror = () => {
        // Fallback to SSE
        trySSE();
      };
    } catch (e) {
      trySSE();
    }

    const trySSE = () => {
      try {
        const sse = new EventSource(sseUrl);
        sse.onopen = () => {
          setTransport('sse');
          // Send client actions via REST POST
        };
        sse.onerror = () => {
          // Fallback to polling
          tryPolling();
        };
      } catch (e) {
        tryPolling();
      }
    };

    const tryPolling = () => {
      setTransport('polling');
      // Implement polling logic
    };
  }, []);

  return transport;
}
```

---

### 💬 Explain to Junior: WebSocket Reconnection Made Simple

**The Problem WebSocket Reconnection Solves**

**Without reconnection:**
```
User sitting in browser
↓
WiFi drops for 3 seconds
↓
User can't see messages
↓
Message: "Connection Lost" forever
↓
User closes tab in frustration
```

**With reconnection:**
```
User sitting in browser
↓
WiFi drops for 3 seconds
↓
System detects: "Uh oh, WiFi back!"
↓
Automatically reconnects
↓
Missed messages arrive
↓
User doesn't even notice
```

### Simple Reconnection Pattern

```javascript
import { useEffect, useRef, useState } from 'react';

function ChatWithReconnection() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Disconnected');
  const wsRef = useRef(null);
  const retryRef = useRef(0);

  const connect = () => {
    setStatus('Connecting...');

    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      setStatus('Connected!');
      retryRef.current = 0; // Reset retry counter on success
    };

    ws.onmessage = (e) => {
      setMessages(prev => [...prev, e.data]);
    };

    ws.onclose = () => {
      setStatus('Disconnected - Reconnecting...');

      // Calculate wait time: 1s, 2s, 4s, 8s, etc.
      const waitTime = 1000 * Math.pow(2, retryRef.current);
      const maxWait = 30000; // Never wait more than 30 seconds
      const actualWait = Math.min(waitTime, maxWait);

      retryRef.current++;

      console.log(`Retrying in ${actualWait}ms (attempt ${retryRef.current})`);

      // Try reconnecting after delay
      setTimeout(() => {
        connect();
      }, actualWait);
    };

    wsRef.current = ws;
  };

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div>
      <p>Status: {status}</p>
      <div>{messages.map((m, i) => <p key={i}>{m}</p>)}</div>
    </div>
  );
}

export default ChatWithReconnection;
```

### Understanding Exponential Backoff with Analogy

**Calling a busy friend:**

Bad approach:
```
You: "Hello?"
Friend: "I'm busy"
[Immediately]
You: "Hello?"
Friend: "Still busy!"
[Immediately]
You: "Hello?"
Friend: "STOP CALLING!" [Blocks you]
```

Good approach:
```
You: "Hello?"
Friend: "I'm busy for a few min"
[Wait 1 second]
You: "Hi, free now?"
Friend: "Not yet, maybe 2 min"
[Wait 2 seconds]
You: "How about now?"
Friend: "Getting busy, try 4 min"
[Wait 4 seconds]
You: "Free now?"
Friend: "Yes! Hi!" [Success]
```

The backoff gives them (the server) breathing room to recover.

### Reconnection Strategy Decision Tree

```
Connection lost?
├── Is it temporary? (< 5 seconds)
│   └── Reconnect immediately
├── Is user still on page?
│   └── YES → Reconnect with backoff
│   └── NO → Stop trying
├── How many times failed?
│   ├── 1-5 times → Keep retrying (odds are good)
│   ├── 5-10 times → Still likely temporary
│   ├── 10+ times → Probably server issue, show message to user
└── Has it been 30+ minutes?
    └── Stop retrying (server is definitely down)
```

</details>

---

### 💬 Explain to Junior: WebSocket Reconnection Made Simple

<details>
<summary><strong>💬 Explain to Junior: WebSocket Reconnection Made Simple</strong></summary>

### Interview Answer Template

**Q: "How would you implement WebSocket reconnection?"**

**Good Answer:**
"I'd implement reconnection using exponential backoff. When the WebSocket closes, instead of reconnecting immediately, I wait an increasing amount of time between attempts:
- 1st attempt: 1 second
- 2nd attempt: 2 seconds
- 3rd attempt: 4 seconds
- And so on, up to a maximum like 30 seconds

This prevents overwhelming the server if all clients disconnect at once. I'd also track the retry count and reset it to 0 when successfully reconnected. Finally, I'd queue any messages sent while disconnected and flush them when the connection is re-established.

For production, I'd probably use Socket.io which handles all this automatically with its built-in reconnection logic."

**Great Answer** (mentions advanced patterns):
"Beyond the basic exponential backoff, I'd implement:

1. **Jitter**: Add random variation (±20%) to backoff times to prevent thundering herd problem
2. **Max retry limit**: Stop retrying after 10-15 attempts to avoid forever-loop
3. **Heartbeat detection**: Send periodic pings to detect dead connections early
4. **Message deduplication**: Use message IDs so the server can ignore duplicates from retried messages
5. **Local state preservation**: Queue unsent messages and only clear the queue after server acknowledges

I'd also implement different strategies based on the error:
- Network error (connection refused): Aggressive retry with short backoff
- Server error (500): Back off longer since server needs recovery time
- User action (logout): Stop retrying immediately

For production apps, Socket.io library handles these details, but understanding the underlying mechanisms is important for debugging connection issues."

</details>

### Common Mistakes

**Mistake 1: Immediate reconnect (no backoff)**
```javascript
// ❌ WRONG - Server gets hammered
ws.onclose = () => {
  const newWs = new WebSocket(url); // Immediately reconnect!
};

// ✅ RIGHT - Give server breathing room
ws.onclose = () => {
  setTimeout(() => {
    connect(); // Wait first
  }, 1000 * Math.pow(2, retries));
};
```

**Mistake 2: Infinite retries with no limit**
```javascript
// ❌ WRONG - Browser keeps trying forever
ws.onclose = () => {
  setTimeout(() => {
    connect(); // Will keep trying
  }, calculateBackoff());
};

// ✅ RIGHT - Stop after too many failures
ws.onclose = () => {
  if (retryCount < maxRetries) {
    setTimeout(() => {
      connect();
    }, calculateBackoff());
  } else {
    showError('Cannot reconnect. Please refresh page.');
  }
};
```

**Mistake 3: Not resending queued messages**
```javascript
// ❌ WRONG - Messages sent while offline are lost
const queue = [];
ws.send = (msg) => {
  if (ws.readyState === OPEN) {
    ws.send(msg);
  } else {
    queue.push(msg); // Stuck in queue forever
  }
};

// ✅ RIGHT - Resend queue on reconnect
ws.onopen = () => {
  queue.forEach(msg => ws.send(msg));
  queue.length = 0;
};
```

### Testing Reconnection Locally

```javascript
// Simulate network failure in DevTools Console
// Throttle network to simulate slow connections
// Or force close with: ws.close()

// Mock server response lag
const originalSend = WebSocket.prototype.send;
WebSocket.prototype.send = function(data) {
  console.log('Sending:', data);
  setTimeout(() => {
    originalSend.call(this, data);
  }, 2000); // 2 second delay
};
```

