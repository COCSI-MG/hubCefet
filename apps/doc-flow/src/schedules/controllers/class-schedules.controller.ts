import { Controller, Get, Post, Body, Param, Delete, HttpCode } from '@nestjs/common';
import { ClassSchedulesService } from '../services/class-schedules.service';
import { CreateClassScheduleDto } from '../dto/create-class-schedule.dto';
import { ClassSchedule } from '../entities/class-schedule.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Room } from '../../rooms/entities/room.entity';

@ApiTags('class-schedules')
@Controller('class-schedules')
export class ClassSchedulesController {
  constructor(private readonly classSchedulesService: ClassSchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo agendamento de aula' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createClassScheduleDto: CreateClassScheduleDto): Promise<ClassSchedule> {
    return this.classSchedulesService.create(createClassScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Busca todos os agendamentos de aulas' })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos retornada com sucesso' })
  findAll(): Promise<ClassSchedule[]> {
    return this.classSchedulesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um agendamento de aula pelo ID' })
  @ApiResponse({ status: 200, description: 'Agendamento retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  findOne(@Param('id') id: string): Promise<ClassSchedule> {
    return this.classSchedulesService.findOne(+id);
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Busca agendamentos por ID de aula' })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos retornada com sucesso' })
  findByClass(@Param('classId') classId: string): Promise<ClassSchedule[]> {
    return this.classSchedulesService.findByClass(+classId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um agendamento de aula' })
  @ApiResponse({ status: 204, description: 'Agendamento removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.classSchedulesService.remove(+id);
  }

  @Get('conflicts/:timeSlotId/:roomId')
  @ApiOperation({ summary: 'Verifica conflitos de agendamento' })
  @ApiResponse({ status: 200, description: 'Lista de conflitos retornada com sucesso' })
  findConflicts(
    @Param('timeSlotId') timeSlotId: string,
    @Param('roomId') roomId: string,
  ): Promise<ClassSchedule[]> {
    return this.classSchedulesService.findConflicts(+timeSlotId, +roomId);
  }

  @Get('teacher-conflicts/:classId/:timeSlotId')
  @ApiOperation({ summary: 'Verifica conflitos de horário para um professor' })
  @ApiResponse({ status: 200, description: 'Lista de conflitos retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada' })
  findTeacherConflicts(
    @Param('classId') classId: string,
    @Param('timeSlotId') timeSlotId: string,
  ): Promise<ClassSchedule[]> {
    return this.classSchedulesService.findTeacherConflicts(+classId, +timeSlotId);
  }

  @Get('is-room-available/:roomId/:timeSlotId')
  @ApiOperation({ summary: 'Verifica se uma sala está disponível em um horário' })
  @ApiResponse({ status: 200, description: 'Status de disponibilidade retornado com sucesso' })
  async isRoomAvailable(
    @Param('roomId') roomId: string,
    @Param('timeSlotId') timeSlotId: string,
  ): Promise<{ available: boolean }> {
    const available = await this.classSchedulesService.isRoomAvailable(+roomId, +timeSlotId);
    return { available };
  }

  @Get('is-timeslot-available-for-class/:classId/:timeSlotId')
  @ApiOperation({ summary: 'Verifica se um horário está disponível para uma aula' })
  @ApiResponse({ status: 200, description: 'Status de disponibilidade retornado com sucesso' })
  async isTimeSlotAvailableForClass(
    @Param('classId') classId: string,
    @Param('timeSlotId') timeSlotId: string,
  ): Promise<{ available: boolean }> {
    const available = await this.classSchedulesService.isTimeSlotAvailableForClass(+classId, +timeSlotId);
    return { available };
  }

  @Get('available-rooms/:timeSlotId')
  @ApiOperation({ summary: 'Busca salas disponíveis em um determinado horário' })
  @ApiResponse({ status: 200, description: 'Lista de salas disponíveis retornada com sucesso' })
  getAvailableRooms(@Param('timeSlotId') timeSlotId: string): Promise<Room[]> {
    return this.classSchedulesService.getAvailableRooms(+timeSlotId);
  }
} 
 