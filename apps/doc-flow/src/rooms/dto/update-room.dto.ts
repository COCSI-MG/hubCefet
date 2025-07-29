import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRoomDto {
  @ApiProperty({
    example: 'Sala 101',
    description: 'Nome da sala',
  })
  @IsOptional()
  @IsString({ message: 'O nome da sala deve ser uma string' })
  name?: string;

  @ApiProperty({
    example: 1,
    description: 'ID do bloco',
  })
  @IsOptional()
  @IsNumber({}, { message: 'O ID do bloco deve ser um número' })
  @Type(() => Number)
  building_id?: number;
} 