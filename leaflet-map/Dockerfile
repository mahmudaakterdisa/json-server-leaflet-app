# Use Node.js as the base image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json first for caching dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project and build
COPY . .
RUN npm run build

# Use nginx to serve the static frontend
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
