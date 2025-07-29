import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Model,
  Table,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { Room } from '../../rooms/entities/room.entity';
import { ClassSchedule } from '../../schedules/entities/class-schedule.entity';

@Table({
  tableName: 'buildings',
  timestamps: false,
})
export class Building extends Model {
  @ApiProperty({
    example: 1,
    description: 'ID do Bloco',
  })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @ApiProperty({
    example: 'Bloco A',
    description: 'Nome do Bloco',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Data de criação',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
  })
  created_at: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Data de atualização',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
  })
  updated_at: Date;

  @HasMany(() => Room, { onDelete: 'CASCADE' })
  rooms: Room[];

  @HasMany(() => ClassSchedule, { onDelete: 'CASCADE' })
  schedules: ClassSchedule[];
} 