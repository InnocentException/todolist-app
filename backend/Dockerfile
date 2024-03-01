FROM node:20-alpine3.18

WORKDIR /app

COPY backend/dist backend
COPY frontend/dist frontend/dist

CMD ["node", "/app/backend"]