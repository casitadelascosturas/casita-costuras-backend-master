import { Controller, Post, Body } from '@nestjs/common';
import { SmsService } from './services/sms.service';

@Controller('sms')
export class SmsController {

  constructor(private readonly smsService: SmsService) {}

  // @Post('send')
  // async sendSms(@Body() body: { to: string; message: string }) {
  //     return this.smsService.sendSms(body.to, body.message);
  // }

  @Post('send')
  async sendSms(@Body() body: { to: string; message: string }) {
      return this.smsService.sendSmsTwilio(body.to, body.message);
  }

}
