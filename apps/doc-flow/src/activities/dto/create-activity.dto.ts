import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({
    example: 'Curso de React Avançado',
    description: 'Nome do curso/atividade',
  })
  @IsNotEmpty()
  @IsString()
  course_name: string;

  @ApiProperty({
    example: 40,
    description: 'Quantidade de horas da atividade',
    minimum: 1,
    maximum: 1000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(1000)
  hours: number;

  @ApiProperty({
    example: 1,
    description: 'ID do tipo de atividade',
  })
  @IsNotEmpty()
  @IsNumber()
  activity_type_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID do tipo de atividade complementar',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  complementary_activity_type_id: number

  @ApiProperty({
    example: 'certificate.pdf',
    description: 'Caminho do arquivo do certificado',
    required: false,
  })
  @IsOptional()
  @IsString()
  certificate_url?: string;
}


