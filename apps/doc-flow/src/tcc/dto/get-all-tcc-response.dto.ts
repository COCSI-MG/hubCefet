import { OmitType, ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { Tcc } from '../entities/tcc.entity';

export class GetAllTccResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({
    type: 'object',
    properties: {
      tccs: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Tcc',
        },
      },
    },
  })
  data: {
    tccs: Tcc[];
  };
}
