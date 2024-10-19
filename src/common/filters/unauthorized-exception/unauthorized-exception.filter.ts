import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { ResponseDto } from 'src/common/dto/response.dto';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';

@Catch()
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Construir la respuesta con el formato de ResponseDto
    const responseBody: ResponseDto = {
      code: HttpCode.UNAUTHORIZED,
      message: HttpMessage.UNAUTHORIZED,
      data: null,
    };

    response.status(401).json(responseBody);
  }
}
