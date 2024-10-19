import { Body, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { MailsService } from './services/mails.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';


@Controller('mail')
export class MailsController {

    constructor(private readonly mailService: MailsService) {}

    // @Post('send')
    // sendEmail(@Body() body: { from: string, to: string, subject: string, templateName: string, variables: Record<string, string> }) {
    //     return this.mailService.sendMail(body.from, body.to, body.subject, body.templateName, body.variables);
    // }

    @Post('send')
    @UseInterceptors(FilesInterceptor('files', 5))
    sendEmail(@UploadedFiles() files: Express.Multer.File[],
              @Body() body: { from: string, to: string, subject: string, templateName: string, variables: any }) {
            const variablesObj = JSON.parse(body.variables);
            return this.mailService.sendMail(body.from, body.to, body.subject, body.templateName, variablesObj, files);
    }
}
