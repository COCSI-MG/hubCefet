import {
  Column,
  Model,
  Table,
  DataType,
  BelongsTo,
  AfterCreate,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { Event } from 'src/events/entities/event.entity';
import { FileType } from '../enum/file-type.enum';
import { FileStatus } from '../enum/file-status.enum';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'files',
  timestamps: false,
})
export class File extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  @ApiProperty({
    example: 'f6a6c5b2-4b9b-4f8f-8f5f-5d5f5f5f5f5f',
  })
  id: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
  })
  @ApiProperty({
    example: 'file.txt',
  })
  name: string;

  @Column({
    type: DataType.STRING(255),
  })
  @ApiProperty({
    example: 'https://www.example.com/file.txt',
  })
  url: string;

  @Column({
    type: DataType.ENUM(...Object.values(FileType)),
    allowNull: false,
  })
  @ApiProperty({
    example: 'image',
  })
  type: FileType;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  user_id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  event_id: string;

  @Column({
    type: DataType.ENUM(...Object.values(FileStatus)),
    defaultValue: FileStatus.STATUS_WAITING,
  })
  @ApiProperty({
    example: 'waiting',
  })
  status: FileStatus;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
  })
  created_at: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW(),
  })
  updated_at: Date;

  @BelongsTo(() => User, 'user_id')
  user: User;
  @BelongsTo(() => Event, 'event_id')
  event: Event;

  @AfterCreate
  static removeColumnAttributesAfterCreate(instance: File) {
    delete instance.dataValues.created_at;
    delete instance.dataValues.updated_at;
  }
}
