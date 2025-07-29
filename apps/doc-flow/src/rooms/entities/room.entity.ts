import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Model,
  Table,
  DataType,
  BelongsTo,
  HasMany,
  ForeignKey,
} from 'sequelize-typescript';
import { Building } from '../../buildings/entities/building.entity';
import { ClassSchedule } from '../../schedules/entities/class-schedule.entity';

@Table({
  tableName: 'rooms',
  timestamps: false,
})
export class Room extends Model {
  @ApiProperty({
    example: 1,
    description: 'ID da Sala',
  })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @ApiProperty({
    example: 'Sala 101',
    description: 'Nome da Sala',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

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

  @BelongsTo(() => Building, { foreignKey: 'building_id', targetKey: 'id' })
  building: Building;

  @HasMany(() => ClassSchedule, { onDelete: 'CASCADE' })
  schedules: ClassSchedule[];
} 