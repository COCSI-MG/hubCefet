import { Injectable, NotFoundException, UnauthorizedException, Logger, BadRequestException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Class, ClassStudent } from './entities';
import { ClassCancellation } from './entities/class-cancellation.entity';
import { Building } from '../buildings/entities/building.entity';
import { Room } from '../rooms/entities/room.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Semester } from '../semesters/entities/semester.entity';
import { ClassSchedule } from '../schedules/entities/class-schedule.entity';
import { User } from '../users/entities/user.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { CancelClassDto } from './dto/cancel-class.dto';
import { Op } from 'sequelize';
import { TimeSlot } from '../schedules/entities/time-slot.entity';
import { TimeSlotsService } from '../schedules/services/time-slots.service';
import { format, parseISO } from 'date-fns';

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(
    @InjectModel(Class) private classModel: typeof Class,
    @InjectModel(ClassStudent) private classStudentModel: typeof ClassStudent,
    @InjectModel(ClassCancellation) private classCancellationModel: typeof ClassCancellation,
    @Inject(forwardRef(() => TimeSlotsService)) private timeSlotsService: TimeSlotsService,
  ) {}

  async findAll(semesterId?: number, userId?: string, profileName?: string): Promise<Class[]> {

    if (process.env.APP_ENV === 'development' && !userId) {
      userId = 'dev-admin';
      profileName = profileName || 'admin';
    } else if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const options: any = {
      include: [
        { model: Subject },
        { 
          model: Semester,
          attributes: ['id', 'year', 'number', 'start_date', 'end_date', 'created_at', 'updated_at']
        },
        { model: User, as: 'teacher' },
        { 
          model: Room,
          as: 'room',
          required: false,
          include: [{ model: Building, as: 'building', required: false }]
        },
        { 
          model: ClassSchedule, 
          include: [
            Room,
            { model: TimeSlot, attributes: ['id', 'startTime', 'endTime', 'dayOfWeek'] }
          ] 
        },
        {
          model: ClassCancellation,
          as: 'cancellations',
          required: false
        }
      ],
    };

    options.include.push({
      model: User,
      as: 'students',
      attributes: ['id', 'full_name', 'email', 'enrollment'],
      required: false
    });

    if (semesterId) {
      options.where = { ...options.where, semesterId };
    }

    const isDevAdmin = userId === 'dev-admin';

    if (profileName && !isDevAdmin) {
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
    } else if (!isDevAdmin) {
      options.where = {
        ...options.where,
        [Op.or]: [
          { teacherId: userId },
          { '$students.id$': userId }
        ]
      };
    }

    const classes = await this.classModel.findAll(options);
    
    const today = new Date();
    const currentDate = format(today, 'yyyy-MM-dd');
    
    return classes.map(cls => {
      if (cls.semester) {
        const semesterObj = (cls.semester as any).toJSON();
        semesterObj.name = `${(cls.semester as any).year}.${(cls.semester as any).number}`;
        
        semesterObj.started_at = (cls.semester as any).start_date;
        semesterObj.ended_at = (cls.semester as any).end_date;
        
        cls.semester = semesterObj as any;
      }
      
      const cancellations = (cls as any).cancellations || [];
      const futureCancellations = cancellations.filter(
        (cancellation: ClassCancellation) => 
          format(new Date(cancellation.date), 'yyyy-MM-dd') >= currentDate
      );
      
      if (futureCancellations.length > 0) {
        (cls as any).isCancelled = true;
        (cls as any).cancellationDates = futureCancellations.map(
          (cancellation: ClassCancellation) => format(new Date(cancellation.date), 'yyyy-MM-dd')
        );
      } else {
        (cls as any).isCancelled = false;
        (cls as any).cancellationDates = [];
      }
      
      return cls;
    });
  }

  async findAllPublic(semesterId?: number): Promise<Class[]> {
    const options: any = {
      include: [
        { model: Subject },
        { 
          model: Semester,
          attributes: ['id', 'year', 'number', 'start_date', 'end_date', 'created_at', 'updated_at']
        },
        { model: User, as: 'teacher' },
        { 
          model: Room,
          as: 'room',
          required: false,
          include: [{ model: Building, as: 'building', required: false }]
        },
        { 
          model: ClassSchedule, 
          include: [
            Room,
            { model: TimeSlot, attributes: ['id', 'startTime', 'endTime', 'dayOfWeek'] }
          ] 
        },
        {
          model: ClassCancellation,
          as: 'cancellations',
          required: false
        }
      ],
    };

    if (semesterId) {
      options.where = { semesterId };
    }

    const classes = await this.classModel.findAll(options);
    
    const today = new Date();
    const currentDate = format(today, 'yyyy-MM-dd');
    
    return classes.map(cls => {
      if (cls.semester) {
        const semesterObj = (cls.semester as any).toJSON();
        semesterObj.name = `${(cls.semester as any).year}.${(cls.semester as any).number}`;
        
        semesterObj.started_at = (cls.semester as any).start_date;
        semesterObj.ended_at = (cls.semester as any).end_date;
        
        cls.semester = semesterObj as any;
      }
      
      const cancellations = (cls as any).cancellations || [];
      const futureCancellations = cancellations.filter(
        (cancellation: ClassCancellation) => 
          format(new Date(cancellation.date), 'yyyy-MM-dd') >= currentDate
      );
      
      if (futureCancellations.length > 0) {
        (cls as any).isCancelled = true;
        (cls as any).cancellationDates = futureCancellations.map(
          (cancellation: ClassCancellation) => format(new Date(cancellation.date), 'yyyy-MM-dd')
        );
      } else {
        (cls as any).isCancelled = false;
        (cls as any).cancellationDates = [];
      }
      
      return cls;
    });
  }

  async findOne(id: number, userId?: string, profileName?: string): Promise<Class> {

    if (process.env.APP_ENV === 'development' && !userId) {
      userId = 'dev-admin';
      profileName = profileName || 'admin';
      this.logger.log(`Modo de desenvolvimento: usando ID de usuário: ${userId}`);
    } else if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const options: any = {
      include: [
        { model: Subject },
        { 
          model: Semester,
          attributes: ['id', 'year', 'number', 'start_date', 'end_date', 'created_at', 'updated_at']
        },
        { model: User, as: 'teacher' },
        { 
          model: Room,
          as: 'room',
          required: false,
          include: [{ model: Building, as: 'building', required: false }]
        },
        { 
          model: ClassSchedule, 
          include: [
            Room,
            { model: TimeSlot, attributes: ['id', 'startTime', 'endTime', 'dayOfWeek'] }
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

    const isDevAdmin = userId === 'dev-admin';

    if (profileName && !isDevAdmin) {
      const profileLower = profileName.toLowerCase();
      const isAdmin = ['admin', 'coordinator'].includes(profileLower);
      
      if (isAdmin) {
        options.include.push({
          model: User,
          as: 'students',
          attributes: ['id', 'full_name', 'email', 'enrollment'],
          required: false
        });
      } else if (profileLower === 'professor') {
        options.where.teacherId = userId;
        
        options.include.push({
          model: User,
          as: 'students',
          attributes: ['id', 'full_name', 'email', 'enrollment'],
          required: false
        });
      } else {
        
        options.include.push({
          model: User,
          as: 'students',
          where: { id: userId },
          attributes: ['id', 'full_name', 'email', 'enrollment'],
          required: true
        });
      }
    } else if (!isDevAdmin) {
      options.include.push({
        model: User,
        as: 'students',
        where: { id: userId },
        attributes: ['id', 'full_name', 'email', 'enrollment'],
        required: true
      });
    } else {
      options.include.push({
        model: User,
        as: 'students',
        attributes: ['id', 'full_name', 'email', 'enrollment'],
        required: false
      });
    }

    const classEntity = await this.classModel.findOne(options);
    
    if (!classEntity) {
      throw new NotFoundException(`Aula com ID ${id} não encontrada ou você não tem acesso a ela`);
    }

    
    if (classEntity.semester) {
      const semesterObj = (classEntity.semester as any).toJSON();
      semesterObj.name = `${(classEntity.semester as any).year}.${(classEntity.semester as any).number}`;
      
      semesterObj.started_at = (classEntity.semester as any).start_date;
      semesterObj.ended_at = (classEntity.semester as any).end_date;
      
      classEntity.semester = semesterObj as any;
    }
    
    const today = new Date();
    const currentDate = format(today, 'yyyy-MM-dd');
    const cancellations = (classEntity as any).cancellations || [];
    const futureCancellations = cancellations.filter(
      (cancellation: ClassCancellation) => 
        format(new Date(cancellation.date), 'yyyy-MM-dd') >= currentDate
    );
    
    if (futureCancellations.length > 0) {
      (classEntity as any).isCancelled = true;
      (classEntity as any).cancellationDates = futureCancellations.map(
        (cancellation: ClassCancellation) => format(new Date(cancellation.date), 'yyyy-MM-dd')
      );
    } else {
      (classEntity as any).isCancelled = false;
      (classEntity as any).cancellationDates = [];
    }
    
    return classEntity;
  }

  async create(createClassDto: CreateClassDto, userId?: string, profileName?: string): Promise<Class> {
    
    const isDevAdmin = userId === 'dev-admin';
    if (isDevAdmin) {
      try {
        const classData = {
          name: createClassDto.name,
          subjectId: createClassDto.subjectId,
          semesterId: createClassDto.semesterId,
          teacherId: createClassDto.teacherId || '00000000-0000-0000-0000-000000000000',
        };
        
        const newClass = await this.classModel.create(classData as any);
        return newClass;
      } catch (error) {
        this.logger.error(`Erro ao criar aula no modo dev-admin: ${error.message}`);
        throw error;
      }
    }
    
    const profileLower = profileName?.toLowerCase() || '';
    const isAdmin = ['admin', 'coordinator'].includes(profileLower);
    const isProfessor = profileLower === 'professor';
    
    if (!isAdmin && !isProfessor) {
      throw new UnauthorizedException('Apenas administradores e professores podem criar aulas');
    }
    
    if (isProfessor && createClassDto.teacherId && createClassDto.teacherId !== userId) {
      throw new UnauthorizedException('Você só pode criar aulas para você mesmo como professor');
    }
    
    const classData = {
      name: createClassDto.name,
      subjectId: createClassDto.subjectId,
      semesterId: createClassDto.semesterId,
      teacherId: createClassDto.teacherId || userId,
    };
    
    try {
      const newClass = await this.classModel.create(classData as any);
      return newClass;
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        const fields = error.fields || (error.index ? [error.index] : ['unknown field']);
        throw new BadRequestException(`Erro de chave estrangeira: ${fields.join(', ')}. Verifique se os IDs fornecidos (disciplina, semestre, professor) existem e são válidos.`);
      }
      if (error.name === 'SequelizeValidationError') {
         throw new BadRequestException(`Erro de validação do Sequelize: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new InternalServerErrorException(`Erro ao criar aula no banco de dados: ${error.message || 'Erro desconhecido'}`);
    }
  }

  async update(id: number, updateClassDto: UpdateClassDto, userId?: string, profileName?: string): Promise<Class> {
    const classEntity = await this.findOne(id, userId, profileName);
    
    if (profileName === 'professor' && classEntity.teacherId !== userId) {
      throw new UnauthorizedException('Você só pode atualizar suas próprias aulas');
    }
    
    if (updateClassDto.teacherId && updateClassDto.teacherId !== classEntity.teacherId) {
      if (!['admin', 'coordinator'].includes(profileName.toLowerCase())) {
        throw new UnauthorizedException('Apenas administradores podem alterar o professor de uma aula');
      }
    }
    
    const fieldsToUpdate: Partial<Class> = {};
    if (updateClassDto.name) fieldsToUpdate.name = updateClassDto.name;
    if (updateClassDto.subjectId) fieldsToUpdate.subjectId = updateClassDto.subjectId;
    if (updateClassDto.semesterId) fieldsToUpdate.semesterId = updateClassDto.semesterId;
    if (updateClassDto.teacherId && (profileName === 'admin' || profileName === 'professor')) {
        fieldsToUpdate.teacherId = updateClassDto.teacherId;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return classEntity;
    }

    await classEntity.update(fieldsToUpdate);
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
    
    return this.classStudentModel.bulkCreate(enrollments);
  }

  async removeStudent(classId: number, studentId: string, userId?: string, profileName?: string): Promise<void> {
    const classEntity = await this.findOne(classId, userId, profileName);
    
    if (profileName === 'professor' && classEntity.teacherId !== userId) {
      throw new UnauthorizedException('Você só pode remover alunos das suas próprias aulas');
    }
    
    if (profileName === 'student') {
      throw new UnauthorizedException('Alunos não têm permissão para cancelar matrícula');
    }
    
    const deleted = await this.classStudentModel.destroy({
      where: {
        classId,
        studentId,
      },
    });
    
    if (deleted === 0) {
      throw new NotFoundException(
        `Aluno ${studentId} não está matriculado na aula ${classId}`
      );
    }
  }

  async searchStudentsByName(
    classId: number, 
    searchTerm: string = '', 
    userId?: string, 
    profileName?: string
  ): Promise<Class> {
    
    if (profileName && profileName.toLowerCase() === 'student') {
      throw new UnauthorizedException('Alunos não têm permissão para acessar a lista de outros alunos');
    }
    
    const classEntity = await this.findOne(classId, userId, profileName);
    
    if (!classEntity) {
      throw new NotFoundException(`Aula com ID ${classId} não encontrada`);
    }
    
    const options: any = {
      include: [
        { model: Subject },
        { model: Semester },
        { model: User, as: 'teacher' },
        { 
          model: Room,
          include: [Building]
        },
        { 
          model: ClassSchedule, 
          include: [
            Room,
            { model: TimeSlot, attributes: ['id', 'startTime', 'endTime', 'dayOfWeek'] }
          ] 
        },
      ],
      where: { id: classId }
    };
    
    const studentsOptions: any = {
      model: User,
      as: 'students',
      attributes: ['id', 'full_name', 'email', 'enrollment'],
      required: false
    };
    
    if (searchTerm && searchTerm.trim() !== '') {
      studentsOptions.where = {
        [Op.or]: [
          { full_name: { [Op.iLike]: `%${searchTerm.trim()}%` } },
          { email: { [Op.iLike]: `%${searchTerm.trim()}%` } }
        ]
      };
    }
    
    options.include.push(studentsOptions);
    
    const classWithFilteredStudents = await this.classModel.findByPk(classId, options);
    
    if (!classWithFilteredStudents) {
      throw new NotFoundException(`Aula com ID ${classId} não encontrada`);
    }
    
    return classWithFilteredStudents;
  }

  async cancelClasses(
    classId: number, 
    cancelClassDto: CancelClassDto, 
    userId: string, 
    profileName: string
  ): Promise<ClassCancellation[]> {
    
    const classEntity = await this.findOne(classId, userId, profileName);
    
    if (!classEntity) {
      throw new NotFoundException(`Aula com ID ${classId} não encontrada`);
    }
    
    const isAdmin = ['admin', 'coordinator'].includes(profileName.toLowerCase());
    if (!isAdmin && classEntity.teacherId !== userId) {
      throw new UnauthorizedException('Apenas o professor da aula ou administradores podem cancelar aulas');
    }
    
    let canceledBy = userId;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      canceledBy = classEntity.teacherId || '00000000-0000-0000-0000-000000000000';
    }
    
    const semester = classEntity.semester;
    if (!semester || !semester.start_date || !semester.end_date) {
      throw new BadRequestException('Não foi possível determinar o período do semestre');
    }
    
    const semesterStartStr = semester.start_date instanceof Date 
      ? format(semester.start_date, 'yyyy-MM-dd')
      : typeof semester.start_date === 'string' 
        ? semester.start_date 
        : String(semester.start_date);
        
    const semesterEndStr = semester.end_date instanceof Date 
      ? format(semester.end_date, 'yyyy-MM-dd')
      : typeof semester.end_date === 'string' 
        ? semester.end_date 
        : String(semester.end_date);
    
    const semesterStart = parseISO(semesterStartStr);
    const semesterEnd = parseISO(semesterEndStr);
    
    if (!classEntity.schedules || classEntity.schedules.length === 0) {
      throw new BadRequestException('A aula não tem agendamentos definidos');
    }
    
    const classSchedule = classEntity.schedules[0];
    if (!classSchedule || !classSchedule.time_slot) {
      throw new BadRequestException('Agendamento da aula não encontrado ou incompleto');
    }
    
    const timeSlot = classSchedule.time_slot;
    
    const weekdayIndex = this.getWeekdayIndex(timeSlot.dayOfWeek);
    const weekdays = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
    const weekdayName = weekdays[weekdayIndex];
    
    if (weekdayIndex === -1) {
      throw new BadRequestException(`Dia da semana não reconhecido para o horário da aula`);
    }
    
    const validDates: Date[] = [];
    const adjustedDates: Date[] = [];
    
    for (const dateStr of cancelClassDto.dates) {
      try {
        
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length !== 3) {
          this.logger.warn(`Formato de data inválido: ${dateStr}`);
          continue;
        }
        
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        
        const date = new Date(year, month, day);
        
        const formattedDate = format(date, 'yyyy-MM-dd');
        const formattedSemesterStart = format(semesterStart, 'yyyy-MM-dd');
        const formattedSemesterEnd = format(semesterEnd, 'yyyy-MM-dd');
        
        
        if (formattedDate < formattedSemesterStart || formattedDate > formattedSemesterEnd) {
          continue;
        }
        
        const dayOfWeek = date.getDay();
        
        if (dayOfWeek === weekdayIndex) {
          validDates.push(date);
          this.logger.debug(`Data ${dateStr} validada com sucesso`);
          continue;
        }
        
        const dateMinus1 = new Date(year, month, day - 1);
        const datePlus1 = new Date(year, month, day + 1);
        
        if (dateMinus1.getDay() === weekdayIndex) {
          adjustedDates.push(dateMinus1);
          continue;
        }
        
        if (datePlus1.getDay() === weekdayIndex) {
          adjustedDates.push(datePlus1);
          continue;
        }
        
        
      } catch (error) {
        this.logger.error(`Erro ao processar data ${dateStr}:`, error);
      }
    }
    
    if (adjustedDates.length > 0) {
      validDates.push(...adjustedDates);
    }
    
    if (validDates.length === 0) {
      throw new BadRequestException(`Nenhuma data válida para cancelamento. Verifique se as datas selecionadas correspondem ao dia da semana da aula (${weekdayName}).`);
    }
    
    const existingCancellations = await this.classCancellationModel.findAll({
      where: {
        class_id: classId,
        date: {
          [Op.in]: validDates.map(date => format(date, 'yyyy-MM-dd')),
        },
      },
    });
    
    if (existingCancellations.length > 0) {
      const existingDates = existingCancellations.map(
        cancel => format(new Date(cancel.date), 'yyyy-MM-dd')
      );
      
      
      const filteredDates = validDates.filter(
        date => !existingDates.includes(format(date, 'yyyy-MM-dd'))
      );
      
      if (filteredDates.length === 0) {
        throw new BadRequestException('Todas as datas selecionadas já foram canceladas');
      }
      
      validDates.length = 0;
      validDates.push(...filteredDates);
    }
    
    const cancellations = validDates.map(date => ({
      classId: classId,
      date: format(date, 'yyyy-MM-dd'),
      reason: cancelClassDto.reason,
      canceledBy: canceledBy,
      studentsNotified: false,
    }));
    
    
    try {
      const result = await this.classCancellationModel.bulkCreate(cancellations, {
        fields: ['classId', 'date', 'reason', 'canceledBy', 'studentsNotified'],
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao salvar cancelamentos: ${error.message}`);
    }
  }
  
  async getClassCancellations(classId: number, userId: string, profileName: string): Promise<ClassCancellation[]> {
    if (userId === 'dev-admin') {
      return this.classCancellationModel.findAll({
        where: { class_id: classId },
        order: [['date', 'ASC']],
      });
    }
    
    await this.findOne(classId, userId, profileName);
    
    return this.classCancellationModel.findAll({
      where: { class_id: classId },
      order: [['date', 'ASC']],
    });
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

  private async validateTimeSlot(timeSlotId: number): Promise<void> {
    try {
      const timeSlot = await this.timeSlotsService.findOne(timeSlotId);
      if (!timeSlot) {
        throw new NotFoundException(`Horário com ID ${timeSlotId} não encontrado`);
      }
    } catch (error) {
      throw new NotFoundException(`Horário com ID ${timeSlotId} não encontrado`);
    }
  }

  private getWeekdayIndex(dayOfWeek: string): number {
    const weekdays = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
    return weekdays.indexOf(dayOfWeek);
  }
}