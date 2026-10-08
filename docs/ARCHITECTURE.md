# TaskFlow Architecture

This document explains how TaskFlow is organised and how its pieces work together. It is meant for anyone who wants to read, change or extend the code.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [HTML Layer](#html-layer)
- [CSS Layer](#css-layer)
- [JavaScript Layer](#javascript-layer)
- [Data Model and Persistence](#data-model-and-persistence)
- [Data Flow](#data-flow)
- [Security and Accessibility](#security-and-accessibility)
- [Future Improvements](#future-improvements)

## Overview

TaskFlow is a small single-page task manager built with plain HTML, CSS and JavaScript. It has no build step and no external dependencies: opening `index.html` in a browser is enough to run it.

Guiding principles:

- **Separation of concerns**: structure (HTML), presentation (CSS) and behaviour (JS) live in separate files.
- **Simplicity**: one entry page, one stylesheet, one script.
- **Responsive**: the layout adapts to tablets and phones through media queries.
- **Keyboard support**: tasks can be added with the Enter key and the input is focused on load.

| Concern | Technology |
| --- | --- |
| Markup | HTML5 |
| Styling | CSS3 (Flexbox, Grid, media queries, animations) |
| Logic | JavaScript ES6+ (one class) |
| Storage | Browser `localStorage` |

## Project Structure

```
taskflow/
├── index.html          # Entry point and page structure
├── styles/
│   └── main.css        # All styles
├── scripts/
│   └── app.js          # Application logic (TaskFlow class)
├── docs/
│   ├── ARCHITECTURE.md # This document
│   └── CONTRIBUTING.md # How to contribute
├── LICENSE             # MIT license
└── README.md           # Project overview
```

## HTML Layer

`index.html` is a single page wrapped in a `.container` element. It uses the semantic `header`, `main` and `footer` elements, and `div` blocks inside `main`:

- **Header** (`header.header`): application title and tagline.
- **Task input** (`.task-input-section`): the `#taskInput` text field and the `#addTaskBtn` button.
- **Task list** (`.tasks-section`): the `#taskCount` counter, the `#tasksList` container filled by JavaScript, and the `#emptyState` message shown when there are no tasks.
- **Statistics** (`.stats-section`): three cards with `#totalTasks`, `#completedTasks` and `#pendingTasks`.
- **Footer** (`footer.footer`): copyright line.

The `<script>` tag is placed at the end of the body so every element already exists when `app.js` runs. The Inter font is loaded from Google Fonts.

The list is an empty container and the statistics start at zero. JavaScript fills them at runtime, so the markup stays small and the data stays in one place. Elements that JavaScript needs are looked up by `id`.

## CSS Layer

`styles/main.css` is organised from general to specific:

1. Reset and base styles (`*` reset, `body` with the purple gradient background and the Inter font)
2. Layout (`.container` limited to 800px, header, main sections)
3. Components (input, buttons, task items, stat cards)
4. States (for example the completed-task style)
5. Responsive rules
6. Animations (a `slideIn` keyframe)

Colours, spacing and sizes are written directly in each rule; the stylesheet does not define CSS custom properties. Class names are descriptive kebab-case (`task-input`, `add-btn`, `stat-card`).

**Responsive behaviour**: the base styles target desktop and two `max-width` media queries (768px and 480px) adjust the layout for tablets and phones.

## JavaScript Layer

All behaviour lives in `scripts/app.js`, inside a single `TaskFlow` class that is created once the DOM has loaded.

| Responsibility | Typical methods |
| --- | --- |
| Start-up | `initializeApp`, `showWelcomeMessage`, `bindEvents` |
| Task operations | `addTask`, `deleteTask`, `toggleTask`, `editTask`, `clearAllTasks` |
| Rendering | `renderTasks`, `updateStats` |
| Persistence | `saveTasks`, `loadTasks`, `getNextTaskId` |
| Utilities | `escapeHtml`, `showNotification`, `exportTasks`, `getTaskStats` |

**Start-up sequence**

1. `DOMContentLoaded` fires and a `TaskFlow` instance is created.
2. Saved tasks and the ID counter are loaded from `localStorage`.
3. Event listeners are attached (button click and Enter key); the input receives focus.
4. The list and statistics are rendered for the first time.

The class keeps the application state (the `tasks` array and an ID counter). Every change follows the same pattern: update state, save, re-render.

## Data Model and Persistence

Each task is a plain object:

```js
{
  id: 1,                          // unique number
  text: "Write documentation",    // description
  completed: false,               // completion status
  createdAt: "2026-10-08T12:00:00.000Z",
  completedAt: null               // ISO date once completed
}
```

The whole array is stored as JSON in `localStorage` under the key `taskflow_tasks`, and the next free ID under `taskflow_counter`. Reading and writing happen inside `try/catch` blocks: if storage is unavailable or the JSON is invalid, the app logs the error and falls back to an empty list (or shows an error notification when saving fails).

## Data Flow

```
User action -> event listener -> method call -> state update -> save -> re-render
```

Example, adding a task:

1. The user types text and clicks "Add Task" or presses Enter.
2. `addTask()` trims the input and shows a warning if it is empty.
3. A new task object is created and pushed to `tasks`.
4. `saveTasks()` writes the array to `localStorage`.
5. `renderTasks()` and `updateStats()` refresh the interface.
6. A success notification is shown, and the input is cleared and focused for the next task.

## Security and Accessibility

- **XSS prevention**: task text is passed through `escapeHtml()` before it is inserted into the list.
- **Input validation**: empty descriptions are rejected with a warning.
- **Safe storage handling**: storage errors are caught and the app keeps working.
- **Confirmation dialogs**: deleting a task or clearing all tasks asks for confirmation first.
- **Accessibility**: the page uses `header`, `main` and `footer` and can be used with the keyboard. There is room to improve (ARIA labels, a `<label>` for the input, a maximum task length).

## Future Improvements

- Move colours and spacing into CSS custom properties.
- Add ARIA labels and a maximum task length.
- Split the code into ES modules and smaller components.
- Add automated tests and linting.
- Add offline support with a service worker.
- Introduce task priorities, due dates and filters.
- Set up a CI workflow that checks every pull request.
