import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { Event } from 'src/events/entities/event.entity';
import { User } from 'src/users/entities/user.entity';

@Table({
  tableName: 'presences',
  timestamps: false,
})
export class Presence extends Model {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Profile ID',
  })
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Event ID',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  event_id: string;

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

  @ApiProperty({
    example: 'inscrito',
    description: 'Status da Presença',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Check in Date',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  check_in_date: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Check out Date',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  check_out_date: Date;

  @BelongsTo(() => User, 'user_id')
  user: User;

  @BelongsTo(() => Event, 'event_id')
  event: Event;
}
