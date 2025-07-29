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
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Response } from 'express';
import { Profiles } from './decorators/profile.decorator';
import { Profile } from './enum/profile.enum';
import { Profile as ProfileModel } from './entities/profile.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetAllProfilesResponseDto } from './dto/get-all-profiles-response.dto';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { Public } from '../auth/decorators/public-auth.decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ summary: 'Create a profile' })
  @ApiResponse({
    status: 201,
    description: 'The record created',
    type: ProfileModel,
  })
  @Profiles(Profile.Admin)
  @Post()
  async create(
    @Res() res: Response,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    try {
      const profile = await this.profileService.create(createProfileDto);
      if (!profile) {
        return res
          .status(409)
          .json(
            new ApiResponseDto<null>(
              409,
              false,
              null,
              'Profile already exists',
            ),
          );
      }
      return res
        .status(201)
        .json(
          new ApiResponseDto<{ profile: ProfileModel }>(
            201,
            true,
            { profile },
            null,
          ),
        );
    } catch (error) {
      if (process.env.APP_ENV === 'development') {
        console.error(error);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @ApiOperation({ summary: 'Return all profiles' })
  @ApiResponse({
    status: 200,
    description: 'Return all profiles',
    type: GetAllProfilesResponseDto,
  })
  @Public()
  @Get()
  async findAll(@Res() res: Response) {
    try {
      const profilesData = await this.profileService.findAll();
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ profiles: ProfileModel[] }>(
            200,
            true,
            { profiles: profilesData },
            null,
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV == 'development') {
        console.error(err);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @ApiOperation({ summary: 'Return a profile' })
  @ApiResponse({
    status: 200,
    description: 'The profile found',
    type: ProfileModel,
  })
  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    try {
      const profile = await this.profileService.findOne(id);
      if (!profile) {
        return res
          .status(404)
          .json(
            new ApiResponseDto<null>(404, false, null, 'Profile not found'),
          );
      }
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ profile: ProfileModel }>(
            200,
            true,
            { profile },
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

  @Profiles(Profile.Admin)
  @Patch(':id')
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    try {
      const updatedProfile = await this.profileService.update(
        id,
        updateProfileDto,
      );
      if (!updatedProfile) {
        return res
          .status(404)
          .json(
            new ApiResponseDto<null>(404, false, null, 'Profile not found'),
          );
      }
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ profile: string }>(
            200,
            true,
            { profile: updatedProfile },
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

  @Profiles(Profile.Admin)
  @Delete(':id')
  async remove(@Res() res: Response, @Param('id') id: string) {
    try {
      await this.profileService.remove(id);
      return res
        .status(200)
        .json(new ApiResponseDto<object>(200, true, {}, null));
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }
}
