FROM node:18-alpine AS build
LABEL "language"="nodejs"
LABEL "framework"="vite"
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build
FROM zeabur/caddy-static
COPY --from=build /app/dist /usr/share/caddy
EXPOSE 8080