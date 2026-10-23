class TaskFlow {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextTaskId();
        this.currentDueDateFilter = 'all';
        this.currentCategoryFilter = 'all';
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

    // Returns a date as YYYY-MM-DD in the user's local time zone.
    // toISOString() uses UTC, which can be one day off around midnight.
    getLocalDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    bindEvents() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');

        addTaskBtn.addEventListener('click', () => this.addTask());

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Due date filter buttons
        document.querySelectorAll('.due-date-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setDueDateFilter(e.currentTarget.dataset.filter);
            });
        });

        // Category filter buttons
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setCategoryFilter(e.currentTarget.dataset.category);
            });
        });

        // Focus on input when page loads
        taskInput.focus();
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const categorySelect = document.getElementById('categorySelect');
        const dueDateInput = document.getElementById('dueDateInput');
        const prioritySelect = document.getElementById('prioritySelect');
        const taskText = taskInput.value.trim();
        const category = categorySelect.value;
        const dueDate = dueDateInput.value;
        const priority = prioritySelect.value;

        if (taskText === '') {
            this.showNotification('Please enter a task description', 'warning');
            taskInput.focus();
            return;
        }

        const newTask = {
            id: this.taskIdCounter++,
            text: taskText,
            category: category,
            dueDate: dueDate || null,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.push(newTask);
        this.saveTasks();
        if (this.currentCategoryFilter !== 'all' && this.currentCategoryFilter !== category) {
            this.setCategoryFilter('all');
        } else {
            this.renderTasks();
        }
        this.updateStats();

        taskInput.value = '';
        categorySelect.value = 'personal';
        dueDateInput.value = '';
        prioritySelect.value = 'medium';
        taskInput.focus();

        this.showNotification('Task added successfully!', 'success');
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    toggleTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();

            const message = task.completed ? 'Task completed! 🎉' : 'Task marked as pending';
            this.showNotification(message, 'success');
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            const newText = prompt('Edit task:', task.text);
            if (newText !== null && newText.trim() !== '') {
                task.text = newText.trim();
                this.saveTasks();
                this.renderTasks();
                this.showNotification('Task updated successfully!', 'success');
            }
        }
    }

    setDueDateFilter(filter) {
        this.currentDueDateFilter = filter;

        // Update button states
        document.querySelectorAll('.due-date-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.due-date-filter-btn[data-filter="${filter}"]`).classList.add('active');

        this.renderTasks();
    }

    setCategoryFilter(category) {
        this.currentCategoryFilter = category;

        // Update button states
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.renderTasks();
    }

    matchesCategoryFilter(task) {
        if (this.currentCategoryFilter === 'all') {
            return true;
        }
        return task.category === this.currentCategoryFilter;
    }

    matchesDueDateFilter(task) {
        const today = this.getLocalDateString();

        switch (this.currentDueDateFilter) {
            case 'all':
                return true;
            case 'due-today':
                return task.dueDate === today;
            case 'overdue':
                return task.dueDate && task.dueDate < today && !task.completed;
            case 'no-due-date':
                return !task.dueDate;
            default:
                return true;
        }
    }

    getFilteredTasks() {
        // Both filters apply at the same time
        return this.tasks.filter(task =>
            this.matchesCategoryFilter(task) && this.matchesDueDateFilter(task)
        );
    }

    getCategoryIcon(category) {
        const icons = {
            work: '💼',
            personal: '📝',
            shopping: '🛒',
            health: '🏥',
            study: '📚'
        };
        return icons[category] || '📝';
    }

    getCategoryColor(category) {
        const colors = {
            work: '#3182ce',
            personal: '#38a169',
            shopping: '#ed8936',
            health: '#e53e3e',
            study: '#805ad5'
        };
        return colors[category] || '#38a169';
    }

    isOverdue(task) {
        if (!task.dueDate || task.completed) return false;
        const today = this.getLocalDateString();
        return task.dueDate < today;
    }

    isDueToday(task) {
        if (!task.dueDate) return false;
        const today = this.getLocalDateString();
        return task.dueDate === today;
    }

    formatDueDate(dateString) {
        if (!dateString) return '';

        // Parse YYYY-MM-DD as a local date (new Date('YYYY-MM-DD') is UTC midnight)
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const taskDate = date.toDateString();
        const todayString = today.toDateString();
        const tomorrowString = tomorrow.toDateString();

        if (taskDate === todayString) {
            return 'Today';
        } else if (taskDate === tomorrowString) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    getPriorityValue(priority) {
        const priorities = { high: 3, medium: 2, low: 1 };
        return priorities[priority] || 2;
    }

    getPriorityIcon(priority) {
        const icons = { high: '🔥', medium: '⚡', low: '📌' };
        return icons[priority] || '⚡';
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            const hasFilter = this.currentCategoryFilter !== 'all' || this.currentDueDateFilter !== 'all';
            emptyState.querySelector('h3').textContent = hasFilter
                ? 'No tasks match these filters'
                : 'No tasks yet';
            emptyState.querySelector('p').textContent = hasFilter
                ? 'Choose another filter or add a task above.'
                : 'Add your first task above to get started!';
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        tasksList.style.display = 'flex';
        emptyState.style.display = 'none';

        // Sort tasks: incomplete first, then by priority (high to low), then by due date, then by category, then by creation date
        const sortedTasks = [...filteredTasks].sort((a, b) => {
            // First sort by completion status (incomplete first)
            if (a.completed !== b.completed) {
                return a.completed - b.completed;
            }

            // Then sort by priority (high to low)
            const priorityDiff = this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority);
            if (priorityDiff !== 0) {
                return priorityDiff;
            }

            // Then sort by due date (overdue first, then by date)
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (a.dueDate) {
                return -1;
            } else if (b.dueDate) {
                return 1;
            }

            // Then sort by category
            if (a.category !== b.category) {
                return a.category.localeCompare(b.category);
            }

            // Finally sort by creation date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        tasksList.innerHTML = sortedTasks.map(task => {
            const isOverdue = this.isOverdue(task);
            const isDueToday = this.isDueToday(task);
            const dueDateText = this.formatDueDate(task.dueDate);

            return `
                <div class="task-item ${task.completed ? 'completed' : ''} category-${task.category} priority-${task.priority} ${isOverdue ? 'overdue' : ''} ${isDueToday ? 'due-today' : ''}" data-task-id="${task.id}">
                    <div class="task-content">
                        <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                             onclick="taskFlow.toggleTask(${task.id})">
                        </div>
                        <span class="task-text">${this.escapeHtml(task.text)}</span>
                        <span class="category-badge category-${task.category}" style="background-color: ${this.getCategoryColor(task.category)}">
                            ${this.getCategoryIcon(task.category)} ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                        </span>
                        <span class="priority-badge priority-${task.priority}">
                            ${this.getPriorityIcon(task.priority)} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        ${task.dueDate ? `
                            <span class="due-date-badge ${isOverdue ? 'overdue' : ''} ${isDueToday ? 'due-today' : ''}">
                                📅 ${dueDateText}
                            </span>
                        ` : ''}
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
            `;
        }).join('');
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const categoriesUsed = new Set(this.tasks.map(task => task.category)).size;
        const overdueTasks = this.tasks.filter(task => this.isOverdue(task)).length;
        const highPriorityTasks = this.tasks.filter(task => task.priority === 'high' && !task.completed).length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('categoriesUsed').textContent = categoriesUsed;
        document.getElementById('overdueTasks').textContent = overdueTasks;
        document.getElementById('highPriorityTasks').textContent = highPriorityTasks;

        // Update task count in header
        const taskCount = document.getElementById('taskCount');
        taskCount.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;

        // Update category and due date statistics
        this.updateCategoryStats();
        this.updateDueDateStats();
    }

    updateCategoryStats() {
        const categoryStats = document.getElementById('categoryStats');
        const categories = ['work', 'personal', 'shopping', 'health', 'study'];

        const categoryData = categories.map(category => {
            const total = this.tasks.filter(task => task.category === category).length;
            const completed = this.tasks.filter(task => task.category === category && task.completed).length;
            const pending = total - completed;

            return {
                category,
                total,
                completed,
                pending,
                icon: this.getCategoryIcon(category),
                color: this.getCategoryColor(category)
            };
        }).filter(data => data.total > 0);

        categoryStats.innerHTML = categoryData.map(data => `
            <div class="category-stat-item">
                <div class="category-stat-header">
                    <span class="category-icon">${data.icon}</span>
                    <span class="category-name">${data.category.charAt(0).toUpperCase() + data.category.slice(1)}</span>
                    <span class="category-total">${data.total}</span>
                </div>
                <div class="category-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.total ? (data.completed / data.total) * 100 : 0}%; background-color: ${data.color}"></div>
                    </div>
                    <span class="progress-text">${data.completed}/${data.total} completed</span>
                </div>
            </div>
        `).join('');

        if (categoryData.length === 0) {
            categoryStats.innerHTML = '<p class="no-categories">No tasks with categories yet.</p>';
        }
    }

    updateDueDateStats() {
        const dueDateStats = document.getElementById('dueDateStats');
        const today = this.getLocalDateString();

        const stats = {
            dueToday: this.tasks.filter(task => task.dueDate === today && !task.completed).length,
            overdue: this.tasks.filter(task => this.isOverdue(task)).length,
            upcoming: this.tasks.filter(task => task.dueDate && task.dueDate > today && !task.completed).length,
            noDueDate: this.tasks.filter(task => !task.dueDate && !task.completed).length
        };

        dueDateStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-icon">📅</span>
                <span class="stat-text">Due Today: ${stats.dueToday}</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">⚠️</span>
                <span class="stat-text">Overdue: ${stats.overdue}</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">📋</span>
                <span class="stat-text">Upcoming: ${stats.upcoming}</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">📝</span>
                <span class="stat-text">No Due Date: ${stats.noDueDate}</span>
            </div>
        `;
    }

    saveTasks() {
        try {
            localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
            localStorage.setItem('taskflow_counter', this.taskIdCounter.toString());
        } catch (error) {
            console.error('Failed to save tasks:', error);
            this.showNotification('Failed to save tasks. Please check your browser storage.', 'error');
        }
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('taskflow_tasks');
            const tasks = saved ? JSON.parse(saved) : [];

            // localStorage can be edited by the user, so treat stored values as untrusted:
            // only keep known priorities and well-formed YYYY-MM-DD due dates.
            const validCategories = ['work', 'personal', 'shopping', 'health', 'study'];
            const validPriorities = ['high', 'medium', 'low'];
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;

            return tasks.map(task => ({
                ...task,
                category: validCategories.includes(task.category) ? task.category : 'personal',
                priority: validPriorities.includes(task.priority) ? task.priority : 'medium',
                dueDate: typeof task.dueDate === 'string' && datePattern.test(task.dueDate) ? task.dueDate : null
            }));
        } catch (error) {
            console.error('Failed to load tasks:', error);
            return [];
        }
    }

    getNextTaskId() {
        try {
            const saved = localStorage.getItem('taskflow_counter');
            return saved ? parseInt(saved) : 1;
        } catch (error) {
            console.error('Failed to load task counter:', error);
            return 1;
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showNotification(message, type = 'info') {
        // Simple notification system
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

        // Set color based on type
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

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Utility methods for potential future features
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'taskflow_backup.json';
        link.click();

        URL.revokeObjectURL(url);
        this.showNotification('Tasks exported successfully!', 'success');
    }

    clearAllTasks() {
        if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('All tasks cleared!', 'success');
        }
    }

    getTaskStats() {
        const now = new Date();
        const today = this.getLocalDateString(now);
        const categoryBreakdown = {};

        ['work', 'personal', 'shopping', 'health', 'study'].forEach(category => {
            categoryBreakdown[category] = {
                total: this.tasks.filter(t => t.category === category).length,
                completed: this.tasks.filter(t => t.category === category && t.completed).length,
                pending: this.tasks.filter(t => t.category === category && !t.completed).length
            };
        });

        const stats = {
            total: this.tasks.length,
            completed: this.tasks.filter(t => t.completed).length,
            pending: this.tasks.filter(t => !t.completed).length,
            categoriesUsed: new Set(this.tasks.map(t => t.category)).size,
            categoryBreakdown,
            dueToday: this.tasks.filter(t => t.dueDate === today && !t.completed).length,
            overdue: this.tasks.filter(t => this.isOverdue(t)).length,
            upcoming: this.tasks.filter(t => t.dueDate && t.dueDate > today && !t.completed).length,
            highPriority: this.tasks.filter(t => t.priority === 'high' && !t.completed).length,
            mediumPriority: this.tasks.filter(t => t.priority === 'medium' && !t.completed).length,
            lowPriority: this.tasks.filter(t => t.priority === 'low' && !t.completed).length,
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskFlow = new TaskFlow();
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskFlow;
}
