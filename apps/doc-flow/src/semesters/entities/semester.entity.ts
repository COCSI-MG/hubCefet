import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Model,
  Table,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { Class } from '../../classes/entities/class.entity';

@Table({
  tableName: 'semesters',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Semester extends Model {
  @ApiProperty({
    example: 1,
    description: 'ID do Semestre',
  })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @ApiProperty({
    example: 2023,
    description: 'Ano do Semestre',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  year: number;

  @ApiProperty({
    example: 1,
    description: 'Número do Período',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  number: number;

  getName(): string {
    return `Período ${this.number} (${this.year})`;
  }

  get name(): string {
    return this.getName();
  }

  getLegacyName(): string {
    return `${this.year}.${this.number}`;
  }

  @ApiProperty({
    example: '2023-01-01',
    description: 'Data de início',
  })
  @Column({
    field: 'start_date',
    type: DataType.DATEONLY,
    allowNull: true,
  })
  start_date: Date;

  @ApiProperty({
    example: '2023-06-30',
    description: 'Data de término',
  })
  @Column({
    field: 'end_date',
    type: DataType.DATEONLY,
    allowNull: true,
  })
  end_date: Date;

  get started_at(): Date {
    return this.start_date;
  }

  get ended_at(): Date {
    return this.end_date;
  }

  @HasMany(() => Class, { onDelete: 'CASCADE' })
  classes: Class[];
} 