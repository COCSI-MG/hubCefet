import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Model,
  Table,
  DataType,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/users/entities/user.entity';

@Table({
  tableName: 'profiles',
  timestamps: false,
})
export class Profile extends Model {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Profile ID',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ApiProperty({
    example: 'admin',
    description: 'Profile name',
  })
  @Column({
    type: DataType.STRING(30),
    allowNull: false,
  })
  name: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Created at',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
  })
  created_at: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Updated at',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
  })
  updated_at: Date;

  @BelongsToMany(() => Role, 'profiles_roles', 'profile_id', 'role_id')
  roles: Role[];

  @HasMany(() => User, 'profile_id')
  users: User[];
}
