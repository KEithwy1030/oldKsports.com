FROM node:22-alpine AS build
LABEL "language"="nodejs"
LABEL "framework"="vite"

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM zeabur/caddy-static
WORKDIR /usr/share/caddy
COPY --from=build /app/dist ./
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]