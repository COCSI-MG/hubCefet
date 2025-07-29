import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ClassSchedule } from './entities/class-schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { TimeSlot } from './entities/time-slot.entity';
import { Building } from '../buildings/entities/building.entity';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(ClassSchedule)
    private scheduleModel: typeof ClassSchedule,
  ) {}

  async findAll(classId?: number): Promise<ClassSchedule[]> {
    const options: any = {
      include: [
        { model: TimeSlot, attributes: ['id', 'startTime', 'endTime', 'dayOfWeek'] },
        { model: Building, attributes: ['id', 'name'] },
        { model: Room, attributes: ['id', 'name', 'capacity'] }
      ],
    };

    if (classId) {
      options.where = { class_id: classId };
    }

    return this.scheduleModel.findAll(options);
  }

  async findOne(id: number): Promise<ClassSchedule> {
    const schedule = await this.scheduleModel.findByPk(id, {
      include: [
        { model: TimeSlot, attributes: ['id', 'startTime', 'endTime', 'dayOfWeek'] },
        { model: Building, attributes: ['id', 'name'] },
        { model: Room, attributes: ['id', 'name', 'capacity'] }
      ],
    });

    if (!schedule) {
      throw new NotFoundException(`Horário com ID ${id} não encontrado`);
    }

    return schedule;
  }

  async create(createScheduleDto: CreateScheduleDto): Promise<ClassSchedule> {
    const scheduleDataToCreate = {
      class_id: createScheduleDto.classId,
      day_of_week: createScheduleDto.dayOfWeek,
      time_slot_id: createScheduleDto.timeSlotId,
      building_id: createScheduleDto.buildingId,
      room_id: createScheduleDto.roomId,
    };
    return this.scheduleModel.create(scheduleDataToCreate as any);
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto): Promise<ClassSchedule> {
    const schedule = await this.findOne(id);
    
    const scheduleDataToUpdate = {
      ...(updateScheduleDto.classId !== undefined && { class_id: updateScheduleDto.classId }),
      ...(updateScheduleDto.dayOfWeek !== undefined && { day_of_week: updateScheduleDto.dayOfWeek }),
      ...(updateScheduleDto.timeSlotId !== undefined && { time_slot_id: updateScheduleDto.timeSlotId }),
      ...(updateScheduleDto.buildingId !== undefined && { building_id: updateScheduleDto.buildingId }),
      ...(updateScheduleDto.roomId !== undefined && { room_id: updateScheduleDto.roomId }),
    };

    await schedule.update(scheduleDataToUpdate);
    await schedule.reload();
    
    return schedule;
  }

  async remove(id: number): Promise<void> {
    const schedule = await this.findOne(id);
    await schedule.destroy();
  }
} 