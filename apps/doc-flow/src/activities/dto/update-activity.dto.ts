import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateActivityDto {
  @ApiPropertyOptional({
    example: 'Curso de React Avançado',
    description: 'Nome do curso/atividade',
  })
  @IsOptional()
  @IsString()
  course_name?: string;

  @ApiPropertyOptional({
    example: 40,
    description: 'Quantidade de horas da atividade',
    minimum: 1,
    maximum: 1000,
  })
  @Transform(({ value }) => value === '' || value === undefined ? undefined : parseInt(value, 10))
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  hours?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID do tipo de atividade',
  })
  @Transform(({ value }) => value === '' || value === undefined ? undefined : parseInt(value, 10))
  @IsOptional()
  @IsNumber()
  activity_type_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID do tipo de atividade complementar',
    nullable: true,
  })
  @Transform(({ value }) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === '') {
      return null;
    }

    return parseInt(value, 10);
  })
  @IsOptional()
  @IsNumber()
  complementary_activity_type_id?: number | null;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Arquivo PDF do certificado',
  })
  @IsOptional()
  certificate?: any;

  @IsOptional()
  @IsString()
  certificate_url?: string;
}
