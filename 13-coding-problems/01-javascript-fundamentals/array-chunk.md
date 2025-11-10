# Array Chunk

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Companies:** All companies
**Time:** 15 minutes

---

## Problem Statement

Split an array into smaller chunks of a specified size.

### Requirements

- ✅ Split array into chunks of given size
- ✅ Last chunk may be smaller
- ✅ Handle empty array
- ✅ Handle invalid size
- ✅ Don't mutate original array

---

## Solution

```javascript
function chunk(array, size) {
  if (size < 1) return [];

  const result = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

// Usage
chunk([1, 2, 3, 4, 5], 2);  // [[1, 2], [3, 4], [5]]
chunk([1, 2, 3, 4, 5, 6], 3);  // [[1, 2, 3], [4, 5, 6]]
chunk([], 2);  // []
```

---

## Alternative Solutions

### Using Array.from

```javascript
function chunk(array, size) {
  if (size < 1) return [];

  return Array.from(
    { length: Math.ceil(array.length / size) },
    (_, i) => array.slice(i * size, (i + 1) * size)
  );
}
```

### Using reduce

```javascript
function chunk(array, size) {
  return array.reduce((chunks, item, index) => {
    const chunkIndex = Math.floor(index / size);

    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = [];
    }

    chunks[chunkIndex].push(item);
    return chunks;
  }, []);
}
```

### Generator Function

```javascript
function* chunkGenerator(array, size) {
  for (let i = 0; i < array.length; i += size) {
    yield array.slice(i, i + size);
  }
}

// Usage
const chunks = [...chunkGenerator([1, 2, 3, 4, 5], 2)];
// [[1, 2], [3, 4], [5]]
```

---

## Test Cases

```javascript
describe('chunk', () => {
  test('splits array into even chunks', () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
  });

  test('handles uneven chunks', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  test('handles chunk size larger than array', () => {
    expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
  });

  test('handles chunk size of 1', () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });

  test('handles empty array', () => {
    expect(chunk([], 2)).toEqual([]);
  });

  test('handles invalid size', () => {
    expect(chunk([1, 2, 3], 0)).toEqual([]);
    expect(chunk([1, 2, 3], -1)).toEqual([]);
  });

  test('does not mutate original array', () => {
    const arr = [1, 2, 3, 4];
    chunk(arr, 2);
    expect(arr).toEqual([1, 2, 3, 4]);
  });
});
```

---

## Real-World Use Cases

### 1. Pagination

```javascript
function paginateResults(items, pageSize) {
  const pages = chunk(items, pageSize);

  return {
    totalPages: pages.length,
    getPage: (pageNum) => pages[pageNum - 1] || [],
    pages
  };
}

const data = Array.from({ length: 50 }, (_, i) => i + 1);
const paginated = paginateResults(data, 10);
console.log(paginated.getPage(1)); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

### 2. Batch API Requests

```javascript
async function batchProcess(items, batchSize) {
  const batches = chunk(items, batchSize);

  for (const batch of batches) {
    await Promise.all(batch.map(item => processItem(item)));
    console.log(`Processed batch of ${batch.length} items`);
  }
}

const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
await batchProcess(userIds, 3); // Process 3 at a time
```

### 3. Grid Layout

```javascript
function createGrid(items, columns) {
  return chunk(items, columns).map((row, rowIndex) => (
    <div key={rowIndex} className="grid-row">
      {row.map((item, colIndex) => (
        <div key={colIndex} className="grid-item">
          {item}
        </div>
      ))}
    </div>
  ));
}
```

### 4. Rate Limiting

```javascript
async function rateLimitedFetch(urls, requestsPerSecond) {
  const batches = chunk(urls, requestsPerSecond);

  const results = [];
  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map(url => fetch(url).then(r => r.json()))
    );
    results.push(...batchResults);

    // Wait 1 second before next batch
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}
```

### 5. CSV Export

```javascript
function exportToCSV(data, rowsPerPage) {
  const pages = chunk(data, rowsPerPage);

  pages.forEach((page, index) => {
    const csv = page.map(row => row.join(',')).join('\\n');
    downloadFile(`export-page-${index + 1}.csv`, csv);
  });
}
```

---

## Performance Optimization

### For Large Arrays

```javascript
function chunkLarge(array, size) {
  // Pre-allocate result array for better performance
  const resultLength = Math.ceil(array.length / size);
  const result = new Array(resultLength);

  for (let i = 0, j = 0; i < array.length; i += size, j++) {
    result[j] = array.slice(i, i + size);
  }

  return result;
}
```

---

## Common Mistakes

- ❌ Mutating the original array
- ❌ Not handling edge cases (empty array, size < 1)
- ❌ Creating unnecessary intermediate arrays
- ❌ Not handling last chunk correctly

✅ Use slice (non-mutating)
✅ Validate size parameter
✅ Efficient iteration
✅ Last chunk can be smaller

---

## Complexity Analysis

- **Time Complexity:** O(n) - iterate through array once
- **Space Complexity:** O(n) - result array size

---

## Related Problems

- `flattenArray` - Opposite operation
- `partition` - Split by predicate
- `groupBy` - Group by key
- `batch` - Process in batches

---

[← Back to JavaScript Fundamentals](./README.md)
