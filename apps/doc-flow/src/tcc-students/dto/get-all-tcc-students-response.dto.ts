import { OmitType, ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { TccStudents } from '../entities/tcc-students.entity';

export class GetAllTccStudentsResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({
    type: 'object',
    properties: {
      tccStudents: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/TccStudents',
        },
      },
    },
  })
  data: {
    tccStudents: TccStudents[];
  };
}
