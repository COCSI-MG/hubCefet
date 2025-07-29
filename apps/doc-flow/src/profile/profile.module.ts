import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Profile } from './entities/profile.entity';
import { ProfileRepositoryImpl } from './repositories/profile.repository';
import { PROFILE_REPOSITORY } from './repositories/profile-repository.token';
@Module({
  imports: [SequelizeModule.forFeature([Profile])],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileRepositoryImpl,
    },
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
