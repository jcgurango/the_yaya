FROM node:22

COPY . /app
COPY .docker/config.js /app/lib/config.js
WORKDIR /app
RUN npm install --production

ENTRYPOINT node .
