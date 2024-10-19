import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
// import { AuthEntity } from './auth.entity';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // TypeOrmModule.forFeature([AuthEntity]),
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'azpzFz0PRYP9aZMNxa9cpo5/zN5EDb25CwTZ1EsSMzw=', // Usa una clave secreta fuerte
      signOptions: { expiresIn: '1h' }, // Token válido por 1 hora
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule { }
