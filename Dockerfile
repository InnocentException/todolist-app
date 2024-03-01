FROM node:20-alpine3.18

WORKDIR /app

COPY backend/dist/ backend/
COPY backend/package*.json backend/
COPY frontend/dist/ frontend/dist/

WORKDIR /app/backend
RUN npm install

EXPOSE 3100

CMD ["node", "main.js"]