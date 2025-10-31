FROM node:18-alpine AS build
LABEL "language"="nodejs"
LABEL "framework"="vite"

# 当 Zeabur 根目录设置为 client 时，构建上下文就是 client/，
# 因此这里一律使用相对路径，避免 COPY client/... 找不到目录
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

FROM zeabur/caddy-static

# 仅作为纯静态托管，避免硬编码后端服务ID；前端通过环境变量直连 /api
COPY --from=build /app/dist /usr/share/caddy

EXPOSE 8080