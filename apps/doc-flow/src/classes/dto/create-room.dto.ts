import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @ApiProperty({
    example: 'Sala 101',
    description: 'Nome da sala',
  })
  @IsNotEmpty({ message: 'O nome da sala é obrigatório' })
  @IsString({ message: 'O nome da sala deve ser uma string' })
  name: string;

  @ApiProperty({
    example: 1,
    description: 'ID do bloco',
  })
  @IsNotEmpty({ message: 'O ID do bloco é obrigatório' })
  @IsNumber({}, { message: 'O ID do bloco deve ser um número' })
  @Type(() => Number)
  building_id: number;
} 