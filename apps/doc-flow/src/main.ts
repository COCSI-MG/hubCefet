import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { loadSwagger } from './lib/load-swagger';
import { ResponseInterceptor } from './lib/interceptors/response.interceptor';
import { HttpExceptionFilter } from './lib/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  loadSwagger(app);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    whitelist: true
  }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    exposedHeaders: ['Content-Disposition'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
