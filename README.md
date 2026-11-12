# TaskFlow - Task Management Application

> A modern, responsive task management app built with HTML, CSS, and JavaScript

## 🚀 Live Demo
**Try TaskFlow now:** [https://thomas-more-devops.github.io/taskflow-group-3-IADI3](https://thomas-more-devops.github.io/taskflow-group-3-IADI3)

## 📊 Project Status
![TaskFlow](https://img.shields.io/badge/TaskFlow-v1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/thomas-more-devops/taskflow-group-3-IADI3)
![GitHub issues](https://img.shields.io/github/issues/thomas-more-devops/taskflow-group-3-IADI3)
![GitHub pull requests](https://img.shields.io/github/issues-pr/thomas-more-devops/taskflow-group-3-IADI3)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat&logo=javascript&logoColor=%23F7DF1E)

## 🎓 Course Context
This project is part of the **Bachelor International Business Management - Data Science, Protection & Security** course, **Week 2: Git Fundamentals**. It demonstrates:
- Modern web development practices
- Git workflow and collaboration
- Professional project documentation
- Responsive design principles
- Team-based software development

## 🚀 Features

- ✅ **Add Tasks**: Create new tasks with a simple, intuitive interface
- ✅ **Mark Complete**: Check off completed tasks with satisfying animations
- ✅ **Edit Tasks**: Modify task descriptions inline
- ✅ **Delete Tasks**: Remove tasks you no longer need
- ✅ **Persistent Storage**: Tasks are saved locally in your browser
- ✅ **Task Statistics**: View your productivity metrics
- ✅ **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- ✅ **Modern UI**: Clean, professional interface with smooth animations

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Flexbox, Grid, custom properties, and animations
- **JavaScript ES6+**: Classes, modules, and modern syntax
- **Local Storage API**: Client-side data persistence
- **Google Fonts**: Inter font family for typography

## 📱 Screenshots

### Desktop View
*Professional task management interface with clean design*

### Mobile View
*Fully responsive design that works on all devices*

## 🏃 How to Run

TaskFlow is a Node.js (Express) server that serves the frontend from `public/` and stores the tasks
through a small REST API (`/api/tasks`). The easiest way to run it is with Docker.

### Prerequisites

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), **started** (the whale icon must say "Docker Desktop is running")
- Port **3000** free on your computer

Check that Docker is ready:

```bash
docker --version
docker info
```

If `docker info` shows an error, Docker Desktop is not running yet.

### 1. Get the code

```bash
git clone https://github.com/thomas-more-devops/taskflow-group-3-IADI3.git
cd taskflow-group-3-IADI3
```

### 2. Build the image

```bash
docker build -t taskflow:1.1 .
```

### 3. Run the container

```bash
docker run -d -p 3000:3000 --name taskflow-app taskflow:1.1
```

Check that it is running and look at the logs:

```bash
docker ps
docker logs taskflow-app
```

The logs should end with `TaskFlow server running on port 3000`.

### 4. Open the app

Go to **http://localhost:3000**. Tasks you add in the UI are saved on the server, so they are still
there after you refresh the page.

### 5. Test the API

Check that the server is healthy:

```bash
curl http://localhost:3000/health
```

Create a task and list all tasks:

**macOS / Linux / Git Bash**

```bash
curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d '{"title":"Test task from API"}'
curl http://localhost:3000/api/tasks
```

**Windows Command Prompt (cmd)**

```bat
curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d "{\"title\":\"Test task from API\"}"
curl http://localhost:3000/api/tasks
```

**Windows PowerShell**

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/tasks -ContentType "application/json" -Body '{"title":"Test task from API"}'
Invoke-RestMethod http://localhost:3000/api/tasks
```

Refresh **http://localhost:3000**: the task created with the API now shows up in the list.

### 6. Stop and remove the container

```bash
docker stop taskflow-app
docker rm taskflow-app
```

> ⚠️ The tasks are stored **in memory** inside the container. Removing (or restarting) the container
> deletes them. Persistent storage with a database is added in a later version.

### Run without Docker (development)

Requires [Node.js 22](https://nodejs.org/) or newer.

```bash
npm install
npm start
```

Then open **http://localhost:3000**. To use another port, set the `PORT` environment variable
(`PORT=4000 npm start`, or `$env:PORT=4000; npm start` in PowerShell).

### Troubleshooting

| Problem | Solution |
|---|---|
| `docker info` fails / "cannot connect to the Docker daemon" | Start Docker Desktop and wait until it says it is running |
| `port is already allocated` | Port 3000 is in use. Run with another host port: `docker run -d -p 3001:3000 --name taskflow-app taskflow:1.1` and open http://localhost:3001 |
| `Conflict. The container name "/taskflow-app" is already in use` | Remove the old container first: `docker rm -f taskflow-app` |
| The container stops right after starting | Read the error with `docker logs taskflow-app` |
| The page loads but shows no tasks after a restart | Expected: tasks are kept in memory and are lost when the container is removed |

## 📋 Usage

### Adding Tasks
1. Type your task in the input field
2. Click "Add Task" or press Enter
3. Your task appears in the list below

### Managing Tasks
- **Complete**: Click the checkbox next to any task
- **Edit**: Click the edit icon (✏️) to modify the task text
- **Delete**: Click the delete icon (🗑️) to remove the task

### Viewing Statistics
The stats section shows:
- **Total Tasks**: All tasks you've created
- **Completed**: Tasks you've finished
- **Pending**: Tasks still to be done

## 💡 Learning Outcomes

Through this project, students learn:
- **Git Version Control**: Basic Git commands (add, commit, push, pull)
- **GitHub Collaboration**: Team workflows and pull requests
- **Professional Documentation**: README writing and code comments
- **Modern Web Development**: HTML5, CSS3, and JavaScript ES6+
- **Responsive Design**: Mobile-first CSS and flexible layouts
- **Data Persistence**: Local Storage API usage
- **User Experience**: Intuitive interface design and accessibility
- **Project Management**: Issue tracking and project organization

## 🎯 Learning Objectives

This project demonstrates:
- Modern HTML5 semantic markup
- CSS3 advanced features (Grid, Flexbox, animations)
- JavaScript ES6+ features (classes, arrow functions, template literals)
- Local Storage API for data persistence
- Responsive web design principles
- Progressive enhancement
- Accessibility best practices

## 📁 Project Structure

```
taskflow/
├── index.html              # Main HTML file
├── styles/
│   └── main.css           # All CSS styles
├── scripts/
│   └── app.js             # Application JavaScript
├── docs/
│   ├── SETUP.md           # Installation guide
│   ├── FEATURES.md        # Feature documentation
│   ├── ARCHITECTURE.md    # Technical documentation
│   └── CONTRIBUTING.md    # Contributing guidelines
├── .github/
│   └── pull_request_template.md  # PR template
├── .gitignore             # Git ignore rules
├── LICENSE                # MIT license
└── README.md              # This file
```

## 🛠️ Development Workflow

```bash
# Daily development workflow
git pull origin main                    # Get latest changes
git checkout -b feature/feature-name    # Create feature branch
# Make your changes to the code
git add .                              # Stage changes
git commit -m "feat: description"     # Commit with conventional message
git push origin feature/feature-name   # Push to remote
# Create Pull Request on GitHub for review
```

## 📈 Performance Metrics

- **Load Time**: <2 seconds on 3G connection
- **Lighthouse Score**: 95+ across all categories
- **Browser Support**: All modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- **Mobile Performance**: Fully responsive design with touch-friendly interactions
- **Accessibility**: WCAG 2.1 AA compliant

## 🚀 Deployment

### GitHub Pages
1. Push your code to a GitHub repository
2. Go to Settings → Pages
3. Select source: "Deploy from branch"
4. Choose "main" branch
5. Your app will be live at `https://thomas-more-devops.github.io/taskflow-group-3-IADI3`

### Local Development
Run `npm install` and `npm start`, then open http://localhost:3000. See [How to Run](#-how-to-run) for the Docker setup.

## 🌟 Key Features Explained

### Local Storage Integration
Tasks are automatically saved to your browser's local storage, ensuring persistence across sessions:

```javascript
// Automatic saving after every change
saveTasks() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
}
```

### Responsive Design
Mobile-first CSS approach with breakpoints for optimal viewing:

```css
@media (max-width: 768px) {
    .input-container {
        flex-direction: column;
    }
}
```

### Smooth Animations
CSS transitions and keyframe animations for delightful user experience:

```css
@keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
```

## 🎨 Design Principles

### Color Palette
- **Primary**: #667eea (Modern blue gradient)
- **Secondary**: #764ba2 (Complementary purple)
- **Success**: #48bb78 (Green for completed tasks)
- **Warning**: #ed8936 (Orange for notifications)
- **Error**: #e53e3e (Red for alerts)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Hierarchy**: Clear heading structure with proper font weights
- **Readability**: Optimal line height and letter spacing

### User Experience
- **Intuitive Interface**: Clear visual hierarchy and familiar patterns
- **Immediate Feedback**: Real-time notifications and visual confirmations
- **Error Prevention**: Input validation and confirmation dialogs
- **Accessibility**: Semantic HTML and proper ARIA attributes

## 🔧 Advanced Features

### Keyboard Shortcuts
- **Enter**: Add new task when input is focused
- **Tab**: Navigate through interface elements
- **Space**: Toggle task completion (when focused)

### Data Export (Future Enhancement)
```javascript
exportTasks() {
    const dataStr = JSON.stringify(this.tasks, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    // Download as JSON file
}
```

### Statistics Tracking
Real-time task statistics with daily productivity metrics:
- Tasks created today
- Tasks completed today
- Overall completion rate
- Productivity trends

## 🤝 Contributing

We welcome contributions from students and developers! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for detailed instructions.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For more details, check:
- [Setup Guide](docs/SETUP.md) - Installation and development setup
- [Architecture Documentation](docs/ARCHITECTURE.md) - Technical implementation details
- [Feature Documentation](docs/FEATURES.md) - Comprehensive feature list

### Commit Message Convention
```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Add new task
- [ ] Edit existing task
- [ ] Mark task as complete
- [ ] Delete task
- [ ] Verify persistence after page reload
- [ ] Test responsive design on different screen sizes
- [ ] Validate accessibility with screen reader

### Browser Compatibility
- ✅ Chrome 80+ (Recommended)
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 📚 Resources

### Learning Materials
- [MDN Web Docs](https://developer.mozilla.org/) - Comprehensive web development documentation
- [JavaScript.info](https://javascript.info/) - Modern JavaScript tutorial
- [CSS-Tricks](https://css-tricks.com/) - CSS techniques and best practices

### Design Inspiration
- [Dribbble](https://dribbble.com/tags/task_management) - Task management UI designs
- [Behance](https://www.behance.net/) - Web design inspiration

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2024 TaskFlow

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 📞 Course Support

### Getting Help
- **Instructor**: [Instructor Name](mailto:instructor@example.com)
- **Course Materials**: Available on course platform
- **Office Hours**: Tuesdays & Thursdays 2-4 PM
- **Discussion Forum**: [Course Forum Link]

### Technical Support
If you have any questions or need help:
- 📧 Open an issue on GitHub
- 📖 Check our [comprehensive documentation](docs/)
- 💬 Review the inline code comments
- 🎓 Consult the course materials
- 👥 Ask teammates during collaborative exercises

## 🏆 Achievements

This TaskFlow application demonstrates:
- **Modern Web Standards**: Using the latest HTML5, CSS3, and ES6+ features
- **Best Practices**: Following industry-standard development patterns
- **User-Centered Design**: Focusing on usability and accessibility
- **Performance**: Optimized for fast loading and smooth interactions
- **Maintainability**: Clean, well-documented, and structured code

## 🎯 Future Enhancements

Potential improvements for version 2.0:
- [ ] **Task Categories**: Color-coded categories (Work, Personal, Shopping)
- [ ] **Due Dates**: Calendar integration and deadline reminders
- [ ] **Priority Levels**: High, Medium, Low priority sorting
- [ ] **Search & Filter**: Advanced task filtering capabilities
- [ ] **Dark Mode**: Toggle between light and dark themes
- [ ] **Collaboration**: Share tasks with team members
- [ ] **Sync**: Cloud synchronization across devices
- [ ] **Offline Mode**: Service worker for offline functionality

## 🙏 Acknowledgments

- **Inter Font**: Beautiful typography by Google Fonts
- **Icons**: Unicode emoji set for consistent cross-platform display
- **Inspiration**: Modern task management applications like Todoist, Things, and Any.do
- **Community**: Open source contributors and web development community

## 🏆 Contributors

Thanks to all the students and developers who contributed to this project:

### Course Contributors (Week 2 - Git Fundamentals)
- [@student1](https://github.com/student1) - Documentation improvements and setup guide
- [@student2](https://github.com/student2) - CSS enhancements and responsive design
- [@student3](https://github.com/student3) - JavaScript functionality and error handling
- [@student4](https://github.com/student4) - Testing, quality assurance, and project management

### How to Become a Contributor
1. Complete the [setup instructions](docs/SETUP.md)
2. Pick an issue from our [project board](https://github.com/thomas-more-devops/taskflow-group-3-IADI3/projects)
3. Follow our [contributing guidelines](docs/CONTRIBUTING.md)
4. Submit a pull request for review

## 🔄 Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

### v1.0.0 (Current)
- ✨ Initial release with core functionality
- 🎨 Modern, responsive design
- 💾 Local storage persistence
- 📊 Basic statistics tracking
- 🔧 Complete CRUD operations

---

**Happy Task Managing! 🎉**

Built with ❤️ using modern web technologies.

*"Productivity is not about being busy, it's about being effective."*

---

## Getting Started with Git

This project is perfect for learning Git version control:

1. **Initialize Repository**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial TaskFlow application"
   ```

2. **Connect to GitHub**:
   ```bash
   git remote add origin https://github.com/thomas-more-devops/taskflow-group-3-IADI3.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Select "Deploy from a branch"
   - Choose "main" branch
   - Your live app will be available at your GitHub Pages URL

Ready to start your DevOps journey with TaskFlow! 🚀
