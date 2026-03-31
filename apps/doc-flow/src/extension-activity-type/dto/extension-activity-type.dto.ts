import { ApiProperty } from "@nestjs/swagger";

export class ExtensionActivityTypeDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador único do tipo de atividade de extensão',
  })
  id: number;

  @ApiProperty({
    example: 'Projeto Social',
    description: 'Nome do tipo de atividade de extensão',
  })
  name: string;

  @ApiProperty({
    example: 'Atividades relacionadas a projetos sociais comunitários.',
    description: 'Descrição detalhada do tipo de atividade de extensão',
    required: false,
    nullable: true,
  })
  description?: string;
}
