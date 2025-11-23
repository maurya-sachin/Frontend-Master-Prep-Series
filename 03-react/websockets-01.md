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

## 🔍 Deep Dive: WebSocket Lifecycle and Cleanup Patterns

### WebSocket Connection States

The WebSocket API defines four connection states:

1. **CONNECTING (0)**: Socket created, handshake in progress
2. **OPEN (1)**: Connection established, data exchange active
3. **CLOSING (2)**: Close handshake initiated, no more messages accepted
4. **CLOSED (3)**: Connection fully closed

Understanding these states prevents errors like trying to send data on a closed socket:

```javascript
const sendMessage = (msg) => {
  // CRITICAL: Check readyState before sending
  if (ws.readyState !== WebSocket.OPEN) {
    console.warn('Socket not ready. Current state:', ws.readyState);
    return false;
  }
  ws.send(msg);
  return true;
};
```

### The Critical Cleanup Problem

This is WRONG and causes memory leaks:

```javascript
// ❌ WRONG: WebSocket never closes properly
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');
  ws.onmessage = (e) => setMessages(prev => [...prev, e.data]);
  // No cleanup! Connection persists after unmount
}, []);
```

**Why it's broken:**
- Component unmounts but WebSocket stays open (memory leak)
- If component remounts, new WebSocket created → resource leak
- Multiple open connections fighting each other
- Browser keeps reconnecting automatically (depending on server)

**The Fix:**

```javascript
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');

  ws.onmessage = (e) => {
    setMessages(prev => [...prev, e.data]);
  };

  // Cleanup function runs on unmount
  return () => {
    if (ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING) {
      ws.close(1000, 'Component unmount'); // 1000 = normal closure
    }
  };
}, []);
```

### UseRef Pattern for Stable References

The issue with storing ws in state:

```javascript
// ❌ PROBLEMATIC: ws stored in state
const [ws, setWs] = useState(null);

useEffect(() => {
  const socket = new WebSocket('ws://localhost:8080');
  setWs(socket); // Triggers re-render

  socket.onmessage = (e) => setMessages(...);
}, []);
```

**Problem**: Setting `ws` in state triggers re-render, which can cause unexpected behavior. Use `useRef` instead:

```javascript
// ✅ CORRECT: ws in useRef for stable reference
import { useEffect, useState, useRef } from 'react';

function ChatComponent() {
  const wsRef = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    wsRef.current = ws;

    ws.onmessage = (e) => {
      setMessages(prev => [...prev, e.data]);
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(msg);
    }
  };

  return (...);
}
```

### Advanced Cleanup Scenarios

**Scenario 1: Multiple event handlers preventing garbage collection**

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

Without removing listeners, the WebSocket holds references to callback functions, preventing garbage collection.

**Scenario 2: Race conditions with async state updates**

```javascript
// ❌ WRONG: State update on unmounted component
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');

  ws.onmessage = (e) => {
    setMessages(prev => [...prev, e.data]); // Can fire after unmount!
  };

  return () => ws.close();
}, []);

// ✅ CORRECT: Use mounted flag
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');
  let isMounted = true;

  ws.onmessage = (e) => {
    if (isMounted) {
      setMessages(prev => [...prev, e.data]);
    }
  };

  return () => {
    isMounted = false;
    ws.close();
  };
}, []);
```

### Socket.io Integration (Abstraction Layer)

Socket.io handles many lifecycle complexities automatically:

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

Socket.io advantages:
- Automatic reconnection with backoff
- Fallback transports (polling if WebSocket unavailable)
- Message queuing during disconnections
- Built-in acknowledgments

---

## 🐛 Real-World Scenario: Connection Stability and Memory Leaks

### Production Issue: Memory Leak in Chat Application

**Metrics:**
- Initial heap: 45 MB
- After 1 hour of user navigation: 285 MB (6.3x increase)
- After 24 hours: 1.8 GB (crashes on tab)
- Symptom: Browser tab becomes unresponsive when navigating between pages

### Root Cause Analysis

Developer's code:

```javascript
// ChatList.jsx - List of chat conversations
function ChatList() {
  useEffect(() => {
    const ws = new WebSocket('ws://api.example.com/chats');

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setChats(prev => [...prev, data]);
    };

    // FORGOT cleanup! User navigates away, component unmounts
    // WebSocket stays open, listener still active
  }, []);

  return <div>{chats.map(chat => <ChatRoom key={chat.id} {...chat} />)}</div>;
}

// ChatRoom.jsx - Individual chat room (rendered 20 times)
function ChatRoom({ id }) {
  useEffect(() => {
    const ws = new WebSocket(`ws://api.example.com/room/${id}`);

    ws.onmessage = (e) => {
      // This closure captures 'id' and createsclosure chain
      setMessages(prev => [...prev, e.data]);
    };

    // No cleanup - 20 WebSocket connections left open!
  }, [id]);

  return <div>{messages.map(m => <Message {...m} />)}</div>;
}
```

**What happens:**
1. User opens chat list → ChatList mounts (1 WebSocket open)
2. User clicks into 5 conversations → 5 ChatRoom components mount (5 WebSockets open)
3. User navigates to home → All components unmount BUT WebSockets stay open (6 total)
4. User opens chat again → 6 old + 6 new = 12 WebSockets now open
5. After 10 page navigations: 60+ WebSocket connections open
6. Browser crashes

### Debugging Steps

**Step 1: Identify connection count**

```javascript
// In DevTools Console
const count = performance.getEntriesByType('resource')
  .filter(r => r.name.includes('ws://'))
  .length;
console.log('Open connections:', count);
```

**Step 2: Check memory timeline**

```javascript
// Chrome DevTools Memory tab:
// 1. Take heap snapshot before navigation
// 2. Navigate away
// 3. Take heap snapshot after navigation
// 4. Comparison shows detached WebSocket objects still in memory
```

**Step 3: Find unclosed listeners**

```javascript
// In browser console
if (window.WebSocket) {
  const OrigWS = window.WebSocket;
  let count = 0;
  window.WebSocket = function(...args) {
    count++;
    const ws = new OrigWS(...args);
    console.log(`WebSocket #${count} created:`, args[0]);

    const originalClose = ws.close.bind(ws);
    ws.close = function() {
      console.log(`WebSocket #${count} closed`);
      return originalClose();
    };

    return ws;
  };
}
// Now navigate - see which connections open/close
```

### Solution: Proper Cleanup

```javascript
// ChatRoom.jsx - FIXED
import { useEffect, useState, useRef } from 'react';

function ChatRoom({ id }) {
  const wsRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const ws = new WebSocket(`ws://api.example.com/room/${id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`Room ${id} connected`);
    };

    ws.onmessage = (e) => {
      if (isMountedRef.current) { // Prevent state update on unmounted component
        setMessages(prev => [...prev, JSON.parse(e.data)]);
      }
    };

    ws.onerror = (error) => {
      console.error(`Room ${id} error:`, error);
    };

    ws.onclose = () => {
      console.log(`Room ${id} disconnected`);
    };

    // CRITICAL CLEANUP
    return () => {
      isMountedRef.current = false;

      if (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Component unmount');
      }

      wsRef.current = null;
    };
  }, [id]); // Re-run if room ID changes

  return (
    <div>
      {messages.map((m, idx) => <Message key={idx} {...m} />)}
    </div>
  );
}
```

### Verification After Fix

**Metrics after fix:**
- Initial heap: 45 MB
- After 1 hour of navigation: 52 MB (no leak!)
- Connection count: Always exactly equal to active ChatRoom components
- User happiness: Restored!

**Monitoring in production:**

```javascript
// Custom hook for connection monitoring
function useWebSocketMonitor() {
  useEffect(() => {
    const interval = setInterval(() => {
      const openConnections = document.querySelectorAll('[data-ws-connection]').length;
      const heapSize = performance.memory?.usedJSHeapSize / 1048576; // MB

      // Send to analytics
      window.analytics?.track('ws_stats', {
        connections: openConnections,
        heap_mb: heapSize,
        timestamp: new Date().toISOString()
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);
}
```

---

## ⚖️ Trade-offs: WebSockets vs Polling vs Server-Sent Events (SSE)

### Comparison Matrix

| Feature | WebSocket | Polling | SSE |
|---------|-----------|---------|-----|
| **Connection** | Persistent bidirectional | New HTTP request each poll | Persistent unidirectional |
| **Latency** | <100ms | 500ms-5s (depends on poll interval) | <100ms (like WebSocket) |
| **Data Direction** | Client ↔ Server | Client → Server only | Server → Client only |
| **CPU Usage** | Low (no repeated connections) | High (constant reconnects) | Low |
| **Memory** | ~50KB per connection | Minimal per request | ~30KB per connection |
| **Browser Support** | IE 10+ | All browsers | IE not supported (Edge yes) |
| **Firewall Issues** | Can be blocked | HTTP only (usually allowed) | HTTP only |
| **Scalability** | Need connection pooling | Scales easier (stateless) | Need connection pooling |
| **Complexity** | Medium (lifecycle management) | Low | Low |
| **Best For** | Real-time bidirectional (chat, gaming) | Legacy systems, high latency tolerance | Server → client only (notifications, feed) |

### Decision Framework

**Use WebSocket when:**
```javascript
// ✅ Chat applications (bidirectional, real-time)
// ✅ Multiplayer games (low latency, frequent updates)
// ✅ Collaborative tools (shared editing, cursor positions)
// ✅ Live trading platforms (high frequency updates)
// ✅ Interactive whiteboards (instant visual feedback)

const WEBSOCKET_SCENARIOS = {
  chat: { frequency: '100-500 msgs/min', latency: '<100ms', direction: 'both' },
  gaming: { frequency: '60-120 updates/sec', latency: '<50ms', direction: 'both' },
  whiteboard: { frequency: '100-1000 events/sec', latency: '<50ms', direction: 'both' }
};
```

**Use Polling when:**
```javascript
// ✅ Legacy browser support (IE 8/9)
// ✅ Behind restrictive firewalls (only HTTP allowed)
// ✅ Infrequent updates (check once per minute)
// ✅ Stateless server requirement
// ✅ Simple REST API existing

const POLLING_SCENARIOS = {
  mailCheck: { frequency: '1 check/min', tolerance: '1-5 min delay' },
  legacyApp: { browserSupport: 'IE9', requirement: 'stateless server' },
  notification: { frequency: 'few per hour', tolerance: 'minutes delay' }
};
```

**Use SSE when:**
```javascript
// ✅ Server-to-client only (stock ticker, notifications)
// ✅ Lower complexity than WebSocket
// ✅ Auto-reconnection built-in
// ✅ HTTP/2 multiplexing benefits
// ✅ Firewall-friendly (standard HTTP)

const SSE_SCENARIOS = {
  notifications: { direction: 'server→client', frequency: 'sporadic' },
  stockTicker: { direction: 'server→client', frequency: '1-5 updates/sec' },
  activityFeed: { direction: 'server→client', frequency: '1-10 updates/min' }
};
```

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

---

## 💬 Explain to Junior: WebSocket Integration Made Simple

### Mental Model: Think of a Telephone Call

**HTTP (Polling):**
```
You: "Hello? Any updates?"
Server: "No"
[Hang up]
---
[5 seconds later]
You: "Hello? Any updates?"
Server: "Yes, you got a message!"
[Hang up]
```
Every check requires a new call. Wasteful if updates are rare, but works with old phones (old browsers).

**WebSocket:**
```
You: "I'm calling and staying on the line"
[Connection established]
You: "Send me updates whenever they happen"
Server: "Got it! New message just came in!"
---
[Instantly, no new call needed]
You: "Send me a response"
[Back and forth, same call]
```
Like leaving the phone line open. Updates arrive instantly. But uses more resources if not many calls made.

**SSE:**
```
You: "I'm staying on the line. Send me notifications one-way"
Server: "New notification!"
Server: "Another notification!"
Server: "Another notification!"
[You can't respond on this line, need separate call]
```

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

### Interview Answer Template

**Question: "Explain how you'd implement WebSocket in a React chat app"**

**Good Answer:**
"I'd use the `useEffect` hook to manage the WebSocket lifecycle. When the component mounts, I create a new WebSocket connection and attach event listeners for `onopen`, `onmessage`, `onerror`, and `onclose`. I store the WebSocket in a `useRef` to maintain a stable reference across renders.

When messages arrive, I update the component state with the new message. Critically, I return a cleanup function from the `useEffect` that closes the WebSocket and removes any listeners when the component unmounts. This prevents memory leaks and dangling connections.

For sending messages, I check if the socket is in the `OPEN` state before attempting to send, avoiding errors when the connection isn't ready yet.

For more reliability, I'd consider using Socket.io which handles reconnection logic, fallback transports, and message queuing automatically. I'd also implement a `reconnect` mechanism with exponential backoff if using plain WebSockets for production."

**Great Answer** (includes edge cases):
"Beyond basic setup, I'd handle several production concerns:

1. **Reconnection**: Implement exponential backoff (1s, 2s, 4s, 8s...) with max retries
2. **Memory leaks**: Use a mounted flag to prevent state updates after unmount
3. **Message queuing**: Queue messages sent while disconnected, send when reconnected
4. **Type safety**: Use TypeScript interfaces for message types
5. **Testing**: Mock WebSocket in tests using jest.mock()
6. **Performance**: Consider batching updates if receiving high-frequency messages

I'd probably use Socket.io or a similar library for production since it handles most of this automatically and provides a better developer experience."

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

## 🔍 Deep Dive: Advanced Reconnection Strategies and State Management

### Exponential Backoff Algorithm Analysis

The exponential backoff strategy prevents hammering the server with repeated connection attempts:

```javascript
// Simple exponential backoff
const calculateBackoff = (attemptCount) => {
  const baseDelay = 1000; // 1 second
  const delay = baseDelay * Math.pow(2, attemptCount);
  const maxDelay = 32000; // 32 seconds max
  return Math.min(delay, maxDelay);
};

// With jitter (randomness to prevent thundering herd)
const calculateBackoffWithJitter = (attemptCount) => {
  const baseDelay = 1000;
  const exponentialDelay = Math.min(
    baseDelay * Math.pow(2, attemptCount),
    32000
  );
  // Add random jitter: ±20% of calculated delay
  const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
  return exponentialDelay + jitter;
};

// Attempt timeline:
// Attempt 1: ~1000ms (1s)
// Attempt 2: ~2000ms (2s)
// Attempt 3: ~4000ms (4s)
// Attempt 4: ~8000ms (8s)
// Attempt 5: ~16000ms (16s)
// Attempt 6+: ~32000ms (max 32s)
```

**Why this matters:**

If all 1000 clients disconnected simultaneously and immediately reconnected, the server would receive 1000 connection requests at the same millisecond, causing thundering herd problem. With exponential backoff spread over 30+ seconds, server load distributes naturally.

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

## 🐛 Real-World Scenario: Production WebSocket Failures and Solutions

### Case Study: Multiplayer Game Disconnect Crisis

**Background:**
- Real-time multiplayer game with 500-1000 concurrent players
- Each player connected via WebSocket to Node.js server
- Players report: frequent disconnects, sudden position jumps, stuck at login

**Metrics:**
- Disconnect rate: 15% per session (expected: <2%)
- Average session length: 4 minutes (expected: 20+ minutes)
- Error logs: 50,000+ reconnection failures per day

### Root Cause Analysis

**Issue #1: No heartbeat mechanism**

```javascript
// ORIGINAL CODE - No heartbeat
useEffect(() => {
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    const state = JSON.parse(event.data);
    updateGameState(state);
  };

  return () => ws.close();
}, []);
```

**Problem**: Browser loses network temporarily (WiFi dropout) → WebSocket closes → onclose fires → component unmounts on bad reconnection attempt → game crashes

**Solution**: Implement heartbeat to detect connection health early

```javascript
useEffect(() => {
  const ws = new WebSocket(wsUrl);
  let heartbeatMissed = 0;

  ws.onopen = () => {
    // Ping server every 15 seconds
    heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        heartbeatMissed++;

        // If 3 pings unanswered, force reconnect
        if (heartbeatMissed >= 3) {
          console.log('Heartbeat failed, reconnecting');
          ws.close();
        }
      }
    }, 15000);
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'pong') {
      heartbeatMissed = 0; // Reset counter
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

---

## ⚖️ Trade-offs: WebSocket vs Server-Sent Events (SSE) vs Long Polling

### Detailed Comparison for Game Architecture

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

## 💬 Explain to Junior: WebSocket Reconnection Made Simple

### The Problem WebSocket Reconnection Solves

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

