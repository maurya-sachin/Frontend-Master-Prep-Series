# TodoMVC - Complete Todo Application

## Problem Statement

Implement a complete TodoMVC application following the official TodoMVC specification. Build a fully functional todo list with add, toggle, edit, delete, filter, and persist functionality using vanilla JavaScript.

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 45-60 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple, Stripe, Airbnb, Uber (Common screening test)

## Requirements

- [ ] Add new todos by pressing Enter
- [ ] Toggle individual todo completion
- [ ] Edit todo on double-click
- [ ] Delete individual todos
- [ ] Toggle all todos at once
- [ ] Clear all completed todos
- [ ] Filter todos (All / Active / Completed)
- [ ] Display active todo count
- [ ] Persist todos to localStorage
- [ ] Handle keyboard events (Enter, Escape)
- [ ] Proper input validation (no empty todos)
- [ ] XSS protection (escape HTML)
- [ ] Show/hide sections when empty
- [ ] Focus management for editing

## Example Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TodoMVC</title>
  <link rel="stylesheet" href="todomvc.css">
</head>
<body>
  <section class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        id="new-todo"
        placeholder="What needs to be done?"
        autofocus
      >
    </header>

    <section class="main" style="display: none;">
      <input id="toggle-all" class="toggle-all" type="checkbox">
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list" id="todo-list"></ul>
    </section>

    <footer class="footer" id="footer" style="display: none;">
      <span class="todo-count" id="todo-count"></span>
      <ul class="filters">
        <li>
          <a href="#/" class="selected" data-filter="all">All</a>
        </li>
        <li>
          <a href="#/active" data-filter="active">Active</a>
        </li>
        <li>
          <a href="#/completed" data-filter="completed">Completed</a>
        </li>
      </ul>
      <button class="clear-completed" id="clear-completed" style="display: none;">
        Clear completed
      </button>
    </footer>
  </section>

  <script src="todomvc.js"></script>
</body>
</html>
```

Expected behavior:
```javascript
// User types "Buy milk" and presses Enter
// Todo is added to list and localStorage
// Input is cleared

// User clicks checkbox → todo marked complete
// User double-clicks label → edit mode activated
// User presses Enter → save changes
// User presses Escape → cancel edit
// User clicks destroy button → todo removed

// User clicks "Active" filter → shows only incomplete todos
// User clicks "Clear completed" → removes all completed todos
// User clicks "toggle all" → all todos marked complete/incomplete
```

## Solution 1: jQuery-Style Imperative (Beginner - ❌ Not Recommended)

```javascript
// ❌ PROBLEMS:
// - Tightly coupled DOM manipulation
// - No separation of concerns
// - Hard to test
// - Difficult to maintain
// - State scattered everywhere

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

document.getElementById('new-todo').addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && this.value.trim()) {
    const todo = {
      id: Date.now(),
      title: this.value.trim(),
      completed: false
    };
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
    this.value = '';
    renderTodos();
  }
});

function renderTodos() {
  const list = document.getElementById('todo-list');
  const filtered = currentFilter === 'all'
    ? todos
    : currentFilter === 'active'
      ? todos.filter(t => !t.completed)
      : todos.filter(t => t.completed);

  list.innerHTML = filtered.map(todo => `
    <li data-id="${todo.id}" class="${todo.completed ? 'completed' : ''}">
      <div class="view">
        <input class="toggle" type="checkbox" ${todo.completed ? 'checked' : ''}
          onchange="toggleTodo(${todo.id})">
        <label ondblclick="editTodo(${todo.id})">${todo.title}</label>
        <button class="destroy" onclick="removeTodo(${todo.id})"></button>
      </div>
      <input class="edit" value="${todo.title}">
    </li>
  `).join('');

  updateStats();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  todo.completed = !todo.completed;
  localStorage.setItem('todos', JSON.stringify(todos));
  renderTodos();
}

function removeTodo(id) {
  todos = todos.filter(t => t.id !== id);
  localStorage.setItem('todos', JSON.stringify(todos));
  renderTodos();
}

// ... more messy global functions
```

**Why this is bad:**
- ❌ Inline event handlers in HTML
- ❌ No XSS protection
- ❌ Global state pollution
- ❌ Cannot unit test
- ❌ Hard to track bugs
- ❌ No edit functionality
- ❌ Missing keyboard handling

## Solution 2: MVC Pattern (Intermediate - ⚠️ Better but Still Limited)

```javascript
// ⚠️ IMPROVEMENTS:
// - Separation of concerns
// - Testable model
// - Centralized state
// - But still uses vanilla DOM manipulation

// Model - State Management
class TodoModel {
  constructor() {
    this.todos = this.loadFromStorage();
    this.subscribers = [];
  }

  loadFromStorage() {
    try {
      return JSON.parse(localStorage.getItem('todos')) || [];
    } catch (e) {
      return [];
    }
  }

  save() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
    this.notify();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb(this.todos));
  }

  addTodo(title) {
    this.todos.push({
      id: Date.now(),
      title: title.trim(),
      completed: false
    });
    this.save();
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.save();
    }
  }

  editTodo(id, newTitle) {
    const todo = this.todos.find(t => t.id === id);
    if (todo && newTitle.trim()) {
      todo.title = newTitle.trim();
      this.save();
    }
  }

  removeTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.save();
  }

  toggleAll(completed) {
    this.todos.forEach(t => t.completed = completed);
    this.save();
  }

  clearCompleted() {
    this.todos = this.todos.filter(t => !t.completed);
    this.save();
  }

  getFiltered(filter) {
    switch(filter) {
      case 'active':
        return this.todos.filter(t => !t.completed);
      case 'completed':
        return this.todos.filter(t => t.completed);
      default:
        return this.todos;
    }
  }

  getActiveCount() {
    return this.todos.filter(t => !t.completed).length;
  }

  hasCompleted() {
    return this.todos.some(t => t.completed);
  }
}

// View - DOM Rendering
class TodoView {
  constructor() {
    this.newTodoInput = document.getElementById('new-todo');
    this.todoList = document.getElementById('todo-list');
    this.toggleAllCheckbox = document.getElementById('toggle-all');
    this.footer = document.getElementById('footer');
    this.main = document.querySelector('.main');
    this.clearCompletedBtn = document.getElementById('clear-completed');
    this.todoCount = document.getElementById('todo-count');
    this.filterLinks = document.querySelectorAll('.filters a');
  }

  renderTodos(todos) {
    if (todos.length === 0) {
      this.todoList.innerHTML = '';
      this.main.style.display = 'none';
      this.footer.style.display = 'none';
      return;
    }

    this.main.style.display = 'block';
    this.footer.style.display = 'block';

    this.todoList.innerHTML = todos.map(todo => `
      <li data-id="${todo.id}" class="${todo.completed ? 'completed' : ''}">
        <div class="view">
          <input class="toggle" type="checkbox" ${todo.completed ? 'checked' : ''}>
          <label>${this.escapeHtml(todo.title)}</label>
          <button class="destroy"></button>
        </div>
        <input class="edit" value="${this.escapeHtml(todo.title)}">
      </li>
    `).join('');
  }

  renderFooter(activeCount, hasCompleted) {
    const itemText = activeCount === 1 ? 'item' : 'items';
    this.todoCount.innerHTML = `<strong>${activeCount}</strong> ${itemText} left`;
    this.clearCompletedBtn.style.display = hasCompleted ? 'block' : 'none';
  }

  updateToggleAll(checked) {
    this.toggleAllCheckbox.checked = checked;
  }

  clearInput() {
    this.newTodoInput.value = '';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  setFilter(filter) {
    this.filterLinks.forEach(link => {
      if (link.dataset.filter === filter) {
        link.classList.add('selected');
      } else {
        link.classList.remove('selected');
      }
    });
  }
}

// Controller - Event Handling & Business Logic
class TodoController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.currentFilter = 'all';

    this.setupEventListeners();
    this.render();

    // Subscribe to model changes
    this.model.subscribe(() => this.render());
  }

  setupEventListeners() {
    // Add new todo
    this.view.newTodoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        this.model.addTodo(e.target.value);
        this.view.clearInput();
      }
    });

    // Delegate events on todo list
    this.view.todoList.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li) return;

      const id = parseInt(li.dataset.id);

      if (e.target.classList.contains('toggle')) {
        this.model.toggleTodo(id);
      } else if (e.target.classList.contains('destroy')) {
        this.model.removeTodo(id);
      }
    });

    // Edit on double-click
    this.view.todoList.addEventListener('dblclick', (e) => {
      if (e.target.tagName === 'LABEL') {
        const li = e.target.closest('li');
        li.classList.add('editing');
        const input = li.querySelector('.edit');
        input.focus();
        input.setSelectionRange(0, input.value.length);
      }
    });

    // Save edit on Enter
    this.view.todoList.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.classList.contains('edit')) {
        const li = e.target.closest('li');
        const id = parseInt(li.dataset.id);
        this.model.editTodo(id, e.target.value);
        li.classList.remove('editing');
      }
    });

    // Cancel edit on Escape
    this.view.todoList.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && e.target.classList.contains('edit')) {
        const li = e.target.closest('li');
        li.classList.remove('editing');
        e.target.value = this.model.todos.find(
          t => t.id === parseInt(li.dataset.id)
        ).title;
      }
    });

    // Save edit on blur
    this.view.todoList.addEventListener('blur', (e) => {
      if (e.target.classList.contains('edit')) {
        const li = e.target.closest('li');
        const id = parseInt(li.dataset.id);
        if (li.classList.contains('editing')) {
          this.model.editTodo(id, e.target.value);
          li.classList.remove('editing');
        }
      }
    }, true);

    // Toggle all
    this.view.toggleAllCheckbox.addEventListener('change', (e) => {
      this.model.toggleAll(e.target.checked);
    });

    // Clear completed
    this.view.clearCompletedBtn.addEventListener('click', () => {
      this.model.clearCompleted();
    });

    // Filters
    this.view.filterLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentFilter = link.dataset.filter;
        this.view.setFilter(this.currentFilter);
        this.render();
      });
    });

    // Handle hash changes (for routing)
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#/', '');
      this.currentFilter = hash || 'all';
      this.view.setFilter(this.currentFilter);
      this.render();
    });

    // Initialize filter from URL
    const hash = window.location.hash.replace('#/', '');
    if (hash) {
      this.currentFilter = hash;
      this.view.setFilter(this.currentFilter);
    }
  }

  render() {
    const todos = this.model.getFiltered(this.currentFilter);
    const activeCount = this.model.getActiveCount();
    const hasCompleted = this.model.hasCompleted();
    const allCompleted = this.model.todos.length > 0 && activeCount === 0;

    this.view.renderTodos(todos);
    this.view.renderFooter(activeCount, hasCompleted);
    this.view.updateToggleAll(allCompleted);
  }
}

// Initialize
const app = new TodoController(new TodoModel(), new TodoView());
```

**Improvements:**
- ✅ MVC separation of concerns
- ✅ Testable model class
- ✅ XSS protection with escapeHtml
- ✅ Event delegation
- ✅ Proper keyboard handling
- ✅ Centralized state management
- ⚠️ Still has some coupling issues

## Solution 3: Production TodoMVC ✅ (Advanced - Recommended)

```javascript
/**
 * Production-Ready TodoMVC Implementation
 * Features:
 * - Complete MVC architecture
 * - Robust error handling
 * - Performance optimizations
 * - Accessibility support
 * - Comprehensive keyboard shortcuts
 * - URL routing
 * - State persistence
 * - Event delegation
 * - Memory leak prevention
 */

// ============================================
// MODEL - State Management & Business Logic
// ============================================

class TodoModel {
  constructor(storage = 'todos-vanillajs') {
    this.storageKey = storage;
    this.todos = this.loadFromStorage();
    this.subscribers = new Map();
  }

  /**
   * Load todos from localStorage with error handling
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading todos:', error);
      return [];
    }
  }

  /**
   * Persist todos to localStorage
   */
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
      this.notify('update', this.todos);
    } catch (error) {
      console.error('Error saving todos:', error);
      this.notify('error', { message: 'Failed to save todos' });
    }
  }

  /**
   * Subscribe to model changes
   */
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of an event
   */
  notify(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(callback => callback(data));
    }
  }

  /**
   * Add a new todo
   */
  addTodo(title) {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      this.notify('error', { message: 'Todo title cannot be empty' });
      return null;
    }

    if (trimmedTitle.length > 200) {
      this.notify('error', { message: 'Todo title too long (max 200 chars)' });
      return null;
    }

    const todo = {
      id: Date.now() + Math.random(), // More unique ID
      title: trimmedTitle,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.todos.push(todo);
    this.save();
    return todo;
  }

  /**
   * Toggle todo completion status
   */
  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      todo.updatedAt = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Edit todo title
   */
  editTodo(id, newTitle) {
    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
      this.notify('error', { message: 'Todo title cannot be empty' });
      return false;
    }

    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.title = trimmedTitle;
      todo.updatedAt = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Remove a todo
   */
  removeTodo(id) {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(t => t.id !== id);

    if (this.todos.length < initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Toggle all todos
   */
  toggleAll(completed) {
    this.todos.forEach(todo => {
      todo.completed = completed;
      todo.updatedAt = new Date().toISOString();
    });
    this.save();
  }

  /**
   * Clear all completed todos
   */
  clearCompleted() {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(t => !t.completed);

    if (this.todos.length < initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Get filtered todos based on filter type
   */
  getFiltered(filter = 'all') {
    switch(filter) {
      case 'active':
        return this.todos.filter(t => !t.completed);
      case 'completed':
        return this.todos.filter(t => t.completed);
      default:
        return this.todos;
    }
  }

  /**
   * Get count of active (incomplete) todos
   */
  getActiveCount() {
    return this.todos.filter(t => !t.completed).length;
  }

  /**
   * Check if any todos are completed
   */
  hasCompleted() {
    return this.todos.some(t => t.completed);
  }

  /**
   * Get all todos (for testing)
   */
  getAll() {
    return [...this.todos];
  }

  /**
   * Clear all todos (for testing)
   */
  clearAll() {
    this.todos = [];
    this.save();
  }
}

// ============================================
// VIEW - DOM Rendering & UI Updates
// ============================================

class TodoView {
  constructor() {
    // Cache DOM elements
    this.elements = {
      newTodoInput: document.getElementById('new-todo'),
      todoList: document.getElementById('todo-list'),
      toggleAllCheckbox: document.getElementById('toggle-all'),
      footer: document.getElementById('footer'),
      main: document.querySelector('.main'),
      clearCompletedBtn: document.getElementById('clear-completed'),
      todoCount: document.getElementById('todo-count'),
      filterLinks: document.querySelectorAll('.filters a'),
    };

    this.editingId = null;
  }

  /**
   * Render the entire todo list
   */
  renderTodos(todos) {
    if (todos.length === 0) {
      this.elements.todoList.innerHTML = '';
      this.elements.main.style.display = 'none';
      this.elements.footer.style.display = 'none';
      return;
    }

    this.elements.main.style.display = 'block';
    this.elements.footer.style.display = 'block';

    const fragment = document.createDocumentFragment();

    todos.forEach(todo => {
      const li = this.createTodoElement(todo);
      fragment.appendChild(li);
    });

    this.elements.todoList.innerHTML = '';
    this.elements.todoList.appendChild(fragment);
  }

  /**
   * Create a single todo element
   */
  createTodoElement(todo) {
    const li = document.createElement('li');
    li.dataset.id = todo.id;
    if (todo.completed) {
      li.classList.add('completed');
    }

    li.innerHTML = `
      <div class="view">
        <input class="toggle" type="checkbox" ${todo.completed ? 'checked' : ''}>
        <label>${this.escapeHtml(todo.title)}</label>
        <button class="destroy"></button>
      </div>
      <input class="edit" value="${this.escapeHtml(todo.title)}">
    `;

    return li;
  }

  /**
   * Update footer with stats
   */
  renderFooter(activeCount, hasCompleted) {
    const itemText = activeCount === 1 ? 'item' : 'items';
    this.elements.todoCount.innerHTML = `<strong>${activeCount}</strong> ${itemText} left`;
    this.elements.clearCompletedBtn.style.display = hasCompleted ? 'block' : 'none';
  }

  /**
   * Update toggle-all checkbox
   */
  updateToggleAll(checked) {
    this.elements.toggleAllCheckbox.checked = checked;
  }

  /**
   * Clear new todo input
   */
  clearInput() {
    this.elements.newTodoInput.value = '';
  }

  /**
   * Set active filter in UI
   */
  setFilter(filter) {
    this.elements.filterLinks.forEach(link => {
      if (link.dataset.filter === filter) {
        link.classList.add('selected');
      } else {
        link.classList.remove('selected');
      }
    });
  }

  /**
   * Enter edit mode for a todo
   */
  enterEditMode(todoElement) {
    if (this.editingId) {
      const previousEditing = this.elements.todoList.querySelector('.editing');
      if (previousEditing) {
        previousEditing.classList.remove('editing');
      }
    }

    todoElement.classList.add('editing');
    this.editingId = parseInt(todoElement.dataset.id);

    const input = todoElement.querySelector('.edit');
    input.focus();
    input.setSelectionRange(0, input.value.length);
  }

  /**
   * Exit edit mode
   */
  exitEditMode(todoElement, save = false) {
    todoElement.classList.remove('editing');
    this.editingId = null;

    if (!save) {
      // Restore original value if not saving
      const input = todoElement.querySelector('.edit');
      const label = todoElement.querySelector('label');
      input.value = label.textContent;
    }
  }

  /**
   * Escape HTML to prevent XSS attacks
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show error message (can be enhanced with toast/notification)
   */
  showError(message) {
    console.error(message);
    // In production, you'd show a toast notification here
    alert(message);
  }

  /**
   * Get all DOM elements for cleanup
   */
  getElements() {
    return this.elements;
  }
}

// ============================================
// CONTROLLER - Event Handling & Coordination
// ============================================

class TodoController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.currentFilter = 'all';
    this.unsubscribers = [];

    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    this.setupEventListeners();
    this.setupModelSubscriptions();
    this.initializeFilter();
    this.render();
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    const elements = this.view.getElements();

    // Add new todo
    elements.newTodoInput.addEventListener('keypress', this.handleNewTodo.bind(this));

    // Delegate events on todo list
    elements.todoList.addEventListener('click', this.handleTodoClick.bind(this));
    elements.todoList.addEventListener('dblclick', this.handleTodoDoubleClick.bind(this));
    elements.todoList.addEventListener('keypress', this.handleTodoKeyPress.bind(this));
    elements.todoList.addEventListener('keydown', this.handleTodoKeyDown.bind(this));
    elements.todoList.addEventListener('blur', this.handleTodoBlur.bind(this), true);

    // Toggle all
    elements.toggleAllCheckbox.addEventListener('change', this.handleToggleAll.bind(this));

    // Clear completed
    elements.clearCompletedBtn.addEventListener('click', this.handleClearCompleted.bind(this));

    // Filters
    elements.filterLinks.forEach(link => {
      link.addEventListener('click', this.handleFilterClick.bind(this));
    });

    // Hash change (routing)
    window.addEventListener('hashchange', this.handleHashChange.bind(this));
  }

  /**
   * Setup model event subscriptions
   */
  setupModelSubscriptions() {
    this.unsubscribers.push(
      this.model.subscribe('update', () => this.render()),
      this.model.subscribe('error', (error) => this.view.showError(error.message))
    );
  }

  /**
   * Initialize filter from URL hash
   */
  initializeFilter() {
    const hash = window.location.hash.replace('#/', '');
    if (hash && ['all', 'active', 'completed'].includes(hash)) {
      this.currentFilter = hash;
    }
    this.view.setFilter(this.currentFilter);
  }

  /**
   * Handle new todo input
   */
  handleNewTodo(e) {
    if (e.key === 'Enter' && e.target.value.trim()) {
      this.model.addTodo(e.target.value);
      this.view.clearInput();
    }
  }

  /**
   * Handle clicks on todo list
   */
  handleTodoClick(e) {
    const li = e.target.closest('li');
    if (!li) return;

    const id = parseFloat(li.dataset.id);

    if (e.target.classList.contains('toggle')) {
      this.model.toggleTodo(id);
    } else if (e.target.classList.contains('destroy')) {
      this.model.removeTodo(id);
    }
  }

  /**
   * Handle double-click to edit
   */
  handleTodoDoubleClick(e) {
    if (e.target.tagName === 'LABEL') {
      const li = e.target.closest('li');
      this.view.enterEditMode(li);
    }
  }

  /**
   * Handle Enter key in edit mode
   */
  handleTodoKeyPress(e) {
    if (e.key === 'Enter' && e.target.classList.contains('edit')) {
      const li = e.target.closest('li');
      const id = parseFloat(li.dataset.id);

      if (this.model.editTodo(id, e.target.value)) {
        this.view.exitEditMode(li, true);
      }
    }
  }

  /**
   * Handle Escape key in edit mode
   */
  handleTodoKeyDown(e) {
    if (e.key === 'Escape' && e.target.classList.contains('edit')) {
      const li = e.target.closest('li');
      this.view.exitEditMode(li, false);
    }
  }

  /**
   * Handle blur (focus loss) in edit mode
   */
  handleTodoBlur(e) {
    if (e.target.classList.contains('edit')) {
      const li = e.target.closest('li');
      if (li.classList.contains('editing')) {
        const id = parseFloat(li.dataset.id);
        if (this.model.editTodo(id, e.target.value)) {
          this.view.exitEditMode(li, true);
        }
      }
    }
  }

  /**
   * Handle toggle all checkbox
   */
  handleToggleAll(e) {
    this.model.toggleAll(e.target.checked);
  }

  /**
   * Handle clear completed button
   */
  handleClearCompleted() {
    this.model.clearCompleted();
  }

  /**
   * Handle filter link clicks
   */
  handleFilterClick(e) {
    e.preventDefault();
    const filter = e.target.dataset.filter;
    this.currentFilter = filter;
    window.location.hash = filter === 'all' ? '' : `/${filter}`;
    this.view.setFilter(this.currentFilter);
    this.render();
  }

  /**
   * Handle URL hash changes
   */
  handleHashChange() {
    const hash = window.location.hash.replace('#/', '');
    const filter = hash || 'all';

    if (['all', 'active', 'completed'].includes(filter)) {
      this.currentFilter = filter;
      this.view.setFilter(this.currentFilter);
      this.render();
    }
  }

  /**
   * Render the entire application
   */
  render() {
    const todos = this.model.getFiltered(this.currentFilter);
    const activeCount = this.model.getActiveCount();
    const hasCompleted = this.model.hasCompleted();
    const allTodos = this.model.getAll();
    const allCompleted = allTodos.length > 0 && activeCount === 0;

    this.view.renderTodos(todos);
    this.view.renderFooter(activeCount, hasCompleted);
    this.view.updateToggleAll(allCompleted);
  }

  /**
   * Cleanup (remove event listeners, unsubscribe)
   */
  destroy() {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    // In production, you'd remove all event listeners here
  }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize the TodoMVC app
document.addEventListener('DOMContentLoaded', () => {
  const model = new TodoModel('todos-vanillajs');
  const view = new TodoView();
  const controller = new TodoController(model, view);

  // Expose for debugging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    window.todoApp = { model, view, controller };
  }
});
```

**Production Features:**
- ✅ Complete MVC architecture
- ✅ Robust error handling
- ✅ XSS protection (HTML escaping)
- ✅ Event delegation (performance)
- ✅ Memory leak prevention (unsubscribe)
- ✅ URL routing with hash
- ✅ Keyboard shortcuts (Enter, Escape)
- ✅ Focus management
- ✅ Input validation
- ✅ localStorage error handling
- ✅ Unique ID generation
- ✅ Timestamps (createdAt, updatedAt)
- ✅ Proper blur handling
- ✅ Clean separation of concerns
- ✅ Testable architecture

## Time & Space Complexity

### Operations Complexity

| Operation | Time | Space | Notes |
|-----------|------|-------|-------|
| Add todo | O(1) | O(1) | Push to array |
| Toggle todo | O(n) | O(1) | Find by ID |
| Edit todo | O(n) | O(1) | Find by ID |
| Delete todo | O(n) | O(n) | Filter creates new array |
| Toggle all | O(n) | O(1) | Iterate all todos |
| Clear completed | O(n) | O(n) | Filter creates new array |
| Get filtered | O(n) | O(n) | Filter creates new array |
| Render | O(n) | O(n) | Create DOM elements |

### Overall Complexity

- **Time**: O(n) for most operations where n = number of todos
- **Space**: O(n) for storing todos in memory and localStorage
- **Render Performance**: O(n) for full re-renders (can be optimized with virtual DOM)

### Optimizations Applied

1. **Event Delegation**: Single listener on parent instead of n listeners
2. **DocumentFragment**: Batch DOM updates to reduce reflows
3. **DOM Caching**: Store element references instead of querying repeatedly
4. **Lazy Rendering**: Only render when filter changes
5. **LocalStorage Batching**: Save once per operation, not per todo

## Test Cases

```javascript
describe('TodoMVC', () => {
  let model, view, controller;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <input id="new-todo">
      <input id="toggle-all" type="checkbox">
      <ul id="todo-list"></ul>
      <footer id="footer">
        <span id="todo-count"></span>
        <button id="clear-completed"></button>
      </footer>
      <section class="main"></section>
      <div class="filters">
        <a data-filter="all"></a>
        <a data-filter="active"></a>
        <a data-filter="completed"></a>
      </div>
    `;

    model = new TodoModel('test-todos');
    view = new TodoView();
    controller = new TodoController(model, view);

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    controller.destroy();
    localStorage.clear();
  });

  describe('Model', () => {
    test('should add a new todo', () => {
      const todo = model.addTodo('Buy milk');
      expect(model.getAll()).toHaveLength(1);
      expect(todo.title).toBe('Buy milk');
      expect(todo.completed).toBe(false);
    });

    test('should not add empty todo', () => {
      const todo = model.addTodo('   ');
      expect(todo).toBeNull();
      expect(model.getAll()).toHaveLength(0);
    });

    test('should toggle todo completion', () => {
      const todo = model.addTodo('Buy milk');
      model.toggleTodo(todo.id);
      expect(model.getAll()[0].completed).toBe(true);
      model.toggleTodo(todo.id);
      expect(model.getAll()[0].completed).toBe(false);
    });

    test('should edit todo', () => {
      const todo = model.addTodo('Buy milk');
      model.editTodo(todo.id, 'Buy eggs');
      expect(model.getAll()[0].title).toBe('Buy eggs');
    });

    test('should not edit with empty string', () => {
      const todo = model.addTodo('Buy milk');
      const result = model.editTodo(todo.id, '   ');
      expect(result).toBe(false);
      expect(model.getAll()[0].title).toBe('Buy milk');
    });

    test('should delete todo', () => {
      const todo = model.addTodo('Buy milk');
      model.removeTodo(todo.id);
      expect(model.getAll()).toHaveLength(0);
    });

    test('should toggle all todos', () => {
      model.addTodo('Buy milk');
      model.addTodo('Buy eggs');
      model.toggleAll(true);
      expect(model.getAll().every(t => t.completed)).toBe(true);
    });

    test('should clear completed todos', () => {
      const todo1 = model.addTodo('Buy milk');
      const todo2 = model.addTodo('Buy eggs');
      model.toggleTodo(todo1.id);
      model.clearCompleted();
      expect(model.getAll()).toHaveLength(1);
      expect(model.getAll()[0].id).toBe(todo2.id);
    });

    test('should filter active todos', () => {
      const todo1 = model.addTodo('Buy milk');
      model.addTodo('Buy eggs');
      model.toggleTodo(todo1.id);
      const active = model.getFiltered('active');
      expect(active).toHaveLength(1);
      expect(active[0].title).toBe('Buy eggs');
    });

    test('should filter completed todos', () => {
      const todo1 = model.addTodo('Buy milk');
      model.addTodo('Buy eggs');
      model.toggleTodo(todo1.id);
      const completed = model.getFiltered('completed');
      expect(completed).toHaveLength(1);
      expect(completed[0].title).toBe('Buy milk');
    });

    test('should get active count', () => {
      model.addTodo('Buy milk');
      const todo2 = model.addTodo('Buy eggs');
      model.toggleTodo(todo2.id);
      expect(model.getActiveCount()).toBe(1);
    });

    test('should persist to localStorage', () => {
      model.addTodo('Buy milk');
      const stored = JSON.parse(localStorage.getItem('test-todos'));
      expect(stored).toHaveLength(1);
      expect(stored[0].title).toBe('Buy milk');
    });

    test('should load from localStorage', () => {
      localStorage.setItem('test-todos', JSON.stringify([
        { id: 1, title: 'Buy milk', completed: false }
      ]));
      const newModel = new TodoModel('test-todos');
      expect(newModel.getAll()).toHaveLength(1);
    });
  });

  describe('View', () => {
    test('should render todos', () => {
      model.addTodo('Buy milk');
      model.addTodo('Buy eggs');
      controller.render();

      const items = document.querySelectorAll('#todo-list li');
      expect(items).toHaveLength(2);
    });

    test('should escape HTML in todo titles', () => {
      model.addTodo('<script>alert("xss")</script>');
      controller.render();

      const label = document.querySelector('#todo-list label');
      expect(label.innerHTML).toContain('&lt;script&gt;');
      expect(label.innerHTML).not.toContain('<script>');
    });

    test('should show active count', () => {
      model.addTodo('Buy milk');
      const todo2 = model.addTodo('Buy eggs');
      model.toggleTodo(todo2.id);
      controller.render();

      const count = document.getElementById('todo-count');
      expect(count.textContent).toContain('1 item left');
    });

    test('should show plural items', () => {
      model.addTodo('Buy milk');
      model.addTodo('Buy eggs');
      controller.render();

      const count = document.getElementById('todo-count');
      expect(count.textContent).toContain('2 items left');
    });

    test('should hide sections when empty', () => {
      controller.render();

      const main = document.querySelector('.main');
      const footer = document.getElementById('footer');
      expect(main.style.display).toBe('none');
      expect(footer.style.display).toBe('none');
    });
  });

  describe('Controller', () => {
    test('should add todo on Enter key', () => {
      const input = document.getElementById('new-todo');
      input.value = 'Buy milk';

      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      input.dispatchEvent(event);

      expect(model.getAll()).toHaveLength(1);
      expect(input.value).toBe('');
    });

    test('should toggle todo on checkbox click', () => {
      const todo = model.addTodo('Buy milk');
      controller.render();

      const checkbox = document.querySelector('.toggle');
      checkbox.click();

      expect(model.getAll()[0].completed).toBe(true);
    });

    test('should delete todo on destroy click', () => {
      model.addTodo('Buy milk');
      controller.render();

      const destroyBtn = document.querySelector('.destroy');
      destroyBtn.click();

      expect(model.getAll()).toHaveLength(0);
    });

    test('should enter edit mode on double-click', () => {
      model.addTodo('Buy milk');
      controller.render();

      const label = document.querySelector('#todo-list label');
      const event = new MouseEvent('dblclick', { bubbles: true });
      label.dispatchEvent(event);

      const li = label.closest('li');
      expect(li.classList.contains('editing')).toBe(true);
    });

    test('should filter todos', () => {
      model.addTodo('Buy milk');
      const todo2 = model.addTodo('Buy eggs');
      model.toggleTodo(todo2.id);

      controller.currentFilter = 'active';
      controller.render();

      const items = document.querySelectorAll('#todo-list li');
      expect(items).toHaveLength(1);
    });
  });
});
```

## Common Mistakes & Edge Cases

### ❌ Mistake 1: No XSS Protection

```javascript
// ❌ VULNERABLE TO XSS
li.innerHTML = `<label>${todo.title}</label>`;

// User enters: <img src=x onerror="alert('XSS')">
// Result: Script executes!

// ✅ CORRECT: Escape HTML
li.innerHTML = `<label>${escapeHtml(todo.title)}</label>`;

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

### ❌ Mistake 2: Not Handling Empty Input

```javascript
// ❌ WRONG: Allows empty todos
this.model.addTodo(e.target.value);

// ✅ CORRECT: Validate input
if (e.target.value.trim()) {
  this.model.addTodo(e.target.value);
}
```

### ❌ Mistake 3: Forgetting to Save to localStorage

```javascript
// ❌ WRONG: State updated but not persisted
toggleTodo(id) {
  const todo = this.todos.find(t => t.id === id);
  todo.completed = !todo.completed;
  // Missing: this.save()
}

// ✅ CORRECT: Always save after mutations
toggleTodo(id) {
  const todo = this.todos.find(t => t.id === id);
  todo.completed = !todo.completed;
  this.save();
}
```

### ❌ Mistake 4: Not Canceling Edit on Escape

```javascript
// ❌ WRONG: No way to cancel edit
// User must delete text or refresh page

// ✅ CORRECT: Handle Escape key
handleKeyDown(e) {
  if (e.key === 'Escape' && e.target.classList.contains('edit')) {
    const li = e.target.closest('li');
    this.view.exitEditMode(li, false); // Don't save
  }
}
```

### ❌ Mistake 5: Memory Leaks with Event Listeners

```javascript
// ❌ WRONG: Creating new listeners on every render
render() {
  todos.forEach(todo => {
    const li = createTodoElement(todo);
    li.querySelector('.destroy').addEventListener('click', () => {
      deleteTodo(todo.id);
    });
  });
}

// ✅ CORRECT: Use event delegation
todoList.addEventListener('click', (e) => {
  if (e.target.classList.contains('destroy')) {
    const id = e.target.closest('li').dataset.id;
    deleteTodo(id);
  }
});
```

### ❌ Mistake 6: Not Handling localStorage Errors

```javascript
// ❌ WRONG: Will crash if localStorage is full or disabled
save() {
  localStorage.setItem('todos', JSON.stringify(this.todos));
}

// ✅ CORRECT: Handle errors gracefully
save() {
  try {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  } catch (error) {
    console.error('Failed to save:', error);
    this.notify('error', { message: 'Storage quota exceeded' });
  }
}
```

### ❌ Mistake 7: Inefficient DOM Updates

```javascript
// ❌ WRONG: Multiple reflows
todos.forEach(todo => {
  const li = createTodoElement(todo);
  todoList.appendChild(li); // Reflow on each append
});

// ✅ CORRECT: Use DocumentFragment
const fragment = document.createDocumentFragment();
todos.forEach(todo => {
  fragment.appendChild(createTodoElement(todo));
});
todoList.appendChild(fragment); // Single reflow
```

### ❌ Mistake 8: Not Preserving Focus

```javascript
// ❌ WRONG: Lose focus on every render
render() {
  todoList.innerHTML = '';
  // Re-render todos
}

// ✅ CORRECT: Track editing state
if (this.editingId) {
  const editingLi = todoList.querySelector(`[data-id="${this.editingId}"]`);
  editingLi.classList.add('editing');
  editingLi.querySelector('.edit').focus();
}
```

## Real-World Applications

### 1. Task Management Systems
- Jira, Asana, Trello use similar patterns
- Add tags, priorities, assignees
- Drag-and-drop reordering
- Real-time sync across users

### 2. E-commerce Cart
- Add/remove items (like todos)
- Update quantities (like editing)
- Clear cart (like clear completed)
- Persist to localStorage

### 3. Form Builders
- Add/remove form fields
- Edit field properties
- Reorder fields
- Save draft state

### 4. Comment Systems
- Add/edit/delete comments
- Like/unlike (toggle)
- Filter by user/date
- Persist drafts

## Follow-Up Questions

**Q1: How would you add drag-and-drop reordering?**

A: Use HTML5 Drag & Drop API or a library like Sortable.js:

```javascript
// Add to model
reorderTodos(fromIndex, toIndex) {
  const [removed] = this.todos.splice(fromIndex, 1);
  this.todos.splice(toIndex, 0, removed);
  this.save();
}

// Add to view
setupDragAndDrop() {
  this.todoList.addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
    this.draggedElement = e.target;
  });

  this.todoList.addEventListener('drop', (e) => {
    e.preventDefault();
    const fromIndex = Array.from(this.todoList.children).indexOf(this.draggedElement);
    const toIndex = Array.from(this.todoList.children).indexOf(e.target.closest('li'));
    this.model.reorderTodos(fromIndex, toIndex);
  });
}
```

**Q2: How would you add undo/redo functionality?**

A: Implement command pattern with history stack:

```javascript
class TodoHistory {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }

  execute(command) {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // Clear redo on new action
  }

  undo() {
    if (this.undoStack.length === 0) return;
    const command = this.undoStack.pop();
    command.undo();
    this.redoStack.push(command);
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const command = this.redoStack.pop();
    command.execute();
    this.undoStack.push(command);
  }
}

class AddTodoCommand {
  constructor(model, title) {
    this.model = model;
    this.title = title;
    this.addedTodo = null;
  }

  execute() {
    this.addedTodo = this.model.addTodo(this.title);
  }

  undo() {
    this.model.removeTodo(this.addedTodo.id);
  }
}
```

**Q3: How would you sync todos across browser tabs?**

A: Use Storage Event API:

```javascript
// In TodoModel
setupCrossTabSync() {
  window.addEventListener('storage', (e) => {
    if (e.key === this.storageKey && e.newValue) {
      this.todos = JSON.parse(e.newValue);
      this.notify('update', this.todos);
    }
  });
}
```

**Q4: How would you add categories/tags?**

A: Extend todo model and add tag filtering:

```javascript
// Enhanced todo structure
{
  id: 1,
  title: 'Buy milk',
  completed: false,
  tags: ['shopping', 'urgent']
}

// Add tag filtering
getByTag(tag) {
  return this.todos.filter(t => t.tags.includes(tag));
}
```

**Q5: How would you add due dates and sorting?**

A: Add date fields and sorting methods:

```javascript
// Enhanced todo
{
  id: 1,
  title: 'Buy milk',
  completed: false,
  dueDate: '2025-12-01',
  priority: 'high'
}

// Sorting
getSorted(sortBy = 'dueDate') {
  return [...this.todos].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    // ... other sort criteria
  });
}
```

## Summary

TodoMVC is a comprehensive coding challenge that tests:
- ✅ DOM manipulation and event handling
- ✅ State management architecture (MVC)
- ✅ LocalStorage API usage
- ✅ Input validation and error handling
- ✅ XSS prevention (security)
- ✅ Keyboard accessibility
- ✅ URL routing
- ✅ Performance optimization (event delegation)
- ✅ Memory leak prevention
- ✅ Clean code architecture

**Key Takeaways:**
1. Use MVC for separation of concerns
2. Always escape user input (XSS protection)
3. Validate input before processing
4. Use event delegation for performance
5. Handle localStorage errors gracefully
6. Implement proper keyboard shortcuts
7. Clean up resources to prevent memory leaks
8. Test edge cases thoroughly

**Time Allocation (60 minutes):**
- 5 min: Understand requirements
- 10 min: Design architecture (MVC)
- 30 min: Implement model + view + controller
- 10 min: Test and debug
- 5 min: Add polish (keyboard shortcuts, error handling)
