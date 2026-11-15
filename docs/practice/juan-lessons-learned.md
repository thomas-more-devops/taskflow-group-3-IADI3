# Lessons learned — Juan Pascual

## Assignment 9 — Preparing a release

A release needs a clear connection between its version, reviewed commit and
published tag. For the v2.0.0 handoff, I will check the version metadata,
release notes and tested commit together. The release branch, Git tag and
GitHub release give the team a shared reference when reproducing a result.

I also learned to distinguish responsibilities in the handoff. Yoel prepares
the release branch and PR, Alex publishes the tag and release, and the team
reviews the changes before integration.

## Assignment 10 — Git practice

On `practice/juan`, I used `pick`, `reword`, `squash` and `drop` to turn four
practice commits into two clear commits. Checking the final history and diff
confirmed that the intended changes remained. I performed the interactive
rebase before sharing those practice commits.

Cherry-picking taught me to move one selected change between branches. In the
stash exercise, I set aside unfinished work, switched to a temporary hotfix
branch and then restored the work. I checked the restored text and empty
stash before committing.

## Lessons reinforced during integration

Before integrating a change, I now check its base branch, current diff and CI
results. Resolving a conflict requires preserving the behavior contributed
by each teammate. Updating a shared branch also requires a fresh review when
the repository dismisses earlier approvals.

CI results depend on which jobs run. In TaskFlow, the Build Validation job
runs on pushes to `main`, so its result must be checked after merging. Docker
work also taught me to record the size metric and test environment alongside
the result. For taskflow:2.0, I verified the disk-usage limit and kept the
runner test and each person's laptop test as separate evidence.

## Evidence

- [Juan's recorded Git practice](https://github.com/thomas-more-devops/taskflow-group-3-IADI3/blob/96c4c9709c93d768d8815b5fdfb94bc4cc24b3d5/docs/practice/juan-evidence.md)
- [Repository release process](../CONTRIBUTING.md#-release-process)
- [PR #20 — CI practice and branch synchronization](https://github.com/thomas-more-devops/taskflow-group-3-IADI3/pull/20)
- [PR #31 — Docker image and validation results](https://github.com/thomas-more-devops/taskflow-group-3-IADI3/pull/31)
