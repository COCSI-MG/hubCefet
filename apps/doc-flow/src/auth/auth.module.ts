import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MagicLoginService } from './magic-login.service';
import { UsersModule } from 'src/users/users.module';
import { EmailModule } from 'src/email/email.module';
import { MagicLink } from './entities/magic-link.entity';
import { User } from 'src/users/entities/user.entity';
import { Profile } from 'src/profile/entities/profile.entity';
import { Role } from 'src/roles/entities/role.entity';
import { ProfileModule } from 'src/profile/profile.module';

@Module({
  imports: [
    UsersModule,
    EmailModule,
    SequelizeModule.forFeature([MagicLink, User, Profile, Role]),
    ProfileModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, MagicLoginService],
  exports: [AuthService, MagicLoginService],
})
export class AuthModule {}
