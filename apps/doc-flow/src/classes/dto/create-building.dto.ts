import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBuildingDto {
  @ApiProperty({
    example: 'Bloco A',
    description: 'Nome do bloco',
  })
  @IsNotEmpty({ message: 'O nome do bloco é obrigatório' })
  @IsString({ message: 'O nome do bloco deve ser uma string' })
  name: string;
} 