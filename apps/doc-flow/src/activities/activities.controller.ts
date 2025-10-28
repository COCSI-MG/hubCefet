import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { ReviewActivityDto } from './dto/review-activity.dto';
import { UploadCertificateDto } from './dto/upload-certificate.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@ApiTags('Activities')
@Controller('activities')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
  ) { }

  @Post('upload')
  @ApiOperation({ summary: 'Upload de certificado com dados da atividade' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dados da atividade e arquivo PDF',
    type: UploadCertificateDto,
  })
  @ApiResponse({ status: 201, description: 'Certificado enviado e 3 professores selecionados para avaliação' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido ou dados incorretos' })
  @ApiResponse({ status: 404, description: 'Tipo de atividade não encontrado' })
  @UseInterceptors(
    FileInterceptor('certificate', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.pdf$/i)) {
          return cb(new BadRequestException('Apenas arquivos PDF são permitidos'), false);
        }
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Apenas arquivos PDF são permitidos'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadCertificate(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadCertificateDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo PDF é obrigatório');
    }

    if (!req.user || !req.user.sub) {
      throw new BadRequestException('Usuário não autenticado');
    }

    return this.activitiesService.uploadCertificate(uploadDto, file, req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova atividade' })
  @ApiResponse({ status: 201, description: 'Atividade criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Tipo de atividade não encontrado' })
  create(
    @Body() createDto: CreateActivityDto,
    @Request() req: any,
  ) {
    return this.activitiesService.create(createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as atividades (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de atividades' })
  findAll() {
    return this.activitiesService.findAll();
  }

  @Get('my-activities')
  @ApiOperation({ summary: 'Listar minhas atividades' })
  @ApiResponse({ status: 200, description: 'Lista das atividades do usuário' })
  findMyActivities(@Request() req: any) {
    return this.activitiesService.findAllByUser(req.user.sub);
  }

  @Get('pending-review')
  @ApiOperation({ summary: 'Listar atividades pendentes de avaliação' })
  @ApiResponse({ status: 200, description: 'Lista de atividades pendentes' })
  findPendingReview() {
    return this.activitiesService.getPendingActivities();
  }

  @Get('for-review')
  @ApiOperation({ summary: 'Listar atividades para minha avaliação' })
  @ApiResponse({ status: 200, description: 'Lista de atividades para avaliar' })
  findForReview(@Request() req: any) {
    return this.activitiesService.findAllByReviewer(req.user.sub);
  }

  @Get('types')
  @ApiOperation({ summary: 'Listar tipos de atividades' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de atividades' })
  getActivityTypes() {
    return this.activitiesService.getActivityTypes();
  }

  @Get('my-stats')
  @ApiOperation({ summary: 'Obter estatísticas das minhas atividades' })
  @ApiResponse({ status: 200, description: 'Estatísticas do usuário' })
  getMyStats(@Request() req: any) {
    return this.activitiesService.getUserActivityStats(req.user.sub);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Obter configurações de review' })
  @ApiResponse({ status: 200, description: 'Configurações de review' })
  getReviewSettings() {
    return this.activitiesService.getReviewSettings();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar atividade por ID' })
  @ApiResponse({ status: 200, description: 'Dados da atividade' })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada' })
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Listar avaliações de uma atividade' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações' })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada' })
  getActivityReviews(@Param('id') id: string) {
    return this.activitiesService.getActivityReviews(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar atividade' })
  @ApiResponse({ status: 200, description: 'Atividade atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou atividade já avaliada' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar' })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateActivityDto,
    @Request() req: any,
  ) {
    return this.activitiesService.update(id, updateDto, req.user.sub);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Avaliar atividade' })
  @ApiResponse({ status: 200, description: 'Avaliação realizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Atividade já avaliada pelo usuário' })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada' })
  reviewActivity(
    @Param('id') id: string,
    @Body() reviewDto: ReviewActivityDto,
    @Request() req: any,
  ) {
    return this.activitiesService.reviewActivity(
      id,
      req.user.sub,
      reviewDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir atividade' })
  @ApiResponse({ status: 200, description: 'Atividade excluída com sucesso' })
  @ApiResponse({ status: 400, description: 'Atividade já avaliada' })
  @ApiResponse({ status: 403, description: 'Sem permissão para excluir' })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.activitiesService.remove(id, req.user.sub);
  }

  @Get(':id/download-certificate')
  @ApiOperation({ summary: 'Baixar certificado de uma atividade (próprio usuário ou professores revisores)' })
  @ApiResponse({ status: 200, description: 'Certificado baixado com sucesso' })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas o próprio usuário ou professores revisores' })
  downloadCertificate(
    @Param('id') id: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    return this.activitiesService.downloadCertificate(id, res, req.user.sub);
  }
}


