FROM node:26-alpine AS builder
WORKDIR /app
ENV CI=true
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:26-alpine
ENV CI=true
RUN npm install -g pnpm
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN pnpm install --prod --no-frozen-lockfile
EXPOSE 3000
ENV CONFIG_DIR=/config
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
CMD ["node", "build/index.js"]
