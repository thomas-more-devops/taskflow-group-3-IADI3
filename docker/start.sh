#!/usr/bin/env bash
# TaskFlow + MongoDB: network, volume, database container and app container (assignment 12, step 3).
# Usage: bash docker/start.sh          (from the repository root)
#        IMAGE=taskflow:2.0 bash docker/start.sh
# Safe to run more than once: existing network, volume and database are reused,
# the app container is recreated from a fresh build.
set -euo pipefail

NETWORK=taskflow-net
VOLUME=taskflow-db-data
DB_CONTAINER=taskflow-db
DB_IMAGE=mongo:8.0.15
APP_CONTAINER=taskflow-app
IMAGE=${IMAGE:-taskflow:2.0}
PORT=${PORT:-3000}

# 1. Custom network: containers on it reach each other by container name (DNS)
docker network inspect "$NETWORK" >/dev/null 2>&1 || docker network create "$NETWORK"

# 2. Named volume: MongoDB data lives here, so it survives removing the database container
docker volume inspect "$VOLUME" >/dev/null 2>&1 || docker volume create "$VOLUME"

# 3. MongoDB container, only on the network (no -p: not reachable from the laptop)
if docker container inspect "$DB_CONTAINER" >/dev/null 2>&1; then
  docker start "$DB_CONTAINER" >/dev/null
else
  docker run -d --name "$DB_CONTAINER" --network "$NETWORK" \
    -v "$VOLUME":/data/db "$DB_IMAGE"
fi

# 4. Build the TaskFlow image (multi-stage Dockerfile)
docker build -t "$IMAGE" .

# 5. App container, connected to the same network; DB_HOST is the database container name
docker rm -f "$APP_CONTAINER" >/dev/null 2>&1 || true
docker run -d --name "$APP_CONTAINER" --network "$NETWORK" -p "$PORT":3000 \
  -e DB_HOST="$DB_CONTAINER" -e DB_NAME=taskflow "$IMAGE"

# 6. Wait until the app logs "MongoDB connected" (the app retries while MongoDB starts)
for _ in $(seq 1 30); do
  if docker logs "$APP_CONTAINER" 2>&1 | grep -q "MongoDB connected"; then
    docker logs "$APP_CONTAINER"
    echo "TaskFlow is running on http://localhost:$PORT"
    exit 0
  fi
  sleep 2
done
docker logs "$APP_CONTAINER"
echo "MongoDB connection not confirmed after 60 s, check the logs above" >&2
exit 1
