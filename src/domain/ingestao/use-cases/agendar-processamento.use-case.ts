import { Injectable } from '@nestjs/common';
import { AgendarProcessamentoDto } from '../dtos/agendar-processamento.dto';
import { KafkaProducerService } from '@infra/messaging/kafka/kafka.producer.service';

@Injectable()
export class AgendarProcessamentoUseCase {
  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async execute(payload: AgendarProcessamentoDto): Promise<void> {
    const { transferId, sipLocation, metadados } = payload;
    console.log(`[AgendarProcessamentoUseCase] Agendando processamento para pedido: ${transferId}`);

    // Mensagem que será consumida pelo Microsserviço de Processamento (Python)
    const message = {
      transferId,
      sipLocation, 
      metadata: metadados,
    };

    await this.kafkaProducer.sendMessage({
      topic: 'ingest-requests',
      messages: [{ value: JSON.stringify(message) }],
    });

    console.log(`[AgendarProcessamentoUseCase] Mensagem para pedido ${transferId} publicada no tópico 'ingest-requests'.`);
  }
}