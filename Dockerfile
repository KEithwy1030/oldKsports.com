# 多阶段构建 Dockerfile
# 这个文件用于Zeabur自动检测，但实际部署需要使用具体的client/Dockerfile和server/Dockerfile

FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:18-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./

# 最终阶段 - 这里只是示例，实际部署时会使用具体的Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY --from=server-builder /app/server ./
EXPOSE 8080
CMD ["npm", "run", "production"]
