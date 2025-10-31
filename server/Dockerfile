FROM node:18-alpine
LABEL "language"="nodejs"
LABEL "framework"="express"

WORKDIR /app

# 仅安装生产依赖
COPY package*.json ./
RUN npm ci --only=production

# 拷贝后端源代码
COPY . ./

# 暴露端口（与 server/package.json 中启动端口一致，Zeabur 会注入 PORT）
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]

# 后端 Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "production"]
