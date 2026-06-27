import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { EventStatus } from '../enum/event-status.enum';
import { EventPresenceOptionEnum } from '../enum/event-presence-option.enum';
import { ActivityTypeEnum } from '../../activities/enum/activity-type.enum';

export class CreateEventDto {
  @ApiProperty({
    example: 'Event 1',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'This is a description of the event.',
    description: 'Event description',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'Event start date',
    example: '2024-12-14T10:00:00Z',
  })
  @IsNotEmpty({
    message: 'Event start date is required',
  })
  @IsISO8601({}, { message: 'Incorrect date format' })
  start_at: string;

  @ApiProperty({
    description: 'Event end date',
    example: '2024-12-17T10:00:00Z',
  })
  @IsNotEmpty({
    message: 'Event end date is required',
  })
  @IsISO8601({}, { message: 'Incorrect date format' })
  end_at: string;

  @ApiPropertyOptional({
    description: 'Status of the event',
    example: 'upcoming',
  })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

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
    example: 5,
    description: 'Radius in kilometers',
  })
  @IsNumber()
  @IsOptional()
  radius: number;

  @ApiProperty({
    example: 10,
    description: 'Vacancies',
  })
  @IsNumber()
  vacancies: number;

  @ApiProperty({
    example: 'qrcode',
    description: '',
  })
  @IsEnum(EventPresenceOptionEnum)
  presence_option: EventPresenceOptionEnum;

  @ApiPropertyOptional({
    example: 1,
    description: 'Tipo de atividade gerada para participantes (1=complementar, 2=extensão)',
  })
  @IsEnum(ActivityTypeEnum)
  @IsOptional()
  activity_type_id?: ActivityTypeEnum;

  @ApiPropertyOptional({
    example: 1,
    description: 'Subtipo de atividade complementar (obrigatório quando activity_type_id=1)',
  })
  @IsNumber()
  @IsOptional()
  complementary_activity_type_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Subtipo de atividade de extensão (obrigatório quando activity_type_id=2)',
  })
  @IsNumber()
  @IsOptional()
  extension_activity_type_id?: number;

  @ApiPropertyOptional({
    example: 4,
    description: 'Quantidade de horas da atividade gerada (obrigatório quando activity_type_id é informado)',
  })
  @IsNumber()
  @Min(1)
  @Max(1000)
  @IsOptional()
  activity_hours?: number;
}
