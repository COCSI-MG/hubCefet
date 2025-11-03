import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComplementaryActivityTypeService } from './complementary-activity-type.service';
import { CreateComplementaryActivityTypeDto } from './dto/create-complementary-activity-type.dto';
import { UpdateComplementaryActivityTypeDto } from './dto/update-complementary-activity-type.dto';
import { Profiles } from 'src/profile/decorators/profile.decorator';
import { Profile } from 'src/profile/enum/profile.enum';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { ComplementaryActivityType } from './entities/complementary-activity-type.entity';
import { ComplementaryActivityTypeDto } from './dto/complementary-activity-type.dto';

@Controller('complementary-activity-type')
export class ComplementaryActivityTypeController {
  constructor(private readonly complementaryActivityTypeService: ComplementaryActivityTypeService) { }

  @ApiOperation({ summary: 'Criar tipo de atividade complementar' })
  @ApiResponse({
    status: 201,
    description: 'create complementary activity type',
    type: ApiResponseDto,
  })
  @Post()
  @Profiles(Profile.Admin, Profile.Professor)
  create(@Body() createComplementaryActivityTypeDto: CreateComplementaryActivityTypeDto) {
    return this.complementaryActivityTypeService.create(createComplementaryActivityTypeDto);
  }

  @ApiOperation({ summary: 'Visualizar todos os tipos de atividade complementar' })
  @ApiResponse({
    status: 200,
    description: 'get all complementary activity types',
    type: [ComplementaryActivityTypeDto],
  })
  @Get()
  findAll() {
    return this.complementaryActivityTypeService.findAll();
  }

  @ApiOperation({ summary: 'Visualizar um tipo de atividade complementar por id' })
  @ApiResponse({
    status: 200,
    description: 'get one complementary activity type',
    type: ComplementaryActivityTypeDto,
  })
  @Get(':id')
  @Profiles(Profile.Admin, Profile.Professor)
  findOne(@Param('id') id: number) {
    return this.complementaryActivityTypeService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar um tipo de atividade complementar por id' })
  @ApiResponse({
    status: 200,
    description: 'update one complementary activity types',
    type: ApiResponseDto,
  })
  @Patch(':id')
  @Profiles(Profile.Admin, Profile.Professor)
  update(@Param('id') id: string, @Body() updateComplementaryActivityTypeDto: UpdateComplementaryActivityTypeDto) {
    return this.complementaryActivityTypeService.update(+id, updateComplementaryActivityTypeDto);
  }

  @ApiOperation({ summary: 'Remover um tipo de atividade complementar por id' })
  @ApiResponse({
    status: 200,
    description: 'remove one complementary activity types',
    type: ApiResponseDto,
  })
  @Delete(':id')
  @Profiles(Profile.Admin, Profile.Professor)
  remove(@Param('id') id: string) {
    return this.complementaryActivityTypeService.remove(+id);
  }
}
