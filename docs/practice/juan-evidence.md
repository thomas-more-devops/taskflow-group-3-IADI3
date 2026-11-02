# Assignment 10 - Juan Pascual

Executed on 2 November 2026 with Git identity `Juan Pascual Ferrer <juanpascualferrer@gmail.com>`.
Base: `eb3c49186be99ad29e4fea6ca4ca27b6e5ddab7c` (main after PR #18).
The exercises use an isolated worktree. Main was never rebased or changed.

## Interactive rebase

Created `practice/juan` from the base and made four practice commits. Before rewriting:

```text
30246a1 chore: disposable commit for drop exercise
08268ca docs: explain the four rebase actions
9026ad3 wip: rebase explanation
1e311de docs: start Juan Git practice
eb3c491 Merge pull request #18 from thomas-more-devops/setup/professional-repo
```

Ran real Git commands:

```bash
git checkout -b practice/juan
# Four commits created with git add and git commit.
git log --oneline -5
git rebase -i HEAD~4
git log --oneline -3
git diff --check
```

The interactive rebase todo was:

```text
pick 1e311de docs: start Juan Git practice
reword 9026ad3 wip: rebase explanation
squash 08268ca docs: explain the four rebase actions
drop 30246a1 chore: disposable commit for drop exercise
```

For reproducibility in the agent shell, `GIT_SEQUENCE_EDITOR` used a Node helper to write those four actions and `GIT_EDITOR` used another helper to save the reword/squash message. Git itself performed the interactive rebase. The helpers live in the repository's local `.git/juan-evidence/` directory.

Result immediately after rebase:

```text
2e3157e docs: explain interactive rebase actions for Juan
1e311de docs: start Juan Git practice
eb3c491 Merge pull request #18 from thomas-more-devops/setup/professional-repo
```

Verified: four practice commits became two; the discarded file `docs/practice/juan-disposable.txt` was absent; `git diff --check` passed. The history was rewritten before publishing the branch, so no force push was needed.

## Cherry-pick

Selected my own existing commit on another branch, `test/ci-pipeline`:

```bash
git log -1 --oneline test/ci-pipeline
git checkout practice/juan
git cherry-pick 5a6d2bb
git log -1 --format=fuller
```

Source: `5a6d2bb898516bf58cbc39f80b9de34ca0cdc57a` (`test: trigger CI pipeline for validation`).
Result: `ce6d3ce90611fd076ef07b06fe4ceedbb611597c` on `practice/juan`.
The HTML comment was applied without conflicts. Both author and committer are Juan Pascual Ferrer.

## Stash and temporary hotfix branch

Appended an uncommitted sentence to `docs/practice/juan.md`, then ran:

```bash
git diff -- docs/practice/juan.md
git stash push -m "WIP: Juan stash exercise notes"
git stash list
git checkout --detach origin/main
git checkout -b hotfix/juan-stash-practice
git status --short
# Created docs/practice/juan-hotfix.md as a documentation exercise.
git add docs/practice/juan-hotfix.md
git commit -m "docs: demonstrate Juan hotfix branch during stash"
git checkout practice/juan
git stash pop
git stash list
git diff --check
git diff -- docs/practice/juan.md
git add docs/practice/juan.md
git commit -m "docs: record restored Juan stash notes"
```

Observed stash entry: `stash@{0}: On practice/juan: WIP: Juan stash exercise notes`.
Hotfix exercise commit: `807a340`, on `hotfix/juan-stash-practice`.
`git stash pop` restored the exact sentence without conflicts and removed stash `c78b001b5bbe9781de05f729f906e8dc1f6e6f98`.
The final `git stash list` was empty. The restored work was committed as `f6117dd`.

The hotfix branch is only a practice artifact and has not been merged into main.

## Who did what

Juan Pascual performed all three exercises and wrote this evidence on his own branches. No teammate's branch was rewritten and no PR was merged as part of Assignment 10.
