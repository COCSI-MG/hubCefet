import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Tcc } from 'src/tcc/entities/tcc.entity';
import { User } from 'src/users/entities/user.entity';

@Table({
  tableName: 'tcc_students',
  timestamps: false,
})
export class TccStudents extends Model {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'TCC Student ID',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'TCC ID',
  })
  @ForeignKey(() => Tcc)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  tcc_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Student ID',
  })
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  student_id: string;

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
}
