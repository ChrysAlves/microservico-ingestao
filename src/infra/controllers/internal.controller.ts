// microservico-ingestao/src/infra/controllers/internal.controller.ts (VERSÃO ROBUSTA)

import { Controller, Get, Param, Res, StreamableFile, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { Response } from 'express';

@Controller('internal')
export class InternalController {

  @Get('files/:transferId/:filename')
  getFile(
    @Param('transferId') transferId: string,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const filePath = join('/app/temp_ingestao_sip', transferId, filename);
    console.log(`[InternalController] Tentando servir o arquivo de: ${filePath}`);

    if (!existsSync(filePath)) {
      console.error(`[InternalController] ARQUIVO NÃO ENCONTRADO: ${filePath}`);
      throw new NotFoundException(`Arquivo temporário não encontrado em ${filePath}`);
    }

    try {
      const fileStream = createReadStream(filePath);
      fileStream.on('error', (err) => {
        console.error(`[InternalController] ERRO NO STREAM do arquivo: ${filePath}`, err);
      });

      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      });

      console.log(`[InternalController] Enviando stream para o arquivo: ${filename}`);
      return new StreamableFile(fileStream);

    } catch (error) {
      console.error(`[InternalController] ERRO GERAL ao tentar criar stream para: ${filePath}`, error);
      throw new InternalServerErrorException('Falha ao ler o arquivo no servidor.');
    }
  }
}