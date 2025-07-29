import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TimeSlot, DayOfWeek } from '../entities/time-slot.entity';
import { CreateTimeSlotDto } from '../dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from '../dto/update-time-slot.dto';
import { Class } from '../../classes/entities/class.entity';
import { Op } from 'sequelize';
import { ClassesService } from '../../classes/services/classes.service';

@Injectable()
export class TimeSlotsService {
  private readonly logger = new Logger(TimeSlotsService.name);

  constructor(
    @InjectModel(TimeSlot)
    private timeSlotModel: typeof TimeSlot,
    @InjectModel(Class)
    private classModel: typeof Class,
    @Inject(forwardRef(() => ClassesService))
    private classesService: ClassesService,
  ) {}

  async create(createTimeSlotDto: CreateTimeSlotDto): Promise<TimeSlot> {
    await this.checkOverlappingTimeSlots(
      createTimeSlotDto.startTime,
      createTimeSlotDto.endTime,
      createTimeSlotDto.dayOfWeek,
    );

    try {
      const now = new Date();
      return await this.timeSlotModel.create({
        ...createTimeSlotDto,
        createdAt: now,
        updatedAt: now
      });
    } catch (error) {
      this.logger.error(`Erro ao criar horário no banco de dados: ${error.message}`);
      throw new BadRequestException(`Erro ao criar horário: ${error.message}`);
    }
  }

  async findAll(): Promise<TimeSlot[]> {
    return this.timeSlotModel.findAll({
      order: [
        ['dayOfWeek', 'ASC'],
        ['startTime', 'ASC'],
      ],
    });
  }

  async findOne(id: number): Promise<TimeSlot> {
    const timeSlot = await this.timeSlotModel.findByPk(id);
    if (!timeSlot) {
      throw new NotFoundException(`Horário com ID ${id} não encontrado`);
    }
    return timeSlot;
  }

  async update(id: number, updateTimeSlotDto: UpdateTimeSlotDto): Promise<TimeSlot> {
    const timeSlot = await this.findOne(id);

    if (updateTimeSlotDto.startTime || updateTimeSlotDto.endTime || updateTimeSlotDto.dayOfWeek) {
      await this.checkOverlappingTimeSlots(
        updateTimeSlotDto.startTime || timeSlot.startTime,
        updateTimeSlotDto.endTime || timeSlot.endTime,
        updateTimeSlotDto.dayOfWeek || timeSlot.dayOfWeek,
        id,
      );
    }

    try {
      await timeSlot.update(updateTimeSlotDto);
      return this.findOne(id);
    } catch (error) {
      this.logger.error(`Erro ao atualizar horário no banco de dados: ${error.message}`);
      throw new BadRequestException(`Erro ao atualizar horário: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    const timeSlot = await this.findOne(id);

    const classScheduleModel = this.timeSlotModel.sequelize.models.ClassSchedule;
    const schedulesCount = await classScheduleModel.count({
      where: { time_slot_id: id },
    });

    if (schedulesCount > 0) {
      throw new BadRequestException(
        `Não é possível excluir o horário pois existem ${schedulesCount} agendamentos de aulas associados a ele`,
      );
    }

    await timeSlot.destroy();
  }

  async getAllTimeSlots(): Promise<TimeSlot[]> {
    return this.findAll();
  }

  private async checkOverlappingTimeSlots(
    startTime: string,
    endTime: string,
    dayOfWeek: DayOfWeek,
    excludeId?: number,
  ): Promise<void> {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    
    if (end <= start) {
      throw new BadRequestException('O horário de término deve ser posterior ao horário de início');
    }

    const exactMatch = await this.timeSlotModel.findOne({
      where: {
        dayOfWeek: dayOfWeek,
        startTime: startTime,
        endTime: endTime,
        ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
      },
    });

    if (exactMatch) {
      throw new BadRequestException('Já existe um horário idêntico cadastrado para este dia da semana');
    }

    const where: any = {
      dayOfWeek: dayOfWeek,
      [Op.or]: [
        {
          startTime: {
            [Op.lte]: startTime,
          },
          endTime: {
            [Op.gt]: startTime,
          },
        },
        {
          startTime: {
            [Op.lt]: endTime,
          },
          endTime: {
            [Op.gte]: endTime,
          },
        },
        {
          startTime: {
            [Op.gte]: startTime,
          },
          endTime: {
            [Op.lte]: endTime,
          },
        },
      ],
    };

    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const overlappingTimeSlots = await this.timeSlotModel.findAll({
      where,
    });

    if (overlappingTimeSlots.length > 0) {
      const conflictingSlot = overlappingTimeSlots[0];
      throw new BadRequestException(
        `Conflito de horário detectado. Já existe um horário das ${conflictingSlot.startTime} às ${conflictingSlot.endTime} no mesmo dia da semana que se sobrepõe ao horário informado.`
      );
    }
  }
} 