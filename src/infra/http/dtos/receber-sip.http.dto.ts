import { IsNotEmpty, IsString, IsOptional, IsJSON } from 'class-validator';

export class ReceberSipHttpDto {
  @IsString()
  @IsNotEmpty()
  transferId!: string;

  @IsString()
  @IsJSON() // Garante que é uma string JSON válida
  @IsOptional()
  metadados?: string;
}