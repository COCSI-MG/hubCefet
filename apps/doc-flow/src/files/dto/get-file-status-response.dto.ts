import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

export class GetFileStatusResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string' },
      status: { type: 'string' },
    },
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'pending',
    },
  })
  data: {
    id: string;
    status: string;
  };
}
