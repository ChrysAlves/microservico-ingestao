# Dockerfile para o Microsserviço de Ingestão (Correção Final)

FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN mkdir -p /app/temp_ingestao_sip


COPY . .


EXPOSE 3001


CMD ["npm", "run", "start:dev"]