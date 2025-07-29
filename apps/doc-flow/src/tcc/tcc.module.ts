import { Module } from '@nestjs/common';
import { TccService } from './tcc.service';
import { TccController } from './tcc.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tcc } from './entities/tcc.entity';
import { TCC_REPOSITORY } from './repositories/tcc-repository.token';
import { TccRepositoryImpl } from './repositories/tcc.repository';

@Module({
  imports: [SequelizeModule.forFeature([Tcc])],
  controllers: [TccController],
  providers: [
    TccService,
    {
      provide: TCC_REPOSITORY,
      useClass: TccRepositoryImpl,
    },
  ],
})
export class TccModule {}
