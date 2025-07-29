import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SemestersService } from './semesters.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { Profiles } from '../profile/decorators/profile.decorator';
import { Profile } from '../profile/enum/profile.enum';

@ApiTags('Semestres')
@Controller('semesters')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @ApiOperation({ summary: 'Listar todos os semestres' })
  @ApiResponse({ status: 200, description: 'Lista de semestres obtida com sucesso' })
  @Get()
  async findAll() {
    return this.semestersService.findAll();
  }

  @ApiOperation({ summary: 'Obter um semestre específico' })
  @ApiResponse({ status: 200, description: 'Semestre obtido com sucesso' })
  @ApiResponse({ status: 404, description: 'Semestre não encontrado' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.semestersService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar um novo semestre' })
  @ApiResponse({ status: 201, description: 'Semestre criado com sucesso' })
  @Profiles(Profile.Admin, Profile.Professor)
  @Post()
  async create(@Body() createSemesterDto: CreateSemesterDto) {
    return this.semestersService.create(createSemesterDto);
  }

  @ApiOperation({ summary: 'Atualizar um semestre existente' })
  @ApiResponse({ status: 200, description: 'Semestre atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Semestre não encontrado' })
  @Profiles(Profile.Admin, Profile.Professor)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSemesterDto: UpdateSemesterDto,
  ) {
    return this.semestersService.update(id, updateSemesterDto);
  }

  @ApiOperation({ summary: 'Remover um semestre' })
  @ApiResponse({ status: 200, description: 'Semestre removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Semestre não encontrado' })
  @Profiles(Profile.Admin, Profile.Professor)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.semestersService.remove(id);
  }
} 