import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Event } from '../entities/event.entity';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

class GetEventResponseDataDto {
  @ApiProperty({
    type: Event,
  })
  event: Event;
  @ApiProperty({
    type: 'boolean',
  })
  isStarted: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  isEnded: boolean;
}

export class GetEventResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({
    type: GetEventResponseDataDto,
  })
  data: {
    event: Event;
    isStarted: boolean;
    isEnded: boolean;
  };
}
