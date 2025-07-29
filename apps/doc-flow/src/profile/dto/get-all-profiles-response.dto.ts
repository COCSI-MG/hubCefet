import { OmitType, ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { Profile } from '../entities/profile.entity';

export class GetAllProfilesResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({
    type: 'object',
    properties: {
      profiles: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Profile',
        },
      },
    },
  })
  data: {
    profiles: Profile[];
  };
}
