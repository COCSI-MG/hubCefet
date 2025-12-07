import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MagicLoginService } from './magic-login.service';
import { UsersModule } from 'src/users/users.module';
import { EmailModule } from 'src/email/email.module';
import { MagicLink } from './entities/magic-link.entity';
import { ProfileModule } from 'src/profile/profile.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    UsersModule,
    EmailModule,
    SequelizeModule.forFeature([MagicLink]),
    ProfileModule,
    RolesModule
  ],
  controllers: [AuthController],
  providers: [AuthService, MagicLoginService],
  exports: [AuthService, MagicLoginService],
})
export class AuthModule { }
