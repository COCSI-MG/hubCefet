import { Module } from '@nestjs/common';
import { TccPresentationsService } from './tcc-presentations.service';
import { TccPresentationsController } from './tcc-presentations.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TccPresentation } from './entities/tcc-presentation.entity';
import { TccPresentationRepositoryImpl } from './repositories/tcc-presentation.repository';
import { TCC_PRESENTATION_REPOSITORY } from './repositories/tcc-presentation.repository.token';

@Module({
  imports: [SequelizeModule.forFeature([TccPresentation])],
  controllers: [TccPresentationsController],
  providers: [
    TccPresentationsService,
    {
      provide: TCC_PRESENTATION_REPOSITORY,
      useClass: TccPresentationRepositoryImpl,
    },
  ],
})
export class TccPresentationsModule {}
