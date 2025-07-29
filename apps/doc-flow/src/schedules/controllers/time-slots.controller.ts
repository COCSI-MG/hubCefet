import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { TimeSlotsService } from '../services/time-slots.service';
import { CreateTimeSlotDto } from '../dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from '../dto/update-time-slot.dto';
import { TimeSlot } from '../entities/time-slot.entity';
import { Profiles } from '../../profile/decorators/profile.decorator';
import { Profile } from '../../profile/enum/profile.enum';
import { ApiResponseDto } from '../../lib/dto/api-response.dto';

@ApiTags('Time Slots')
@Controller('time-slots')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @ApiOperation({ summary: 'Listar todos os horários disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de horários obtida com sucesso' })
  @Get()
  async findAll(@Res() res: Response) {
    try {
      const timeSlots = await this.timeSlotsService.findAll();
      return res.status(200).json(timeSlots);
    } catch (error) {
      if (process.env.APP_ENV === 'development') {
        console.error(error);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Erro interno do servidor'),
      );
    }
  }

  @ApiOperation({ summary: 'Obter um horário específico por ID' })
  @ApiResponse({ status: 200, description: 'Horário obtido com sucesso' })
  @ApiResponse({ status: 404, description: 'Horário não encontrado' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    try {
      const timeSlot = await this.timeSlotsService.findOne(id);
      return res.status(200).json(timeSlot);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res
          .status(404)
          .json(
            new ApiResponseDto<null>(404, false, null, error.message),
          );
      }
      
      if (process.env.APP_ENV === 'development') {
        console.error(error);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Erro interno do servidor'),
      );
    }
  }

  @ApiOperation({ summary: 'Criar um novo horário' })
  @ApiResponse({ status: 201, description: 'Horário criado com sucesso' })
  @ApiResponse({ status:400, description: 'Dados inválidos' })
  @Profiles(Profile.Admin, Profile.Professor)
  @Post()
  async create(@Body() createTimeSlotDto: CreateTimeSlotDto, @Res() res: Response) {
    try {
      const timeSlot = await this.timeSlotsService.create(createTimeSlotDto);
      return res.status(201).json(timeSlot);
    } catch (error) {
      if (error.message.includes('sobreposição') || 
          error.message.includes('posterior') || 
          error.message.includes('idêntico') || 
          error.message.includes('Conflito de horário')) {
        return res
          .status(400)
          .json(
            new ApiResponseDto<null>(400, false, null, error.message),
          );
      }
      
      if (process.env.APP_ENV === 'development') {
        console.error(error);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Erro interno do servidor'),
      );
    }
  }

  @ApiOperation({ summary: 'Atualizar um horário existente' })
  @ApiResponse({ status: 200, description: 'Horário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Horário não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @Profiles(Profile.Admin, Profile.Professor)
  @Put(':id')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTimeSlotDto: UpdateTimeSlotDto,
    @Res() res: Response,
  ) {
    try {
      const timeSlot = await this.timeSlotsService.update(id, updateTimeSlotDto);
      return res.status(200).json(timeSlot);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res
          .status(404)
          .json(
            new ApiResponseDto<null>(404, false, null, error.message),
          );
      }
      
      if (error.message.includes('sobreposição') || 
          error.message.includes('posterior') || 
          error.message.includes('idêntico') || 
          error.message.includes('Conflito de horário')) {
        return res
          .status(400)
          .json(
            new ApiResponseDto<null>(400, false, null, error.message),
          );
      }
      
      if (process.env.APP_ENV === 'development') {
        console.error(error);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Erro interno do servidor'),
      );
    }
  }

  @ApiOperation({ summary: 'Remover um horário' })
  @ApiResponse({ status: 200, description: 'Horário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Horário não encontrado' })
  @ApiResponse({ status: 400, description: 'Horário não pode ser removido pois está em uso' })
  @Profiles(Profile.Admin, Profile.Professor)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    try {
      await this.timeSlotsService.remove(id);
      return res
        .status(200)
        .json(
          new ApiResponseDto<object>(200, true, {}, 'Horário removido com sucesso'),
        );
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res
          .status(404)
          .json(
            new ApiResponseDto<null>(404, false, null, error.message),
          );
      }
      
      if (error.message.includes('não é possível excluir') || error.message.includes('aulas associadas') || error.message.includes('agendamentos de aulas associados')) {
        return res
          .status(400)
          .json(
            new ApiResponseDto<null>(400, false, null, error.message),
          );
      }
      
      if (process.env.APP_ENV === 'development') {
        console.error(error);
      }
      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Erro interno do servidor'),
      );
    }
  }
} 