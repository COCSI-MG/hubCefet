import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';

export class SignUpAuthDto {
  @ApiProperty()
  @IsEmail()
  @Matches(/(@cefet-rj\.br|@aluno\.cefet-rj\.br)$/, {
    message:
      'Apenas e-mails dos domínios cefet-rj.br ou aluno.cefet-rj.br são permitidos',
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsStrongPassword({}, {
    message: 'A senha deve ser forte e conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.'
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @Matches(/\d{4}\d{3}[A-Z]{4}$/, {
    message: 'Matricula deve estar no formato 99992020SINF',
  })
  @IsString()
  enrollment?: string;
}
