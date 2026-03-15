import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { ActivityType } from './activity-type.entity';
import { ActivityStatus } from './activity-status.entity';
import { ActivityReviewer } from './activity-reviewer.entity';
import { ActivityReview } from './activity-review.entity';

@Table({
  tableName: 'activities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Activity extends Model {
  @ApiProperty({
    example: 1,
    description: 'Activity ID',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ApiProperty({
    example: 'Curso de React Avançado',
    description: 'Course name',
  })
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  course_name: string;

  @ApiProperty({
    example: 40,
    description: 'Number of hours',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  hours: number;

  @ApiProperty({
    example: 'certificate.pdf',
    description: 'File path of the certificate',
  })
  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  certificate_url: string;

  @ApiProperty({
    example: '114c4e4d-8334-434a-a923-8203f6d19312',
    description: 'User ID who submitted the activity',
  })
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id: string;

  @ApiProperty({
    example: 1,
    description: 'Activity Type ID',
  })
  @ForeignKey(() => ActivityType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  activity_type_id: number;

  @ApiProperty({
    example: 1,
    description: 'Status ID',
  })
  @ForeignKey(() => ActivityStatus)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  status_id: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Date and time of creation',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Date and time of last update',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  updated_at: Date;

  @ApiProperty({
    example: 1,
    description: 'Activity Type ID',
  })
  @ForeignKey(() => ActivityType)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  complementary_activity_type_id: number;

  @BelongsTo(() => User, 'user_id')
  user: User;

  @BelongsTo(() => ActivityType, 'activity_type_id')
  activityType: ActivityType;

  @BelongsTo(() => ActivityStatus, 'status_id')
  status: ActivityStatus;

  @HasMany(() => ActivityReviewer, 'activity_id')
  reviewers: ActivityReviewer[];

  @HasMany(() => ActivityReview, 'activity_id')
  reviews: ActivityReview[];
}


