import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Model,
  Table,
  DataType,
  BelongsTo,
  HasMany,
  BelongsToMany,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { Semester } from '../../semesters/entities/semester.entity';
import { ClassStudent } from './class-student.entity';
import { ClassSchedule } from '../../schedules/entities/class-schedule.entity';
import { ClassCancellation } from './class-cancellation.entity';

@Table({
  tableName: 'classes',
  timestamps: false,
  underscored: true
})
export class Class extends Model {
  @ApiProperty({
    example: 1,
    description: 'ID da Aula',
  })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @ApiProperty({
    example: 'Estrutura de Dados 2',
    description: 'Nome da disciplina',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @ApiProperty({
    example: 1,
    description: 'ID da Disciplina',
  })
  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  subjectId: number;

  @ApiProperty({
    example: 1,
    description: 'ID do Semestre',
  })
  @ForeignKey(() => Semester)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  semesterId: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do Professor',
  })
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  teacherId: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Data de criação',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
  })
  createdAt: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Data de atualização',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
  })
  updatedAt: Date;

  @BelongsTo(() => Subject)
  subject: Subject;

  @BelongsTo(() => Semester)
  semester: Semester;

  @BelongsTo(() => User)
  teacher: User;

  @BelongsToMany(() => User, { through: () => ClassStudent, foreignKey: 'classId', otherKey: 'studentId' })
  students: User[];
  
  @HasMany(() => ClassSchedule, { foreignKey: 'class_id', sourceKey: 'id' })
  schedules: ClassSchedule[];
  
  @HasMany(() => ClassStudent, { foreignKey: 'classId', sourceKey: 'id' })
  classStudents: ClassStudent[];

  @HasMany(() => ClassCancellation, { foreignKey: 'classId', sourceKey: 'id', as: 'cancellations' })
  cancellations: ClassCancellation[];
}