import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@ApiTags('Horários')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @ApiOperation({ summary: 'Listar todos os horários' })
  @ApiResponse({ status: 200, description: 'Lista de horários obtida com sucesso' })
  @Get()
  async findAll(@Query('class_id') classId?: number) {
    return this.schedulesService.findAll(classId);
  }

  @ApiOperation({ summary: 'Obter um horário específico' })
  @ApiResponse({ status: 200, description: 'Horário obtido com sucesso' })
  @ApiResponse({ status: 404, description: 'Horário não encontrado' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar um novo horário' })
  @ApiResponse({ status: 201, description: 'Horário criado com sucesso' })
  @Post()
  async create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @ApiOperation({ summary: 'Atualizar um horário existente' })
  @ApiResponse({ status: 200, description: 'Horário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Horário não encontrado' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @ApiOperation({ summary: 'Remover um horário' })
  @ApiResponse({ status: 200, description: 'Horário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Horário não encontrado' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.remove(id);
  }
} 