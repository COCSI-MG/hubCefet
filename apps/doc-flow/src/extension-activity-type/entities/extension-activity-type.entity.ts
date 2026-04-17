import { Optional } from 'sequelize';
import { Table, Column, Model, DataType } from 'sequelize-typescript';


interface ExtensionActivityTypeAttributes {
  id: number
  name: string
  description: string
}

type ExtensionActivityTypeCreationAttributes = Optional<ExtensionActivityTypeAttributes, 'id' | 'description'>

@Table({
  tableName: 'extension_activities_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ExtensionActivityType extends Model<ExtensionActivityTypeAttributes, ExtensionActivityTypeCreationAttributes> {
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
  description: string;
}
