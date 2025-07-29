import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { ClassSchedule } from './class-schedule.entity';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

@Table({
  tableName: 'time_slots',
  timestamps: true,
  underscored: true
})
export class TimeSlot extends Model {
  @ApiProperty({
    example: 1,
    description: 'ID do Horário',
  })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @ApiProperty({
    example: '07:30',
    description: 'Horário de início',
  })
  @Column({
    type: DataType.TIME,
    allowNull: false,
    field: 'start_time'
  })
  startTime: string;

  @ApiProperty({
    example: '09:10',
    description: 'Horário de término',
  })
  @Column({
    type: DataType.TIME,
    allowNull: false,
    field: 'end_time'
  })
  endTime: string;

  @ApiProperty({
    example: 'MONDAY',
    description: 'Dia da semana',
    enum: DayOfWeek,
  })
  @Column({
    type: DataType.ENUM(...Object.values(DayOfWeek)),
    allowNull: false,
    field: 'day_of_week'
  })
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    example: '2023-04-25T10:00:00.000Z',
    description: 'Data de criação',
  })
  @Column({
    type: DataType.DATE,
    field: 'created_at',
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-04-25T10:00:00.000Z',
    description: 'Data de atualização',
  })
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  updatedAt: Date;

  @HasMany(() => ClassSchedule, { foreignKey: 'time_slot_id' })
  schedules: ClassSchedule[];
} 