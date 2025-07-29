import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './entities/role.entity';
import { RoleRepositoryImpl } from './repositories/role.repository';

@Module({
  imports: [SequelizeModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [
    RolesService,
    {
      provide: 'IRoleRepository',
      useClass: RoleRepositoryImpl,
    },
  ],
  exports: [RolesService],
})
export class RolesModule {}



