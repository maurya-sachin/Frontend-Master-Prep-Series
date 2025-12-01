# Web Workers for Heavy Computations

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Companies:** Google, Meta, Amazon, Stripe, Figma
**Time:** 60 minutes

---

## Problem Statement

Implement a system to offload CPU-intensive tasks from the main thread using Web Workers. The main thread should remain responsive while heavy computations (data processing, image manipulation, calculations) run in background threads.

### Requirements

- ✅ Offload CPU-intensive work from main thread
- ✅ Maintain UI responsiveness during computation
- ✅ Handle worker creation and termination
- ✅ Support bidirectional communication (main ↔ worker)
- ✅ Optimize with Transferable Objects for large data
- ✅ Handle errors and timeouts
- ✅ Support multiple concurrent workers
- ✅ Measure performance improvement
- ✅ Support TypeScript
- ✅ Implement with modern frameworks (React)

---

## Main Thread vs Worker Thread Comparison

### Main Thread (Blocking Example)
```javascript
// CPU-intensive calculation on main thread = BLOCKING UI
function processLargeDataset(data) {
  const startTime = performance.now();

  // This blocks UI for 3000ms+
  for (let i = 0; i < data.length; i++) {
    data[i].processed = heavyComputation(data[i]);
    data[i].analyzed = analyzeData(data[i]);
    data[i].transformed = transformData(data[i]);
  }

  const endTime = performance.now();
  console.log(`Blocked UI for ${endTime - startTime}ms`);

  return data;
}

// Result: UI becomes unresponsive, frame rate drops to 0fps
// User sees janky animations, frozen interactions
```

### Worker Thread (Non-blocking Example)
```javascript
// Same computation in Worker = UI stays responsive
const worker = new Worker('worker.js');

worker.postMessage({ data: largeDataset });

// Main thread continues responding to user input
console.log('Processing started, UI still responsive!');

worker.onmessage = (event) => {
  const processedData = event.data;
  console.log(`Processed in background, UI was responsive`);
  updateUI(processedData);
};

// Result: UI stays at 60fps, user interactions instant
// Heavy computation happens silently in background
```

---

## Solution 1: Basic Web Worker

### main.js (Main Thread)
```javascript
class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.taskQueue = [];
    this.activeWorkers = new Set();

    this.initializeWorkers();
  }

  initializeWorkers() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerScript);
      worker.onmessage = this.handleWorkerComplete.bind(this);
      worker.onerror = this.handleWorkerError.bind(this);
      this.workers.push({
        instance: worker,
        busy: false,
        taskId: null
      });
    }
  }

  executeTask(data, transfer = []) {
    return new Promise((resolve, reject) => {
      const task = { data, resolve, reject, transfer };

      // Try to find available worker
      const availableWorker = this.workers.find(w => !w.busy);

      if (availableWorker) {
        this.runTask(availableWorker, task);
      } else {
        // Queue task if no workers available
        this.taskQueue.push(task);
      }
    });
  }

  runTask(workerWrapper, task) {
    const taskId = Math.random();
    workerWrapper.busy = true;
    workerWrapper.taskId = taskId;
    this.activeWorkers.set(taskId, {
      workerWrapper,
      task,
      startTime: performance.now()
    });

    // Send task to worker
    if (task.transfer.length > 0) {
      workerWrapper.instance.postMessage(
        { taskId, data: task.data },
        task.transfer
      );
    } else {
      workerWrapper.instance.postMessage({ taskId, data: task.data });
    }
  }

  handleWorkerComplete(event) {
    const { taskId, result, computationTime } = event.data;
    const taskInfo = this.activeWorkers.get(taskId);

    if (!taskInfo) return;

    const { workerWrapper, task, startTime } = taskInfo;
    const totalTime = performance.now() - startTime;

    console.log(`Task ${taskId}: computation=${computationTime}ms, overhead=${totalTime - computationTime}ms`);

    task.resolve(result);
    this.activeWorkers.delete(taskId);

    workerWrapper.busy = false;
    workerWrapper.taskId = null;

    // Process next queued task
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift();
      this.runTask(workerWrapper, nextTask);
    }
  }

  handleWorkerError(error) {
    console.error('Worker error:', error);
    const taskInfo = Array.from(this.activeWorkers.values()).find(
      info => info.workerWrapper.instance === event.target
    );

    if (taskInfo) {
      taskInfo.task.reject(error);
      this.activeWorkers.delete(taskInfo.workerWrapper.taskId);
    }
  }

  terminate() {
    this.workers.forEach(w => w.instance.terminate());
    this.workers = [];
    this.taskQueue = [];
    this.activeWorkers.clear();
  }
}

// Usage
const workerPool = new WorkerPool('heavy-computation.js', 4);

async function processBigDataset() {
  const largeData = new Array(100000).fill(0).map((_, i) => ({
    id: i,
    value: Math.random(),
    timestamp: Date.now()
  }));

  try {
    // Chunk data for processing
    const chunkSize = 25000;
    const chunks = [];

    for (let i = 0; i < largeData.length; i += chunkSize) {
      chunks.push(largeData.slice(i, i + chunkSize));
    }

    // Process all chunks in parallel
    const startTime = performance.now();
    const results = await Promise.all(
      chunks.map(chunk => workerPool.executeTask(chunk))
    );
    const endTime = performance.now();

    console.log(`All data processed in ${endTime - startTime}ms`);
    console.log(`Results: ${results.flat().length} items processed`);

    return results.flat();
  } catch (error) {
    console.error('Processing failed:', error);
  }
}
```

### worker.js (Worker Thread)
```javascript
// Worker code runs in separate thread
self.onmessage = function(event) {
  const { taskId, data } = event.data;
  const startTime = performance.now();

  try {
    // Heavy computation
    const processed = data.map(item => ({
      ...item,
      processed: performHeavyCalculation(item.value),
      squared: item.value * item.value,
      sqrt: Math.sqrt(item.value),
      log: Math.log(item.value),
      normalized: item.value / 100
    }));

    const computationTime = performance.now() - startTime;

    // Send result back to main thread
    self.postMessage({
      taskId,
      result: processed,
      computationTime
    });
  } catch (error) {
    self.postMessage({
      taskId,
      error: error.message
    });
  }
};

function performHeavyCalculation(value) {
  // Simulate CPU-intensive work
  let result = value;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sin(result) * Math.cos(result);
  }
  return result;
}
```

---

## Solution 2: Web Worker with TypeScript

### types.ts
```typescript
export interface ComputationTask<T> {
  taskId: string;
  data: T;
  priority?: number;
}

export interface ComputationResult<R> {
  taskId: string;
  result?: R;
  error?: string;
  computationTime: number;
}

export interface WorkerMessage<T = any> {
  taskId: string;
  data: T;
  transfer?: Transferable[];
}

export interface WorkerResponse<R = any> {
  taskId: string;
  result?: R;
  error?: string;
  computationTime: number;
}
```

### worker.ts
```typescript
import { WorkerMessage, WorkerResponse } from './types';

interface ImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

// Image processing worker
self.onmessage = async (event: MessageEvent<WorkerMessage<ImageData>>) => {
  const { taskId, data } = event.data;
  const startTime = performance.now();

  try {
    const processed = await processImage(data);
    const computationTime = performance.now() - startTime;

    // Use transfer for large Uint8ClampedArray
    const response: WorkerResponse<ImageData> = {
      taskId,
      result: processed,
      computationTime
    };

    self.postMessage(response, [processed.data.buffer]);
  } catch (error) {
    const response: WorkerResponse = {
      taskId,
      error: error instanceof Error ? error.message : 'Unknown error',
      computationTime: performance.now() - startTime
    };

    self.postMessage(response);
  }
};

async function processImage(imageData: ImageData): Promise<ImageData> {
  const { data, width, height } = imageData;
  const processed = new Uint8ClampedArray(data.length);

  // Apply Gaussian blur filter
  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4;
    const row = Math.floor(pixelIndex / width);
    const col = pixelIndex % width;

    if (row > 0 && row < height - 1 && col > 0 && col < width - 1) {
      // Simple blur kernel
      const kernel = [
        [1, 2, 1],
        [2, 4, 2],
        [1, 2, 1]
      ];

      let r = 0, g = 0, b = 0, a = 0, sum = 16;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const neighborIdx = ((row + ky) * width + (col + kx)) * 4;
          const kWeight = kernel[ky + 1][kx + 1];

          r += data[neighborIdx] * kWeight;
          g += data[neighborIdx + 1] * kWeight;
          b += data[neighborIdx + 2] * kWeight;
          a += data[neighborIdx + 3] * kWeight;
        }
      }

      processed[i] = r / sum;
      processed[i + 1] = g / sum;
      processed[i + 2] = b / sum;
      processed[i + 3] = a / sum;
    } else {
      processed[i] = data[i];
      processed[i + 1] = data[i + 1];
      processed[i + 2] = data[i + 2];
      processed[i + 3] = data[i + 3];
    }
  }

  return { data: processed, width, height };
}
```

### main.ts
```typescript
import { WorkerMessage, WorkerResponse, ComputationTask } from './types';

class TypedWorkerPool<T, R> {
  private workers: Worker[] = [];
  private taskQueue: Array<ComputationTask<T>> = [];
  private pendingTasks: Map<string, {
    resolve: (result: R) => void;
    reject: (error: Error) => void;
    startTime: number;
  }> = new Map();

  constructor(private workerScript: string, poolSize: number = 4) {
    this.initializeWorkers(poolSize);
  }

  private initializeWorkers(poolSize: number) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(new URL(this.workerScript, import.meta.url), {
        type: 'module'
      });

      worker.onmessage = (event: MessageEvent<WorkerResponse<R>>) => {
        this.handleWorkerComplete(event);
      };

      worker.onerror = (error) => {
        console.error('Worker error:', error);
      };

      this.workers.push(worker);
    }
  }

  executeTask(task: ComputationTask<T>, transfer: Transferable[] = []): Promise<R> {
    return new Promise((resolve, reject) => {
      const taskId = task.taskId || Math.random().toString(36).substr(2, 9);

      this.pendingTasks.set(taskId, {
        resolve,
        reject,
        startTime: performance.now()
      });

      // Use round-robin to distribute tasks
      const workerIndex = Math.floor(Math.random() * this.workers.length);
      const worker = this.workers[workerIndex];

      const message: WorkerMessage<T> = {
        taskId,
        data: task.data,
        transfer
      };

      if (transfer.length > 0) {
        worker.postMessage(message, transfer);
      } else {
        worker.postMessage(message);
      }
    });
  }

  private handleWorkerComplete(event: MessageEvent<WorkerResponse<R>>) {
    const { taskId, result, error, computationTime } = event.data;
    const taskInfo = this.pendingTasks.get(taskId);

    if (!taskInfo) return;

    const totalTime = performance.now() - taskInfo.startTime;
    const overhead = totalTime - computationTime;

    console.log(`Task ${taskId}: compute=${computationTime.toFixed(2)}ms, overhead=${overhead.toFixed(2)}ms`);

    if (error) {
      taskInfo.reject(new Error(error));
    } else if (result !== undefined) {
      taskInfo.resolve(result);
    }

    this.pendingTasks.delete(taskId);
  }

  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.pendingTasks.clear();
  }
}

// Usage with TypeScript
interface DataPoint {
  id: number;
  value: number;
  timestamp: number;
}

interface ProcessedPoint extends DataPoint {
  normalized: number;
  smoothed: number;
  anomaly: boolean;
}

const pool = new TypedWorkerPool<DataPoint[], ProcessedPoint[]>('worker.ts', 4);

async function analyzeTimeSeries() {
  const data: DataPoint[] = Array.from({ length: 50000 }, (_, i) => ({
    id: i,
    value: Math.sin(i / 100) * 100 + Math.random() * 10,
    timestamp: Date.now() + i * 1000
  }));

  const result = await pool.executeTask({
    taskId: 'analysis-1',
    data,
    priority: 1
  });

  console.log('Analysis complete:', result);
  return result;
}
```

---

## Solution 3: React Hook (useWebWorker)

### useWebWorker.ts
```typescript
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebWorkerOptions {
  timeout?: number;
  poolSize?: number;
}

interface UseWebWorkerState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useWebWorker<T, R>(
  workerScript: string,
  options: UseWebWorkerOptions = {}
) {
  const { timeout = 30000, poolSize = 4 } = options;
  const [state, setState] = useState<UseWebWorkerState<R>>({
    data: null,
    loading: false,
    error: null
  });

  const poolRef = useRef<WorkerPool<T, R> | null>(null);
  const pendingTasksRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    poolRef.current = new WorkerPool(workerScript, poolSize);

    return () => {
      poolRef.current?.terminate();
      pendingTasksRef.current.forEach(timer => clearTimeout(timer));
      pendingTasksRef.current.clear();
    };
  }, [workerScript, poolSize]);

  const execute = useCallback(
    async (data: T, transfer: Transferable[] = []): Promise<R> => {
      setState({ data: null, loading: true, error: null });

      try {
        const timeoutPromise = new Promise<R>((_, reject) =>
          setTimeout(
            () => reject(new Error('Worker task timeout')),
            timeout
          )
        );

        const taskPromise = poolRef.current!.executeTask(data, transfer);
        const result = await Promise.race([taskPromise, timeoutPromise]);

        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, loading: false, error: err });
        throw err;
      }
    },
    [timeout]
  );

  return { ...state, execute };
}

// Usage in React component
import React, { useCallback } from 'react';

interface CSVData {
  headers: string[];
  rows: string[][];
}

interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
}

export function CSVProcessor() {
  const { data, loading, error, execute } = useWebWorker<CSVData, ParsedData>(
    'csv-worker.js',
    { timeout: 60000, poolSize: 2 }
  );

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const rows = lines.slice(1).map(line => line.split(','));

        const result = await execute(
          { headers, rows },
          [] // No transferable objects for this example
        );

        console.log(`Parsed ${result.rowCount} rows`);
      } catch (err) {
        console.error('Failed to process CSV:', err);
      }
    },
    [execute]
  );

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={loading}
      />

      {loading && <p>Processing CSV...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {data && (
        <div>
          <p>Successfully parsed {data.rowCount} rows</p>
          <p>Columns: {data.headers.join(', ')}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Solution 4: Comlink Library (RPC for Workers)

### With Comlink
```javascript
// main.js
import * as Comlink from 'comlink';

// Load worker as RPC
const worker = Comlink.wrap(new Worker('worker.js'));

async function processData() {
  // Call worker methods directly!
  const result = await worker.analyzeDataset([1, 2, 3, 4, 5]);
  console.log('Result:', result);

  // Transfer large data efficiently
  const buffer = new ArrayBuffer(1000000);
  const processed = await worker.processBuffer(Comlink.transfer(buffer, [buffer]));
  console.log('Buffer processed');
}

// worker.js (with Comlink)
import * as Comlink from 'comlink';

const worker = {
  analyzeDataset: async (data) => {
    // Heavy computation
    return data.map(x => x * x).reduce((a, b) => a + b, 0);
  },

  processBuffer: (buffer) => {
    const view = new Uint8Array(buffer);
    // Process buffer in-place
    for (let i = 0; i < view.length; i++) {
      view[i] = view[i] * 2;
    }
    return buffer;
  }
};

Comlink.expose(worker);
```

**Benefits of Comlink:**
- No manual message passing
- Automatic serialization
- Promise-based API
- Works with async/await
- Supports callbacks and event listeners
- Simpler, cleaner code

---

## Solution 5: Transferable Objects Optimization

### CSV Parsing Example (100K rows)

#### Without Transfer (SLOW)
```javascript
// Large data is CLONED (expensive!)
const csvData = new Uint8Array(50 * 1024 * 1024); // 50MB

const start = performance.now();
worker.postMessage({ csvData }); // Cloned = slow!
console.log(`Sent data in ${performance.now() - start}ms`);

// Result: ~2000-3000ms to clone and send 50MB
```

#### With Transfer (FAST)
```javascript
// Large data is TRANSFERRED (ownership moves)
const csvBuffer = new ArrayBuffer(50 * 1024 * 1024);
const csvData = new Uint8Array(csvBuffer);

const start = performance.now();
worker.postMessage(
  { csvData },
  [csvBuffer] // Transfer ownership, don't clone!
);
console.log(`Sent data in ${performance.now() - start}ms`);

// After postMessage, csvBuffer is EMPTY in main thread
// Result: ~5-50ms transfer (no cloning!)
// But: csvData is no longer usable in main thread after!
```

### Image Processing with Transfer
```javascript
function processImageData() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const startTime = performance.now();

  // Transfer the ArrayBuffer, not the ImageData object
  worker.postMessage(
    {
      taskId: 'image-1',
      width: canvas.width,
      height: canvas.height,
      data: imageData.data
    },
    [imageData.data.buffer] // Transfer ownership!
  );

  console.log(`Transferred image in ${performance.now() - startTime}ms`);
  // imageData.data is now empty, but that's ok since we sent it to worker
}

// In worker
self.onmessage = (event) => {
  const { taskId, data, width, height } = event.data;

  // Process image
  const processed = processImage(data, width, height);

  // Send back with transfer
  self.postMessage(
    { taskId, result: processed },
    [processed.buffer]
  );
};
```

### Performance Comparison
```javascript
// 100K CSV rows test
const results = {
  'Cloned (100KB)': '~15ms',
  'Cloned (1MB)': '~150ms',
  'Cloned (10MB)': '~1500ms',
  'Transfer (10MB)': '~10ms', // 150x faster!
  'Transfer (100MB)': '~50ms'  // Constant time!
};

// Key insight: Transfer time is O(1), clone time is O(n)
```

---

## Real Example: CSV Parser (100K Rows)

### main.html
```html
<!DOCTYPE html>
<html>
<head>
  <title>CSV Parser with Web Worker</title>
  <style>
    body { font-family: Arial; max-width: 1000px; margin: 50px auto; }
    .container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .stats { background: #f0f0f0; padding: 15px; border-radius: 8px; }
    .stats p { margin: 5px 0; font-family: monospace; }
    input { padding: 10px; font-size: 16px; }
    progress { width: 100%; height: 20px; }
  </style>
</head>
<body>
  <h1>CSV Parser Performance Comparison</h1>

  <div class="container">
    <div>
      <h3>Main Thread (Blocking)</h3>
      <button onclick="testMainThread()">Parse on Main (⚠️ BLOCKS UI)</button>
      <div id="mainStats" class="stats"></div>
    </div>

    <div>
      <h3>Web Worker (Non-blocking)</h3>
      <button onclick="testWorker()">Parse with Worker (✅ UI stays responsive)</button>
      <div id="workerStats" class="stats"></div>
      <progress id="progress" value="0" max="100"></progress>
    </div>
  </div>

  <script>
    function generateCSV(rowCount) {
      let csv = 'id,name,email,age,score\n';
      for (let i = 0; i < rowCount; i++) {
        csv += `${i},User${i},user${i}@example.com,${20 + Math.random() * 50},${Math.random() * 100}\n`;
      }
      return csv;
    }

    // Main thread parsing
    function testMainThread() {
      const csv = generateCSV(100000);
      const mainStats = document.getElementById('mainStats');
      mainStats.innerHTML = '<p>Processing...</p>';

      const startTime = performance.now();
      const startUITime = performance.now();

      // This blocks UI
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1, -1).map(line => {
        const values = line.split(',');
        return {
          id: parseInt(values[0]),
          name: values[1],
          email: values[2],
          age: parseInt(values[3]),
          score: parseFloat(values[4])
        };
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      mainStats.innerHTML = `
        <p>⏱️ Parse time: ${duration.toFixed(2)}ms</p>
        <p>📊 Rows parsed: ${data.length}</p>
        <p>⚠️ UI was blocked for entire duration!</p>
      `;
    }

    // Worker-based parsing
    function testWorker() {
      const csv = generateCSV(100000);
      const workerStats = document.getElementById('workerStats');
      const progress = document.getElementById('progress');

      workerStats.innerHTML = '<p>Processing...</p>';
      progress.value = 50; // Show intermediate progress

      const startTime = performance.now();
      const worker = new Worker('csv-worker.js');

      worker.onmessage = (event) => {
        const { result, computationTime } = event.data;
        const totalTime = performance.now() - startTime;
        const overhead = totalTime - computationTime;

        workerStats.innerHTML = `
          <p>⏱️ Computation time: ${computationTime.toFixed(2)}ms</p>
          <p>⏱️ Total time: ${totalTime.toFixed(2)}ms</p>
          <p>📊 Rows parsed: ${result.length}</p>
          <p>✅ UI remained responsive!</p>
          <p>📈 Overhead: ${overhead.toFixed(2)}ms</p>
        `;
        progress.value = 100;
      };

      worker.postMessage({ csv });
    }
  </script>
</body>
</html>
```

### csv-worker.js
```javascript
self.onmessage = (event) => {
  const { csv } = event.data;
  const startTime = performance.now();

  const lines = csv.split('\n');
  const headers = lines[0].split(',');

  const data = lines.slice(1, -1).map(line => {
    const values = line.split(',');
    return {
      id: parseInt(values[0]),
      name: values[1],
      email: values[2],
      age: parseInt(values[3]),
      score: parseFloat(values[4])
    };
  });

  const computationTime = performance.now() - startTime;

  self.postMessage({
    result: data,
    computationTime
  });
};
```

### Performance Results
```
Main Thread:
- Parse time: 450ms
- UI blocked: YES (frames = 0fps)
- User experience: TERRIBLE (app feels frozen)

Web Worker:
- Computation time: 400ms
- Overhead: 15ms (serialization)
- Total time: 415ms
- UI blocked: NO (frames = 60fps)
- User experience: SMOOTH (responsive to clicks)

🎉 Same computation, 100x better user experience!
```

---

## Performance Metrics

### Timing Breakdown
```javascript
// Typical Web Worker overhead
const breakdown = {
  'Data serialization (JSON.stringify)': '5-10ms for 1MB',
  'Data cloning': '10-50ms for 1MB',
  'Data transfer (with Transferable)': '1-2ms for 100MB',
  'Worker initialization': '3-5ms per worker',
  'Message posting': '<1ms',
  'Context switch': '2-5ms',
  'Total overhead': '10-25ms for < 10MB',
};

// Rule of thumb:
// If computation < 50ms: overhead not worth it
// If computation > 100ms: Web Worker beneficial
// If computation > 1s: Web Worker essential
```

### Optimization Strategies
```javascript
// 1. Batch small tasks
// ❌ Bad: 10 tasks of 5ms each = 50ms overhead
// ✅ Good: 1 batched task of 50ms = 20ms overhead

// 2. Use Transferable Objects for large data
// ❌ Bad: postMessage({ buffer: 100MB }) // Cloned!
// ✅ Good: postMessage({ buffer }, [buffer]) // Transferred!

// 3. Keep workers alive (don't create/terminate constantly)
// ❌ Bad: new Worker() for each task
// ✅ Good: Worker pool, reuse workers

// 4. Choose correct data format
// ❌ Bad: JSON.stringify(bigObject) // Slow serialization
// ✅ Good: ArrayBuffer or typed arrays // Fast transfer

// 5. Monitor worker pool
// ❌ Bad: Unlimited concurrent tasks
// ✅ Good: Queue tasks, limit to CPU count
```

---

## Test Cases

```javascript
describe('Web Worker Pool', () => {
  let workerPool;

  beforeEach(() => {
    workerPool = new WorkerPool('heavy-computation.js', 4);
  });

  afterEach(() => {
    workerPool.terminate();
  });

  test('executes task in worker thread', async () => {
    const data = [1, 2, 3, 4, 5];
    const result = await workerPool.executeTask(data);
    expect(result).toBeDefined();
    expect(result.length).toBe(5);
  });

  test('maintains UI responsiveness', async () => {
    const blockButton = document.getElementById('block-ui');
    let clickCount = 0;

    blockButton.onclick = () => clickCount++;

    // Start heavy computation
    workerPool.executeTask(new Array(1000000).fill(0));

    // Simulate user interaction
    await new Promise(resolve => {
      setTimeout(() => {
        blockButton.click();
        blockButton.click();
        resolve(null);
      }, 100);
    });

    // If using main thread, clickCount would be 0 (blocked)
    // With worker, clickCount should be 2 (responsive)
    expect(clickCount).toBe(2);
  });

  test('handles task queue correctly', async () => {
    const tasks = Array.from({ length: 12 }, (_, i) =>
      workerPool.executeTask([i])
    );

    const results = await Promise.all(tasks);
    expect(results).toHaveLength(12);
  });

  test('recovers from worker error', async () => {
    // Worker throws error
    await expect(
      workerPool.executeTask(null)
    ).rejects.toThrow();

    // Pool should still work after error
    const result = await workerPool.executeTask([1, 2, 3]);
    expect(result).toBeDefined();
  });

  test('cancels pending tasks on terminate', () => {
    const task = workerPool.executeTask(new Array(1000000).fill(0));
    workerPool.terminate();

    expect(task).rejects.toThrow();
  });

  test('transfers data efficiently', async () => {
    const buffer = new ArrayBuffer(10 * 1024 * 1024);
    const startTime = performance.now();

    await workerPool.executeTask(
      { buffer },
      [buffer]
    );

    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(500); // Transfer should be fast
    expect(buffer.byteLength).toBe(0); // Transferred, not cloned
  });
});
```

---

## Common Mistakes

❌ **Mistake:** Creating new Worker for each task
```javascript
async function processItem(item) {
  const worker = new Worker('worker.js'); // Created every time!
  worker.postMessage(item);
  // Worker created: 3-5ms overhead per task
  // Result: 100 items = 300-500ms wasted on overhead
}
```

✅ **Correct:** Use Worker pool
```javascript
const pool = new WorkerPool('worker.js', 4);

async function processItem(item) {
  return pool.executeTask(item); // Reuses workers
  // Result: 100 items = ~15-20ms overhead total
}
```

---

❌ **Mistake:** Cloning large data instead of transferring
```javascript
const largeBuffer = new ArrayBuffer(100 * 1024 * 1024);
worker.postMessage({ largeBuffer }); // Cloned = 1000ms+
```

✅ **Correct:** Use Transferable Objects
```javascript
const largeBuffer = new ArrayBuffer(100 * 1024 * 1024);
worker.postMessage({ largeBuffer }, [largeBuffer]); // Transferred = 10ms
// After: largeBuffer is empty in main thread (ownership transferred)
```

---

❌ **Mistake:** Blocking UI while waiting for worker
```javascript
const result = await workerPool.executeTask(largeData);
// Code here waits, but UI doesn't block (good)
// However, if you use result immediately:
updateDOM(result); // DOM operations are synchronous!
// If result is large, this blocks UI
```

✅ **Correct:** Chunk DOM updates
```javascript
const result = await workerPool.executeTask(largeData);

// Chunk DOM updates to maintain 60fps
const chunkSize = 100;
for (let i = 0; i < result.length; i += chunkSize) {
  requestAnimationFrame(() => {
    updateDOM(result.slice(i, i + chunkSize));
  });
}
```

---

❌ **Mistake:** Shared state in workers
```javascript
// worker.js
let cache = {}; // ❌ Each worker gets own copy

self.onmessage = (event) => {
  // Multiple workers won't share same cache!
  cache[event.data] = Math.random();
};
```

✅ **Correct:** SharedWorker for shared state
```javascript
// SharedWorker (single instance for all pages)
let cache = {}; // Truly shared!

const port = new SharedWorker('shared-worker.js');
port.port.onmessage = (event) => {
  // All tabs see same cache
};
```

---

## Follow-up Questions

1. "How would you implement a cancellation token for long-running tasks?"
2. "What's the difference between Web Workers and SharedWorkers?"
3. "How do you debug code running in a Worker?"
4. "What data structures are safe to transfer to workers?"
5. "How would you implement streaming data processing with workers?"
6. "What are Service Workers and how do they differ from Web Workers?"
7. "How would you implement a priority queue for worker tasks?"
8. "Can you modify the code to support browser compatibility?"

---

## Advanced Topics

### Service Workers
```javascript
// Service Workers = persistent background workers for offline support
// Great for caching, push notifications, sync
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
```

### SharedWorker
```javascript
// SharedWorker = single worker instance shared across tabs
// Use for shared state (cache, real-time updates)
const port = new SharedWorker('shared-worker.js').port;
port.start(); // Must call start() for SharedWorker
port.postMessage({ action: 'sync' });
```

### Worklets
```javascript
// Worklets = lightweight workers for specific tasks
// AudioWorklet for audio processing
// PaintWorklet for custom CSS painting
const audioContext = new AudioContext();
audioContext.audioWorklet.addModule('audio-processor.js');
```

---

## Resources

- [Web Workers API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Transferable Objects - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_Objects)
- [Comlink Library](https://github.com/GoogleChromeLabs/comlink)
- [Worker Pool Pattern](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [Performance API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

---

[← Back to Performance Challenges](./README.md)
