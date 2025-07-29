import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  Req,
  ConflictException,
  Query,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { File } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';
import { memoryStorage } from 'multer';
import { UserRequest } from 'src';
import { CreateFileResponseDto } from './dto/create-file-response.dto';
import { GetFileStatusResponseDto } from './dto/get-file-status-response.dto';
import { GetAllFilesResponseDto } from './dto/get-all-files-response.dto';
import { GetFileResponseDto } from './dto/get-file-response.dto';
import { DownloadFileResponseDto } from './dto/download-file-response.dto';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { UploadFileDto } from './dto/upload-file.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Create a file register in database' })
  @ApiResponse({
    status: 201,
    description: 'The record created',
    type: CreateFileResponseDto,
  })
  @Post()
  async create(
    @Req() req: UserRequest,
    @Body() fileCreateDto: CreateFileDto,
    @Res() res: Response,
  ) {
    try {
      const userId: string = req.user?.sub;
      if (!userId) {
        return res
          .status(401)
          .json(new ApiResponseDto<null>(401, false, null, 'Unauthorized'));
      }
      const file: File = await this.filesService.create(fileCreateDto, userId);
      return res
        .status(201)
        .json(
          new ApiResponseDto<{ file: File }>(
            201,
            true,
            { file },
            'File created successfully, you are able to upload it now',
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      if (err instanceof ConflictException) {
        return res
          .status(409)
          .json(new ApiResponseDto<null>(409, false, null, err.message));
      }
      return res
        .status(500)
        .json(
          new ApiResponseDto<null>(500, false, null, 'Internal server error'),
        );
    }
  }

  @ApiOperation({ summary: 'Get the status of a file' })
  @ApiResponse({
    status: 200,
    description: 'Return the status of a file',
    type: GetFileStatusResponseDto,
  })
  @Get('status/:id')
  async getStatus(@Param('id') id: string, @Res() res: Response) {
    try {
      const file = await this.filesService.findOne(id);
      if (!file) {
        return res
          .status(404)
          .json(new ApiResponseDto<null>(404, false, null, 'File not found'));
      }
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ file: { id: string; status: string } }>(
            200,
            true,
            { file: { id: file.id, status: file.status } },
            null,
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      return res
        .status(500)
        .json(
          new ApiResponseDto<null>(500, false, null, 'Internal server error'),
        );
    }
  }

  @Post('upload/:id')
  @ApiOperation({
    summary: 'Queue file to save on disk',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    type: UploadFileDto,
  })
  @ApiResponse({
    status: 202,
    type: DownloadFileResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
          return cb(new Error('File is not an document'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      if (!file) {
        return res
          .status(400)
          .json(new ApiResponseDto<null>(400, false, null, 'File not found'));
      }
      if (!isNaN(Number(id)) || id.length !== 36) {
        return res
          .status(400)
          .json(new ApiResponseDto<null>(400, false, null, 'Invalid id'));
      }
      await this.filesService.upload(file, id);
      return res
        .status(202)
        .json(
          new ApiResponseDto<string>(
            202,
            true,
            'File enqueued to be processed',
            null,
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      if (err instanceof ConflictException) {
        return res
          .status(409)
          .json(new ApiResponseDto<null>(409, false, null, err.message));
      }
      return res
        .status(500)
        .json(
          new ApiResponseDto<null>(500, false, null, 'Internal server error'),
        );
    }
  }

  @Get('user')
  async findAllByUser(
    @Req() req: UserRequest,
    @Res() res: Response,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    try {
      const files = await this.filesService.findByUserId(
        req.user.sub,
        limit,
        offset,
      );
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ files: File[] } | null>(
            200,
            true,
            { files },
            null,
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }

      return res
        .status(500)
        .json(
          new ApiResponseDto<null>(500, false, null, 'Internal server error'),
        );
    }
  }

  @ApiOperation({ summary: 'Return all files' })
  @ApiResponse({
    status: 200,
    description: 'Return all files',
    type: GetAllFilesResponseDto,
  })
  @Get()
  async findAll(@Res() res: Response) {
    try {
      const files = await this.filesService.findAll();
      if (!files) {
        return res
          .status(404)
          .json(new ApiResponseDto<null>(404, false, null, 'Files not found'));
      }
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ files: File[] }>(200, true, { files }, null),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      return res
        .status(500)
        .json(
          new ApiResponseDto<null>(500, false, null, 'Internal server error'),
        );
    }
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Return a file',
    type: GetFileResponseDto,
  })
  async findOne(@Res() res: Response, @Param('id') id: string) {
    try {
      const file = await this.filesService.findOne(id);
      if (!file) {
        return res
          .status(404)
          .json(new ApiResponseDto<null>(404, false, null, 'file not found'));
      }
      return res
        .status(200)
        .json(new ApiResponseDto<File>(200, true, file, null));
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      return res
        .status(500)
        .json(
          new ApiResponseDto<null>(500, false, null, 'Internal server error'),
        );
    }
  }

  @ApiOperation({ summary: 'Download a file' })
  @ApiResponse({
    status: 200,
    description: 'Return the file',
    type: DownloadFileResponseDto,
  })
  @Get('download/:id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    try {
      const filePath = await this.filesService.getFilePath(id);
      res.download(filePath, (err) => {
        if (err) {
          if (process.env.APP_ENV === 'development') {
            console.error(err);
          }
          return res
            .status(500)
            .json(
              new ApiResponseDto<null>(
                500,
                false,
                null,
                'Internal server error',
              ),
            );
        }
      });
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      return res
        .status(500)
        .json(
          new ApiResponseDto<null>(500, false, null, 'Internal server error'),
        );
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(id, updateFileDto);
  }

  @Delete(':id')
  async remove(@Res() res: Response, @Param('id') id: string) {
    try {
      await this.filesService.remove(id);
      return res
        .status(200)
        .json(
          new ApiResponseDto<null>(
            200,
            true,
            null,
            'File deleted successfully',
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      return res
        .status(500)
        .json(
          new ApiResponseDto<null>(500, false, null, 'Internal server error'),
        );
    }
  }
}
