import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  InternalServerErrorException,
} from '@nestjs/common';
import { TccService } from './tcc.service';
import { CreateTccDto } from './dto/create-tcc.dto';
import { UpdateTccDto } from './dto/update-tcc.dto';
import { Response } from 'express';
import { Profiles } from 'src/profile/decorators/profile.decorator';
import { Profile } from 'src/profile/enum/profile.enum';
import { UserRequest } from 'src';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetAllTccResponseDto } from './dto/get-all-tcc-response.dto';
import { Tcc } from './entities/tcc.entity';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

@Controller('tcc')
export class TccController {
  constructor(private readonly tccService: TccService) {}

  @ApiOperation({ summary: 'Create a new TCC' })
  @ApiResponse({
    status: 201,
    description: 'Create a new TCC',
    type: CreateTccDto,
  })
  @Profiles(Profile.Admin, Profile.Professor)
  @Post()
  async create(
    @Req() req: UserRequest,
    @Res() res: Response,
    @Body() createTccDto: CreateTccDto,
  ) {
    try {
      createTccDto.advisorId = req.user?.sub;
      const newTcc = await this.tccService.create(createTccDto);
      return res
        .status(201)
        .json(
          new ApiResponseDto<{ tcc: Tcc }>(201, true, { tcc: newTcc }, null),
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

  @ApiOperation({ summary: 'Return all TCCs' })
  @ApiResponse({
    status: 200,
    description: 'Return all TCCs',
    type: GetAllTccResponseDto,
  })
  @Get()
  async findAll(@Res() res: Response) {
    try {
      const tccData = await this.tccService.findAll();
      const response = new ApiResponseDto<{ tccs: Tcc[] }>(
        200,
        true,
        { tccs: tccData },
        null,
      );
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
      const tcc = await this.tccService.findOne(id);
      if (!tcc) {
        return res
          .status(404)
          .json(new ApiResponseDto<null>(404, false, null, 'TCC not found'));
      }
      return res
        .status(200)
        .json(new ApiResponseDto<{ tcc: Tcc }>(200, true, { tcc }, null));
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @Profiles(Profile.Admin, Profile.Professor)
  @Patch(':id')
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateTccDto: UpdateTccDto,
  ) {
    try {
      const updatedTcc = await this.tccService.update(id, updateTccDto);
      if (!updatedTcc) {
        return res
          .status(404)
          .json(new ApiResponseDto<null>(404, false, null, 'TCC not found'));
      }
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ tcc: Tcc }>(
            200,
            true,
            { tcc: updatedTcc },
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

  @Profiles(Profile.Admin, Profile.Professor)
  @Delete(':id')
  async remove(@Res() res: Response, @Param('id') id: string) {
    try {
      await this.tccService.remove(id);
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
