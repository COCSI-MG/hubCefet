import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

export class EndEventResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({
    type: 'object',
    properties: {
      message: {
        type: 'string',
      },
    },
    example: {
      message: 'Event ended',
    },
  })
  data: {
    message: string;
  };
}
