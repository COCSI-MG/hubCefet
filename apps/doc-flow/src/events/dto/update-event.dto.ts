import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) { }


export class UpdateEventVacanciesDto {
  @ApiProperty({
    example: 10,
    description: 'Vacancies',
  })
  @IsNumber()
  vacancies: number;
}
