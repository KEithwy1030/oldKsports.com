FROM node:18-alpine AS build
LABEL "language"="nodejs"
LABEL "framework"="vite"

ARG BACKEND_URL=http://backend:8080
ENV VITE_BACKEND_URL=$BACKEND_URL

WORKDIR /app

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

FROM zeabur/caddy-static

# Configure Caddy with path-based routing (preserve path!)
RUN echo ':8080 {' > /etc/caddy/Caddyfile && \
    echo '    handle /uploads/* {' >> /etc/caddy/Caddyfile && \
    echo '        reverse_proxy http://oldksports-app.zeabur.internal:8080' >> /etc/caddy/Caddyfile && \
    echo '    }' >> /etc/caddy/Caddyfile && \
    echo '    handle /api/* {' >> /etc/caddy/Caddyfile && \
    echo '        reverse_proxy http://oldksports-app.zeabur.internal:8080' >> /etc/caddy/Caddyfile && \
    echo '    }' >> /etc/caddy/Caddyfile && \
    echo '    handle {' >> /etc/caddy/Caddyfile && \
    echo '        root * /usr/share/caddy' >> /etc/caddy/Caddyfile && \
    echo '        try_files {path} /index.html' >> /etc/caddy/Caddyfile && \
    echo '        file_server' >> /etc/caddy/Caddyfile && \
    echo '    }' >> /etc/caddy/Caddyfile && \
    echo '}' >> /etc/caddy/Caddyfile

COPY --from=build /app/dist /usr/share/caddy

EXPOSE 8080