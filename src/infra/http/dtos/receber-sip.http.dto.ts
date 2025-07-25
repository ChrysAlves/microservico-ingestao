import { IsNotEmpty, IsString, IsOptional, IsJSON } from 'class-validator';

export class ReceberSipHttpDto {
  @IsString()
  @IsNotEmpty()
  transferId!: string;

  @IsString()
  @IsJSON()
  @IsOptional()
  metadados?: string;
}