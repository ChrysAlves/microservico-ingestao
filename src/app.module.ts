// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Agora este import será encontrado
import { AgendarProcessamentoUseCase } from '@domain/ingestao/use-cases/agendar-processamento.use-case';
import { IngestaoController } from '@infra/controllers/ingestao.controller';
import { KafkaProducerService } from '@infra/messaging/kafka/kafka.producer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis de ambiente disponíveis em toda a aplicação
    }),
  ],
  controllers: [IngestaoController],
  providers: [AgendarProcessamentoUseCase, KafkaProducerService],
})
export class AppModule {}