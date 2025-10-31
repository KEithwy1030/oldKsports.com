FROM node:22-alpine AS build
LABEL "language"="nodejs"
LABEL "framework"="express"

WORKDIR /app

# 构建前端
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm install
COPY client/ ./
RUN npm run build

# 构建后端
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./

# 复制前端构建输出到后端的 public 目录
RUN mkdir -p /app/public/dist && \
    cp -r /app/client/dist/* /app/public/dist/

EXPOSE 8080
CMD ["npm", "start"]
