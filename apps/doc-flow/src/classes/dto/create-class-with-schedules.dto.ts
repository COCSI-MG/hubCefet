import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateClassDto } from './create-class.dto';
import { CreateClassScheduleDto } from '../../schedules/dto/create-class-schedule.dto';

export class CreateClassWithSchedulesDto {
  @ApiProperty({
    description: 'Dados da aula',
    type: CreateClassDto,
  })
  @IsNotEmpty({ message: 'Os dados da aula são obrigatórios' })
  @ValidateNested()
  @Type(() => CreateClassDto)
  class: CreateClassDto;

  @ApiProperty({
    description: 'Agendamentos da aula (horários e salas)',
    type: [CreateClassScheduleDto],
  })
  @IsArray({ message: 'Os agendamentos devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CreateClassScheduleDto)
  schedules: CreateClassScheduleDto[];
} 
 