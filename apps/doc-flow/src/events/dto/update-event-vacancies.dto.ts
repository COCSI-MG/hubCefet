import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';



export class UpdateEventVacanciesDto {
  @ApiProperty({
    example: 10,
    description: 'Vacancies',
  })
  @IsNumber()
  vacancies: number;
}
