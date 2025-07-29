import { Injectable, NotFoundException, InternalServerErrorException, Logger, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Semester } from './entities/semester.entity';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { Op } from 'sequelize';

@Injectable()
export class SemestersService {
  private readonly logger = new Logger(SemestersService.name);

  constructor(
    @InjectModel(Semester)
    private semesterModel: typeof Semester,
  ) {}

  async findAll(): Promise<Semester[]> {
    try {
      return await this.semesterModel.findAll({
        order: [['year', 'DESC'], ['number', 'DESC']],
      });
    } catch (error) {
      throw new InternalServerErrorException('Ocorreu um erro ao buscar os semestres');
    }
  }

  async findOne(id: number): Promise<Semester> {
    try {
      const semester = await this.semesterModel.findByPk(id);

      if (!semester) {
        throw new NotFoundException(`Semestre com ID ${id} não encontrado`);
      }

      return semester;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erro ao buscar semestre ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Ocorreu um erro ao buscar o semestre ${id}`);
    }
  }

  private async checkPeriodOverlap(
    number: number, 
    startDate: string | Date, 
    endDate: string | Date, 
    excludeId?: number
  ): Promise<boolean> {
    try {
      const whereClause: any = {
        number,
        [Op.and]: [
          {
            [Op.or]: [
              {
                [Op.and]: [
                  { start_date: { [Op.lte]: startDate } },
                  { end_date: { [Op.gte]: startDate } }
                ]
              },
              {
                [Op.and]: [
                  { start_date: { [Op.lte]: endDate } },
                  { end_date: { [Op.gte]: endDate } }
                ]
              },
              {
                [Op.and]: [
                  { start_date: { [Op.gte]: startDate } },
                  { end_date: { [Op.lte]: endDate } }
                ]
              }
            ]
          }
        ]
      };

      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const overlappingSemesters = await this.semesterModel.findAll({
        where: whereClause
      });
      
      return overlappingSemesters.length > 0;
    } catch (error) {
      throw new InternalServerErrorException('Ocorreu um erro ao verificar sobreposição de períodos');
    }
  }

  async create(createSemesterDto: CreateSemesterDto): Promise<Semester> {
    try {
      const { year, number, start_date, end_date } = createSemesterDto;
      
      if (new Date(start_date) > new Date(end_date)) {
        throw new ConflictException('A data de término deve ser posterior à data de início');
      }

      const hasOverlap = await this.checkPeriodOverlap(number, start_date, end_date);
      if (hasOverlap) {
        throw new ConflictException(`Já existe um período com número ${number} que se sobrepõe às datas informadas`);
      }

      const data = {
        year,
        number,
        start_date: start_date || null,
        end_date: end_date || null,
      };
      
      return await this.semesterModel.create(data);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Ocorreu um erro ao criar o semestre');
    }
  }

  async update(id: number, updateSemesterDto: UpdateSemesterDto): Promise<Semester> {
    try {
      const semester = await this.findOne(id);
      
      if (
        (updateSemesterDto.number && updateSemesterDto.number !== semester.number) ||
        updateSemesterDto.start_date || 
        updateSemesterDto.end_date
      ) {
        const number = updateSemesterDto.number || semester.number;
        const startDate = updateSemesterDto.start_date || semester.start_date;
        const endDate = updateSemesterDto.end_date || semester.end_date;
        
        if (new Date(startDate) > new Date(endDate)) {
          throw new ConflictException('A data de término deve ser posterior à data de início');
        }

        const hasOverlap = await this.checkPeriodOverlap(number, startDate, endDate, id);
        if (hasOverlap) {
          throw new ConflictException(`Já existe um período com número ${number} que se sobrepõe às datas informadas`);
        }
      }
      
      const data = {
        year: updateSemesterDto.year !== undefined ? updateSemesterDto.year : semester.year,
        number: updateSemesterDto.number !== undefined ? updateSemesterDto.number : semester.number,
        start_date: updateSemesterDto.start_date || semester.start_date,
        end_date: updateSemesterDto.end_date || semester.end_date,
      };
      
      await semester.update(data);
      await semester.reload();
      
      return semester;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(`Ocorreu um erro ao atualizar o semestre ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const semester = await this.findOne(id);
      await semester.destroy();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Ocorreu um erro ao remover o semestre ${id}`);
    }
  }
} 