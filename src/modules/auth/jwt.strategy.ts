// src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      // Configuración de la estrategia JWT
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extraer el JWT del encabezado 'Authorization: Bearer <token>'
      ignoreExpiration: false, // Rechazar tokens que hayan expirado
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'), // Clave secreta para verificar la firma del token
    });
  }

  // Validación del payload del token
  async validate(payload: any) {
    // Aquí puedes agregar lógica adicional para validar el usuario o manejar roles, etc.
    return { userId: payload.sub, email: payload.email }; // Retorna un objeto usuario que se inyecta en el contexto de la solicitud
  }
}
