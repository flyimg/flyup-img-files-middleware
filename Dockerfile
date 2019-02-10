FROM node:10.13-alpine
#ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
COPY . .
RUN HOME='.'
RUN npm install
EXPOSE 3000
CMD npm start
