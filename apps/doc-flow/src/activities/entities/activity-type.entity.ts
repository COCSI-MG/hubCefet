import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Activity } from './activity.entity';

@Table({
  tableName: 'activity_types',
  timestamps: false,
})
export class ActivityType extends Model {
  @ApiProperty({
    example: 1,
    description: 'Activity Type ID',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ApiProperty({
    example: 'Atividades de Ensino',
    description: 'Name of the activity type',
  })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  name: string;

  @HasMany(() => Activity)
  activities: Activity[];
}


