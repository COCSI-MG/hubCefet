import { Injectable } from '@nestjs/common';
import { FileRepository } from './files.repository.interface';
import { InjectModel } from '@nestjs/sequelize';
import { File } from '../entities/file.entity';
import { CreateFileDto } from '../dto/create-file.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FileRepositoryImpl implements FileRepository {
  constructor(
    @InjectModel(File)
    private fileModel: typeof File,
  ) {}
  findByUserNameAndType(
    userId: string,
    name: string,
    type: string,
  ): Promise<File[]> {
    return this.fileModel.findAll({
      where: {
        name,
        type,
        user_id: userId,
      },
    });
  }

  async create(createFileDto: CreateFileDto, userId: string): Promise<File> {
    return await this.fileModel.create({
      name: createFileDto.name,
      url: createFileDto.url,
      type: createFileDto.type,
      user_id: userId,
    });
  }

  async findAll(): Promise<File[]> {
    return await this.fileModel.findAll();
  }

  async findOne(id: string): Promise<File> {
    return await this.fileModel.findByPk(id);
  }

  async update(id: string, updateFileDto: CreateFileDto): Promise<string> {
    await this.fileModel.update(updateFileDto, {
      where: {
        id,
      },
    });
    return 'File updated successfully';
  }

  async remove(id: string): Promise<number> {
    const deletedProfile = await this.fileModel.destroy({
      where: {
        id,
      },
    });
    return deletedProfile;
  }

  async findByPk(id: string): Promise<File> {
    return await this.fileModel.findByPk(id);
  }

  async findByUserIdPaginate(
    id: string,
    limit: number,
    offset: number,
  ): Promise<File[]> {
    return await this.fileModel.findAll({
      where: {
        user_id: id,
      },
      include: [
        {
          model: User,
          attributes: ['id', 'full_name'],
        },
      ],
      limit,
      offset,
    });
  }

  async findByUserId(userId: string): Promise<File[]> {
    return await this.fileModel.findAll({
      where: {
        user_id: userId,
      },
    });
  }

  async findByUserIdAndType(userId: string, type: string): Promise<File[]> {
    return await this.fileModel.findAll({
      where: {
        user_id: userId,
        type,
      },
    });
  }
}
