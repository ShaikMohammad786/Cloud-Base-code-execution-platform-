# Use the official Node.js 20 as a parent image
FROM node:20

# Install Python3 and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set the working directory in the container
WORKDIR /code

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build your app
RUN npm run build

# Expose ports
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "dist/index.js" ]