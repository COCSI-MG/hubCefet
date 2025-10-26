import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { File } from 'src/files/entities/file.entity';
import { Role } from 'src/roles/entities/role.entity';
import { TccPresentation } from 'src/tcc-presentations/entities/tcc-presentation.entity';
import { TccStudents } from 'src/tcc-students/entities/tcc-students.entity';
import { Tcc } from 'src/tcc/entities/tcc.entity';

export function loadSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Doc Flow API')
    .setDescription('The Doc Flow API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      extraModels: [Role, Tcc, TccPresentation, TccStudents, File],
    });
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: '/api-json',
  });
}
