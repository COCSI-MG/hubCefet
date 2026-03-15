import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({
    status: 201,
    description: 'The record created',
    type: CreateUserResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ApiResponseDto,
  })
  @Profiles(Profile.Admin, Profile.Professor)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const userCreateResult = await this.usersService.create(createUserDto);

    return userCreateResult.data
  }

  @ApiOperation({ summary: 'Return all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all users',
    type: GetAllUsersResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ApiResponseDto,
  })
  @Get('limit/:limit/offset/:offset')
  async findAll(
    @Param('limit') limit: number,
    @Param('offset') offset: number,
    @Query('profile') profileName?: string,
    @Query('search') searchTerm?: string,
  ) {
    const findAllUserResult = searchTerm ? await this.usersService.search(
      searchTerm.trim(),
      limit,
      offset,
      profileName,
    ) : await this.usersService.findAll(
      limit,
      offset,
      profileName,
    );

    return findAllUserResult.data
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
    type: ApiResponseDto,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.usersService.findOne(id);

    return result.data
  }

  @Profiles(Profile.Admin, Profile.Professor)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.update(id, updateUserDto);
  }

  @Profiles(Profile.Admin, Profile.Professor)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }
}
