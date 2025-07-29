import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'time_slots',
  timestamps: true,
})
export class TimeSlot extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  day_of_week: string;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  start_time: string;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  end_time: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  created_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  updated_at: Date;
} 