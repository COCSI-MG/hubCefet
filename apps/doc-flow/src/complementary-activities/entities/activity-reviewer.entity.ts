import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { ComplementaryActivity } from './complementary-activity.entity';

@Table({
  tableName: 'activity_reviewers',
  timestamps: false,
})
export class ActivityReviewer extends Model {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Activity Reviewer ID',
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
  @ForeignKey(() => ComplementaryActivity)
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
    example: '2024-01-01T00:00:00.000Z',
    description: 'Date and time when reviewer was assigned',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  assigned_at: Date;

  @BelongsTo(() => ComplementaryActivity, 'activity_id')
  activity: ComplementaryActivity;

  @BelongsTo(() => User, 'reviewer_user_id')
  reviewer: User;
} 
 
 