import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class MagicLoginRequestDto {
  @ApiProperty({
    description: 'Email do estudante registrado no sistema',
    example: 'joao.silva.aluno@cefet-rj.br ou joao.silva@cefet-rj.br',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @Matches(/(@cefet-rj\.br|@aluno\.cefet-rj\.br)$/, {
    message: 'Apenas emails institucionais (@cefet-rj.br ou @aluno.cefet-rj.br) são permitidos',
  })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;
} 
 
 