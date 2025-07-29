import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { BuildingsService } from './buildings.service';
import { Profiles } from '../profile/decorators/profile.decorator';
import { Profile } from '../profile/enum/profile.enum';

@ApiTags('Blocos')
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @ApiOperation({ summary: 'Listar todos os blocos' })
  @ApiResponse({ status: 200, description: 'Lista de blocos obtida com sucesso' })
  @Get()
  async findAll() {
    return this.buildingsService.findAll();
  }

  @ApiOperation({ summary: 'Obter um bloco específico' })
  @ApiResponse({ status: 200, description: 'Bloco obtido com sucesso' })
  @ApiResponse({ status: 404, description: 'Bloco não encontrado' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.buildingsService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar um novo bloco' })
  @ApiResponse({ status: 201, description: 'Bloco criado com sucesso' })
  @Profiles(Profile.Admin, Profile.Professor)
  @Post()
  async create(@Body() createBuildingDto: CreateBuildingDto) {
    return this.buildingsService.create(createBuildingDto);
  }

  @ApiOperation({ summary: 'Atualizar um bloco existente' })
  @ApiResponse({ status: 200, description: 'Bloco atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Bloco não encontrado' })
  @Profiles(Profile.Admin, Profile.Professor)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ) {
    return this.buildingsService.update(id, updateBuildingDto);
  }

  @ApiOperation({ summary: 'Remover um bloco' })
  @ApiResponse({ status: 200, description: 'Bloco removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Bloco não encontrado' })
  @Profiles(Profile.Admin, Profile.Professor)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.buildingsService.remove(id);
  }
} 