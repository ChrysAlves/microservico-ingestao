// src/domain/ingestao/use-cases/agendar-processamento.use-case.ts

import { Injectable } from '@nestjs/common';
import { AgendarProcessamentoDto } from '../dtos/agendar-processamento.dto';
import { KafkaProducerService } from '@infra/messaging/kafka/kafka.producer.service';

@Injectable()
export class AgendarProcessamentoUseCase {
  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async execute(payload: AgendarProcessamentoDto): Promise<void> {
    const { transferId, sipLocation, metadados, ra } = payload; 
    console.log(`[AgendarProcessamentoUseCase] Agendando processamento para pedido: ${transferId}`);

    const message = {
      transferId,
      sipLocation,
      metadados, 
      ra, 
    };

    await this.kafkaProducer.sendMessage({
      topic: 'ingest-requests',
      messages: [{ value: JSON.stringify(message) }],
    });

    console.log(`[AgendarProcessamentoUseCase] Mensagem para pedido ${transferId} publicada no tópico 'ingest-requests'.`);
  }
}