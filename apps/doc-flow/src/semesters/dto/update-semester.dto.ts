import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsNumber, Min, Max } from 'class-validator';

export class UpdateSemesterDto {
  @ApiProperty({
    example: 2023,
    description: 'Ano ao qual o período está associado',
  })
  @IsOptional()
  @IsNumber({}, { message: 'O ano deve ser um número' })
  @Min(2000, { message: 'O ano deve ser posterior a 2000' })
  @Max(2100, { message: 'O ano deve ser anterior a 2100' })
  year?: number;

  @ApiProperty({
    example: 3,
    description: 'Identificador numérico do período (qualquer número inteiro positivo, não apenas 1 ou 2)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'O número do período deve ser um número' })
  @Min(1, { message: 'O número do período deve ser maior que zero' })
  number?: number;

  @ApiProperty({
    example: '2023-01-01',
    description: 'Data de início do período',
  })
  @IsOptional()
  @IsDateString({}, { message: 'A data de início deve estar em formato válido' })
  start_date?: string;

  @ApiProperty({
    example: '2023-06-30',
    description: 'Data de término do período',
  })
  @IsOptional()
  @IsDateString({}, { message: 'A data de término deve estar em formato válido' })
  end_date?: string;
} 