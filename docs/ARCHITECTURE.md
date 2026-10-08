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
- **Mobile-first**: base styles target small screens and are enhanced for larger ones.
- **Accessibility**: semantic markup, keyboard support and readable contrast.

| Concern | Technology |
| --- | --- |
| Markup | HTML5 |
| Styling | CSS3 (Flexbox, Grid, custom properties) |
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

`index.html` is a single semantic page. Its main areas are:

- **Header**: application title and tagline.
- **Task input section**: a text field and an "Add Task" button.
- **Tasks section**: the task counter, the dynamically rendered list and an empty-state message shown when there are no tasks.
- **Stats section**: cards showing totals (for example total, completed and pending tasks).
- **Footer**: closing information.

The list and the statistics are empty containers in the HTML. JavaScript fills them at runtime, so the markup stays small and the data stays in one place.

## CSS Layer

`styles/main.css` is organised from general to specific:

1. Reset and base styles
2. Design tokens (CSS custom properties: colours, spacing, font sizes, radii)
3. Layout (container, header, main sections)
4. Components (input, buttons, task items, stat cards)
5. States and utilities (for example the completed-task style)
6. Responsive rules (media queries, mobile-first)
7. Animations

Design tokens keep the look consistent and make theme changes a one-line edit. Class names follow a BEM-like `block__element--modifier` pattern.

## JavaScript Layer

All behaviour lives in `scripts/app.js`, inside a single `TaskFlow` class that is created once the DOM has loaded.

| Responsibility | Typical methods |
| --- | --- |
| Task operations | `addTask`, `deleteTask`, `toggleTask`, `editTask` |
| Rendering | `renderTasks`, `updateStats` |
| Persistence | `saveTasks`, `loadTasks` |
| Utilities | `escapeHtml`, `showNotification` |

**Start-up sequence**

1. `DOMContentLoaded` fires and a `TaskFlow` instance is created.
2. Saved tasks are loaded from `localStorage`.
3. Event listeners are attached (button click, Enter key, list actions).
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

The whole array is stored as JSON in `localStorage`. When loading, the data is parsed inside a `try/catch` and invalid entries are discarded, so corrupted storage never breaks the app.

## Data Flow

```
User action -> event listener -> method call -> state update -> save -> re-render
```

Example, adding a task:

1. The user types text and clicks "Add Task" or presses Enter.
2. `addTask()` validates and trims the input.
3. A new task object is created and pushed to `tasks`.
4. `saveTasks()` writes the array to `localStorage`.
5. `renderTasks()` and `updateStats()` refresh the interface.
6. The input is cleared and focused for the next task.

## Security and Accessibility

- **XSS prevention**: user text is escaped (or inserted with `textContent`) before being shown.
- **Input validation**: empty and overly long descriptions are rejected with a message.
- **Safe storage handling**: parsing errors fall back to an empty list.
- **Accessibility**: semantic elements, ARIA labels where needed, keyboard navigation, visible focus states and sufficient colour contrast.

## Future Improvements

- Split the code into ES modules and smaller components.
- Add automated tests and linting.
- Add offline support with a service worker.
- Introduce task priorities, due dates and filters.
- Set up a CI workflow that checks every pull request.
