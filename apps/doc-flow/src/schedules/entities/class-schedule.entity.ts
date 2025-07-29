import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Model,
  Table,
  DataType,
  BelongsTo,
  ForeignKey,
  Index,
  Unique,
} from 'sequelize-typescript';
import { Building } from '../../buildings/entities/building.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Class } from '../../classes/entities/class.entity';
import { TimeSlot } from './time-slot.entity';

@Table({
  tableName: 'class_schedules',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'unique_class_time_room',
      unique: true,
      fields: ['class_id', 'time_slot_id', 'room_id']
    },
    {
      name: 'unique_time_room',
      unique: true,
      fields: ['time_slot_id', 'room_id']
    }
  ]
})
export class ClassSchedule extends Model {
  @ApiProperty({
    example: 1,
    description: 'ID do Horário de Aula',
  })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: 'ID da Aula',
  })
  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  class_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID do TimeSlot',
  })
  @ForeignKey(() => TimeSlot)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'time_slot_id'
  })
  time_slot_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID do Bloco',
  })
  @ForeignKey(() => Building)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  building_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID da Sala',
  })
  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  room_id: number;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Data de criação',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
    field: 'created_at'
  })
  created_at: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Data de atualização',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
    field: 'updated_at'
  })
  updated_at: Date;

  @BelongsTo(() => Building)
  building: Building;

  @BelongsTo(() => Room)
  room: Room;

  @BelongsTo(() => Class)
  class: Class;

  @BelongsTo(() => TimeSlot)
  time_slot: TimeSlot;
}