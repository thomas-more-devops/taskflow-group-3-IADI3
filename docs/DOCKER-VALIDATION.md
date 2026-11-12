# Juan's Docker validation (assignments 11 and 12)

## Assignment 11: taskflow:1.0

Use branch `feature/docker-container` for these assignment 11 commands.
From the repository root with Docker running (Linux containers):

```powershell
docker build -t taskflow:1.0 .
docker run -d --name taskflow-v1 -p 3000:3000 taskflow:1.0
curl.exe --fail http://localhost:3000/api/tasks
'{"title":"Juan Docker test","category":"work"}' | Set-Content -Encoding ascii task.json
curl.exe --fail -H "Content-Type: application/json" --data-binary "@task.json" http://localhost:3000/api/tasks
curl.exe --fail http://localhost:3000/api/tasks
docker logs taskflow-v1
docker image inspect taskflow:1.0 --format '{{.Size}}'
docker rm -f taskflow-v1
Remove-Item -LiteralPath task.json
```

Expected: `GET` initially returns `[]`, `POST` returns a task with `id` and
`title`, and the next `GET` contains that task. Logs contain
`TaskFlow server running on port 3000`. The API stores tasks in memory;
restarting the container clears them. The frontend uses localStorage until
Yoel's PR #27 is integrated; API integration and the `taskflow:1.1` rebuild
belong to Yoel and Alex.

The `Docker validation` PR workflow builds the image, checks that development
dependencies are absent, fetches the static files, runs CRUD requests using
`curl`, prints the image size and `docker logs`, and removes its test containers.
It also supports the MongoDB backend and non-root image of assignment 12.
CI results demonstrate execution on a GitHub runner; each team member must
also run the final image on their own laptop.

Dockerfile design references: [Node image best practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
and [Docker build contexts and .dockerignore](https://docs.docker.com/build/concepts/context/).

## Assignment 12: taskflow:2.0

The root Dockerfile now uses two stages. `dependencies` installs only locked
production dependencies with `npm ci --omit=dev`; `runtime` receives those
dependencies and the application files, including `database.js` and `models/`.
The npm download cache stays out of the runtime image. The dependencies stage
uses `node:22-alpine3.23`; runtime uses matching `alpine:3.23` with the Node 22
binary, npm and its required system libraries. This omits Yarn, Corepack and
Node development headers from the final image while preserving `npm start`.
`USER node` sets the runtime user before `CMD`.

This version depends on Rodrigo's MongoDB backend (#24). The Dockerfile from
the assignment 11 branch remains available at `feature/docker-container`.

```powershell
docker build -t taskflow:2.0 .
docker run --rm taskflow:2.0 whoami
docker image ls taskflow:2.0
```

Expected `whoami` output: `node`. With the containerd image store, record both
`DISK USAGE` and `CONTENT SIZE`. Compressed content alone does not establish
compliance with the course's 250 MB limit. CI checks the stricter
`DISK USAGE < 250,000,000 bytes`, after starting the container, using Docker 29
with the containerd image store. It logs both values from the Docker API and
prints `docker image ls`.

To start the full stack manually, or use Yoel's scripts from #28 once merged:

```powershell
docker network create taskflow-net
docker volume create taskflow-db-data
docker run -d --name taskflow-db --network taskflow-net -v taskflow-db-data:/data/db mongo:8.0.15
docker run -d --name taskflow-app --network taskflow-net -p 3000:3000 -e DB_HOST=taskflow-db -e DB_NAME=taskflow taskflow:2.0
docker logs taskflow-app
curl.exe --fail http://localhost:3000/api/tasks
```

Create the named network and volume only if they do not already exist. Wait
for `MongoDB connected` in the app logs before testing the API. MongoDB is
reachable only on the Docker network; no database host port is published.
The POST/GET commands above work with this backend too. Alex owns the full
persistence test (remove and recreate both containers, retaining the volume)
and the final README; frontend testing also needs Yoel's #27.

With `database.js` present, the PR workflow builds `taskflow:2.0`, verifies
`whoami` is `node`, starts a real `mongo:8.0.15` container with its own test
network and volume, and runs the same curl API checks and logs the app.
Its resources are isolated from the team stack and removed at the end.

See [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/).

## Recorded runner results (12 November 2026)

| Image | Tested commit | Original runner inspect size | Result |
| --- | --- | --- | --- |
| `taskflow:1.0` | `cda6fc3` | 63,543,563 bytes | [Build, curl CRUD and logs passed](https://github.com/thomas-more-devops/taskflow-group-3-IADI3/actions/runs/43234019734) |
| `taskflow:2.0` | `392e10d` | 64,516,380 bytes | [Build, non-root user, real MongoDB, curl CRUD and logs passed](https://github.com/thomas-more-devops/taskflow-group-3-IADI3/actions/runs/43234025692) |

The 2.0 logs confirm `MongoDB connected: taskflow-test-db:27017/taskflow`.
Those original `inspect` values do not prove the Desktop `DISK USAGE` limit:
Alex reported 262 MB disk usage and 64.5 MB content for the original 2.0 image.
The revised runtime and CI above address that difference explicitly.
The [updated Docker 29/containerd run](https://github.com/thomas-more-devops/taskflow-group-3-IADI3/actions/runs/43269561588)
on commit `72aa45a` reports **238,513,446 bytes DISK USAGE** (CLI: 239 MB)
and **58,793,254 bytes CONTENT SIZE** (CLI: 58.8 MB). The stricter disk usage
check passes below 250,000,000 bytes, alongside the non-root, MongoDB, static
asset and curl CRUD checks. This supersedes the original 2.0 size measurement.
These runs used GitHub's Linux runner. The laptop build remains pending
because Docker Desktop and WSL are not installed on Juan's Windows laptop.

Size reference: [Docker CLI image-size implementation](https://github.com/docker/cli/blob/master/cli/command/image/tree.go)
and [containerd image store](https://docs.docker.com/desktop/features/containerd/).
