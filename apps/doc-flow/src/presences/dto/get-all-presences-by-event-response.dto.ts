import { OmitType, ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { Presence } from '../entities/presence.entity';

export class GetAllPresencesByEventResponseDto extends OmitType(
  ApiResponseDto,
  ['data'] as const,
) {
  @ApiProperty({
    type: 'object',
    properties: {
      presences: {
        type: 'array',
        items: {
          type: 'object',
          $ref: '#/components/schemas/Presence',
        },
      },
    },
  })
  data: {
    presences: Presence[];
  };
}
