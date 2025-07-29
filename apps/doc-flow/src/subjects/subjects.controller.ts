import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Profiles } from '../profile/decorators/profile.decorator';
import { Profile } from '../profile/enum/profile.enum';

@ApiTags('Disciplinas')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'Listar todas as disciplinas' })
  @ApiResponse({ status: 200, description: 'Lista de disciplinas obtida com sucesso' })
  @Get()
  async findAll() {
    return this.subjectsService.findAll();
  }

  @ApiOperation({ summary: 'Obter uma disciplina específica' })
  @ApiResponse({ status: 200, description: 'Disciplina obtida com sucesso' })
  @ApiResponse({ status: 404, description: 'Disciplina não encontrada' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar uma nova disciplina' })
  @ApiResponse({ status: 201, description: 'Disciplina criada com sucesso' })
  @Profiles(Profile.Admin, Profile.Professor)
  @Post()
  async create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @ApiOperation({ summary: 'Atualizar uma disciplina existente' })
  @ApiResponse({ status: 200, description: 'Disciplina atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Disciplina não encontrada' })
  @Profiles(Profile.Admin, Profile.Professor)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @ApiOperation({ summary: 'Remover uma disciplina' })
  @ApiResponse({ status: 200, description: 'Disciplina removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Disciplina não encontrada' })
  @Profiles(Profile.Admin, Profile.Professor)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.remove(id);
  }
} 