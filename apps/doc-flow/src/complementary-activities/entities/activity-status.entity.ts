import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { ComplementaryActivity } from './complementary-activity.entity';

@Table({
  tableName: 'activity_statuses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ActivityStatus extends Model {
  @ApiProperty({
    example: 1,
    description: 'Activity Status ID',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ApiProperty({
    example: 'PENDING',
    description: 'Status name',
  })
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  name: string;

  @ApiProperty({
    example: 'Atividade aguardando aprovação dos professores',
    description: 'Description of the status',
  })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

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

  @HasMany(() => ComplementaryActivity, 'status_id')
  complementaryActivities: ComplementaryActivity[];
} 
 
 