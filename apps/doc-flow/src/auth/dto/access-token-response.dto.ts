import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenResponseDto {
  @ApiProperty({
    type: 'string',
    example: 'some-jwt-token',
  })
  access_token: string;
}
