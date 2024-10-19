// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
// // import { JwtStrategy } from './jwt.strategy';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { AuthModule } from './auth/auth.module';


// @Module({
//     imports: [AuthModule,

//         PassportModule,
//         JwtModule.registerAsync({
//           imports: [ConfigModule],
//           useFactory: async (configService: ConfigService) => ({
//             secret: configService.get<string>('JWT_SECRET_KEY'),
//             signOptions: { expiresIn: '15m' },
//           }),
//           inject: [ConfigService],
//         }),
//       ],
//     //   providers: [JwtStrategy],
//       exports: [JwtModule],
// })
// export class AuthModule {}
