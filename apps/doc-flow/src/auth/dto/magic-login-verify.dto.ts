import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MagicLoginVerifyDto {
  @ApiProperty({
    description: 'Token recebido por email para autenticação',
    example: 'abc123def456ghi789jkl012mno345pqr',
  })
  @IsString({ message: 'Token deve ser uma string' })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string;
} 
 
 