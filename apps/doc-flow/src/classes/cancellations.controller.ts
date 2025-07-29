import { Controller, Get, Query, Request, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClassesService } from './services/classes.service';

@ApiTags('Cancelamentos')
@Controller('all-cancellations')
export class CancellationsController {
  private readonly logger = new Logger(CancellationsController.name);

  constructor(private readonly classesService: ClassesService) {}

  private extractUserInfo(req: any) {
    const userId = req.user?.sub || req.user?.id;
    
    let profileName = req.user?.profile?.name;
    
    if (!profileName && req.user?.profile) {
      profileName = typeof req.user.profile === 'string' 
        ? req.user.profile 
        : req.user.profile.roles?.[0] || req.user.profile.name;
    }
    
    return { userId, profileName };
  }

  @ApiOperation({ summary: 'Listar todos os cancelamentos' })
  @ApiResponse({ status: 200, description: 'Lista de todos os cancelamentos obtida com sucesso' })
  @Get()
  async getAllCancellations(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Request() req?: any
  ) {
    const { userId, profileName } = this.extractUserInfo(req);
    
    return this.classesService.getAllCancellations(startDate, endDate, userId, profileName);
  }
} 
