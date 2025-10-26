import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { TccStudents } from 'src/tcc-students/entities/tcc-students.entity';
import { User } from 'src/users/entities/user.entity';

@Table({
  tableName: 'tcc',
  timestamps: false,
})
export class Tcc extends Model {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'TCC ID',
  })
  @Column({
    type: DataType.UUIDV4,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id: string;

  @ApiProperty({
    example: 'Title',
    description: 'TCC title',
  })
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  theme: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Advisor ID',
  })
  @Column({
    type: DataType.UUIDV4,
    allowNull: false,
  })
  advisor_id: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Created at',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Updated at',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updated_at: Date;

  @BelongsTo(() => User, 'advisor_id')
  advisor: User;

  @BelongsToMany(() => TccStudents, 'tcc_students', 'tcc_id', 'student_id')
  students: User[];
}
