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
      'Only emails from cefet-rj.br or aluno.cefet-rj.br domains are allowed',
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
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
