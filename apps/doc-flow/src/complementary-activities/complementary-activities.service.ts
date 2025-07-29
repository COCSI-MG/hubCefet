import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { ComplementaryActivityRepository } from './repositories/complementary-activity.repository';
import { ActivityTypeRepository } from './repositories/activity-type.repository';
import { ActivityReviewRepository } from './repositories/activity-review.repository';
import { ActivityReviewerRepository } from './repositories/activity-reviewer.repository';
import { ReviewSettingRepository } from './repositories/review-setting.repository';
import { CreateComplementaryActivityDto } from './dto/create-complementary-activity.dto';
import { UpdateComplementaryActivityDto } from './dto/update-complementary-activity.dto';
import { ReviewActivityDto } from './dto/review-activity.dto';
import { UploadCertificateDto } from './dto/upload-certificate.dto';
import { ComplementaryActivity, ActivityType } from './entities';
import { ProfessorSelectionService } from './services/professor-selection.service';
import { FileUploadService } from './services/file-upload.service';

@Injectable()
export class ComplementaryActivitiesService {
  constructor(
    private readonly activityRepository: ComplementaryActivityRepository,
    private readonly activityTypeRepository: ActivityTypeRepository,
    private readonly activityReviewRepository: ActivityReviewRepository,
    private readonly activityReviewerRepository: ActivityReviewerRepository,
    private readonly reviewSettingRepository: ReviewSettingRepository,
    private readonly professorSelectionService: ProfessorSelectionService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async uploadCertificate(
    uploadDto: UploadCertificateDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<ComplementaryActivity> {
    if (!this.fileUploadService.validatePdfFile(file)) {
      throw new BadRequestException('Arquivo deve ser um PDF válido');
    }

    const activityType = await this.activityTypeRepository.findOne(uploadDto.activity_type_id);
    if (!activityType) {
      throw new NotFoundException('Tipo de atividade não encontrado');
    }

    const requiredReviewers = await this.reviewSettingRepository.getRequiredReviewers();

    try {
      await this.professorSelectionService.selectRandomProfessors(requiredReviewers);
    } catch (error) {
      throw new BadRequestException(
        `Não é possível cadastrar certificado: ${error.message}. `
      );
    }

    const sequelize = this.activityRepository.getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const filePath = await this.fileUploadService.saveCertificate(file);

      const activity = await this.activityRepository.createWithTransaction({
        course_name: uploadDto.course_name,
        hours: uploadDto.hours,
        activity_type_id: uploadDto.activity_type_id,
        certificate_url: filePath,
      }, userId, transaction);

      const selectedProfessors = await this.professorSelectionService.selectRandomProfessors(requiredReviewers);
      
      await this.activityReviewerRepository.createMultipleWithTransaction(activity.id, selectedProfessors, transaction);

      await transaction.commit();

      return {
        id: activity.id,
        course_name: activity.course_name,
        hours: activity.hours,
        certificate_url: activity.certificate_url,
        activity_type_id: activity.activity_type_id,
        created_at: activity.created_at,
      } as ComplementaryActivity;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async create(
    createDto: CreateComplementaryActivityDto,
    userId: string,
  ): Promise<ComplementaryActivity> {
    const activityType = await this.activityTypeRepository.findOne(createDto.activity_type_id);
    if (!activityType) {
      throw new NotFoundException('Tipo de atividade não encontrado');
    }

    return this.activityRepository.create(createDto, userId);
  }

  async findAll(): Promise<ComplementaryActivity[]> {
    return this.activityRepository.findAll();
  }

  async findAllByUser(userId: string): Promise<ComplementaryActivity[]> {
    return this.activityRepository.findByUserId(userId);
  }

  async findAllByReviewer(reviewerId: string): Promise<ComplementaryActivity[]> {
    return this.activityRepository.findByReviewer(reviewerId);
  }

  async findOne(id: string): Promise<ComplementaryActivity> {
    const activity = await this.activityRepository.findOne(id);
    if (!activity) {
      throw new NotFoundException('Atividade complementar não encontrada');
    }
    return activity;
  }

  async update(
    id: string,
    updateDto: UpdateComplementaryActivityDto,
    userId: string,
  ): Promise<ComplementaryActivity> {
    const activity = await this.findOne(id);
    
    if (activity.user_id !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar esta atividade');
    }

    if (activity.status_id !== 1) {
      throw new BadRequestException('Não é possível editar uma atividade que já foi avaliada');
    }

    if (updateDto.activity_type_id) {
      const activityType = await this.activityTypeRepository.findOne(updateDto.activity_type_id);
      if (!activityType) {
        throw new NotFoundException('Tipo de atividade não encontrado');
      }
    }

    const [, [updatedActivity]] = await this.activityRepository.update(id, updateDto);
    return updatedActivity;
  }

  async remove(id: string, userId: string): Promise<void> {
    const activity = await this.findOne(id);
    
    if (activity.user_id !== userId) {
      throw new ForbiddenException('Você não tem permissão para excluir esta atividade');
    }

    if (activity.status_id !== 1) {
      throw new BadRequestException('Não é possível excluir uma atividade que já foi avaliada');
    }

    await this.activityRepository.remove(id);
  }

  async reviewActivity(
    id: string,
    reviewerId: string,
    reviewDto: ReviewActivityDto,
  ): Promise<void> {
    const activity = await this.findOne(id);

    if (activity.status_id !== 1) {
      throw new BadRequestException('Esta atividade já foi avaliada');
    }

    const existingReview = await this.activityReviewRepository.findOne(id, reviewerId);
    if (existingReview) {
      throw new BadRequestException('Você já avaliou esta atividade');
    }

    await this.activityReviewRepository.create(id, reviewerId, reviewDto);

    await this.checkAndUpdateActivityStatus(id);
  }

  private async checkAndUpdateActivityStatus(activityId: string): Promise<void> {
    const requiredReviewers = await this.reviewSettingRepository.getRequiredReviewers();
    const totalReviews = await this.activityReviewRepository.countTotalByActivity(activityId);
    const approvedCount = await this.activityReviewRepository.countApprovedByActivity(activityId);
    const rejectedCount = await this.activityReviewRepository.countRejectedByActivity(activityId);

    if (rejectedCount > 0) {
      await this.activityRepository.updateStatus(activityId, 3);
      Logger.log(`[REVIEW] Atividade ${activityId} rejeitada por ${rejectedCount} professor(es)`);
      return;
    }

    if (totalReviews >= requiredReviewers && approvedCount === requiredReviewers) {
      await this.activityRepository.updateStatus(activityId, 2);
      Logger.log(`[REVIEW] Atividade ${activityId} aprovada por todos os ${requiredReviewers} revisores`);
      return;
    }

    if (totalReviews < requiredReviewers) {
      Logger.log(`[REVIEW] Atividade ${activityId} ainda aguardando mais revisões (${totalReviews}/${requiredReviewers})`);
    }
  }

  async getActivityTypes(): Promise<ActivityType[]> {
    return this.activityTypeRepository.findAll();
  }

  async getPendingActivities(): Promise<ComplementaryActivity[]> {
    return this.activityRepository.findPendingReview();
  }

  async getActivityReviews(activityId: string): Promise<any[]> {
    return this.activityReviewRepository.findByActivity(activityId);
  }

  async getUserActivityStats(userId: string): Promise<any> {
    const activities = await this.activityRepository.findByUserId(userId);
    
    const stats = {
      total: activities.length,
      pending: activities.filter(a => a.status_id === 1).length,
      approved: activities.filter(a => a.status_id === 2).length,
      rejected: activities.filter(a => a.status_id === 3).length,
      totalHours: activities
        .filter(a => a.status_id === 2)
        .reduce((sum, a) => sum + a.hours, 0),
    };

    return stats;
  }

  async getReviewSettings(): Promise<{ requiredReviewers: number }> {
    const requiredReviewers = await this.reviewSettingRepository.getRequiredReviewers();
    return { requiredReviewers };
  }

  async downloadCertificate(
    id: string,
    res: Response,
    userId: string,
  ): Promise<void> {
    const activity = await this.findOne(id);

    const isOwner = activity.user_id === userId;
    const isReviewer = await this.activityReviewerRepository.findByActivity(id);
    const userIsReviewer = isReviewer.some(reviewer => reviewer.reviewer_user_id === userId);

    if (!isOwner && !userIsReviewer) {
      throw new ForbiddenException('Você não tem permissão para baixar este certificado');
    }

    if (!activity.certificate_url) {
      throw new NotFoundException('Certificado não encontrado');
    }

    const uploadsDir = process.env.PDF_STORAGE_PATH || './storage/certificates';
    const fileName = activity.certificate_url.replace('certificates/', '');
    const fullPath = join(uploadsDir, fileName);

    if (!existsSync(fullPath)) {
      Logger.error(`[DOWNLOAD] Arquivo não encontrado: ${fullPath}`);
      throw new NotFoundException('Certificado não encontrado no sistema de arquivos');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = createReadStream(fullPath);
    fileStream.pipe(res);
  }
} 
 
 