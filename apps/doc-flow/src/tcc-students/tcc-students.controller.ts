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
import { TccStudentsService } from './tcc-students.service';
import { CreateTccStudentDto } from './dto/create-tcc-student.dto';
import { UpdateTccStudentDto } from './dto/update-tcc-student.dto';
import { GetAllTccStudentsResponseDto } from './dto/get-all-tcc-students-response.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { TccStudents } from './entities/tcc-students.entity';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

@Controller('tcc-students')
export class TccStudentsController {
  constructor(private readonly tccStudentsService: TccStudentsService) {}

  @ApiBody({ type: CreateTccStudentDto })
  @ApiOperation({ summary: 'Create a TCC Student' })
  @ApiCreatedResponse({
    description: 'The record created',
    type: ApiResponseDto<{ tccStudents: TccStudents }>,
  })
  @Post()
  async create(
    @Body() createTccStudentDto: CreateTccStudentDto,
    @Res() response: Response,
  ) {
    try {
      const tccStudents =
        await this.tccStudentsService.create(createTccStudentDto);

      return response
        .status(201)
        .json(new ApiResponseDto(201, true, { tccStudents }, null));
    } catch (err) {
      if (process.env.APP_ENV == 'development') {
        console.error(err);
      }

      throw new InternalServerErrorException(
        new ApiResponseDto(500, false, null, 'Internal server error'),
      );
    }
  }

  @ApiOperation({ summary: 'Return all TCC Students' })
  @ApiResponse({
    status: 200,
    description: 'Return all TCC Students',
    type: GetAllTccStudentsResponseDto,
  })
  @Get()
  async findAll(@Res() res: Response) {
    try {
      const tccStudentsData = await this.tccStudentsService.findAll();
      const response = new ApiResponseDto<{ tccStudents: TccStudents[] }>(
        200,
        true,
        { tccStudents: tccStudentsData },
        null,
      );
      return res.status(200).json(response);
    } catch (err) {
      if (process.env.APP_ENV == 'development') {
        console.error(err);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto(500, false, null, 'Internal server error'),
      );
    }
  }

  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    try {
      const tccStudent = await this.tccStudentsService.findOne(id);
      if (!tccStudent) {
        return res
          .status(404)
          .json(
            new ApiResponseDto<null>(404, false, null, 'TCC Student not found'),
          );
      }
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ tccStudent: TccStudents }>(
            200,
            true,
            { tccStudent },
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
    @Body() updateTccStudentDto: UpdateTccStudentDto,
  ) {
    try {
      const tccStudent = await this.tccStudentsService.update(
        id,
        updateTccStudentDto,
      );
      if (!tccStudent) {
        return res
          .status(404)
          .json(
            new ApiResponseDto<null>(404, false, null, 'TCC Student not found'),
          );
      }
      return res
        .status(200)
        .json(new ApiResponseDto<string>(200, true, tccStudent, null));
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
      await this.tccStudentsService.remove(id);
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
