import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';
import { CreateClassDto } from './create-class.dto';

export class UpdateClassDto extends PartialType(CreateClassDto) {
  @ApiProperty({
    example: 'Estrutura de Dados 2',
    description: 'Nome da disciplina',
  })
  @IsOptional()
  @IsString({ message: 'O nome da disciplina deve ser uma string' })
  name?: string;

  @ApiProperty({
    example: 1,
    description: 'ID da Disciplina',
  })
  @IsOptional()
  @IsNumber({}, { message: 'O ID da disciplina deve ser um número' })
  @Type(() => Number)
  @Transform(({ obj }) => obj.subject_id || obj.subjectId)
  subjectId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID do Semestre',
  })
  @IsOptional()
  @IsNumber({}, { message: 'O ID do semestre deve ser um número' })
  @Type(() => Number)
  @Transform(({ obj }) => obj.semester_id || obj.semesterId)
  semesterId?: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do Professor',
  })
  @IsOptional()
  @IsUUID('4', { message: 'O ID do professor deve ser um UUID válido' })
  @Transform(({ obj }) => obj.teacher_id || obj.teacherId)
  teacherId?: string;
} 