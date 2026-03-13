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
  Query,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
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
  constructor(private readonly filesService: FilesService) { }

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
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Nao autorizado');
    }

    return await this.filesService.create(fileCreateDto, userId);
  }

  @ApiOperation({ summary: 'Get the status of a file' })
  @ApiResponse({
    status: 200,
    description: 'Return the status of a file',
    type: GetFileStatusResponseDto,
  })
  @Get('status/:id')
  async getStatus(@Param('id') id: string) {
    const file = await this.filesService.findOne(id);
    if (!file) {
      throw new NotFoundException('Arquivo nao encontrado')
    }

    return file
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
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo nao encontrado');
    }

    if (!isNaN(Number(id)) || id.length !== 36) {
      throw new BadRequestException('ID do aruiqov invalido');
    }

    await this.filesService.upload(file, id);

    return 'Arquivo adicionado na fila de upload';
  }

  @Get('user')
  async findAllByUser() {
    return await this.filesService.findAll();
  }

  @ApiOperation({ summary: 'Return all files' })
  @ApiResponse({
    status: 200,
    description: 'Return all files',
    type: GetAllFilesResponseDto,
  })
  @Get()
  async findAll() {
    const files = await this.filesService.findAll();

    return files
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Return a file',
    type: GetFileResponseDto,
  })
  async findOne(@Param('id') id: string) {
    return await this.filesService.findOne(id);
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
  async update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    await this.filesService.update(id, updateFileDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.filesService.remove(id);
  }
}
