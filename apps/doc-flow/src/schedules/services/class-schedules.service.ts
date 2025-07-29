import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ClassSchedule } from '../entities/class-schedule.entity';
import { CreateClassScheduleDto } from '../dto/create-class-schedule.dto';
import { TimeSlot } from '../entities/time-slot.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Class } from '../../classes/entities/class.entity';
import { Building } from '../../buildings/entities/building.entity';
import { Op } from 'sequelize';
import { ClassesService } from '../../classes/services/classes.service';

@Injectable()
export class ClassSchedulesService {
  private readonly logger = new Logger(ClassSchedulesService.name);

  constructor(
    @InjectModel(ClassSchedule)
    private classScheduleModel: typeof ClassSchedule,
    @InjectModel(TimeSlot)
    private timeSlotModel: typeof TimeSlot,
    @InjectModel(Room)
    private roomModel: typeof Room,
    @InjectModel(Class)
    private classModel: typeof Class,
    @InjectModel(Building)
    private buildingModel: typeof Building,
    @Inject(forwardRef(() => ClassesService))
    private classesService: ClassesService,
  ) {}

  async create(createClassScheduleDto: CreateClassScheduleDto): Promise<ClassSchedule> {
    try {
      const room = await this.roomModel.findByPk(createClassScheduleDto.room_id);
      if (!room) {
        throw new NotFoundException(`Sala com ID ${createClassScheduleDto.room_id} não encontrada`);
      }

      const timeSlot = await this.timeSlotModel.findByPk(createClassScheduleDto.time_slot_id);
      if (!timeSlot) {
        throw new NotFoundException(`Horário com ID ${createClassScheduleDto.time_slot_id} não encontrado`);
      }

      if (createClassScheduleDto.class_id) {
        const classEntity = await this.classModel.findByPk(createClassScheduleDto.class_id);
        if (!classEntity) {
          throw new NotFoundException(`Aula com ID ${createClassScheduleDto.class_id} não encontrada`);
        }
      }

      let buildingId = createClassScheduleDto.building_id;
      if (!buildingId) {
        buildingId = room.building_id;
      } else {
        const building = await this.buildingModel.findByPk(buildingId);
        if (!building) {
          throw new NotFoundException(`Bloco com ID ${buildingId} não encontrado`);
        }
      }

      const existingRoomSchedule = await this.classScheduleModel.findOne({
        where: {
          time_slot_id: createClassScheduleDto.time_slot_id,
          room_id: createClassScheduleDto.room_id,
        },
      });

      if (existingRoomSchedule) {
        throw new ConflictException(`Já existe um agendamento para esta sala neste horário`);
      }

      if (createClassScheduleDto.class_id) {
        const existingClassSchedule = await this.classScheduleModel.findOne({
          where: {
            class_id: createClassScheduleDto.class_id,
            time_slot_id: createClassScheduleDto.time_slot_id,
          },
        });

        if (existingClassSchedule) {
          throw new ConflictException(`A aula já está agendada para este horário em outra sala`);
        }
      }

      return await this.classScheduleModel.create({
        class_id: createClassScheduleDto.class_id,
        time_slot_id: createClassScheduleDto.time_slot_id,
        room_id: createClassScheduleDto.room_id,
        building_id: buildingId,
      });
    } catch (error) {
      this.logger.error(`Erro ao criar agendamento: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<ClassSchedule[]> {
    return this.classScheduleModel.findAll({
      include: [
        { model: TimeSlot },
        { model: Room },
        { model: Class },
        { model: Building },
      ],
    });
  }

  async findByClass(classId: number): Promise<ClassSchedule[]> {
    return this.classScheduleModel.findAll({
      where: { class_id: classId },
      include: [
        { model: TimeSlot },
        { model: Room },
        { model: Building },
      ],
    });
  }

  async findOne(id: number): Promise<ClassSchedule> {
    const schedule = await this.classScheduleModel.findByPk(id, {
      include: [
        { model: TimeSlot },
        { model: Room },
        { model: Class },
        { model: Building },
      ],
    });
    
    if (!schedule) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }
    
    return schedule;
  }

  async remove(id: number): Promise<void> {
    const schedule = await this.findOne(id);
    await schedule.destroy();
  }

  async findConflicts(timeSlotId: number, roomId: number): Promise<ClassSchedule[]> {
    return this.classScheduleModel.findAll({
      where: {
        [Op.or]: [
          { time_slot_id: timeSlotId, room_id: roomId },
        ],
      },
      include: [
        { model: TimeSlot },
        { model: Room },
        { model: Class },
      ],
    });
  }

  async findTeacherConflicts(classId: number, timeSlotId: number): Promise<ClassSchedule[]> {
    const classEntity = await this.classModel.findByPk(classId);
    if (!classEntity) {
      throw new NotFoundException(`Aula com ID ${classId} não encontrada`);
    }

    const teacherId = classEntity.teacherId;

    const teacherClasses = await this.classModel.findAll({
      where: { teacherId },
      attributes: ['id'],
    });

    const teacherClassIds = teacherClasses.map(c => c.id);

    return this.classScheduleModel.findAll({
      where: {
        class_id: { [Op.in]: teacherClassIds },
        time_slot_id: timeSlotId,
      },
      include: [
        { model: TimeSlot },
        { model: Room },
        { model: Class },
      ],
    });
  }

  async isRoomAvailable(roomId: number, timeSlotId: number): Promise<boolean> {
    const existingSchedule = await this.classScheduleModel.findOne({
      where: {
        room_id: roomId,
        time_slot_id: timeSlotId,
      },
    });

    return !existingSchedule;
  }

  async isTimeSlotAvailableForClass(classId: number, timeSlotId: number): Promise<boolean> {
    const existingSchedule = await this.classScheduleModel.findOne({
      where: {
        class_id: classId,
        time_slot_id: timeSlotId,
      },
    });

    return !existingSchedule;
  }

  async getAvailableRooms(timeSlotId: number): Promise<Room[]> {
    const occupiedRooms = await this.classScheduleModel.findAll({
      where: { time_slot_id: timeSlotId },
      attributes: ['room_id'],
    });

    const occupiedRoomIds = occupiedRooms.map(schedule => schedule.room_id);

    return this.roomModel.findAll({
      where: {
        id: { [Op.notIn]: occupiedRoomIds },
      },
      include: [{ model: Building }],
    });
  }
} 
 