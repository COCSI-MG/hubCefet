import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Class } from './class.entity';

@Table({
  tableName: 'class_students',
  timestamps: false,
})
export class ClassStudent extends Model {
  @ApiProperty({
    example: 1,
    description: 'ID da Matrícula',
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
    field: 'class_id'
  })
  classId: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do Aluno',
  })
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'student_id'
  })
  studentId: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Data de criação',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
    field: 'created_at'
  })
  createdAt: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Data de atualização',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
    field: 'updated_at'
  })
  updatedAt: Date;

  @BelongsTo(() => Class, { foreignKey: 'classId', targetKey: 'id' })
  class: Class;

  @BelongsTo(() => User, { foreignKey: 'studentId', targetKey: 'id' })
  student: User;
} 