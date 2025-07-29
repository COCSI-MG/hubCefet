import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Event } from '../entities/event.entity';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

export class GetAllEventsResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({
    type: 'object',
    properties: {
      events: {
        type: 'array',
        items: {
          type: 'object',
          $ref: '#/components/schemas/Event',
        },
      },
    },
  })
  data: {
    events: Event[];
  };
}
