import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { PresenceCheckType } from '../enum/presence-check-type.enum';

export class UpdatePresenceDto {
  @ApiProperty({
    description: 'Tipo de marcação de presença',
    enum: PresenceCheckType,
    example: PresenceCheckType.CHECK_IN,
  })
  @IsEnum(PresenceCheckType)
  type: PresenceCheckType;

  @ApiPropertyOptional({
    description: 'Latitude do usuário (obrigatória para eventos por geolocalização)',
    example: -22.9035,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude do usuário (obrigatória para eventos por geolocalização)',
    example: -43.2096,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
