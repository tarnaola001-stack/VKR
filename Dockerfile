FROM node:20-bullseye-slim

WORKDIR /app/server

COPY server/package*.json ./

RUN npm install

COPY server ./

RUN mkdir -p public/uploads

ENV NODE_ENV=production

EXPOSE 8080

CMD ["npm", "start"]