import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  BadRequestException,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { Profiles } from 'src/profile/decorators/profile.decorator';
import { Profile } from 'src/profile/enum/profile.enum';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { GetAllUsersResponseDto } from './dto/get-all-users-response.dto';
import { Api500ResponseDto } from 'src/lib/dto/api-500-response.dto';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({
    status: 201,
    description: 'The record created',
    type: CreateUserResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: Api500ResponseDto,
  })
  @Profiles(Profile.Admin, Profile.Professor)
  @Post()
  async create(@Res() res: Response, @Body() createUserDto: CreateUserDto) {
    try {
      const userCreateResult = await this.usersService.create(createUserDto);
      if (!userCreateResult) {
        return res
          .status(409)
          .json(
            new ApiResponseDto<null>(409, false, null, 'User already exists'),
          );
      }
      return res
        .status(201)
        .json(
          new ApiResponseDto<{ user: User }>(
            201,
            true,
            userCreateResult.data,
            null,
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      if (err instanceof Error && err.message === 'Profile not found') {
        throw new BadRequestException(
          new ApiResponseDto<null>(400, false, null, 'Bad request'),
        );
      }
      return res
        .status(500)
        .json(
          new ApiResponseDto<null>(500, false, null, 'Internal server error'),
        );
    }
  }

  @ApiOperation({ summary: 'Return all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all users',
    type: GetAllUsersResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: Api500ResponseDto,
  })
  @Get('limit/:limit/offset/:offset')
  async findAll(
    @Res() res: Response,
    @Param('limit') limit: number,
    @Param('offset') offset: number,
    @Query('profile') profileName?: string,
    @Query('search') searchTerm?: string,
  ) {
    try {
      let findAllUserResult;
      
      if (searchTerm && searchTerm.trim()) {
        findAllUserResult = await this.usersService.search(
          searchTerm.trim(),
          limit, 
          offset, 
          profileName
        );
      } else {
        findAllUserResult = await this.usersService.findAll(limit, offset, profileName);
      }
      
      const getAllResponseDto = new ApiResponseDto<{ users: User[] }>(
        200,
        findAllUserResult.success,
        findAllUserResult.data,
        null,
      );
      return res.status(200).json(getAllResponseDto);
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @ApiOperation({ summary: 'Return a user' })
  @ApiResponse({
    status: 200,
    description: 'Return a user',
    type: User,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: Api500ResponseDto,
  })
  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    try {
      const findUserResult = await this.usersService.findOne(id);
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ user: User }>(
            200,
            findUserResult.success,
            findUserResult.data,
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
  @Patch(':id')
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      if (!user) {
        return res
          .status(404)
          .json(new ApiResponseDto<null>(404, false, null, 'User not found'));
      }
      return res
        .status(200)
        .json(new ApiResponseDto<{ user: User }>(200, true, { user }, null));
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
      await this.usersService.remove(id);
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
