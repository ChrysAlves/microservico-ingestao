// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- 1. Importe o ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Adicione esta linha para habilitar a validação global
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3001); // A porta interna do nosso serviço de ingestão
}
bootstrap();