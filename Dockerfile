FROM node:26-alpine AS deps
WORKDIR /app
ENV CI=true
ARG PNPM_VERSION=11.10.0
RUN npm install -g pnpm@${PNPM_VERSION}
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN pnpm build

FROM node:26-alpine AS prod-deps
WORKDIR /app
ENV CI=true
ARG PNPM_VERSION=11.10.0
RUN npm install -g pnpm@${PNPM_VERSION}
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

FROM node:26-alpine
WORKDIR /app
ENV CI=true
ENV NODE_ENV=production
ENV CONFIG_DIR=/config
ENV HOST=0.0.0.0
ENV PORT=3000
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package.json ./package.json
COPY --from=builder /app/build ./build
COPY --from=builder /app/config /config
EXPOSE 3000
CMD ["node", "build/index.js"]
