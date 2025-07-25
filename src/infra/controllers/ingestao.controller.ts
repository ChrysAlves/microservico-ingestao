// src/infra/controllers/ingestao.controller.ts

import { Controller, Post, UseInterceptors, UploadedFiles, Body, HttpStatus, HttpCode, Get } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AgendarProcessamentoUseCase } from '@domain/ingestao/use-cases/agendar-processamento.use-case';
import { ReceberSipHttpDto } from '@infra/http/dtos/receber-sip.http.dto';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const UPLOADS_BASE_DIR = '/app/temp_ingestao_sip';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const transferId = req.body.transferId;
    if (!transferId) {
      return cb(new Error('transferId é obrigatório no corpo da requisição!'), '');
    }
    const destinationPath = path.join(UPLOADS_BASE_DIR, transferId);
    fs.mkdirSync(destinationPath, { recursive: true });
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

@Controller('ingest')
export class IngestaoController {
  constructor(private readonly agendarProcessamentoUseCase: AgendarProcessamentoUseCase) {}

  @Get('health')
  checkHealth() {
    return { status: 'ok' };
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, { storage }))
  @HttpCode(HttpStatus.ACCEPTED)
  async receberSip(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: ReceberSipHttpDto,
  ) {
    const { transferId, metadados } = body;
    const sipLocation = path.join(UPLOADS_BASE_DIR, transferId);

    console.log(`[IngestaoController] Recebido SIP para pedido: ${transferId} com ${files.length} arquivos.`);
    console.log(`[IngestaoController] Arquivos salvos em: ${sipLocation}`);

    const parsedMetadados = metadados ? JSON.parse(metadados) : {};

    await this.agendarProcessamentoUseCase.execute({
      transferId,
      sipLocation: sipLocation,
      metadados: parsedMetadados,
      ra: parsedMetadados.ra, 
    });

    return {
      message: 'SIP recebido pela Ingestão e agendado para processamento.',
      transferId,
    };
  }
}