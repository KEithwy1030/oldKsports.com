FROM node:24-slim
LABEL "language"="nodejs"

WORKDIR /src
COPY . .

# Change to server directory and install dependencies
WORKDIR /src/server
RUN npm ci --production

EXPOSE 3000

# Use npm run production as startup command
CMD ["npm", "run", "production"]