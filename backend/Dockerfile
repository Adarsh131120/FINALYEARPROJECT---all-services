# backend/Dockerfile

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Create upload directory
RUN mkdir -p uploads logs

EXPOSE 5000

CMD ["node", "server.js"]