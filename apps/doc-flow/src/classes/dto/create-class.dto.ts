import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateClassDto {
  @ApiProperty({
    example: 'Estrutura de Dados 2',
    description: 'Nome da disciplina',
  })
  @IsNotEmpty({ message: 'O nome da disciplina é obrigatório' })
  @IsString({ message: 'O nome da disciplina deve ser uma string' })
  @Transform(({ value }) => value?.trim())
  readonly name: string;

  @ApiProperty({
    example: 1,
    description: 'ID da Disciplina',
  })
  @Type(() => Number)
  @IsNotEmpty({ message: 'O ID da disciplina é obrigatório' })
  @IsNumber({}, { message: 'O ID da disciplina deve ser um número' })
  readonly subjectId: number;

  @ApiProperty({
    example: 1,
    description: 'ID do Semestre',
  })
  @Type(() => Number)
  @IsNotEmpty({ message: 'O ID do semestre é obrigatório' })
  @IsNumber({}, { message: 'O ID do semestre deve ser um número' })
  readonly semesterId: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do Professor',
  })
  @IsOptional()
  @IsUUID('4', { message: 'O ID do professor deve ser um UUID válido' })
  readonly teacherId: string;
}