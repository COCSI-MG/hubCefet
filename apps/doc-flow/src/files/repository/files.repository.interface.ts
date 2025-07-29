import { File } from '../entities/file.entity';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';

export interface FileRepository {
  create(createFileDto: CreateFileDto, userId: string): Promise<File>;
  findAll(): Promise<File[]>;
  findOne(id: string): Promise<File>;
  update(id: string, updateFileDto: UpdateFileDto): Promise<string>;
  remove(id: string): Promise<number>;
  findByPk(id: string): Promise<File>;
  findByUserId(id: string, limit: number, offset: number): Promise<File[]>;
  findByEventId(id: string): Promise<File[]>;
  findByUserIdAndEventId(userId: string, eventId: string): Promise<File[]>;
  findByUserIdAndEventIdAndType(
    userId: string,
    eventId: string,
    type: string,
  ): Promise<File[]>;
}
