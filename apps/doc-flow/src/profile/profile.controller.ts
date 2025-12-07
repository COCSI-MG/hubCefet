import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profiles } from './decorators/profile.decorator';
import { Profile } from './enum/profile.enum';
import { Profile as ProfileModel } from './entities/profile.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetAllProfilesResponseDto } from './dto/get-all-profiles-response.dto';
import { Public } from '../auth/decorators/public-auth.decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @ApiOperation({ summary: 'Create a profile' })
  @ApiResponse({
    status: 201,
    description: 'The record created',
    type: ProfileModel,
  })
  @Profiles(Profile.Admin)
  @Post()
  async create(
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return await this.profileService.create(createProfileDto);
  }

  @ApiOperation({ summary: 'Return all profiles' })
  @ApiResponse({
    status: 200,
    description: 'Return all profiles',
    type: GetAllProfilesResponseDto,
  })
  @Public()
  @Get()
  async findAll() {
    return await this.profileService.findAll();
  }

  @ApiOperation({ summary: 'Return a profile' })
  @ApiResponse({
    status: 200,
    description: 'The profile found',
    type: ProfileModel,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.profileService.findOne(id);
  }

  @Profiles(Profile.Admin)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    await this.profileService.update(
      id,
      updateProfileDto,
    );
  }

  @Profiles(Profile.Admin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.profileService.remove(id);
  }
}
