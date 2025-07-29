import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSemesterDto {
  @ApiProperty({
    example: 2023,
    description: 'Ano do semestre',
  })
  @IsOptional()
  @IsNumber({}, { message: 'O ano do semestre deve ser um número' })
  @Type(() => Number)
  year?: number;

  @ApiProperty({
    example: 1,
    description: 'Número do semestre (1 ou 2)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'O número do semestre deve ser um número' })
  @IsIn([1, 2], { message: 'O número do semestre deve ser 1 ou 2' })
  @Type(() => Number)
  number?: number;
} 