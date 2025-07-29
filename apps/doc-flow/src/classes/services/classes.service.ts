import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, Logger, Inject, forwardRef, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Class } from '../entities/class.entity';
import { ClassStudent } from '../entities/class-student.entity';
import { ClassCancellation } from '../entities/class-cancellation.entity';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { TimeSlot } from '../../schedules/entities/time-slot.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { Semester } from '../../semesters/entities/semester.entity';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Building } from '../../buildings/entities/building.entity';
import { ClassSchedule } from '../../schedules/entities/class-schedule.entity';
import { Op } from 'sequelize';
import { TimeSlotsService } from '../../schedules/services/time-slots.service';
import { CreateClassWithSchedulesDto } from '../dto/create-class-with-schedules.dto';
import { ClassSchedulesService } from '../../schedules/services/class-schedules.service';
import { CancelClassDto } from '../dto/cancel-class.dto';
import { EmailQueueService } from '../../email/email-queue.service';

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(
    @InjectModel(Class)
    private readonly classModel: typeof Class,
    @Inject(forwardRef(() => TimeSlotsService))
    private readonly timeSlotsService: TimeSlotsService,
    @InjectModel(ClassStudent)
    private readonly classStudentModel: typeof ClassStudent,
    @InjectModel(ClassCancellation)
    private readonly classCancellationModel: typeof ClassCancellation,
    @Inject(forwardRef(() => ClassSchedulesService))
    private readonly classSchedulesService: ClassSchedulesService,
    private readonly emailQueueService: EmailQueueService
  ) {}

  private getIncludeOptions() {
    return [
      { model: Subject, as: 'subject' },
      { model: Semester, as: 'semester' },
      { model: User, as: 'teacher' },
      { 
        model: ClassSchedule, 
        as: 'schedules',
        include: [
          { 
            model: Room,
            include: [{ model: Building }]
          },
          { 
            model: TimeSlot, 
            attributes: ['id', 'startTime', 'endTime', 'dayOfWeek'] 
          }
        ] 
      },
      {
        model: User,
        as: 'students',
        attributes: ['id', 'full_name', 'email', 'enrollment'],
        required: false
      }
    ];
  }

  async create(createClassDto: CreateClassDto, userId?: string, profileName?: string): Promise<Class> {
    const isAdmin = profileName && ['admin', 'coordinator'].includes(profileName.toLowerCase());
    
    let teacherId = createClassDto.teacherId;
    
    if (!teacherId) {
      if (userId) {
        teacherId = userId;
      } else {
        throw new BadRequestException('É necessário fornecer um ID de professor ou estar autenticado para criar uma aula');
      }
    }
    
    if (!isAdmin && teacherId !== userId) {
      throw new UnauthorizedException('Você só pode criar aulas para você mesmo como professor');
    }
    
    await this.validateDuplicateClass(teacherId, createClassDto.subjectId, createClassDto.semesterId);
    
    const classData = {
      name: createClassDto.name,
      subjectId: createClassDto.subjectId,
      semesterId: createClassDto.semesterId,
      teacherId: teacherId
    };

    try {
      const createdClass = await this.classModel.create(classData as any);
      return this.findOne(createdClass.id);
    } catch (error) {
      throw new BadRequestException(`Erro ao criar aula: ${error.message}`);
    }
  }

  async findAll(semesterId?: number, userId?: string, profileName?: string): Promise<Class[]> {

    const options: any = {
      include: this.getIncludeOptions()
    };

    if (semesterId) {
      options.where = { ...options.where, semesterId };
    }

    if (profileName) {
      const profileLower = profileName.toLowerCase();
      
      if (profileLower === 'professor') {
        options.where = { ...options.where, teacherId: userId };
      } else {
        options.include = options.include.filter(inc => inc.as !== 'students');
        
        options.include.push({
          model: User,
          as: 'students',
          where: { id: userId },
          attributes: ['id', 'full_name', 'email', 'enrollment'],
          required: true
        });
      }
    }

    const classes = await this.classModel.findAll(options);
    
    const classesWithWeeklyCancellations = await Promise.all(
      classes.map(async (classEntity) => {
        const weeklyCancellations = await this.getWeeklyCancellationsForClass(classEntity.id);
        return {
          ...classEntity.toJSON(),
          weeklyCancellations
        };
      })
    );

    return classesWithWeeklyCancellations as any;
  }

  async findAllPublic(semesterId?: number): Promise<Class[]> {
    const options: any = {
      include: [
        { model: Subject, as: 'subject' },
        { model: Semester, as: 'semester' },
        { model: User, as: 'teacher' },
        { 
          model: ClassSchedule, 
          as: 'schedules',
          include: [
            { 
              model: Room,
              include: [{ model: Building }]
            },
            { 
              model: TimeSlot, 
              attributes: ['id', 'startTime', 'endTime', 'dayOfWeek'] 
            }
          ] 
        },
        {
          model: ClassCancellation,
          as: 'cancellations',
          required: false
        }
      ]
    };

    if (semesterId) {
      options.where = { semesterId };
    }

    const classes = await this.classModel.findAll(options);
    
    const classesWithWeeklyCancellations = await Promise.all(
      classes.map(async (classEntity) => {
        const weeklyCancellations = await this.getWeeklyCancellationsForClass(classEntity.id);
        return {
          ...classEntity.toJSON(),
          weeklyCancellations
        };
      })
    );

    return classesWithWeeklyCancellations as any;
  }

  async findOnePublic(id: number): Promise<Class> {
    const options: any = {
      include: [
        { model: Subject, as: 'subject' },
        { model: Semester, as: 'semester' },
        { model: User, as: 'teacher' },
        { 
          model: ClassSchedule, 
          as: 'schedules',
          include: [
            { 
              model: Room,
              include: [{ model: Building }]
            },
            { 
              model: TimeSlot, 
              attributes: ['id', 'startTime', 'endTime', 'dayOfWeek'] 
            }
          ] 
        },
        {
          model: ClassCancellation,
          as: 'cancellations',
          required: false
        }
      ],
      where: { id }
    };

    const classEntity = await this.classModel.findOne(options);

    if (!classEntity) {
      throw new NotFoundException(`Aula com ID ${id} não encontrada`);
    }

    const weeklyCancellations = await this.getWeeklyCancellationsForClass(classEntity.id);
    return {
      ...classEntity.toJSON(),
      weeklyCancellations
    } as any;
  }

  async findOne(id: number, userId?: string, profileName?: string): Promise<Class> {
    const options: any = {
      include: this.getIncludeOptions(),
      where: { id }
    };

    if (profileName) {
      const profileLower = profileName.toLowerCase();
      
      if (profileLower === 'professor') {
        options.where.teacherId = userId;
      } else {
        
        options.include = options.include.filter(inc => inc.as !== 'students');
        
        options.include.push({
          model: User,
          as: 'students',
          where: { id: userId },
          attributes: ['id', 'full_name', 'email', 'enrollment'],
          required: true
        });
      }
    }

    const classEntity = await this.classModel.findOne(options);

    if (!classEntity) {
      throw new NotFoundException(`Aula com ID ${id} não encontrada ou você não tem acesso a ela`);
    }

    return classEntity;
  }

  async update(id: number, dto: UpdateClassDto, userId?: string, profileName?: string): Promise<Class> {
    const classEntity = await this.findOne(id, userId, profileName);
    
    if (profileName === 'professor' && classEntity.teacherId !== userId) {
      throw new UnauthorizedException('Você só pode atualizar suas próprias aulas');
    }

    await classEntity.update(dto);
    return this.findOne(id, userId, profileName);
  }

  async remove(id: number, userId?: string, profileName?: string): Promise<void> {
    const classEntity = await this.findOne(id, userId, profileName);
    
    if (profileName === 'professor' && classEntity.teacherId !== userId) {
      throw new UnauthorizedException('Você só pode remover suas próprias aulas');
    }
    
    await classEntity.destroy();
  }
  
  async addStudents(classId: number, studentIds: string[], userId?: string, profileName?: string): Promise<ClassStudent[]> {
    
    const classEntity = await this.findOne(classId, userId, profileName);
    
    if (profileName === 'professor' && classEntity.teacherId !== userId) {
      throw new UnauthorizedException('Você só pode adicionar alunos às suas próprias aulas');
    }
    
    const enrollments = studentIds.map(studentId => ({
      classId,
      studentId,
    }));
    
    try {
      const result = await this.classStudentModel.bulkCreate(enrollments);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao adicionar alunos: ${error.message}`, error.stack);
      throw new BadRequestException(`Erro ao adicionar alunos: ${error.message}`);
    }
  }
  
  async removeStudent(classId: number, studentId: string, userId?: string, profileName?: string): Promise<void> {
    const classEntity = await this.findOne(classId, userId, profileName);
    
    if (profileName === 'professor' && classEntity.teacherId !== userId) {
      throw new UnauthorizedException('Você só pode remover alunos das suas próprias aulas');
    }
    
    if (profileName === 'student' && studentId !== userId) {
      throw new UnauthorizedException('Você só pode cancelar sua própria matrícula');
    }
    
    const deleted = await this.classStudentModel.destroy({
      where: {
        classId,
        studentId,
      },
    });
    
    if (deleted === 0) {
      throw new NotFoundException(`Aluno ${studentId} não está matriculado na aula ${classId}`);
    }
  }
  
  async searchStudentsByName(classId: number, searchTerm: string = '', userId?: string, profileName?: string): Promise<Class> {
    const options: any = {
      include: this.getIncludeOptions(),
      where: { id: classId }
    };
    
    if (searchTerm && searchTerm.trim() !== '') {
      options.include = options.include.map(include => {
        if (include.as === 'students') {
          return {
            ...include,
            where: {
              [Op.or]: [
                { full_name: { [Op.iLike]: `%${searchTerm.trim()}%` } },
                { email: { [Op.iLike]: `%${searchTerm.trim()}%` } },
                { enrollment: { [Op.iLike]: `%${searchTerm.trim()}%` } }
              ]
            }
          };
        }
        return include;
      });
    }
    
    const classWithFilteredStudents = await this.classModel.findOne(options);
    
    if (!classWithFilteredStudents) {
      throw new NotFoundException(`Aula com ID ${classId} não encontrada`);
    }
    
    return classWithFilteredStudents;
  }

  async createWithSchedules(dto: CreateClassWithSchedulesDto, userId?: string, profileName?: string): Promise<Class> {
    try {
      const classDto = { ...dto.class };
      
      const isAdmin = profileName && ['admin', 'coordinator'].includes(profileName.toLowerCase());
      const isProfessor = profileName && profileName.toLowerCase() === 'professor';
      
      if (isAdmin) {
        if (!classDto.teacherId) {
          throw new BadRequestException('Administradores devem especificar um ID de professor para criar aulas');
        }
        
        if (classDto.teacherId === userId) {
          const userProfiles = await this.getUserProfiles(userId);
          const hasTeacherProfile = userProfiles.some(profile => 
            profile.name.toLowerCase() === 'professor'
          );
          
          if (!hasTeacherProfile) {
            throw new UnauthorizedException('Administradores só podem criar aulas para si mesmos se também tiverem perfil de professor');
          }
        }
      } else if (isProfessor) {
        if (classDto.teacherId && classDto.teacherId !== userId) {
          throw new UnauthorizedException('Professores só podem criar aulas para si mesmos');
        }
      
      if (!classDto.teacherId) {
          classDto.teacherId = userId;
        }
        } else {
        throw new UnauthorizedException('Apenas administradores e professores podem criar aulas');
        }
      
      await this.validateTeacherExists(classDto.teacherId);
      
      await this.validateDuplicateClass(classDto.teacherId, classDto.subjectId, classDto.semesterId);
      
      await this.validateScheduleConflicts(dto.schedules, classDto.teacherId);
      
      const classData = {
        name: classDto.name,
        subjectId: classDto.subjectId,
        semesterId: classDto.semesterId,
        teacherId: classDto.teacherId
      };
      
      const createdClass = await this.classModel.create(classData as any);
      
      const schedulePromises = dto.schedules.map(async (scheduleDto) => {
        const newScheduleDto = {
          ...scheduleDto,
          class_id: createdClass.id
        };
        
        await this.validateSingleSchedule(newScheduleDto, classDto.teacherId);
        
        return this.classSchedulesService.create(newScheduleDto);
      });
      
      await Promise.all(schedulePromises);
      
      return this.findOne(createdClass.id, userId, profileName);
    } catch (error) {
      this.logger.error(`Erro ao criar aula com agendamentos: ${error.message}`);
      
      if (error.message.includes('conflito') || error.message.includes('ocupado')) {
        try {
          const createdClass = await this.classModel.findOne({
            where: { 
              name: dto.class.name,
              teacherId: dto.class.teacherId,
              subjectId: dto.class.subjectId,
              semesterId: dto.class.semesterId
            },
            order: [['createdAt', 'DESC']]
          });
          
          if (createdClass) {
            await createdClass.destroy();
            this.logger.log(`Aula removida devido a erro de agendamento: ID ${createdClass.id}`);
          }
        } catch (cleanupError) {
          this.logger.error(`Erro ao limpar aula após falha: ${cleanupError.message}`);
        }
      }
      
      throw new BadRequestException(`Erro ao criar aula com agendamentos: ${error.message}`);
    }
  }

  private async getUserProfiles(userId: string): Promise<any[]> {
    const userModel = this.classModel.sequelize.models.User as typeof User;
    const user = await userModel.findByPk(userId, {
      include: ['profile']
    });
    
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }
    
    return user.profile ? [user.profile] : [];
  }

  private async validateTeacherExists(teacherId: string): Promise<void> {
    const userModel = this.classModel.sequelize.models.User as typeof User;
    const teacher = await userModel.findByPk(teacherId);
    if (!teacher) {
      throw new NotFoundException(`Professor com ID ${teacherId} não encontrado`);
    }
  }

  private async validateDuplicateClass(teacherId: string, subjectId: number, semesterId: number): Promise<void> {
    const existingClass = await this.classModel.findOne({
      where: {
        teacherId: teacherId,
        subjectId: subjectId,
        semesterId: semesterId
      },
      include: [
        {
          model: Subject,
          as: 'subject',
          attributes: ['name', 'code']
        },
        {
          model: Semester,
          as: 'semester',
          attributes: ['year', 'number']
        }
      ]
    });

    if (existingClass) {
      const subjectName = existingClass.subject?.name || 'Disciplina';
      const subjectCode = existingClass.subject?.code || '';
      const semesterInfo = existingClass.semester 
        ? `${existingClass.semester.year}.${existingClass.semester.number}`
        : 'semestre';
      
      throw new ConflictException(
        `Já existe uma aula da disciplina "${subjectName}" ${subjectCode ? `(${subjectCode})` : ''} ` +
        `para este professor no semestre ${semesterInfo}. ` +
        `Para adicionar novos horários, use o endpoint POST /api/class-schedules com o ID da aula existente (${existingClass.id}) ` +
        `ao invés de criar uma nova aula.`
      );
    }
  }

  private async validateScheduleConflicts(schedules: any[], teacherId: string): Promise<void> {
    for (const schedule of schedules) {
      const roomConflict = await this.classSchedulesService.isRoomAvailable(
        schedule.room_id, 
        schedule.time_slot_id
      );
      
      if (!roomConflict) {
        throw new ConflictException(
          `A sala ${schedule.room_id} já está ocupada no horário ${schedule.time_slot_id}`
        );
      }
      
      const teacherConflicts = await this.getTeacherScheduleConflicts(teacherId, schedule.time_slot_id);
      
      if (teacherConflicts.length > 0) {
        throw new ConflictException(
          `O professor já possui uma aula agendada no horário ${schedule.time_slot_id}`
        );
      }
    }
    
    const timeSlotIds = schedules.map(s => s.time_slot_id);
    const uniqueTimeSlots = new Set(timeSlotIds);
    
    if (timeSlotIds.length !== uniqueTimeSlots.size) {
      throw new ConflictException('Não é possível agendar a mesma aula em horários duplicados');
    }
  }

  private async validateSingleSchedule(scheduleDto: any, teacherId: string): Promise<void> {
    const isRoomAvailable = await this.classSchedulesService.isRoomAvailable(
      scheduleDto.room_id,
      scheduleDto.time_slot_id
    );
    
    if (!isRoomAvailable) {
      throw new ConflictException(
        `Conflito detectado: Sala ${scheduleDto.room_id} não está mais disponível no horário ${scheduleDto.time_slot_id}`
      );
    }
  }

  private async getTeacherScheduleConflicts(teacherId: string, timeSlotId: number): Promise<any[]> {
    const teacherClasses = await this.classModel.findAll({
      where: { teacherId },
      attributes: ['id']
    });
    
    const classIds = teacherClasses.map(c => c.id);
    
    if (classIds.length === 0) {
      return [];
    }
    
    const classScheduleModel = this.classModel.sequelize.models.ClassSchedule as typeof ClassSchedule;
    return await classScheduleModel.findAll({
      where: {
        class_id: { [Op.in]: classIds },
        time_slot_id: timeSlotId
      }
    });
  }

  private async validateCancellationDates(classId: number, dates: string[]): Promise<void> {
    const classEntity = await this.classModel.findOne({
      where: { id: classId },
      include: [
        {
          model: Semester,
          as: 'semester',
          attributes: ['id', 'year', 'number', 'start_date', 'end_date']
        },
        {
          model: ClassSchedule,
          as: 'schedules',
          include: [
            {
              model: TimeSlot,
              attributes: ['dayOfWeek']
            }
          ]
        }
      ]
    });

    if (!classEntity) {
      throw new BadRequestException('Aula não encontrada');
    }

    if (!classEntity.schedules || classEntity.schedules.length === 0) {
      throw new BadRequestException('Aula não possui horários cadastrados');
    }

    if (!classEntity.semester) {
      throw new BadRequestException('Aula não possui semestre associado');
    }

    const validDaysOfWeek = new Set(
      classEntity.schedules.map(schedule => {
        const dayOfWeek = schedule.time_slot.dayOfWeek;
        
        if (typeof dayOfWeek === 'string') {
          const dayMap = {
            'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3,
            'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
          };
          return dayMap[dayOfWeek.toUpperCase()] ?? parseInt(dayOfWeek);
        }
        return dayOfWeek;
      })
    );

    const semesterStart = new Date(classEntity.semester.start_date);
    const semesterEnd = new Date(classEntity.semester.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const invalidDates: string[] = [];
    const pastDates: string[] = [];
    const outsideSemesterDates: string[] = [];
    const dayNames = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    
    for (const dateStr of dates) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      
      if (date <= today) {
        pastDates.push(`${dateStr} (${dayNames[dayOfWeek]})`);
        continue;
      }
      
      if (date < semesterStart || date > semesterEnd) {
        outsideSemesterDates.push(`${dateStr} (${dayNames[dayOfWeek]})`);
        continue;
      }
      
      if (!validDaysOfWeek.has(dayOfWeek)) {
        invalidDates.push(`${dateStr} (${dayNames[dayOfWeek]})`);
      }
    }

    const errors: string[] = [];
    
    if (pastDates.length > 0) {
      errors.push(`Não é possível cancelar datas passadas: ${pastDates.join(', ')}`);
    }
    
    if (outsideSemesterDates.length > 0) {
      const semesterStartStr = semesterStart.toLocaleDateString('pt-BR');
      const semesterEndStr = semesterEnd.toLocaleDateString('pt-BR');
      errors.push(
        `As seguintes datas estão fora do período do semestre (${semesterStartStr} a ${semesterEndStr}): ${outsideSemesterDates.join(', ')}`
      );
    }
    
    if (invalidDates.length > 0) {
      const validDaysNames = Array.from(validDaysOfWeek).map(day => dayNames[day]).join(', ');
      errors.push(
        `As seguintes datas não correspondem aos dias da semana da aula: ${invalidDates.join(', ')}. ` +
        `Esta aula acontece apenas em: ${validDaysNames}`
      );
  }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('. '));
    }
  }

  private async checkExistingCancellations(classId: number, dates: string[]): Promise<void> {
    const existingCancellations = await this.classCancellationModel.findAll({
      where: {
        classId: classId,
        date: {
          [Op.in]: dates.map(dateStr => {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
          })
        }
      }
    });

    if (existingCancellations.length > 0) {
      const duplicateDates = existingCancellations.map(cancellation => {
        const date = new Date(cancellation.date);
        return date.toISOString().split('T')[0];
      });
      
      throw new BadRequestException(
        `Já existem cancelamentos para as seguintes datas: ${duplicateDates.join(', ')}. ` +
        `Não é possível cancelar a mesma aula duas vezes na mesma data.`
      );
    }
  }



  async getAllCancellations(startDate?: string, endDate?: string, userId?: string, profileName?: string): Promise<ClassCancellation[]> {
    
    const where: any = {};
    
    if (startDate || endDate) {
      where.date = {};
      
      if (startDate) {
        where.date[Op.gte] = startDate;
      }
      
      if (endDate) {
        where.date[Op.lte] = endDate;
      }
    }
    
    return this.classCancellationModel.findAll({
      where,
      order: [['date', 'ASC']],
      include: [
        {
          model: Class,
          as: 'class',
          include: [
            {
              model: Subject,
              as: 'subject',
              attributes: ['id', 'name', 'code']
            },
            {
              model: User,
              as: 'teacher',
              attributes: ['id', 'full_name', 'email']
            }
          ]
        }
      ]
    });
  }

  async cancelClass(classId: number, dto: CancelClassDto, userId: string, profileName: string): Promise<ClassCancellation[]> {
    const classEntity = await this.findOne(classId, userId, profileName);
    
    const isAdmin = profileName && ['admin', 'coordinator'].includes(profileName.toLowerCase());
    const isProfessor = profileName && profileName.toLowerCase() === 'professor';
    
    if (!isAdmin && (!isProfessor || classEntity.teacherId !== userId)) {
      throw new UnauthorizedException('Apenas o professor da aula ou administradores podem cancelar aulas');
    }
    
    await this.validateCancellationDates(classId, dto.dates);
    
    await this.checkExistingCancellations(classId, dto.dates);
    
    const cancellations = dto.dates.map(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      return {
        classId: classId,
        date: date,
        reason: dto.reason,
        canceledBy: userId,
        studentsNotified: false
      };
    });
    
    try {
      const createdCancellations = await this.classCancellationModel.bulkCreate(cancellations);
      this.logger.log(`${createdCancellations.length} cancelamentos criados para a aula ${classId}`);
      
      await this.sendCancellationEmailsToStudents(classEntity, dto.dates, dto.reason);
      
      return createdCancellations;
    } catch (error) {
      this.logger.error(`Erro ao criar cancelamentos: ${error.message}`);
      throw new BadRequestException(`Erro ao cancelar aulas: ${error.message}`);
    }
  }

  async getClassCancellations(classId: number, userId: string, profileName: string): Promise<ClassCancellation[]> {
    await this.findOne(classId, userId, profileName);
    
    return this.classCancellationModel.findAll({
      where: {
        classId: classId
      },
      order: [['date', 'ASC']]
    });
  }

  async getWeeklyCancellations(classId: number, referenceDate?: string, userId?: string, profileName?: string): Promise<ClassCancellation[]> {
    await this.findOne(classId, userId, profileName);
    
    const date = referenceDate ? new Date(referenceDate) : new Date();
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek;
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return this.classCancellationModel.findAll({
      where: {
        classId: classId,
        date: {
          [Op.gte]: startOfWeek,
          [Op.lte]: endOfWeek
        }
      },
      order: [['date', 'ASC']]
    });
  }

  private async getWeeklyCancellationsForClass(classId: number, referenceDate?: string): Promise<ClassCancellation[]> {
    const date = referenceDate ? new Date(referenceDate) : new Date();
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek;
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return this.classCancellationModel.findAll({
      where: {
        classId: classId,
        date: {
          [Op.gte]: startOfWeek,
          [Op.lte]: endOfWeek
        }
      },
      order: [['date', 'ASC']]
    });
  }

  private async sendCancellationEmailsToStudents(classEntity: Class, dates: string[], reason: string): Promise<void> {
    try {
      if (!classEntity.students || classEntity.students.length === 0) {
        this.logger.log(`Nenhum aluno matriculado na aula ${classEntity.id}. Emails não enviados.`);
        return;
      }

      const studentEmails = classEntity.students
        .map(student => student.email)
        .filter(email => email && email.trim() !== '');

      if (studentEmails.length === 0) {
        this.logger.warn(`Nenhum email válido encontrado para os alunos da aula ${classEntity.id}`);
        return;
      }

      const subjectName = classEntity.subject?.name || 'Disciplina não informada';
      const teacherName = classEntity.teacher?.full_name || 'Professor não informado';
      const className = classEntity.name || subjectName;

      await this.emailQueueService.addClassCancellationEmailJob(
        classEntity.id,
        studentEmails,
        className,
        subjectName,
        dates,
        reason,
        teacherName
      );

      this.logger.log(`Job de email de cancelamento adicionado à fila para ${studentEmails.length} alunos da aula ${classEntity.id}`);
    } catch (error) {
      this.logger.error(`Erro ao adicionar job de email à fila: ${error.message}`, error.stack);
    }
  }
} 