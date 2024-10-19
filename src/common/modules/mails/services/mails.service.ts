import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path';
import { ResponseDto } from 'src/common/dto/response.dto';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailsService {
    private readonly resend: Resend;
    private readonly logger = new Logger(MailsService.name);
    private domain: string;
    private sendEmailNotification: string;
    private keyResend: string;

    constructor(
      private readonly jwtService: JwtService, 
      private configService: ConfigService) {
      this.keyResend = this.configService.get<string>('RESEND_API_KEY');
      this.domain = this.configService.get<string>('DOMAIN');
      this.sendEmailNotification = this.configService.get<string>('SEND_EMAIL_NOTIFICATION');
      this.resend = new Resend(this.keyResend);

    }

    private loadTemplate(templateName: string, variables: Record<string, string>): string {
        const templatePath = path.join(__dirname, '../../../../assets/templates', `${templateName}.template.html`);

        let template = fs.readFileSync(templatePath, 'utf8');
        for (const [key, value] of Object.entries(variables)) {
          template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return template;
    }

    async sendMail(from: string, to: string, subject: string, templateName: string, variables: Record<string, string>, attachmentFiles?: Express.Multer.File[]): Promise<ResponseDto> {
        try {
          let attachments = [];
          const html = this.loadTemplate(templateName, variables);          
          // console.log('attachmentFiles: ', attachmentFiles.length)
          attachments = attachmentFiles?.map(file => ({
            filename: file.originalname,
            content: file.buffer
          }));

          const response = await this.resend.emails.send({
            from: this.sendEmailNotification,
            to,
            subject,
            html,
            attachments,
          });
    
          console.log('response: ', response);

          if(!response.error){
            return {
                code: HttpCode.OK,
                message: HttpMessage.OK,
                data: response,
              };
          }else{
            return {
                code: HttpCode.BAD_REQUEST,
                message: HttpMessage.BAD_REQUEST,
                data: response,
              };
          }
        } catch (error) {
          this.logger.error('Error sending email:', error.response?.data || error.message);
          return {
            code: HttpCode.SERVICE_UNAVAILABLE,
            message: HttpMessage.SERVICE_UNAVAILABLE,
            data: null,
          };
        }
      }

      generateVerificationToken(email: string): string {
        const payload = { email };
        return this.jwtService.sign(payload);
      }
}
