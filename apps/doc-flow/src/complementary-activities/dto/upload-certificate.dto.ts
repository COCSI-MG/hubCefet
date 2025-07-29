import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadCertificateDto {
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
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(1000)
  hours: number;

  @ApiProperty({
    example: 1,
    description: 'ID do tipo de atividade complementar',
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  activity_type_id: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo PDF do certificado',
  })
  certificate: any;
} 
 
 