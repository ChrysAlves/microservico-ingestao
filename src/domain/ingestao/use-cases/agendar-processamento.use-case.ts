// src/domain/ingestao/use-cases/agendar-processamento.use-case.ts

import { Injectable } from '@nestjs/common';
import { AgendarProcessamentoDto } from '../dtos/agendar-processamento.dto';
import { KafkaProducerService } from '@infra/messaging/kafka/kafka.producer.service';

@Injectable()
export class AgendarProcessamentoUseCase {
  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async execute(payload: AgendarProcessamentoDto): Promise<void> {
    const { transferId, sipLocation, metadados, ra } = payload; // ADICIONADO: Recebe o RA
    console.log(`[AgendarProcessamentoUseCase] Agendando processamento para pedido: ${transferId}`);

    // Mensagem que será consumida pelo Microsserviço de Processamento (Python)
    const message = {
      transferId,
      sipLocation,
      metadados, // Mantemos os metadados completos
      ra, // ADICIONADO: 'ra' como campo de primeiro nível
    };

    await this.kafkaProducer.sendMessage({
      topic: 'ingest-requests',
      messages: [{ value: JSON.stringify(message) }],
    });

    console.log(`[AgendarProcessamentoUseCase] Mensagem para pedido ${transferId} publicada no tópico 'ingest-requests'.`);
  }
}