import { OmitType, ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { User } from '../entities/user.entity';

export class CreateUserResponseDto extends OmitType(ApiResponseDto, [
  'data',
] as const) {
  @ApiProperty({ type: User })
  data: {
    user: User;
  };
}
