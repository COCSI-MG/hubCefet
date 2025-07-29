import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

export class AuthResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({
    type: 'object',
    properties: {
      accessToken: {
        type: 'string',
      },
    },
    example: {
      accessToken: 'some-jwt-token',
    },
  })
  data: {
    accessToken: string;
  };
}
