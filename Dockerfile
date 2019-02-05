FROM node:10.13-alpine
ENV NODE_ENV test
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install -g mocha && npm install --silent && mv node_modules ../
COPY . .
EXPOSE 3000
CMD npm start
