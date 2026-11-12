FROM node:22-alpine AS dependencies

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json server.js database.js ./
COPY --chown=node:node models/ ./models/
COPY --chown=node:node public/ ./public/

USER node
EXPOSE 3000
CMD ["npm", "start"]
