# Dockerfile da Ingestão (Modo Desenvolvimento Corrigido)
FROM node:20-alpine
WORKDIR /app

# Cria o diretório de upload e dá a permissão correta para o usuário 'node'
RUN mkdir -p /app/temp_ingestao_sip && chown -R node:node /app

COPY package*.json ./
RUN npm install

# Muda para o usuário 'node' para rodar a aplicação
USER node
EXPOSE 3001
CMD ["npm", "run", "start:dev"]