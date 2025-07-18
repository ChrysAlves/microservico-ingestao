// microservico-ingestao/src/app.module.ts (CORRIGIDO)

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgendarProcessamentoUseCase } from '@domain/ingestao/use-cases/agendar-processamento.use-case';
import { IngestaoController } from '@infra/controllers/ingestao.controller';
import { KafkaProducerService } from '@infra/messaging/kafka/kafka.producer.service';
import { InternalController } from '@infra/controllers/internal.controller';

// 1. Importe o AppController e AppService
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  // 2. Adicione o AppController à lista de controllers
  controllers: [IngestaoController, InternalController, AppController],
  // 3. Adicione o AppService à lista de providers
  providers: [AgendarProcessamentoUseCase, KafkaProducerService, AppService],
})
export class AppModule {}