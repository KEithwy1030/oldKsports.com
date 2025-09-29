# Frontend Dockerfile with Caddy reverse proxy rules
# - Serves SPA from /usr/share/caddy
# - Proxies /uploads/* and /api/* to backend so images and APIs don't fall back to index.html

FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM zeabur/caddy-static

# If you prefer使用后端域名，请在这里修改为你的后端地址
# 例如：https://oldksports-app.zeabur.app 或 http://backend-service:3000
ARG BACKEND_URL=https://oldksports-app.zeabur.app

# 生成 Caddyfile：/uploads/* 与 /api/* 反代到后端，其它路径走前端静态并支持 SPA 回退
RUN echo ':8080 {'                          >  /etc/caddy/Caddyfile && \
    echo '  handle /uploads/* {'            >> /etc/caddy/Caddyfile && \
    echo "    reverse_proxy ${BACKEND_URL}" >> /etc/caddy/Caddyfile && \
    echo '  }'                              >> /etc/caddy/Caddyfile && \
    echo '  handle /api/* {'                >> /etc/caddy/Caddyfile && \
    echo "    reverse_proxy ${BACKEND_URL}" >> /etc/caddy/Caddyfile && \
    echo '  }'                              >> /etc/caddy/Caddyfile && \
    echo '  handle {'                       >> /etc/caddy/Caddyfile && \
    echo '    root * /usr/share/caddy'      >> /etc/caddy/Caddyfile && \
    echo '    try_files {path} /index.html' >> /etc/caddy/Caddyfile && \
    echo '    file_server'                  >> /etc/caddy/Caddyfile && \
    echo '  }'                              >> /etc/caddy/Caddyfile && \
    echo '}'                                >> /etc/caddy/Caddyfile

COPY --from=build /app/dist /usr/share/caddy

EXPOSE 8080

# 前端 Dockerfile
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建的文件到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 3000

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
