import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { EventStatus } from '../enum/event-status.enum';

export class CreateEventDto {
  @ApiProperty({
    example: 'Event 1',
  })
  @IsString()
  name: string;
  @ApiProperty({
    description: 'Event start date',
    example: '2024-12-14T10:00:00Z',
  })
  @IsNotEmpty({
    message: 'Event start date is required',
  })
  @IsISO8601({}, { message: 'Incorrect date format' })
  eventStartDate: string;
  @ApiProperty({
    description: 'Event end date',
    example: '2024-12-17T10:00:00Z',
  })
  @IsISO8601({}, { message: 'Incorrect date format' })
  eventEndDate?: string;
  @ApiProperty({
    description: 'Status of the event',
    example: 'upcoming',
  })
  @IsEnum(EventStatus)
  status: EventStatus;

  @ApiProperty({
    example: 'user-id',
    description: 'User ID',
  })
  @IsString()
  @IsOptional()
  created_by_user_id?: string;

  @ApiProperty({
    example: -23.5505199,
    description: 'Latitude',
  })
  @IsNumber()
  @IsOptional()
  latitude: number;

  @ApiProperty({
    example: -46.6333094,
    description: 'Longitude',
  })
  @IsNumber()
  @IsOptional()
  longitude: number;

  @ApiProperty({
    example: 10,
    description: 'Vacancies',
  })
  @IsNumber()
  vacancies: number;
}
