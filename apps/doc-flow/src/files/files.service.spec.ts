import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { FileRepository } from './repository/files.repository.interface';
import { FILE_REPOSITORY } from './repository/files-repository.token';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { FileStatus } from './enum/file-status.enum';
import { unlink } from 'node:fs/promises';
import { File } from './entities/file.entity';
import { FileType } from './enum/file-type.enum';
import { existsSync } from 'node:fs';

jest.mock('node:fs/promises', () => {
  return {
    unlink: jest.fn(),
  };
});

jest.mock('node:fs', () => ({
  existsSync: jest.fn((filePath: string) => {
    return filePath === 'path';
  }),
}));

describe('FilesService', () => {
  let service: FilesService;
  let fileRepository: FileRepository;
  let fileQueue: Queue;
  const filesData: File[] = [
    {
      id: '887722e9-e3e0-48bd-8104-7771c81aef71',
      event_id: '887722e9-e3e0-48bd-8104-7771c81aef71',
      user_id: '887722e9-e3e0-48bd-8104-7771c81aef71',
      name: 'name',
      path: '/var/tmp/file.txt',
      type: FileType.DOCUMENT,
      status: FileStatus.STATUS_WAITING,
    },
    {
      id: '887722e9-e3e0-48bd-8104-7771c81aef73',
      event_id: '887722e9-e3e0-48bd-8104-7771c81aef73',
      user_id: '887722e9-e3e0-48bd-8104-7771c81aef73',
      name: 'name',
      path: '/var/tmp/file.txt',
      type: FileType.DOCUMENT,
      status: FileStatus.STATUS_DONE,
    },
  ] as File[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: FILE_REPOSITORY,
          useValue: {
            findByUserIdAndEventIdAndType: jest.fn(
              (userId: string, eventId: string, type: FileType) => {
                Promise.resolve(
                  filesData.filter(
                    (file) =>
                      file.user_id === userId &&
                      file.event_id === eventId &&
                      file.type === type,
                  ),
                );
              },
            ),
            create: jest.fn((createFileDto: CreateFileDto, userId: string) => {
              Promise.resolve({
                id: '887722e9-e3e0-48bd-8104-7771c81aef71',
                event_id: createFileDto.eventId,
                user_id: userId,
                name: createFileDto.name,
                type: createFileDto.type,
                status: FileStatus.STATUS_WAITING,
              });
            }),
            findAll: jest.fn(() => Promise.resolve(filesData)),
            findOne: jest.fn((id: string) =>
              Promise.resolve(filesData.find((file) => file.id === id)),
            ),
            findByUserId: jest.fn((userId: string) => {
              Promise.resolve(
                filesData.filter((file) => file.user_id === userId),
              );
            }),
            findByEventId: jest.fn((eventId: string) => {
              Promise.resolve(
                filesData.filter((file) => file.event_id === eventId),
              );
            }),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getQueueToken('file'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    fileRepository = module.get<FileRepository>(FILE_REPOSITORY);
    fileQueue = module.get<Queue>(getQueueToken('file'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if file already exists', async () => {
      const createFileDto: CreateFileDto = {
        name: 'Document',
        eventId: '887722e9-e3e0-48bd-8104-7771c81aef71',
        type: FileType.DOCUMENT,
      };
      const userId = '887722e9-e3e0-48bd-8104-7771c81aef71';
      jest
        .spyOn(fileRepository, 'findByUserIdAndEventIdAndType')
        .mockResolvedValue(filesData);

      await expect(service.create(createFileDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a file if it does not exist', async () => {
      const createFileDto: CreateFileDto = {
        name: 'Document 1',
        eventId: '887722e9-e3e0-48bd-8104-7771c81aef71',
        type: FileType.DOCUMENT,
      };
      const userId = '887722e9-e3e0-48bd-8104-7771c81aef71';
      jest
        .spyOn(fileRepository, 'findByUserIdAndEventIdAndType')
        .mockResolvedValue([]);
      jest.spyOn(fileRepository, 'create').mockResolvedValue(filesData[0]);

      const result = await service.create(createFileDto, userId);
      expect(result).toEqual(filesData[0]);
    });
  });

  describe('findAll', () => {
    it('should return all files', async () => {
      const result = await service.findAll();
      expect(result).toEqual(filesData);
    });
  });

  describe('findOne', () => {
    it('should return a file by id', async () => {
      const fileId = filesData[0].id;
      const result = await service.findOne(fileId);
      expect(result).toEqual(filesData[0]);
    });
  });

  describe('remove', () => {
    it('should throw an error if file not found', async () => {
      jest.spyOn(fileRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(filesData[0].id)).rejects.toThrow(
        'File not found',
      );
    });

    it('should remove a file', async () => {
      const fileId = filesData[0].id;
      await service.remove(fileId);

      expect(unlink).toHaveBeenCalledWith(filesData[0].path);
      expect(fileRepository.remove).toHaveBeenCalledWith(fileId);
    });
  });

  describe('upload', () => {
    it('should throw an error if file not found', async () => {
      jest.spyOn(fileRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.upload({} as Express.Multer.File, '1'),
      ).rejects.toThrow('File not found');
    });

    it('should throw ConflictException if file status is not waiting', async () => {
      const file: File = {
        ...filesData[0],
        status: FileStatus.STATUS_DONE,
      } as File;
      jest.spyOn(fileRepository, 'findOne').mockResolvedValue(file);

      await expect(
        service.upload({} as Express.Multer.File, file.id),
      ).rejects.toThrow(ConflictException);
    });

    it('should enqueue file to save on disk', async () => {
      const fileId = filesData[0].id;
      const file: Express.Multer.File = {
        buffer: Buffer.from(''),
        originalname: 'file.txt',
        mimetype: 'text/plain',
        size: 1000,
      } as Express.Multer.File;

      await service.upload(file, filesData[0].id);
      expect(fileQueue.add).toHaveBeenCalledWith('processFile', {
        fileId: fileId,
        buffer: '',
        filename: 'file.txt',
        mimetype: 'text/plain',
        size: 1000,
      });
    });
  });

  describe('getFilePath', () => {
    it('should throw an error if file not found', async () => {
      jest.spyOn(fileRepository, 'findOne').mockResolvedValue(null);
      await expect(service.getFilePath(filesData[0].id)).rejects.toThrow(
        'File not found',
      );
    });

    it('should throw an error if file not found on disk', async () => {
      const fileId = filesData[0].id;
      jest.spyOn(fileRepository, 'findOne').mockResolvedValue(filesData[0]);
      (existsSync as jest.Mock).mockReturnValue(false);

      await expect(service.getFilePath(fileId)).rejects.toThrow(
        'File not found on disk',
      );
    });

    it('should return file path', async () => {
      const fileId = filesData[0].id;
      (existsSync as jest.Mock).mockReturnValue(true);

      const result = await service.getFilePath(fileId);
      expect(result).toEqual(filesData[0].path);
    });
  });
});
