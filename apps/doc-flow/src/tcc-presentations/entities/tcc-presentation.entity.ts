import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { Tcc } from 'src/tcc/entities/tcc.entity';

@Table({
  tableName: 'tcc_presentations',
  timestamps: false,
})
export class TccPresentation extends Model {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'TCC Presentation ID',
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
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  tcc_id: string;

  @ApiProperty({
    example: 'first',
    description: 'Presentation type',
  })
  @Column({
    type: DataType.ENUM('first', 'second'),
    allowNull: false,
  })
  type: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Presentation date',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  date: Date;

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

  @BelongsTo(() => Tcc, 'tcc_id')
  tcc: Tcc;
}
