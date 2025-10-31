FROM node:22-alpine
LABEL "language"="nodejs"
LABEL "framework"="express"

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production
COPY . ./

EXPOSE 8080
CMD ["npm", "start"]
