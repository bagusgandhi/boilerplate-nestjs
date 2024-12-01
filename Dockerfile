# Use the specified Node.js image
FROM node:18.16.0-alpine3.18

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# RUN cp -r mails dist/

# Expose the port the app runs on
EXPOSE 4000

# Run the web service on container startup
CMD ["node", "dist/main.js"]