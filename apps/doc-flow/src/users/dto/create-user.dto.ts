import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @Matches(/(@cefet-rj\.br|@aluno\.cefet-rj\.br)$/, {
    message:
      'Apenas e-mails dos domínios cefet-rj.br ou aluno.cefet-rj.br são permitidos',
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsStrongPassword({}, {
    message: 'A senha deve ser forte e conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.'
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty()
  @IsString()
  enrollment?: string;

  @ApiProperty()
  @IsString()
  profileId?: string;
}
