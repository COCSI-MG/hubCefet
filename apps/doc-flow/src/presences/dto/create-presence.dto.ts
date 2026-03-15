import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePresenceDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  event_id: string;
}
