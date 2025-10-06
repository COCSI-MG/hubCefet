import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  Logger,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClassesService } from '../services/classes.service';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { Class } from '../entities/class.entity';
import { AddStudentsDto } from '../dto/add-students.dto';
import { ClassStudent } from '../entities/class-student.entity';
import { CreateClassWithSchedulesDto } from '../dto/create-class-with-schedules.dto';
import { CancelClassDto } from '../dto/cancel-class.dto';
import { ClassCancellation } from '../entities/class-cancellation.entity';
import { UserRequest } from 'src';
import { Profiles } from 'src/profile/decorators/profile.decorator';
import { Profile } from 'src/profile/enum/profile.enum';
import { Public } from '../../auth/decorators/public-auth.decorator';

@ApiTags('classes')
@Controller('classes')
export class ClassesController {
  private readonly logger = new Logger(ClassesController.name);

  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova aula' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Aula criada com sucesso',
    type: Class,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado',
  })
  @Profiles(Profile.Admin, Profile.Professor)
  async create(
    @Body() dto: CreateClassDto,
    @Req() req: UserRequest,
  ): Promise<Class> {
    try {
      const userId = req.user?.sub;
      const profileName = req.user?.profile?.name;

      return this.classesService.create(dto, userId, profileName);
    } catch (error) {
      throw error;
    }
  }

  @Post('with-schedules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova aula com agendamentos (horários e salas)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Aula criada com sucesso',
    type: Class,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado',
  })
  @Profiles(Profile.Admin, Profile.Professor)
  async createWithSchedules(
    @Body() dto: CreateClassWithSchedulesDto,
    @Req() req: UserRequest,
  ): Promise<Class> {
    try {
      const userId = req.user?.sub;
      const profileName = req.user?.profile?.name;
      this.logger.log(
        `Criando aula com agendamentos para usuário: ${userId}, perfil: ${profileName}`,
      );
      return this.classesService.createWithSchedules(dto, userId, profileName);
    } catch (error) {
      this.logger.error(
        `Erro ao criar aula com agendamentos: ${error.message}`,
      );
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todas as aulas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de aulas',
    type: [Class],
  })
  async findAll(
    @Query('semester_id') semesterId?: number,
    @Req() req?: UserRequest,
  ): Promise<Class[]> {
    const userId = req?.user?.sub;
    const profileName = req?.user?.profile?.name;

    return this.classesService.findAll(semesterId, userId, profileName);
  }

  @Get('public')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todas as aulas (visualização pública)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista pública de todas as aulas',
    type: [Class],
  })
  async findAllPublic(
    @Query('semester_id') semesterId?: number,
  ): Promise<Class[]> {
    this.logger.log('Buscando todas as aulas (visualização pública)');
    return this.classesService.findAllPublic(semesterId);
  }

  @Get('public/:id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar aula específica (visualização pública)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalhes públicos da aula',
    type: Class,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aula não encontrada',
  })
  async findOnePublic(@Param('id') id: string): Promise<Class> {
    this.logger.log(`Buscando detalhes públicos da aula com ID: ${id}`);
    return this.classesService.findOnePublic(+id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar aula por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Aula encontrada',
    type: Class,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aula não encontrada',
  })
  async findOne(
    @Param('id') id: string,
    @Req() req: UserRequest,
  ): Promise<Class> {
    const userId = req.user?.sub;
    const profileName = req.user?.profile?.name;

    return this.classesService.findOne(+id, userId, profileName);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar aula' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Aula atualizada',
    type: Class,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aula não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @Profiles(Profile.Admin, Profile.Professor)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
    @Req() req: UserRequest,
  ): Promise<Class> {
    const userId = req.user?.sub;
    const profileName = req.user?.profile?.name;

    return this.classesService.update(+id, dto, userId, profileName);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover aula' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Aula removida' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aula não encontrada',
  })
  @Profiles(Profile.Admin, Profile.Professor)
  async remove(
    @Param('id') id: string,
    @Req() req: UserRequest,
  ): Promise<void> {
    const userId = req.user?.sub;
    const profileName = req.user?.profile?.name;

    return this.classesService.remove(+id, userId, profileName);
  }

  @Post(':id/students')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adicionar alunos a uma aula' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alunos adicionados com sucesso',
    type: [ClassStudent],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aula não encontrada',
  })
  @Profiles(Profile.Admin, Profile.Professor)
  async addStudents(
    @Param('id') id: string,
    @Body() dto: AddStudentsDto,
    @Req() req: UserRequest,
  ): Promise<ClassStudent[]> {
    const userId = req.user?.sub;
    const profileName = req.user?.profile?.name;

    this.logger.log(
      `Adicionando alunos à aula ${id}: ${JSON.stringify(dto.student_ids)}`,
    );
    return this.classesService.addStudents(
      +id,
      dto.student_ids,
      userId,
      profileName,
    );
  }

  @Delete(':id/students/:studentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um aluno de uma aula' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Aluno removido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aula ou aluno não encontrado',
  })
  @Profiles(Profile.Admin, Profile.Professor)
  async removeStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Req() req: UserRequest,
  ): Promise<void> {
    const userId = req.user?.sub;
    const profileName = req.user?.profile?.name;

    this.logger.log(`Removendo aluno ${studentId} da aula ${id}`);
    return this.classesService.removeStudent(
      +id,
      studentId,
      userId,
      profileName,
    );
  }

  @Get(':id/search-students')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar alunos de uma aula com filtro' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alunos encontrados com sucesso',
    type: Class,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aula não encontrada',
  })
  @Profiles(Profile.Admin, Profile.Professor)
  async searchStudents(
    @Param('id') id: string,
    @Query('term') searchTerm: string = '',
    @Req() req: UserRequest,
  ): Promise<Class> {
    const userId = req.user?.sub;
    const profileName = req.user?.profile?.name;

    this.logger.log(`Buscando alunos da aula ${id} com filtro "${searchTerm}"`);
    return this.classesService.searchStudentsByName(
      +id,
      searchTerm,
      userId,
      profileName,
    );
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cancelar aulas em datas específicas' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Aulas canceladas com sucesso',
    type: [ClassCancellation],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aula não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description:
      'Não autorizado - apenas o professor da aula ou admin pode cancelar',
  })
  @Profiles(Profile.Admin, Profile.Professor)
  async cancelClass(
    @Param('id') id: string,
    @Body() dto: CancelClassDto,
    @Req() req: UserRequest,
  ): Promise<ClassCancellation[]> {
    const userId = req.user?.sub;
    const profileName = req.user?.profile?.name;

    this.logger.log(
      `Cancelando aula ${id} para as datas: ${dto.dates.join(', ')} por usuário: ${userId}`,
    );
    return this.classesService.cancelClass(+id, dto, userId, profileName);
  }

  @Get(':id/cancellations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar todos os cancelamentos de uma aula específica',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de cancelamentos obtida com sucesso',
    type: [ClassCancellation],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aula não encontrada',
  })
  async getClassCancellations(
    @Param('id') id: string,
    @Req() req: UserRequest,
  ): Promise<ClassCancellation[]> {
    const userId = req.user?.sub;
    const profileName = req.user?.profile?.name;

    this.logger.log(
      `Buscando cancelamentos da aula ${id} para usuário: ${userId}`,
    );
    return this.classesService.getClassCancellations(+id, userId, profileName);
  }

  @Get(':id/weekly-cancellations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar cancelamentos da semana atual para uma aula específica',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de cancelamentos da semana obtida com sucesso',
    type: [ClassCancellation],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aula não encontrada',
  })
  async getWeeklyCancellations(
    @Param('id') id: string,
    @Req() req: UserRequest,
    @Query('date') date?: string,
  ): Promise<ClassCancellation[]> {
    const userId = req.user?.sub;
    const profileName = req.user?.profile?.name;

    this.logger.log(
      `Buscando cancelamentos da semana para aula ${id}, data de referência: ${date || 'atual'}`,
    );
    return this.classesService.getWeeklyCancellations(
      +id,
      date,
      userId,
      profileName,
    );
  }
}
