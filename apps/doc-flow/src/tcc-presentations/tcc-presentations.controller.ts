import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import { TccPresentationsService } from './tcc-presentations.service';
import { CreateTccPresentationDto } from './dto/create-tcc-presentation.dto';
import { UpdateTccPresentationDto } from './dto/update-tcc-presentation.dto';
import { GetAllTccPresentationsResponseDto } from './dto/get-all-tcc-presentations-response.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { TccPresentation } from './entities/tcc-presentation.entity';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

@Controller('tcc-presentations')
export class TccPresentationsController {
  constructor(
    private readonly tccPresentationsService: TccPresentationsService,
  ) {}

  @Post()
  async create(
    @Body() createTccPresentationDto: CreateTccPresentationDto,
    @Res() res: Response,
  ) {
    try {
      const tccPresentation = await this.tccPresentationsService.create(
        createTccPresentationDto,
      );
      return res
        .status(201)
        .json(
          new ApiResponseDto<{ tccPresentation: TccPresentation }>(
            201,
            true,
            { tccPresentation },
            null,
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @ApiOperation({ summary: 'Return all TCC Presentations' })
  @ApiResponse({
    status: 200,
    description: 'Return all TCC Presentations',
    type: GetAllTccPresentationsResponseDto,
  })
  @Get()
  async findAll(@Res() res: Response) {
    try {
      const tccPresentationsData = await this.tccPresentationsService.findAll();
      const response = new ApiResponseDto<{
        tccPresentations: TccPresentation[];
      }>(200, true, { tccPresentations: tccPresentationsData }, null);
      return res.status(200).json(response);
    } catch (err) {
      if (process.env.APP_ENV == 'development') {
        console.error(err);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    try {
      const tccPresentation = await this.tccPresentationsService.findOne(id);
      if (!tccPresentation) {
        return res
          .status(404)
          .json(
            new ApiResponseDto<null>(
              404,
              false,
              null,
              'TCC Presentation not found',
            ),
          );
      }
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ tccPresentation: TccPresentation }>(
            200,
            true,
            { tccPresentation },
            null,
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @Patch(':id')
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateTccPresentationDto: UpdateTccPresentationDto,
  ) {
    try {
      const tccPresentation = await this.tccPresentationsService.update(
        id,
        updateTccPresentationDto,
      );
      if (!tccPresentation) {
        return res
          .status(404)
          .json(
            new ApiResponseDto<null>(
              404,
              false,
              null,
              'TCC Presentation not found',
            ),
          );
      }
      return res
        .status(200)
        .json(new ApiResponseDto<string>(200, true, tccPresentation, null));
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @Delete(':id')
  async remove(@Res() res: Response, @Param('id') id: string) {
    try {
      await this.tccPresentationsService.remove(id);
      return res
        .status(200)
        .json(new ApiResponseDto<object>(200, true, {}, null));
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
