import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, Request, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AddStudentsDto } from './dto/add-students.dto';

@ApiTags('Aulas')
@Controller('classes')
export class ClassesController {
  private readonly logger = new Logger(ClassesController.name);

  constructor(private readonly classesService: ClassesService) {}

  private extractUserInfo(req: any) {
    let userId = req.user?.sub || req.user?.id;
    
    if (userId === 'dev-admin') {
      userId = process.env.DEFAULT_ADMIN_UUID || '00000000-0000-0000-0000-000000000000';
      this.logger.warn(`Substituindo ID de usuário 'dev-admin' por UUID de admin padrão: ${userId}`);
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (userId && !uuidRegex.test(userId)) {
      this.logger.error(`ID de usuário inválido: ${userId}. Usando UUID padrão.`);
      userId = process.env.DEFAULT_ADMIN_UUID || '00000000-0000-0000-0000-000000000000';
    }
    
    let profileName = req.user?.profile?.name;
    
    if (!profileName && req.user?.profile) {
      profileName = typeof req.user.profile === 'string' 
        ? req.user.profile 
        : req.user.profile.roles?.[0] || req.user.profile.name;
    }
    
    return { userId, profileName };
  }

  @ApiOperation({ summary: 'Listar todas as aulas' })
  @ApiResponse({ status: 200, description: 'Lista de aulas obtida com sucesso' })
  @Get()
  async findAll(@Query('semester_id') semesterId?: number, @Request() req?: any) {
    const { userId, profileName } = this.extractUserInfo(req);
    
    return this.classesService.findAll(semesterId, userId, profileName);
  }

  @Get('public')
  @ApiOperation({ summary: 'Listar todas as aulas (visualização pública)' })
  @ApiResponse({ status: 200, description: 'Lista pública de todas as aulas' })
  async findAllPublic(@Query('semester_id') semesterId?: number) {
    return this.classesService.findAllPublic(semesterId);
  }

  @ApiOperation({ summary: 'Obter uma aula específica' })
  @ApiResponse({ status: 200, description: 'Aula obtida com sucesso' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req?: any) {
    const { userId, profileName } = this.extractUserInfo(req);
    
    return this.classesService.findOne(id, userId, profileName);
  }

  @ApiOperation({ summary: 'Criar uma nova aula' })
  @ApiResponse({ status: 201, description: 'Aula criada com sucesso' })
  @Post()
  async create(@Body() createClassDto: CreateClassDto, @Request() req?: any) {
    const { userId, profileName } = this.extractUserInfo(req);
    
    return this.classesService.create(createClassDto, userId, profileName);
  }

  @ApiOperation({ summary: 'Atualizar uma aula existente' })
  @ApiResponse({ status: 200, description: 'Aula atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
    @Request() req?: any
  ) {
    const { userId, profileName } = this.extractUserInfo(req);
    
    return this.classesService.update(id, updateClassDto, userId, profileName);
  }

  @ApiOperation({ summary: 'Remover uma aula' })
  @ApiResponse({ status: 200, description: 'Aula removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req?: any) {
    const { userId, profileName } = this.extractUserInfo(req);
    
    return this.classesService.remove(id, userId, profileName);
  }

  @ApiOperation({ summary: 'Adicionar alunos a uma aula' })
  @ApiResponse({ status: 200, description: 'Alunos adicionados com sucesso' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada' })
  @Post(':id/students')
  async addStudents(
    @Param('id', ParseIntPipe) id: number,
    @Body() addStudentsDto: AddStudentsDto,
    @Request() req?: any
  ) {
    const { userId, profileName } = this.extractUserInfo(req);
    
    return this.classesService.addStudents(id, addStudentsDto.student_ids, userId, profileName);
  }

  @ApiOperation({ summary: 'Remover um aluno de uma aula' })
  @ApiResponse({ status: 200, description: 'Aluno removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Aula ou aluno não encontrado' })
  @Delete(':id/students/:studentId')
  async removeStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId') studentId: string,
    @Request() req?: any
  ) {
    const { userId, profileName } = this.extractUserInfo(req);
    
    return this.classesService.removeStudent(id, studentId, userId, profileName);
  }

  @ApiOperation({ summary: 'Buscar alunos de uma aula com filtro' })
  @ApiResponse({ status: 200, description: 'Alunos encontrados com sucesso' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada' })
  @Get(':id/search-students')
  async searchStudents(
    @Param('id', ParseIntPipe) id: number,
    @Query('term') searchTerm: string = '',
    @Request() req?: any
  ) {
    const { userId, profileName } = this.extractUserInfo(req);
    
    return this.classesService.searchStudentsByName(id, searchTerm, userId, profileName);
  }
} 
