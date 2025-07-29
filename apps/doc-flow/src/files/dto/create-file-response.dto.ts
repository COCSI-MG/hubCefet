import { ApiProperty, OmitType } from '@nestjs/swagger';
import { File } from '../entities/file.entity';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { FileType } from '../enum/file-type.enum';
import { FileStatus } from '../enum/file-status.enum';

export class CreateFileResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({
    type: 'object',
    properties: {
      file: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          user_id: { type: 'string' },
          event_id: { type: 'string' },
          type: { enum: [...Object.values(FileType)] },
          status: { enum: [...Object.values(FileStatus)] },
        },
      },
      message: { type: 'string' },
    },
  })
  data: {
    file: File;
    message: string;
  };
}
