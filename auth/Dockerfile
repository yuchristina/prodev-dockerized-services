# The easiest to Dockerize is the auth application. Create a Dockerfile in the auth/ directory and refer to the previous Docker lesson about what to write in it. You can find that at https://nodejs.org/en/docs/guides/nodejs-docker-webapp/.
# The application will start on port 80 by default, so just map that port to port 8082 when you run it using the -p flag.
# Note: The file name to run is server.mjs.

FROM node:14
# Create app directory
WORKDIR /auth/
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source
COPY . .
EXPOSE 8082

CMD [ "node", "server.mjs" ]