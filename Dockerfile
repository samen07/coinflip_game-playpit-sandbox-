# Use the node image as the base for our image
FROM node:16-alpine

# Create a working directory inside the container
WORKDIR /app

# Copy the package.json file into the container
COPY package*.json ./

# Run npm install to install dependencies
RUN npm install

# Copy the rest of the project files into the container
COPY . .

# Expose the port that your Node.js application is running on (usually 3000)
EXPOSE 3000

# Start the Node.js application in the foreground
CMD [ "npm", "start" ]