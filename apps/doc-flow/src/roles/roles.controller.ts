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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Response } from 'express';
import { Profiles } from 'src/profile/decorators/profile.decorator';
import { Profile } from 'src/profile/enum/profile.enum';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enum/role.enum';
import { Role as RoleModel } from './entities/role.entity';
import { GetAllRolesResponseDto } from './dto/get-all-roles-response.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Profiles(Profile.Admin)
  @Roles(Role.CREATE_ANY)
  @Post()
  async create(@Res() res: Response, @Body() createRoleDto: CreateRoleDto) {
    try {
      const role = await this.rolesService.create(createRoleDto);
      return res
        .status(201)
        .json(
          new ApiResponseDto<{ role: RoleModel }>(201, true, { role }, null),
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

  @ApiOperation({ summary: 'Return all roles' })
  @ApiResponse({
    status: 200,
    description: 'Return all roles',
    type: GetAllRolesResponseDto,
  })
  @Get()
  async findAll(@Res() res: Response) {
    try {
      const rolesData = await this.rolesService.findAll();
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ roles: RoleModel[] }>(
            200,
            true,
            { roles: rolesData },
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

  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    try {
      const role = await this.rolesService.findOne(id);
      if (!role) {
        return res
          .status(404)
          .json(new ApiResponseDto<null>(404, false, null, 'Role not found'));
      }
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ role: RoleModel }>(200, true, { role }, null),
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
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    try {
      const updatedRole = await this.rolesService.update(id, updateRoleDto);
      if (!updatedRole) {
        return res
          .status(404)
          .json(new ApiResponseDto<null>(404, false, null, 'Role not found'));
      }
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ role: string }>(
            200,
            true,
            { role: updatedRole },
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

  @Delete(':id')
  async remove(@Res() res: Response, @Param('id') id: string) {
    try {
      await this.rolesService.remove(id);
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
