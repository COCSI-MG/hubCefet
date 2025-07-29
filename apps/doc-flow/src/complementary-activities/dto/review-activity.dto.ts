import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReviewDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewActivityDto {
  @ApiProperty({
    example: 'APPROVED',
    description: 'Decisão da avaliação',
    enum: ReviewDecision,
  })
  @IsEnum(ReviewDecision)
  decision: ReviewDecision;

  @ApiProperty({
    example: 'Certificado válido e adequado para o tipo de atividade',
    description: 'Comentários do avaliador',
    required: false,
  })
  @IsOptional()
  @IsString()
  comments?: string;
}
 
 