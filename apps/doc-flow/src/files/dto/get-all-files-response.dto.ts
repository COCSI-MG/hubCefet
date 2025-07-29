import { ApiProperty, OmitType } from '@nestjs/swagger';
import { File } from '../entities/file.entity';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

export class GetAllFilesResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({
    type: 'object',
    properties: {
      files: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/File',
        },
      },
    },
  })
  data: {
    files: File[];
  };
}
