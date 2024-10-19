import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { ResponseDto } from 'src/common/dto/response.dto';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';

@Controller('authentication')
export class AuthController {

  constructor(private service: AuthService) { }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string): Promise<ResponseDto> {
    const response = await this.service.validateUser(email, password);

    if(response && response.code === HttpCode.OK){
      const tokenData = await this.service.login(response.data);

      return {
        code: HttpCode.OK,
        message: HttpMessage.OK,
        data: tokenData
      };

    }else if(response && response.code === HttpCode.FORBIDDEN){
      return {
        code: HttpCode.FORBIDDEN,
        message: (response.message === HttpMessage.INVALID_PASSWORD) ? HttpMessage.INVALID_PASSWORD : HttpMessage.EMAIL_NOT_VERIFY,
        data: null
      };
    }else{
      return {
        code: HttpCode.NOT_FOUND,
        message: HttpMessage.INVALID_USER_EMAIL,
        data: null
      };
    }
    
  }

}
