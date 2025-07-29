import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { loadSwagger } from './lib/load-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  loadSwagger(app);
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    whitelist: true
  }));
  app.enableCors({
    exposedHeaders: ['Content-Disposition'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
