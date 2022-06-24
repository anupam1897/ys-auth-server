FROM node:alpine
ENV AUTH_SERVER_PORT 4000
COPY . /app/auth
WORKDIR /app/auth
RUN npm install
COPY . .
EXPOSE 4000
CMD node authServer
