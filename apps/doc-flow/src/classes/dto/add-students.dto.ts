import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AddStudentsDto {
  @ApiProperty({
    example: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
    description: 'Lista de IDs dos alunos',
  })
  @IsNotEmpty({ message: 'A lista de IDs dos alunos é obrigatória' })
  @IsArray({ message: 'A lista de IDs dos alunos deve ser um array' })
  @IsUUID('4', { each: true, message: 'Cada ID de aluno deve ser um UUID válido' })
  student_ids: string[];
} 