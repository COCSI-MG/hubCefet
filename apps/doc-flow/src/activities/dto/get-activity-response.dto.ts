import { ApiProperty } from '@nestjs/swagger';
import { ComplementaryActivityType } from '../../complementary-activity-type/entities/complementary-activity-type.entity';
import { User } from '../../users/entities/user.entity';
import { ActivityHistoryType } from '../enum/activity-history-type.enum';
import { ActivityReviewer } from '../entities/activity-reviewer.entity';
import { ActivityStatus } from '../entities/activity-status.entity';
import { ActivityType } from '../entities/activity-type.entity';

export class ActivityHistoryLogItemDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do item do histórico',
  })
  id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID da atividade',
  })
  activity_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do usuário responsável pela ação',
  })
  user_id: string;

  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome do usuário responsável pela ação',
    nullable: true,
  })
  user_name: string | null;

  @ApiProperty({
    example: ActivityHistoryType.CREATED,
    description: 'Tipo do evento do histórico',
    enum: ActivityHistoryType,
  })
  type: ActivityHistoryType;

  @ApiProperty({
    example: 'CREATE',
    description: 'Ação resumida do log',
  })
  action: string;

  @ApiProperty({
    example: 'Atividade criada pelo aluno',
    description: 'Descrição do evento',
  })
  description: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data do evento',
  })
  created_at: Date;

  @ApiProperty({
    type: () => User,
    description: 'Usuário responsável pela ação',
    nullable: true,
  })
  user?: User;
}

export class GetActivityResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID da atividade',
  })
  id: string;

  @ApiProperty({
    example: 'Curso de React Avançado',
    description: 'Nome do curso/atividade',
  })
  course_name: string;

  @ApiProperty({
    example: 40,
    description: 'Carga horária da atividade',
  })
  hours: number;

  @ApiProperty({
    example: 'certificates/file.pdf',
    description: 'Caminho do certificado',
  })
  certificate_url: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do usuário dono da atividade',
  })
  user_id: string;

  @ApiProperty({
    example: 1,
    description: 'ID do tipo da atividade',
  })
  activity_type_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID do status da atividade',
  })
  status_id: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data de criação',
  })
  created_at: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data de atualização',
  })
  updated_at: Date;

  @ApiProperty({
    example: 1,
    description: 'ID do tipo complementar',
    nullable: true,
  })
  complementary_activity_type_id?: number | null;

  @ApiProperty({
    type: () => User,
    description: 'Usuário dono da atividade',
  })
  user: User;

  @ApiProperty({
    type: () => ActivityType,
    description: 'Tipo da atividade',
    nullable: true,
  })
  activityType?: ActivityType;

  @ApiProperty({
    type: () => ActivityStatus,
    description: 'Status da atividade',
    nullable: true,
  })
  status?: ActivityStatus;

  @ApiProperty({
    type: () => ComplementaryActivityType,
    description: 'Tipo complementar da atividade',
    nullable: true,
  })
  complementaryActivityType?: ComplementaryActivityType | null;

  @ApiProperty({
    type: () => ActivityReviewer,
    isArray: true,
    description: 'Revisores vinculados à atividade',
  })
  reviewers: ActivityReviewer[];

  @ApiProperty({
    type: () => ActivityHistoryLogItemDto,
    isArray: true,
    description: 'Histórico da atividade em formato de log',
  })
  history: ActivityHistoryLogItemDto[];
}
