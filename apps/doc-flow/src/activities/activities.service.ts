import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { ActivityRepository } from './repositories/activity.repository';
import { ActivityTypeRepository } from './repositories/activity-type.repository';
import { ActivityReviewRepository } from './repositories/activity-review.repository';
import { ActivityReviewerRepository } from './repositories/activity-reviewer.repository';
import { ActivityHistoryRepository } from './repositories/activity-history.repository';
import { ReviewSettingRepository } from './repositories/review-setting.repository';
import { ReviewActivityDto, ReviewDecision } from './dto/review-activity.dto';
import { UploadCertificateDto } from './dto/upload-certificate.dto';
import { Activity, ActivityHistory, ActivityType } from './entities';
import { ProfessorSelectionService } from './services/professor-selection.service';
import { FileUploadService } from './services/file-upload.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityHistoryType } from './enum/activity-history-type.enum';
import { ActivityHistoryLogItemDto, GetActivityResponseDto } from './dto/get-activity-response.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly activityTypeRepository: ActivityTypeRepository,
    private readonly activityReviewRepository: ActivityReviewRepository,
    private readonly activityReviewerRepository: ActivityReviewerRepository,
    private readonly activityHistoryRepository: ActivityHistoryRepository,
    private readonly reviewSettingRepository: ReviewSettingRepository,
    private readonly professorSelectionService: ProfessorSelectionService,
    private readonly fileUploadService: FileUploadService,
  ) { }

  async uploadCertificate(
    uploadDto: UploadCertificateDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Activity> {
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
        complementary_activity_type_id: uploadDto.complementary_activity_type_id
      }, userId, transaction);

      const selectedProfessors = await this.professorSelectionService.selectRandomProfessors(requiredReviewers);

      await this.activityReviewerRepository.createMultipleWithTransaction(activity.id, selectedProfessors, transaction);
      await this.createHistory(
        activity.id,
        userId,
        ActivityHistoryType.CREATED,
        'Atividade criada pelo usuário',
        transaction,
      );

      await transaction.commit();

      return {
        id: activity.id,
        course_name: activity.course_name,
        hours: activity.hours,
        certificate_url: activity.certificate_url,
        activity_type_id: activity.activity_type_id,
        created_at: activity.created_at,
      } as Activity;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async create(
    createDto: CreateActivityDto,
    userId: string,
  ): Promise<Activity> {
    const activityType = await this.activityTypeRepository.findOne(createDto.activity_type_id);
    if (!activityType) {
      throw new NotFoundException('Tipo de atividade não encontrado');
    }

    const sequelize = this.activityRepository.getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const activity = await this.activityRepository.createWithTransaction(createDto, userId, transaction);

      await this.createHistory(
        activity.id,
        userId,
        ActivityHistoryType.CREATED,
        'Atividade criada pelo aluno',
        transaction,
      );

      await transaction.commit();
      return activity;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findAll(): Promise<Activity[]> {
    return this.activityRepository.findAll();
  }

  async findAllByUser(userId: string): Promise<Activity[]> {
    return this.activityRepository.findByUserId(userId);
  }

  async findAllByReviewer(reviewerId: string): Promise<Activity[]> {
    return this.activityRepository.findByReviewer(reviewerId);
  }

  async findOne(id: string): Promise<GetActivityResponseDto> {
    const activity = await this.activityRepository.findOne(id);
    if (!activity) {
      throw new NotFoundException('Atividade  não encontrada');
    }

    return this.mapActivityResponse(activity);
  }

  async update(
    id: string,
    updateDto: UpdateActivityDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<GetActivityResponseDto> {
    const activity = await this.activityRepository.findOne(id);
    if (!activity) {
      throw new NotFoundException('Atividade  não encontrada');
    }

    if (activity.user_id !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar esta atividade');
    }

    if (activity.status_id !== 1) {
      throw new BadRequestException('Não é possível editar uma atividade que já foi avaliada');
    }

    if (file && !this.fileUploadService.validatePdfFile(file)) {
      throw new BadRequestException('Arquivo deve ser um PDF válido');
    }

    if (updateDto.activity_type_id) {
      const activityType = await this.activityTypeRepository.findOne(updateDto.activity_type_id);
      if (!activityType) {
        throw new NotFoundException('Tipo de atividade não encontrado');
      }
    }

    const sequelize = this.activityRepository.getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const updatePayload: Partial<Activity> = {};

      if (typeof updateDto.course_name === 'string' && updateDto.course_name.trim() !== '') {
        updatePayload.course_name = updateDto.course_name;
      }

      if (typeof updateDto.hours === 'number') {
        updatePayload.hours = updateDto.hours;
      }

      if (typeof updateDto.activity_type_id === 'number') {
        updatePayload.activity_type_id = updateDto.activity_type_id;
      }

      if (updateDto.complementary_activity_type_id !== undefined) {
        updatePayload.complementary_activity_type_id = updateDto.complementary_activity_type_id;
      }

      if (file) {
        const filePath = await this.fileUploadService.saveCertificate(file);
        updatePayload.certificate_url = filePath;
      }

      if (Object.keys(updatePayload).length === 0) {
        throw new BadRequestException('Nenhum dado foi informado para atualização');
      }

      await activity.update(updatePayload, { transaction });
      await this.activityReviewRepository.softDeleteByActivity(id, transaction);

      await this.createHistory(
        id,
        userId,
        ActivityHistoryType.EDITED,
        'Atividade atualizada pelo aluno',
        transaction,
      );

      await transaction.commit();
      return this.findOne(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const activity = await this.activityRepository.findOne(id);
    if (!activity) {
      throw new NotFoundException('Atividade  não encontrada');
    }

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
    const activity = await this.activityRepository.findOne(id);
    if (!activity) {
      throw new NotFoundException('Atividade  não encontrada');
    }

    if (activity.status_id !== 1) {
      throw new BadRequestException('Esta atividade já foi avaliada');
    }

    const existingReview = await this.activityReviewRepository.findOne(id, reviewerId);
    if (existingReview) {
      throw new BadRequestException('Você já avaliou esta atividade');
    }

    const sequelize = this.activityRepository.getSequelize();
    const transaction = await sequelize.transaction();

    try {
      await this.activityReviewRepository.create(id, reviewerId, reviewDto, transaction);
      await this.createHistory(
        id,
        reviewerId,
        ActivityHistoryType.REVIEWED,
        this.getReviewHistoryDescription(reviewDto.decision),
        transaction,
      );

      await this.checkAndUpdateActivityStatus(id, transaction);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private async checkAndUpdateActivityStatus(activityId: string, transaction?: any): Promise<void> {
    const requiredReviewers = await this.reviewSettingRepository.getRequiredReviewers();
    const totalReviews = await this.activityReviewRepository.countTotalByActivity(activityId, transaction);
    const approvedCount = await this.activityReviewRepository.countApprovedByActivity(activityId, transaction);
    const rejectedCount = await this.activityReviewRepository.countRejectedByActivity(activityId, transaction);

    if (rejectedCount > 0) {
      await this.activityRepository.updateStatus(activityId, 3, transaction);
      Logger.log(`[REVIEW] Atividade ${activityId} rejeitada por ${rejectedCount} professor(es)`);
      return;
    }

    if (totalReviews >= requiredReviewers && approvedCount === requiredReviewers) {
      await this.activityRepository.updateStatus(activityId, 2, transaction);
      Logger.log(`[REVIEW] Atividade ${activityId} aprovada por todos os ${requiredReviewers} revisores`);
      return;
    }

    if (totalReviews < requiredReviewers) {
      Logger.log(`[REVIEW] Atividade ${activityId} ainda aguardando mais revisões (${totalReviews}/${requiredReviewers})`);
    }
  }

  private async createHistory(
    activityId: string,
    userId: string,
    type: ActivityHistoryType,
    description: string,
    transaction?: any,
  ): Promise<void> {
    if (transaction) {
      await this.activityHistoryRepository.createWithTransaction(
        activityId,
        userId,
        type,
        description,
        transaction,
      );
      return;
    }

    await this.activityHistoryRepository.create(activityId, userId, type, description);
  }

  private getReviewHistoryDescription(decision: ReviewDecision): string {
    if (decision === ReviewDecision.APPROVED) {
      return 'Atividade revisada e aprovada pelo avaliador';
    }

    return 'Atividade revisada e rejeitada pelo avaliador';
  }

  private mapActivityResponse(activity: Activity): GetActivityResponseDto {
    return {
      id: activity.id,
      course_name: activity.course_name,
      hours: activity.hours,
      certificate_url: activity.certificate_url,
      user_id: activity.user_id,
      activity_type_id: activity.activity_type_id,
      status_id: activity.status_id,
      created_at: activity.created_at,
      updated_at: activity.updated_at,
      complementary_activity_type_id: activity.complementary_activity_type_id,
      user: activity.user,
      activityType: activity.activityType,
      status: activity.status,
      complementaryActivityType: activity.complementaryActivityType,
      reviewers: activity.reviewers ?? [],
      history: this.mapActivityHistory(activity.history ?? []),
    };
  }

  private mapActivityHistory(history: ActivityHistory[]): ActivityHistoryLogItemDto[] {
    return history.map((entry) => ({
      id: entry.id,
      activity_id: entry.activity_id,
      user_id: entry.user_id,
      user_name: entry.user?.full_name ?? null,
      type: entry.type,
      action: this.getHistoryActionLabel(entry.type),
      description: entry.description,
      created_at: entry.created_at,
      user: entry.user,
    }));
  }

  private getHistoryActionLabel(type: ActivityHistoryType): string {
    switch (type) {
      case ActivityHistoryType.CREATED:
        return 'CREATE';
      case ActivityHistoryType.EDITED:
        return 'UPDATE';
      case ActivityHistoryType.REVIEWED:
        return 'REVIEW';
      default:
        return 'EVENT';
    }
  }

  private parseOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'number') {
      return Number.isNaN(value) ? undefined : value;
    }

    if (typeof value === 'string') {
      const parsedValue = Number(value);
      return Number.isNaN(parsedValue) ? undefined : parsedValue;
    }

    return undefined;
  }

  async getActivityTypes(): Promise<ActivityType[]> {
    return this.activityTypeRepository.findAll();
  }

  async getPendingActivities(): Promise<Activity[]> {
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
    const activity = await this.activityRepository.findOne(id);
    if (!activity) {
      throw new NotFoundException('Atividade  não encontrada');
    }

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
