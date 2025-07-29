import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class SignInAuthDto {
  @ApiProperty()
  @IsEmail()
  @Matches(/(@cefet-rj\.br|@aluno\.cefet-rj\.br)$/, {
    message: 'Only emails from cefet-rj.br or aluno.cefet-rj.br domains are allowed',
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
