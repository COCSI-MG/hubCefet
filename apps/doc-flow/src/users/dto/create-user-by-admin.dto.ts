import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateUserByAdminDto {
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
  @IsNotEmpty()
  full_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  enrollment?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  profileId: string;
}
