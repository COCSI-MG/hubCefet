import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ExtensionActivityTypeService } from './extension-activity-type.service';
import { CreateExtensionActivityTypeDto } from './dto/create-extension-activity-type.dto';
import { UpdateExtensionActivityTypeDto } from './dto/update-extension-activity-type.dto';
import { Profiles } from 'src/profile/decorators/profile.decorator';
import { Profile } from 'src/profile/enum/profile.enum';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { ExtensionActivityTypeDto } from './dto/extension-activity-type.dto';

@Controller('extension-activity-type')
export class ExtensionActivityTypeController {
  constructor(private readonly extensionActivityTypeService: ExtensionActivityTypeService) { }

  @ApiOperation({ summary: 'Criar tipo de atividade de extensão' })
  @ApiResponse({
    status: 201,
    description: 'create extension activity type',
    type: ApiResponseDto,
  })
  @Post()
  @Profiles(Profile.Admin)
  create(@Body() createExtensionActivityTypeDto: CreateExtensionActivityTypeDto) {
    return this.extensionActivityTypeService.create(createExtensionActivityTypeDto);
  }

  @ApiOperation({ summary: 'Visualizar todos os tipos de atividade de extensão' })
  @ApiResponse({
    status: 200,
    description: 'get all extension activity types',
    type: [ExtensionActivityTypeDto],
  })
  @Get()
  findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,

  ) {
    return this.extensionActivityTypeService.findAll(limit, offset);
  }

  @ApiOperation({ summary: 'Visualizar um tipo de atividade de extensão por id' })
  @ApiResponse({
    status: 200,
    description: 'get one extension activity type',
    type: ExtensionActivityTypeDto,
  })
  @Get(':id')
  @Profiles(Profile.Admin)
  findOne(@Param('id') id: number) {
    return this.extensionActivityTypeService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar um tipo de atividade de extensão por id' })
  @ApiResponse({
    status: 200,
    description: 'update one extension activity type',
    type: ApiResponseDto,
  })
  @Patch(':id')
  @Profiles(Profile.Admin)
  update(@Param('id') id: string, @Body() updateExtensionActivityTypeDto: UpdateExtensionActivityTypeDto) {
    return this.extensionActivityTypeService.update(+id, updateExtensionActivityTypeDto);
  }

  @ApiOperation({ summary: 'Remover um tipo de atividade de extensão por id' })
  @ApiResponse({
    status: 200,
    description: 'remove one extension activity type',
    type: ApiResponseDto,
  })
  @Delete(':id')
  @Profiles(Profile.Admin)
  remove(@Param('id') id: string) {
    return this.extensionActivityTypeService.remove(+id);
  }
}
