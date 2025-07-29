import { OmitType, ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { User } from '../entities/user.entity';

export class GetAllUsersResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: {
          type: 'object',
          $ref: '#/components/schemas/User',
        },
      },
    },
  })
  data: {
    users: User[];
  };
}
