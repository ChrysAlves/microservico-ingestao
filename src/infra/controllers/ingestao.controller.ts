// src/infra/controllers/ingestao.controller.ts (Versão com subdiretórios)

import { Controller, Post, UseInterceptors, UploadedFiles, Body, HttpStatus, HttpCode, Get } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AgendarProcessamentoUseCase } from '@domain/ingestao/use-cases/agendar-processamento.use-case';
import { ReceberSipHttpDto } from '@infra/http/dtos/receber-sip.http.dto';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs'; // Importa o módulo de sistema de arquivos do Node.js

const UPLOADS_BASE_DIR = '/app/temp_ingestao_sip';

// Configuração de armazenamento dinâmica
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pega o transferId do corpo da requisição
    const transferId = req.body.transferId;
    if (!transferId) {
      // Retorna um erro se o transferId não for fornecido
      return cb(new Error('transferId é obrigatório no corpo da requisição!'), '');
    }
    
    // Cria um caminho de pasta único para este pedido
    const destinationPath = path.join(UPLOADS_BASE_DIR, transferId);
    
    // Cria o diretório se ele não existir
    fs.mkdirSync(destinationPath, { recursive: true });
    
    // Diz ao multer para salvar os arquivos neste diretório único
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
    const sipLocation = path.join(UPLOADS_BASE_DIR, transferId); // O caminho exato do SIP

    console.log(`[IngestaoController] Recebido SIP para pedido: ${transferId} com ${files.length} arquivos.`);
    console.log(`[IngestaoController] Arquivos salvos em: ${sipLocation}`);

    // Envia a localização EXATA do SIP para o Kafka
    await this.agendarProcessamentoUseCase.execute({
      transferId,
      sipLocation: sipLocation, 
      metadados: metadados ? JSON.parse(metadados) : {},
    });

    return {
      message: 'SIP recebido pela Ingestão e agendado para processamento.',
      transferId,
    };
  }
}