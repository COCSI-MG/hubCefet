import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ApiResponseDto } from './api-response.dto';

export class Api500ResponseDto extends OmitType(ApiResponseDto, [
  'error',
] as const) {
  @ApiProperty({
    example: 'Internal server error',
    description: 'Error message',
  })
  error: string;
}
