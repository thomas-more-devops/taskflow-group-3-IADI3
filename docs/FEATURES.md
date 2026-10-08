# TaskFlow Features

> What TaskFlow does today, how to use each feature and how it works under the hood.

TaskFlow is a small task manager built with plain HTML, CSS and JavaScript. It runs entirely in the browser, has no external dependencies apart from the Inter font from Google Fonts, and stores everything in `localStorage`.

## Table of Contents

- [Task Management](#task-management)
- [Statistics](#statistics)
- [Notifications](#notifications)
- [Data Persistence](#data-persistence)
- [User Interface](#user-interface)
- [Security](#security)
- [Developer Utilities](#developer-utilities)
- [Known Limitations](#known-limitations)
- [Planned Features](#planned-features)
- [FAQ](#faq)

## Task Management

### Add a task
1. Type a description in the **"What needs to be done?"** field.
2. Press **Enter** or click **Add Task**.

- Leading and trailing spaces are removed.
- Empty or whitespace-only input is rejected with a warning notification.
- Each task gets a unique numeric `id`, a `createdAt` timestamp and starts as not completed.
- The input is cleared and focused again so you can add the next task straight away.

### Complete a task
Click the round checkbox next to a task to mark it as completed. Click it again to mark it as pending.

- Completed tasks get the `completed` style (strikethrough and lighter look).
- The completion time is stored in `completedAt` and cleared again when the task is reopened.

### Edit a task
1. Click the ✏️ button on a task.
2. Change the text in the browser prompt and click **OK**.

- Clicking **Cancel** or leaving the text empty keeps the original description.

### Delete a task
1. Click the 🗑️ button on a task.
2. Confirm in the browser dialog.

- Deletion is permanent: there is no undo.

### Sorting
Tasks are shown in this order:
1. Pending tasks before completed tasks.
2. Within each group, the newest task first (by `createdAt`).

### Empty state
When there are no tasks, the list is hidden and a friendly empty-state message is shown instead.

## Statistics

The statistics panel updates after every add, complete, reopen and delete action:

| Metric | Meaning |
|--------|---------|
| **Total** | Number of tasks in the list |
| **Completed** | Tasks marked as done |
| **Pending** | Total minus completed |

The header also shows a live counter, for example `1 task` or `5 tasks`.

## Notifications

Every action shows a small toast in the top-right corner for 3 seconds:

| Type | Colour | Example |
|------|--------|---------|
| `success` | Green | "Task added successfully!" |
| `warning` | Orange | "Please enter a task description" |
| `error` | Red | "Failed to save tasks. Please check your browser storage." |
| `info` | Blue | Default when no type is given |

Each notification is also written to the browser console, which helps when debugging.

## Data Persistence

TaskFlow uses two `localStorage` keys:

| Key | Content |
|-----|---------|
| `taskflow_tasks` | JSON array with all tasks |
| `taskflow_counter` | The next task `id` to use |

Each task is stored like this:

```json
{
  "id": 1,
  "text": "Write the README",
  "completed": false,
  "createdAt": "2026-10-08T12:00:00.000Z",
  "completedAt": null
}
```

- Tasks are saved automatically after every change, so they survive page reloads and browser restarts.
- If saving fails (for example storage is full or blocked), an error notification is shown.
- If the stored data is missing or corrupted, TaskFlow starts with an empty list instead of crashing, and entries that are not valid tasks are skipped.
- If the stored counter is missing or invalid, the next `id` is calculated from the highest existing task `id`.

## User Interface

- **Layout:** a single centred card with the input, the task list and the statistics.
- **Style:** purple gradient background, translucent card with `backdrop-filter: blur`, Inter font.
- **Animation:** new tasks slide in (`slideIn` keyframes); buttons and tasks react on hover.
- **Responsive:** extra rules for screens up to `768px` and up to `480px` wide.
- **Keyboard:** the input is focused on page load and **Enter** adds a task.

## Security

- **XSS protection:** task text is passed through `escapeHtml()` before it is inserted into the page, so typing HTML such as `<script>` shows it as plain text instead of running it.
- **Privacy:** no data leaves the browser; there is no server and no tracking.

## Developer Utilities

These methods exist in `scripts/app.js` but have no button in the interface yet. You can call them from the browser console through the global `taskFlow` object:

| Method | What it does |
|--------|--------------|
| `taskFlow.exportTasks()` | Downloads all tasks as `taskflow_backup.json` |
| `taskFlow.clearAllTasks()` | Deletes all tasks after a confirmation |
| `taskFlow.getTaskStats()` | Returns total, completed, pending, created today and completed today |

## Known Limitations

- Data lives in one browser on one device: clearing browser data deletes all tasks.
- Editing and deleting use the browser's built-in `prompt()` and `confirm()` dialogs.
- There is no undo for deletes.
- The task checkboxes are `div` elements, so they cannot be toggled with the keyboard yet.
- There is no import function for exported JSON files.

## Planned Features

Ideas for future work (see the repository issues):

- Categories, priorities and due dates
- Search and filter
- Dark mode
- Import of exported tasks
- Keyboard shortcuts (Space to toggle, Escape to cancel editing)

## FAQ

**Where is my data stored?**
Only in your browser's `localStorage`. Nothing is sent to a server.

**Does TaskFlow work offline?**
Yes, once the page is loaded. Without internet the Inter font may not load, and the browser falls back to a system font.

**Why did my tasks disappear?**
Most likely the browser data for the site was cleared, or you opened TaskFlow in another browser or a private window.

---

For installation see [SETUP.md](SETUP.md). For the code structure see [ARCHITECTURE.md](ARCHITECTURE.md) and for the workflow see [CONTRIBUTING.md](CONTRIBUTING.md).
