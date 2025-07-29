import { OmitType, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { Role } from '../entities/role.entity';

export class GetAllRolesResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({
    type: 'object',
    properties: {
      roles: {
        type: 'array',
        items: {
          $ref: getSchemaPath(Role),
        },
      },
    },
  })
  data: {
    roles: Role[];
  };
}
