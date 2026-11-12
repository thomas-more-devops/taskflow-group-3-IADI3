ARG ALPINE_VERSION=3.23
FROM node:22-alpine${ALPINE_VERSION} AS dependencies

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM alpine:${ALPINE_VERSION} AS runtime

RUN apk add --no-cache libstdc++ libatomic \
    && addgroup -g 1000 node \
    && adduser -u 1000 -G node -s /bin/sh -D node

# Keep Node and npm start without Yarn, Corepack or Node development headers.
COPY --from=dependencies /usr/local/bin/node /usr/local/bin/node
COPY --from=dependencies /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

WORKDIR /app
ENV NODE_ENV=production

COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json server.js database.js ./
COPY --chown=node:node models/ ./models/
COPY --chown=node:node public/ ./public/

USER node
EXPOSE 3000
CMD ["npm", "start"]
