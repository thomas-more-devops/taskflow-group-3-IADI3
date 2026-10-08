/**
 * TaskFlow - simple task manager.
 *
 * All application logic lives in the TaskFlow class:
 * - state: the list of tasks and the next free id
 * - persistence: tasks are stored in the browser's localStorage
 * - rendering: the task list and statistics are rebuilt after every change
 *
 * One instance is created on page load and exposed as `window.taskFlow`,
 * because the buttons rendered in the task list call it from inline onclick handlers.
 */

// localStorage keys, kept in one place so they cannot get out of sync.
const STORAGE_KEYS = {
    tasks: 'taskflow_tasks',
    counter: 'taskflow_counter'
};

class TaskFlow {
    /**
     * Loads saved data, connects the UI and draws the first render.
     */
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextTaskId();
        this.initializeApp();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    initializeApp() {
        console.log('TaskFlow initialized successfully!');
        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        if (this.tasks.length === 0) {
            console.log('Welcome to TaskFlow! Add your first task to get started.');
        }
    }

    /**
     * Small helper around getElementById that logs a clear error
     * when an element the app depends on is missing from index.html.
     * @param {string} id - The element id.
     * @returns {HTMLElement|null}
     */
    getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`TaskFlow: element with id "${id}" was not found in the page.`);
        }
        return element;
    }

    /**
     * Connects the "Add Task" button and the Enter key to addTask().
     */
    bindEvents() {
        const addTaskBtn = this.getElement('addTaskBtn');
        const taskInput = this.getElement('taskInput');

        // Without these elements the user cannot add tasks, so stop here.
        if (!addTaskBtn || !taskInput) {
            return;
        }

        addTaskBtn.addEventListener('click', () => this.addTask());

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Focus on input when page loads
        taskInput.focus();
    }

    /**
     * Creates a new task from the input field, saves it and refreshes the UI.
     * Empty or whitespace-only input is rejected with a warning.
     */
    addTask() {
        const taskInput = this.getElement('taskInput');
        if (!taskInput) {
            return;
        }

        const taskText = taskInput.value.trim();

        if (taskText === '') {
            this.showNotification('Please enter a task description', 'warning');
            taskInput.focus();
            return;
        }

        const newTask = {
            id: this.taskIdCounter++,
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        taskInput.value = '';
        taskInput.focus();

        this.showNotification('Task added successfully!', 'success');
    }

    /**
     * Finds a task by id and shows an error notification when it does not exist
     * (for example when the page is out of sync with localStorage).
     * @param {number} taskId
     * @returns {object|undefined} The task, or undefined if not found.
     */
    findTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (!task) {
            console.warn(`TaskFlow: task with id ${taskId} was not found.`);
            this.showNotification('Task not found. Please reload the page.', 'error');
        }
        return task;
    }

    /**
     * Deletes a task after the user confirms.
     * @param {number} taskId
     */
    deleteTask(taskId) {
        if (!this.findTask(taskId)) {
            return;
        }

        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    /**
     * Switches a task between completed and pending and stores when it was completed.
     * @param {number} taskId
     */
    toggleTask(taskId) {
        const task = this.findTask(taskId);
        if (!task) {
            return;
        }

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        const message = task.completed ? 'Task completed! 🎉' : 'Task marked as pending';
        this.showNotification(message, 'success');
    }

    /**
     * Lets the user change a task's text through a browser prompt.
     * Cancel or an empty value keeps the original text.
     * @param {number} taskId
     */
    editTask(taskId) {
        const task = this.findTask(taskId);
        if (!task) {
            return;
        }

        const newText = prompt('Edit task:', task.text);
        if (newText === null) {
            return; // user pressed Cancel
        }

        if (newText.trim() === '') {
            this.showNotification('Task description cannot be empty', 'warning');
            return;
        }

        task.text = newText.trim();
        this.saveTasks();
        this.renderTasks();
        this.showNotification('Task updated successfully!', 'success');
    }

    /**
     * Rebuilds the task list in the DOM.
     * Shows the empty state when there are no tasks.
     */
    renderTasks() {
        const tasksList = this.getElement('tasksList');
        const emptyState = this.getElement('emptyState');
        if (!tasksList || !emptyState) {
            return;
        }

        if (this.tasks.length === 0) {
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        tasksList.style.display = 'flex';
        emptyState.style.display = 'none';

        // Sort tasks: incomplete first, then newest first
        const sortedTasks = [...this.tasks].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed - b.completed;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Task text goes through escapeHtml() so user input cannot inject HTML (XSS).
        tasksList.innerHTML = sortedTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                         onclick="taskFlow.toggleTask(${task.id})">
                    </div>
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                </div>
                <div class="task-actions">
                    <button class="task-btn edit-btn" onclick="taskFlow.editTask(${task.id})" title="Edit task">
                        ✏️
                    </button>
                    <button class="task-btn delete-btn" onclick="taskFlow.deleteTask(${task.id})" title="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Updates the statistics panel and the task counter in the header.
     */
    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        const values = {
            totalTasks: totalTasks,
            completedTasks: completedTasks,
            pendingTasks: pendingTasks,
            taskCount: `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`
        };

        // Skip any element that is missing instead of throwing an error.
        Object.entries(values).forEach(([id, value]) => {
            const element = this.getElement(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * Saves tasks and the id counter to localStorage.
     * Fails gracefully (for example when storage is full or blocked).
     */
    saveTasks() {
        try {
            localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(this.tasks));
            localStorage.setItem(STORAGE_KEYS.counter, this.taskIdCounter.toString());
        } catch (error) {
            console.error('Failed to save tasks:', error);
            this.showNotification('Failed to save tasks. Please check your browser storage.', 'error');
        }
    }

    /**
     * Reads tasks from localStorage.
     * Returns an empty list when nothing is saved or the data is corrupted,
     * and skips entries that are not valid tasks.
     * @returns {Array<object>}
     */
    loadTasks() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.tasks);
            if (!saved) {
                return [];
            }

            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed)) {
                console.warn('Saved tasks are not a list, starting with an empty list.');
                return [];
            }

            return parsed.filter(task =>
                task !== null &&
                typeof task === 'object' &&
                Number.isInteger(task.id) &&
                typeof task.text === 'string'
            );
        } catch (error) {
            console.error('Failed to load tasks:', error);
            return [];
        }
    }

    /**
     * Returns the next free task id.
     * Uses the saved counter, but never a value that is already taken,
     * so a missing or wrong counter cannot create duplicate ids.
     * @returns {number}
     */
    getNextTaskId() {
        const highestId = this.tasks.reduce((max, task) => Math.max(max, task.id), 0);

        try {
            const saved = parseInt(localStorage.getItem(STORAGE_KEYS.counter), 10);
            return Number.isNaN(saved) ? highestId + 1 : Math.max(saved, highestId + 1);
        } catch (error) {
            console.error('Failed to load task counter:', error);
            return highestId + 1;
        }
    }

    /**
     * Escapes HTML special characters so text is shown, not executed.
     * @param {string} unsafe
     * @returns {string}
     */
    escapeHtml(unsafe) {
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Shows a toast message in the top-right corner for 3 seconds.
     * @param {string} message
     * @param {'success'|'error'|'warning'|'info'} [type='info']
     */
    showNotification(message, type = 'info') {
        // Also log it, which helps when debugging
        console.log(`[${type.toUpperCase()}] ${message}`);

        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            max-width: 300px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        `;

        // Set color based on type (unknown types fall back to info)
        const colors = {
            success: '#48bb78',
            error: '#e53e3e',
            warning: '#ed8936',
            info: '#3182ce'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);

        // Animate out after 3 seconds, then remove.
        // remove() does nothing if the element is already gone, so it cannot throw.
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Utility methods for potential future features (callable from the console)

    /**
     * Downloads all tasks as a JSON backup file.
     */
    exportTasks() {
        try {
            const dataStr = JSON.stringify(this.tasks, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'taskflow_backup.json';
            link.click();

            URL.revokeObjectURL(url);
            this.showNotification('Tasks exported successfully!', 'success');
        } catch (error) {
            console.error('Failed to export tasks:', error);
            this.showNotification('Failed to export tasks.', 'error');
        }
    }

    /**
     * Deletes every task after confirmation. Cannot be undone.
     */
    clearAllTasks() {
        if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('All tasks cleared!', 'success');
        }
    }

    /**
     * Returns counts for all tasks and for today's activity.
     * @returns {{total: number, completed: number, pending: number, createdToday: number, completedToday: number}}
     */
    getTaskStats() {
        const now = new Date();
        const stats = {
            total: this.tasks.length,
            completed: this.tasks.filter(t => t.completed).length,
            pending: this.tasks.filter(t => !t.completed).length,
            createdToday: this.tasks.filter(t => {
                const taskDate = new Date(t.createdAt);
                return taskDate.toDateString() === now.toDateString();
            }).length,
            completedToday: this.tasks.filter(t => {
                if (!t.completedAt) return false;
                const completedDate = new Date(t.completedAt);
                return completedDate.toDateString() === now.toDateString();
            }).length
        };
        return stats;
    }
}

// Initialize the app when DOM is loaded.
// If something goes wrong during start-up, log it instead of failing silently.
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.taskFlow = new TaskFlow();
    } catch (error) {
        console.error('TaskFlow failed to start:', error);
    }
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskFlow;
}
