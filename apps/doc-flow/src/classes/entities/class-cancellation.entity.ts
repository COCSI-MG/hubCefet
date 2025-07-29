import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript';
import { Class } from './class.entity';

@Table({
  tableName: 'class_cancellations',
  underscored: true,
})
export class ClassCancellation extends Model {
  @ApiProperty({
    example: 1,
    description: 'ID do cancelamento da aula',
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
    description: 'ID da aula cancelada',
  })
  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'class_id'
  })
  classId: number;

  @ApiProperty({
    example: '2023-06-15',
    description: 'Data da aula cancelada',
  })
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  date: Date;

  @ApiProperty({
    example: 'Feriado nacional',
    description: 'Motivo do cancelamento',
  })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  reason: string;

  @ApiProperty({
    example: false,
    description: 'Indica se os alunos foram notificados',
  })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'students_notified'
  })
  studentsNotified: boolean;

  @ApiProperty({
    example: 'b689bf8a-e671-486f-8bc1-f877a7ee89eb',
    description: 'ID do professor que cancelou a aula',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'canceled_by'
  })
  canceledBy: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at'
  })
  createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at'
  })
  updatedAt: Date;

  @BelongsTo(() => Class, { foreignKey: 'classId', targetKey: 'id', as: 'class' })
  class: Class;
} 
