class TaskFlow {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextTaskId();
        this.currentFilter = 'all';
        this.currentDueDateFilter = 'all';
        this.currentCategoryFilter = 'all';
        this.currentSort = 'priority';
        this.searchQuery = '';
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
        const searchInput = document.getElementById('searchInput');
        const clearSearch = document.getElementById('clearSearch');
        const sortSelect = document.getElementById('sortSelect');
        const toggleAdvanced = document.getElementById('toggleAdvanced');
        const clearAllFilters = document.getElementById('clearAllFilters');

        addTaskBtn.addEventListener('click', () => this.addTask());

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Search functionality (debounced so the list is not rebuilt on every keystroke)
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.renderTasks();
                this.updateStats();
            }, 150);
        });

        clearSearch.addEventListener('click', () => {
            clearTimeout(this.searchTimeout);
            searchInput.value = '';
            this.searchQuery = '';
            this.renderTasks();
            this.updateStats();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.currentTarget.dataset.filter);
            });
        });

        // Sort functionality
        sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });

        // Advanced panel toggle
        toggleAdvanced.addEventListener('click', () => {
            this.toggleAdvancedPanel();
        });

        // Clear all filters
        clearAllFilters.addEventListener('click', () => {
            this.clearAllFilters();
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

        // If the search or any filter would hide the new task, reset them so it stays visible
        const hiddenByFilters = !this.getFilteredTasks().includes(newTask);
        if (hiddenByFilters) {
            this.resetFilters();
        } else {
            this.renderTasks();
            this.updateStats();
        }

        taskInput.value = '';
        categorySelect.value = 'personal';
        dueDateInput.value = '';
        prioritySelect.value = 'medium';
        taskInput.focus();

        this.showNotification(hiddenByFilters
            ? 'Task added! Search and filters were cleared so you can see it.'
            : 'Task added successfully!', 'success');
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
        this.updateStats();
    }

    setCategoryFilter(category) {
        this.currentCategoryFilter = category;

        // Update button states
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.category-filter-btn[data-category="${category}"]`).classList.add('active');

        this.renderTasks();
        this.updateStats();
    }

    setFilter(filter) {
        this.currentFilter = filter;

        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // Scoped to .filter-btn so it never matches the due date filter buttons
        document.querySelector(`.filter-btn[data-filter="${filter}"]`).classList.add('active');

        this.renderTasks();
        this.updateStats();
    }

    toggleAdvancedPanel() {
        const panel = document.getElementById('advancedPanel');
        const toggleIcon = document.querySelector('.toggle-icon');

        const toggleButton = document.getElementById('toggleAdvanced');

        if (panel.style.display === 'none' || !panel.style.display) {
            panel.style.display = 'block';
            toggleIcon.textContent = '▲';
            toggleButton.setAttribute('aria-expanded', 'true');
        } else {
            panel.style.display = 'none';
            toggleIcon.textContent = '▼';
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    }

    clearAllFilters() {
        // Reset sort
        this.currentSort = 'priority';
        document.getElementById('sortSelect').value = 'priority';

        this.resetFilters();
        this.showNotification('All filters cleared', 'info');
    }

    // Resets the search and every filter (status, category, due date) but keeps the chosen sort
    resetFilters() {
        // Reset search
        clearTimeout(this.searchTimeout);
        document.getElementById('searchInput').value = '';
        this.searchQuery = '';

        // Reset category and due date filters (button states only, the render happens once below)
        this.currentCategoryFilter = 'all';
        this.currentDueDateFilter = 'all';
        document.querySelectorAll('.category-filter-btn, .due-date-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.category-filter-btn[data-category="all"]').classList.add('active');
        document.querySelector('.due-date-filter-btn[data-filter="all"]').classList.add('active');

        // Reset the status filter (setFilter() renders the list and updates the stats once)
        this.setFilter('all');
    }

    matchesSearch(task) {
        if (!this.searchQuery) return true;
        return task.text.toLowerCase().includes(this.searchQuery);
    }

    matchesFilter(task) {
        const now = new Date();
        const taskCreated = new Date(task.createdAt);
        const isRecent = (now - taskCreated) < (24 * 60 * 60 * 1000); // Last 24 hours

        switch (this.currentFilter) {
            case 'all':
                return true;
            case 'completed':
                return task.completed;
            case 'pending':
                return !task.completed;
            case 'recent':
                return isRecent;
            default:
                return true;
        }
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
        // Search, status, category and due date filters all apply at the same time
        return this.tasks.filter(task =>
            this.matchesSearch(task) &&
            this.matchesFilter(task) &&
            this.matchesCategoryFilter(task) &&
            this.matchesDueDateFilter(task)
        );
    }

    hasActiveFilters() {
        return Boolean(this.searchQuery) ||
            this.currentFilter !== 'all' ||
            this.currentCategoryFilter !== 'all' ||
            this.currentDueDateFilter !== 'all';
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

    // Default sort shared by the priority system, due dates and categories:
    // pending first, then priority (high to low), due date, category and newest first
    compareByPriority(a, b) {
        if (a.completed !== b.completed) {
            return a.completed - b.completed;
        }

        const priorityDiff = this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority);
        if (priorityDiff !== 0) {
            return priorityDiff;
        }

        if (a.dueDate && b.dueDate) {
            if (a.dueDate !== b.dueDate) {
                return a.dueDate < b.dueDate ? -1 : 1;
            }
        } else if (a.dueDate) {
            return -1;
        } else if (b.dueDate) {
            return 1;
        }

        if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
    }

    getSortedTasks(tasks) {
        const sortedTasks = [...tasks];

        switch (this.currentSort) {
            case 'created-desc':
                return sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'created-asc':
                return sortedTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'priority':
                // Default order of the app: pending first, then priority, due date, category and newest
                return sortedTasks.sort((a, b) => this.compareByPriority(a, b));
            case 'alphabetical':
                return sortedTasks.sort((a, b) => a.text.localeCompare(b.text));
            case 'completion':
                return sortedTasks.sort((a, b) => {
                    if (a.completed !== b.completed) {
                        return a.completed - b.completed;
                    }
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
            default:
                return sortedTasks;
        }
    }

    highlightSearchTerm(text) {
        if (!this.searchQuery) return this.escapeHtml(text);

        // Split the raw text around the matches and escape each piece separately,
        // so the highlight can never cut an HTML entity like &amp; in half
        const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
        return text
            .split(regex)
            .map((part, index) => index % 2 === 1
                ? `<mark class="search-highlight">${this.escapeHtml(part)}</mark>`
                : this.escapeHtml(part))
            .join('');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    updateSearchResults(filteredTasks = this.getFilteredTasks()) {
        const searchResults = document.getElementById('searchResults');
        const totalTasks = this.tasks.length;

        if (this.hasActiveFilters()) {
            searchResults.textContent = `Showing ${filteredTasks.length} of ${totalTasks}`;
            searchResults.style.display = 'inline';
        } else {
            searchResults.style.display = 'none';
        }
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const noResults = document.getElementById('noResults');
        const filteredTasks = this.getFilteredTasks();
        const sortedTasks = this.getSortedTasks(filteredTasks);

        // Reuse the filtered list for the "Showing X of Y" text instead of filtering again
        this.updateSearchResults(filteredTasks);

        // Hide both states initially
        emptyState.style.display = 'none';
        noResults.style.display = 'none';

        if (this.tasks.length === 0) {
            // No tasks at all
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        if (sortedTasks.length === 0) {
            // Tasks exist but none match the search or filters
            tasksList.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        tasksList.style.display = 'flex';

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
                        <span class="task-text">${this.highlightSearchTerm(task.text)}</span>
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
                        <span class="task-meta">
                            ${new Date(task.createdAt).toLocaleDateString()}
                        </span>
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
        const filteredTasks = this.getFilteredTasks().length;
        const highPriorityTasks = this.tasks.filter(task => task.priority === 'high' && !task.completed).length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('categoriesUsed').textContent = categoriesUsed;
        document.getElementById('overdueTasks').textContent = overdueTasks;
        document.getElementById('filteredTasks').textContent = filteredTasks;
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
            filtered: this.getFilteredTasks().length,
            searchQuery: this.searchQuery,
            currentFilter: this.currentFilter,
            currentSort: this.currentSort,
            createdToday: this.tasks.filter(t => {
                const taskDate = new Date(t.createdAt);
                return taskDate.toDateString() === now.toDateString();
            }).length,
            completedToday: this.tasks.filter(t => {
                if (!t.completedAt) return false;
                const completedDate = new Date(t.completedAt);
                return completedDate.toDateString() === now.toDateString();
            }).length,
            recent: this.tasks.filter(t => {
                const taskCreated = new Date(t.createdAt);
                return (now - taskCreated) < (24 * 60 * 60 * 1000);
            }).length
        };
        return stats;
    }

    // Advanced search functionality
    searchByKeyword(keyword) {
        this.searchQuery = keyword.toLowerCase();
        document.getElementById('searchInput').value = keyword;
        this.renderTasks();
        this.updateStats();
    }

    // Bulk operations
    markAllCompleted() {
        const filteredTasks = this.getFilteredTasks();
        const pendingTasks = filteredTasks.filter(task => !task.completed);

        if (pendingTasks.length === 0) {
            this.showNotification('No pending tasks to complete', 'info');
            return;
        }

        pendingTasks.forEach(task => {
            task.completed = true;
            task.completedAt = new Date().toISOString();
        });

        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.showNotification(`Marked ${pendingTasks.length} tasks as completed`, 'success');
    }

    deleteCompleted() {
        const completedTasks = this.tasks.filter(task => task.completed);

        if (completedTasks.length === 0) {
            this.showNotification('No completed tasks to delete', 'info');
            return;
        }

        if (confirm(`Delete ${completedTasks.length} completed tasks? This cannot be undone.`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification(`Deleted ${completedTasks.length} completed tasks`, 'success');
        }
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
