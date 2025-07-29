import { OmitType, ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { TccPresentation } from '../entities/tcc-presentation.entity';

export class GetAllTccPresentationsResponseDto extends OmitType(
  ApiResponseDto,
  ['data'] as const,
) {
  @ApiProperty({
    type: 'array',
    items: {
      $ref: '#/components/schemas/TccPresentation',
    },
  })
  data: TccPresentation[];
}
