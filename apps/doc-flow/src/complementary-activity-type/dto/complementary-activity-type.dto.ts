import { ApiProperty } from "@nestjs/swagger";

export class ComplementaryActivityTypeDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador único do tipo de atividade complementar',
  })
  id: number;

  @ApiProperty({
    example: 'Monitoria',
    description: 'Nome do tipo de atividade complementar',
  })
  name: string;

  @ApiProperty({
    example: 'Atividades de monitoria realizadas em disciplinas da graduação.',
    description: 'Descrição detalhada do tipo de atividade complementar',
    required: false,
    nullable: true,
  })
  description?: string;
}
