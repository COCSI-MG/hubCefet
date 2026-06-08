import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PresenceCheckType } from '../enum/presence-check-type.enum';

export class UpdatePresenceDto {
  @ApiProperty({
    description: 'Tipo de marcação de presença',
    enum: PresenceCheckType,
    example: PresenceCheckType.CHECK_IN,
  })
  @IsEnum(PresenceCheckType)
  type: PresenceCheckType;
}
