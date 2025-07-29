import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBuildingDto {
  @ApiProperty({
    example: 'Bloco A',
    description: 'Nome do bloco',
  })
  @IsOptional()
  @IsString({ message: 'O nome do bloco deve ser uma string' })
  name?: string;
} 