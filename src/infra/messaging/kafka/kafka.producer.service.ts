import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'ingestao-service-producer',
      brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    console.log('Kafka Producer (Ingestao) conectado.');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async sendMessage(record: ProducerRecord) {
    await this.producer.send(record);
  }
}