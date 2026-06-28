import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column, DataType, ForeignKey, HasMany, Model,
  Scopes,
  Table,
} from 'sequelize-typescript';
import { Presence } from 'src/presences/entities/presence.entity';
import { EventStatus } from '../enum/event-status.enum';
import { User } from 'src/users/entities/user.entity';
import { EventPresenceOptionEnum } from '../enum/event-presence-option.enum';
import { ActivityType } from '../../activities/entities/activity-type.entity';
import { ComplementaryActivityType } from '../../complementary-activity-type/entities/complementary-activity-type.entity';
import { ExtensionActivityType } from '../../extension-activity-type/entities/extension-activity-type.entity';
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
  }) @Column({
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
    allowNull: false,
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

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  radius: number;

  @Column({
    type: DataType.ENUM(...Object.values(EventPresenceOptionEnum)),
    allowNull: false,
  })
  presence_option: string;

  @ApiProperty({
    example: 1,
    description: 'Tipo de atividade gerada para participantes (1=complementar, 2=extensão)',
  })
  @ForeignKey(() => ActivityType)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  activity_type_id: number;

  @ApiProperty({
    example: 1,
    description: 'Subtipo de atividade complementar gerada para participantes',
  })
  @ForeignKey(() => ComplementaryActivityType)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  complementary_activity_type_id: number;

  @ApiProperty({
    example: 1,
    description: 'Subtipo de atividade de extensão gerada para participantes',
  })
  @ForeignKey(() => ExtensionActivityType)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  extension_activity_type_id: number;

  @ApiProperty({
    example: 4,
    description: 'Quantidade de horas atribuída à atividade gerada para participantes',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  activity_hours: number;

  @ApiProperty({
    example: '15',
    description: 'Min checkin time',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 15,
  })
  min_checkin_time: number;

  @ApiProperty({
    example: '15',
    description: 'Max checkin time',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 15,
  })
  max_checkin_time: number;


  @ApiProperty({
    example: '15',
    description: 'Min checkout time',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 15,
  })
  min_checkout_time: number;

  @ApiProperty({
    example: '15',
    description: 'Max checkout time',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 15,
  })
  max_checkout_time: number;

  @HasMany(() => Presence, 'event_id')
  presences: Presence[];

  @BelongsTo(() => User, 'created_by_user_id')
  user: User;

  @BelongsTo(() => ActivityType, 'activity_type_id')
  activityType: ActivityType;

  @BelongsTo(() => ComplementaryActivityType, 'complementary_activity_type_id')
  complementaryActivityType: ComplementaryActivityType;

  @BelongsTo(() => ExtensionActivityType, 'extension_activity_type_id')
  extensionActivityType: ExtensionActivityType;
}
