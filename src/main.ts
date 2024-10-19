import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './modules/auth/jwt-auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { UnauthorizedExceptionFilter } from './common/filters/unauthorized-exception/unauthorized-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('service/api/v1');

  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);
  app.useGlobalGuards(new JwtAuthGuard(reflector, configService));
  app.useGlobalFilters(new UnauthorizedExceptionFilter());
  app.enableCors({
    origin: ['http://localhost:4200', 'https://lacasitadelascosturastipicas.com'], // Reemplaza esto con el origen de tu cliente
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Permite el envío de cookies o credenciales
  });
  await app.listen(3000);
}
bootstrap();
