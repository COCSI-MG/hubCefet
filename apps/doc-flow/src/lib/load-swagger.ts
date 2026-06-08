import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { File } from 'src/files/entities/file.entity';

export function loadSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Doc Flow API')
    .setDescription('The Doc Flow API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      extraModels: [File],
    });
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: '/api-json',
  });
}
