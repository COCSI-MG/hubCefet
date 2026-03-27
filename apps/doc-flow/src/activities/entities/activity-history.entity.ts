import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { ActivityHistoryType } from '../enum/activity-history-type.enum';
import { Activity } from './activity.entity';

@Table({
  tableName: 'activity_histories',
  timestamps: false,
})
export class ActivityHistory extends Model {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Activity history ID',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Activity ID',
  })
  @ForeignKey(() => Activity)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  activity_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID responsible for the action',
  })
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id: string;

  @ApiProperty({
    example: ActivityHistoryType.CREATED,
    description: 'History type',
    enum: ActivityHistoryType,
  })
  @Column({
    type: DataType.ENUM(...Object.values(ActivityHistoryType)),
    allowNull: false,
  })
  type: ActivityHistoryType;

  @ApiProperty({
    example: 'Atividade criada pelo aluno',
    description: 'Description of the action',
  })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Date and time when the action happened',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  @BelongsTo(() => Activity, 'activity_id')
  activity: Activity;

  @BelongsTo(() => User, 'user_id')
  user: User;
}
