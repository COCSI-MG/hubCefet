import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Activity } from './activity.entity';

@Table({
  tableName: 'activity_reviews',
  timestamps: false,
})
export class ActivityReview extends Model {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Activity Review ID',
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
    description: 'Reviewer User ID',
  })
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  reviewer_user_id: string;

  @ApiProperty({
    example: 'APPROVED',
    description: 'Review decision',
    enum: ['APPROVED', 'REJECTED'],
  })
  @Column({
    type: DataType.ENUM('APPROVED', 'REJECTED'),
    allowNull: false,
  })
  decision: 'APPROVED' | 'REJECTED';

  @ApiProperty({
    example: 'Certificado válido e atividade comprovada',
    description: 'Review comments',
  })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  comments: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Date and time when review was made',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  reviewed_at: Date;

  @BelongsTo(() => Activity)
  activity: Activity;

  @BelongsTo(() => User)
  reviewer: User;
}


