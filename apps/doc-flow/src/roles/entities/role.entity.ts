import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Model,
  Table,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { Profile } from 'src/profile/entities/profile.entity';

@Table({
  tableName: 'roles',
  timestamps: false,
})
export class Role extends Model {
  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    description: 'Unique identifier',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;
  @ApiProperty({
    example: 'VIEW_ANY',
    description: 'Role name',
  })
  @Column({
    type: DataType.STRING(30),
    allowNull: false,
  })
  name: string;

  @ApiProperty({
    example: '2021-09-01T00:00:00.000Z',
    description: 'Date of creation',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
  })
  created_at: Date;

  @ApiProperty({
    example: '2021-09-01T00:00:00.000Z',
    description: 'Date of last update',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
  })
  updated_at: Date;

  @BelongsToMany(() => Profile, 'profiles_roles', 'role_id', 'profile_id')
  profiles: Profile[];
}
