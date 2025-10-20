import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { RolesModule } from './roles/roles.module';
import { FilesModule } from './files/files.module';
import { PresencesModule } from './presences/presences.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ProfileGuard } from './profile/profile.guard';
import { RolesGuard } from './roles/roles.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { TccModule } from './tcc/tcc.module';
import { TccPresentationsModule } from './tcc-presentations/tcc-presentations.module';
import { TccStudentsModule } from './tcc-students/tcc-students.module';
import { BuildingsModule } from './buildings/buildings.module';
import { RoomsModule } from './rooms/rooms.module';
import { SubjectsModule } from './subjects/subjects.module';
import { SemestersModule } from './semesters/semesters.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ClassesModule } from './classes/classes.module';
import { EmailModule } from './email/email.module';
import { QueuesModule } from './queues/queues.module';
import { ComplementaryActivitiesModule } from './complementary-activities/complementary-activities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    ScheduleModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadModels: true,
      logging: true,
      models: [__dirname + '/**/*.entity{.ts, .js}'],
      modelMatch: (filename, member) => {
        return (
          filename.substring(0, filename.indexOf('.entity')) ===
          member.toLowerCase()
        );
      },
      define: {
        underscored: false,
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
    ProfileModule,
    RolesModule,
    AuthModule,
    EventsModule,
    FilesModule,
    PresencesModule,
    TccModule,
    TccPresentationsModule,
    TccStudentsModule,
    BuildingsModule,
    RoomsModule,
    SubjectsModule,
    SemestersModule,
    ClassesModule,
    SchedulesModule,
    EmailModule,
    QueuesModule,
    ComplementaryActivitiesModule,
  ],
  controllers: [],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ProfileGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
