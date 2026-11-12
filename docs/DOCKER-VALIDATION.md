# Juan's Docker validation (assignments 11 and 12)

## Assignment 11: taskflow:1.0

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
