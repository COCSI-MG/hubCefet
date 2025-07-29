import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  HasMany,
  Model,
  Scopes,
  Table,
} from 'sequelize-typescript';
import { Presence } from 'src/presences/entities/presence.entity';
import { EventStatus } from '../enum/event-status.enum';
import { File } from 'src/files/entities/file.entity';
import { User } from 'src/users/entities/user.entity';
@Scopes(() => ({
  withoutTimestamps: {
    attributes: {
      exclude: ['created_at'],
    },
  },
}))
@Table({
  tableName: 'events',
  timestamps: false,
})
export class Event extends Model {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier of the event',
  })
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;
  @ApiProperty({
    example: 'Event 1',
    description: 'Name of the event',
  })
  @Column({
    type: DataType.STRING(60),
    allowNull: false,
  })
  name: string;
  @ApiProperty({
    example: '2021-01-01 00:00:00',
    description: 'Date of the event',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  start_at: Date;
  @ApiProperty({
    example: '2021-01-01 23:59:59',
    description: 'Date of the event end',
  })
  @Column({
    type: DataType.DATE,
  })
  end_at: Date;
  @ApiProperty({
    example: 'upcoming',
    description: 'Event status',
  })
  @Column({
    type: DataType.ENUM(...Object.values(EventStatus)),
    defaultValue: EventStatus.STATUS_UPCOMING,
  })
  status: string;
  @ApiProperty({
    example: '2021-01-01',
    description: 'Date that the event was created',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  created_at: Date;
  @ApiProperty({
    example: '2021-01-01',
    description: 'Event update information',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updated_at: Date;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  created_by_user_id: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  latitude: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  longitude: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  vacancies: number;

  @HasMany(() => Presence, 'event_id')
  presences: Presence[];

  @HasMany(() => File, 'event_id')
  files: File[];

  @BelongsTo(() => User, 'created_by_user_id')
  user: User;
}
