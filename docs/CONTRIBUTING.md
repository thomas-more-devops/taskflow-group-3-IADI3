# Contributing to TaskFlow

Thanks for helping improve TaskFlow! This guide explains how our team works on the project so that every change is easy to review and merge.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branching Strategy](#branching-strategy)
- [Making Changes](#making-changes)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Testing Checklist](#testing-checklist)
- [Documentation](#documentation)

## Code of Conduct

Be respectful and constructive. Welcome different viewpoints, give feedback kindly, accept feedback gracefully, and keep discussions focused on the project. Harassment, personal attacks and discriminatory language are not tolerated.

## Getting Started

Prerequisites: Git, a GitHub account, a modern browser and basic knowledge of HTML, CSS and JavaScript.

1. Accept the collaborator invitation to the repository.
2. Clone the repository:
   ```bash
   git clone https://github.com/thomas-more-devops/taskflow-group-3-IADI3.git
   cd taskflow-group-3-IADI3
   ```
3. Open `index.html` in your browser, or serve the folder locally:
   ```bash
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`.

## Branching Strategy

- **Never commit directly to `main`.** It always holds the stable, reviewed version.
- Create one branch per task, starting from an up-to-date `main`:
  ```bash
  git checkout main
  git pull origin main
  git checkout -b <type>/<short-description>
  ```
- Branch names use a type prefix and kebab-case, for example `docs/setup-guide`, `feature/task-priority`, `fix/storage-error`.

| Prefix | Use for |
| --- | --- |
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code restructuring without behaviour change |
| `chore/` | Tooling and maintenance |

## Making Changes

1. Check the open issues so you do not duplicate work, and open an issue first for larger changes.
2. Make small, focused changes on your own branch.
3. Test your changes (see the [checklist](#testing-checklist)).
4. Commit, push your branch and open a pull request:
   ```bash
   git add .
   git commit -m "docs: add architecture guide"
   git push -u origin <your-branch>
   ```

## Coding Standards

**HTML**
- Use semantic elements (`header`, `main`, `section`, `button`, ...).
- Add ARIA labels and alt text where needed and keep a logical heading order.

**CSS**
- Keep new rules in `styles/main.css`, in the section that matches their purpose (layout, components, states, responsive).
- Name classes in kebab-case (for example `task-item`, `add-btn`) and describe purpose rather than appearance.
- Check your changes at the existing breakpoints (768px and 480px) and add rules to the `max-width` media queries when needed.

**JavaScript**
- Use modern ES6+ syntax (`const`/`let`, arrow functions, template literals).
- Validate input and handle errors with `try/catch` where something can fail.
- Never insert user text with `innerHTML` unescaped; use `textContent` or the existing `escapeHtml()` helper to prevent XSS.
- Keep functions short and give them clear names.

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <short description>
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.

Good examples:

```
feat: add task priority levels
fix: handle corrupted localStorage data
docs: add contributing guidelines
```

Avoid vague messages such as `update`, `changes` or `fixed stuff`.

## Pull Request Process

1. Make sure your branch is up to date with `main`:
   ```bash
   git fetch origin
   git merge origin/main
   ```
2. Open a pull request from your branch into `main`.
3. Write a clear title and description: what changed, why, and how you tested it. Add screenshots for visual changes.
4. Link related issues with keywords such as `Closes #3`.
5. Ask at least one teammate to review. Answer comments politely and push fixes to the same branch.
6. Once approved and all checks pass, merge the pull request (squash if the history is noisy) and delete the branch.

## Reporting Issues

Search existing issues first. A good bug report includes a description, steps to reproduce, expected versus actual behaviour, screenshots if useful, and your browser and operating system. A good feature request explains the problem, the proposed solution and any alternatives you considered.

## Testing Checklist

Before opening a pull request, verify what applies to your change:

- [ ] Tasks can be added, completed, edited and deleted
- [ ] Statistics update correctly
- [ ] Data survives a page refresh
- [ ] No errors appear in the browser console
- [ ] Layout works on mobile, tablet and desktop widths
- [ ] Keyboard navigation and focus states still work
- [ ] Works in the latest Chrome, Firefox and Edge (and Safari if available)

## Documentation

Update the docs whenever behaviour or structure changes:

- `README.md` for user-facing features and setup
- `docs/ARCHITECTURE.md` for structural or code-organisation changes
- Code comments for non-obvious logic

Questions? Open an issue with the `question` label or ask in the team chat.
