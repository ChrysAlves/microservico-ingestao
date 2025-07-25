# Microsserviço de Ingestão - Sistema de Preservação Digital

## Descrição

O **Microsserviço de Ingestão** atua como a "portaria" do sistema de preservação digital. É responsável por receber os SIPs (Submission Information Packages) do Microsserviço Mapoteca, realizar as primeiras validações e encaminhá-los para processamento através do Kafka.

## Função Principal

- **Recepção de SIPs**: Recebe pacotes de submissão (arquivos + metadados) do Microsserviço Mapoteca
- **Armazenamento Temporário**: Salva os arquivos em diretório temporário para processamento
- **Publicação no Kafka**: Notifica o Microsserviço de Processamento sobre novos SIPs disponíveis

## Arquitetura e Comunicação

### Posição na Arquitetura
```
Front-End → Middleware → Mapoteca → **INGESTÃO** → Kafka → Processamento
```

### Comunicações

#### Entrada (Recebe de):
- **Microsserviço Mapoteca** (API REST)
  - Recebe SIPs com arquivos e metadados
  - Endpoint: `POST /ingest`

#### Saída (Envia para):
- **Kafka** (Message Broker)
  - Publica no tópico: `ingest-requests`
  - Notifica o Microsserviço de Processamento

### Restrições Importantes
- **APENAS** o Microsserviço Mapoteca pode se comunicar com este serviço
- Não há comunicação direta com outros microsserviços (Processamento, Gestão de Dados, Acesso, MinIO)

## Fluxo de Operação

### 1. Fluxo de Upload (Ingestão)
```
1. Mapoteca → Ingestão (API REST): Envia SIP
2. Ingestão: Salva arquivos temporariamente
3. Ingestão → Kafka: Publica mensagem no tópico 'ingest-requests'
4. Kafka → Processamento: Entrega mensagem para processamento
```

### Detalhamento do Fluxo:
1. **Recepção**: Microsserviço Mapoteca envia SIP via API REST
2. **Validação Inicial**: Verifica integridade básica dos dados recebidos
3. **Armazenamento Temporário**: Salva arquivos em diretório temporário
4. **Notificação**: Publica mensagem no Kafka informando novo SIP disponível
5. **Confirmação**: Retorna status de sucesso para o Mapoteca

## Tecnologias

- **Runtime**: Node.js
- **Linguagem**: TypeScript
- **Framework**: NestJS
- **Message Broker**: Apache Kafka
- **Armazenamento**: Sistema de arquivos local (temporário)



## Variáveis de Ambiente

```env
# Kafka Configuration
KAFKA_BROKER_URL=localhost:9092
KAFKA_TOPIC_INGEST_REQUESTS=ingest-requests

# Temporary Storage
TEMP_STORAGE_PATH=/tmp/ingest

# API Configuration
PORT=3001
```

## Endpoints da API

### POST /ingest
Recebe um SIP para processamento.

**Request:**
```json
{
  "sipId": "uuid",
  "metadata": {
    "title": "string",
    "creator": "string",
    "description": "string"
  },
  "files": [
    {
      "filename": "string",
      "content": "base64 | multipart"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "sipId": "uuid",
  "message": "SIP received and queued for processing"
}
```

## Estrutura de Mensagem Kafka

### Tópico: ingest-requests
```json
{
  "sipId": "uuid",
  "timestamp": "ISO8601",
  "tempPath": "/tmp/ingest/uuid",
  "metadata": {
    "title": "string",
    "creator": "string",
    "description": "string"
  },
  "files": [
    {
      "filename": "string",
      "path": "/tmp/ingest/uuid/filename",
      "size": "number"
    }
  ]
}
```

## Monitoramento e Logs

- **Health Check**: `GET /health`
- **Metrics**: Integração com Prometheus
- **Logs**: Estruturados em JSON para análise

## Considerações de Segurança

- Validação de tipos de arquivo
- Limite de tamanho de upload
- Sanitização de nomes de arquivo
- Autenticação via token JWT (do Mapoteca)

## Tratamento de Erros

- **Arquivo corrompido**: Rejeita SIP e notifica Mapoteca
- **Falha no Kafka**: Retry automático com backoff exponencial
- **Espaço em disco**: Monitoramento e limpeza automática de arquivos temporários

## Relacionamento com Outros Microsserviços

### Microsserviço Mapoteca
- **Papel**: Orquestrador central que envia SIPs
- **Comunicação**: API REST síncrona
- **Dados trocados**: SIPs completos (arquivos + metadados)

### Microsserviço de Processamento
- **Papel**: Consumidor das mensagens Kafka
- **Comunicação**: Assíncrona via Kafka
- **Dados trocados**: Notificações de novos SIPs disponíveis
