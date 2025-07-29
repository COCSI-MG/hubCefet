import { OmitType, ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { TccStudents } from '../entities/tcc-students.entity';

export class CreateTccStudentResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({
    type: 'object',
    properties: {
      tccStudent: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          tcc_id: { type: 'string' },
          student_id: { type: 'string' },
          created_at: { type: 'string' },
          updated_at: { type: 'string' },
        },
      },
    },
  })
  data: {
    tccStudent: TccStudents;
  };
}
