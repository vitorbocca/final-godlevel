FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for Vite)
# Use npm install instead of npm ci since lock file may be out of sync
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

