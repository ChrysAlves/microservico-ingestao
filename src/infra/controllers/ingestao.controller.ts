// src/infra/controllers/ingestao.controller.ts (VERSÃO ORIGINAL RESTAURADA)

import { Controller, Post, UseInterceptors, UploadedFiles, Body, HttpStatus, HttpCode, Get } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AgendarProcessamentoUseCase } from '@domain/ingestao/use-cases/agendar-processamento.use-case';
import { ReceberSipHttpDto } from '@infra/http/dtos/receber-sip.http.dto';
import * as multer from 'multer';
import * as path from 'path';

// O diretório que criamos no Dockerfile
const UPLOADS_TEMP_DIR = '/app/temp_ingestao_sip';

const storage = multer.diskStorage({
  destination: UPLOADS_TEMP_DIR,
  filename: (req, file, cb) => {
    // Salva o arquivo com seu nome original
    cb(null, file.originalname);
  },
});

@Controller('ingest')
export class IngestaoController {
  constructor(private readonly agendarProcessamentoUseCase: AgendarProcessamentoUseCase) {}

  @Get('health')
  checkHealth() {
    const message = 'Microsserviço de Ingestão está no ar e respondendo!';
    console.log(`[IngestaoController] Rota de health-check acionada. Retornando: "${message}"`);
    return { status: 'ok', message: message };
  }

  // --- ENDPOINT POST ORIGINAL RESTAURADO ---
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, { storage }))
  @HttpCode(HttpStatus.ACCEPTED)
  async receberSip(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: ReceberSipHttpDto,
  ) {
    const { transferId, metadados } = body;
    console.log(`[IngestaoController] Recebido SIP para pedido: ${transferId} com ${files.length} arquivos.`);
    console.log(`[IngestaoController] Arquivos salvos em: ${UPLOADS_TEMP_DIR}`);

    await this.agendarProcessamentoUseCase.execute({
      transferId,
      sipLocation: UPLOADS_TEMP_DIR, // Informa ao processador onde os arquivos estão
      metadados: metadados ? JSON.parse(metadados) : {},
    });

    return {
      message: 'SIP recebido pela Ingestão e agendado para processamento.',
      transferId,
    };
  }
}