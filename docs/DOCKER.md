# Running TaskFlow with MongoDB in Docker

TaskFlow runs as two containers on one Docker network: the app (`taskflow-app`) and the database (`taskflow-db`). The tasks are stored in MongoDB, and MongoDB keeps its files in a named volume, so they survive removing both containers.

```
 laptop :3000 ──► taskflow-app ──(taskflow-net)──► taskflow-db ──► volume taskflow-db-data (/data/db)
```

## Quick start

From the repository root:

```bash
bash docker/start.sh       # Linux / macOS / Git Bash
.\docker\start.ps1         # Windows PowerShell
```

The script creates what is missing, builds `taskflow:2.0`, starts both containers and waits until the app logs `MongoDB connected`. Then open http://localhost:3000.

## Step by step

| Command | Why |
|---|---|
| `docker network create taskflow-net` | A user-defined network gives the containers DNS, so the app reaches the database by its container name. |
| `docker volume create taskflow-db-data` | A named volume managed by Docker. MongoDB writes its data here instead of in the container. |
| `docker run -d --name taskflow-db --network taskflow-net -v taskflow-db-data:/data/db mongo:8.0.15` | Starts MongoDB on the network, with the volume mounted on `/data/db`, where MongoDB stores its files. There is no `-p`: the database is only reachable from containers on `taskflow-net`. |
| `docker build -t taskflow:2.0 .` | Builds the app image from the multi-stage Dockerfile. |
| `docker run -d --name taskflow-app --network taskflow-net -p 3000:3000 -e DB_HOST=taskflow-db -e DB_NAME=taskflow taskflow:2.0` | Starts the app on the same network. `DB_HOST=taskflow-db` is the database container name, which `database.js` uses to build the connection string. |
| `docker logs taskflow-app` | Should show `MongoDB connected: taskflow-db:27017/taskflow`. A few `MongoDB not ready` lines first are normal: the app retries while the database starts. |

Look inside the database (optional):

```bash
docker exec -it taskflow-db mongosh
use taskflow
db.tasks.find()
exit
```

## Stop and clean up

```bash
docker rm -f taskflow-app taskflow-db     # removes the containers, the data stays in the volume
docker volume rm taskflow-db-data         # deletes the data for good
docker network rm taskflow-net
```
