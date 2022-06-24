FROM node:alpine
ENV AUTH_SERVER_PORT 4000
COPY . /app
WORKDIR /app
RUN npm install
COPY . .
EXPOSE 4000
CMD node authserver
