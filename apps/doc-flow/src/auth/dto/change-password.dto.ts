import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsStrongPassword({}, {
    message: 'A senha deve ser forte e conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.'
  })
  @IsNotEmpty()
  newPassword: string;
}
