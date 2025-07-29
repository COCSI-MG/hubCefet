import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'review_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ReviewSetting extends Model {
  @ApiProperty({
    example: 1,
    description: 'Review Setting ID',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ApiProperty({
    example: 'required_reviewers',
    description: 'Chave de configuração',
  })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  key: string;

  @ApiProperty({
    example: 3,
    description: 'Número de aprovações necessárias',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 3,
    validate: {
      min: 1,
    },
  })
  required_approvals: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Date and time of creation',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Date and time of last update',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  updated_at: Date;
} 
 
 