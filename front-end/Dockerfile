# Dockerfile for React Frontend
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --force

COPY . ./
RUN npm run build

# Install serve to host the built static files
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
