import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'complementary_activities_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ComplementaryActivityType extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;
}
