
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgendarProcessamentoUseCase } from '@domain/ingestao/use-cases/agendar-processamento.use-case';
import { IngestaoController } from '@infra/controllers/ingestao.controller';
import { KafkaProducerService } from '@infra/messaging/kafka/kafka.producer.service';
import { InternalController } from '@infra/controllers/internal.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [IngestaoController, InternalController, AppController],
  providers: [AgendarProcessamentoUseCase, KafkaProducerService, AppService],
})
export class AppModule {}