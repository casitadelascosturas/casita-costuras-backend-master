import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let reflector: Reflector;
  let configService: ConfigService;

  beforeEach(() => {
    // Crear instancias simuladas para las dependencias
    reflector = new Reflector();
    configService = new ConfigService();

    // Pasar las dependencias al constructor de JwtAuthGuard
    jwtAuthGuard = new JwtAuthGuard(reflector, configService);
  });

  it('should be defined', () => {
    expect(jwtAuthGuard).toBeDefined();
  });
});
