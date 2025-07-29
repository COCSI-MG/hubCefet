import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject)
    private subjectModel: typeof Subject,
  ) {}

  async findAll(): Promise<Subject[]> {
    return this.subjectModel.findAll({
      include: { all: true },
    });
  }

  async findOne(id: number): Promise<Subject> {
    const subject = await this.subjectModel.findByPk(id, {
      include: { all: true },
    });

    if (!subject) {
      throw new NotFoundException(`Disciplina com ID ${id} não encontrada`);
    }

    return subject;
  }

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    return this.subjectModel.create(createSubjectDto as any);
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
    const subject = await this.findOne(id);
    
    await subject.update(updateSubjectDto);
    await subject.reload();
    
    return subject;
  }

  async remove(id: number): Promise<void> {
    const subject = await this.findOne(id);
    await subject.destroy();
  }
} 