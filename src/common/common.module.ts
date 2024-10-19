import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailsController } from './modules/mails/mails.controller';
import { MailsService } from './modules/mails/services/mails.service';
import { TokenService } from './services/token.service';
import { SmsController } from './modules/sms/sms.controller';
import { SmsService } from './modules/sms/services/sms.service';
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TokenService, MailsService, SmsService],
  controllers: [MailsController, SmsController],
  exports: [MailsService],
})
export class CommonModule { }
