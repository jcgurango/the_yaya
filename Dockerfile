FROM node:8

COPY . /app
COPY .docker/config.js /app/lib/config.js
WORKDIR /app
RUN npm install

ENTRYPOINT node .
