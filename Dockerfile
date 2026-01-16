# Use Node.js 18
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci
RUN cd frontend && npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Make start script executable
RUN chmod +x start.sh

# Expose ports
EXPOSE 3000 3001

# Start the servers
CMD ["./start.sh"]