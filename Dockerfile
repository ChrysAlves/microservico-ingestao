# Dockerfile para o Microsserviço de Ingestão (VERSÃO CORRIGIDA)

FROM node:20-alpine

# Define o ambiente como 'development' ANTES de instalar.
# Isso força o npm a instalar TODAS as dependências.
ENV NODE_ENV=development

RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN mkdir -p /app/temp_ingestao_sip

COPY . .

EXPOSE 3001

CMD ["npm", "run", "start:dev"]