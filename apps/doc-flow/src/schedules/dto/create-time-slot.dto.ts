import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { DayOfWeek } from '../entities/time-slot.entity';
import { IsTimeAfter } from '../validators/is-time-after.validator';

export class CreateTimeSlotDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in format HH:MM',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in format HH:MM',
  })
  @IsTimeAfter('startTime', {
    message: 'O horário de término deve ser posterior ao horário de início',
  })
  endTime: string;

  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  dayOfWeek: DayOfWeek;
} 