import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ResponseDto } from 'src/common/dto/response.dto';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService, // Servicio de usuarios para obtener los datos
        private readonly jwtService: JwtService, // Servicio JWT para crear tokens
        private readonly configService: ConfigService,
      ) {}

      async validateUser(email: string, password: string): Promise<ResponseDto> {
        const user = (await this.usersService.findUser(email)).data;
        if(!user){
            return {
                code: HttpCode.NOT_FOUND,
                message: HttpMessage.NOT_FOUND,
                data: null,
            };
        }else if(!user.verifyEmail){
            return {
                code: HttpCode.FORBIDDEN,
                message: HttpMessage.EMAIL_NOT_VERIFY,
                data: null,
            }
        }

        if(user && (await bcrypt.compare(password, user.password))){
            return {
                code: HttpCode.OK,
                message: HttpMessage.OK,
                data: {
                    verifyEmail: user.verifyEmail,
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    reset: user.reset,
                    passwordTemp: user.passwordTemp,
                    role: user.role,
                    view_own_data: user.view_own_data
                },
            }
        }else if(user && !(await bcrypt.compare(password, user.password))){
            return {
                code: HttpCode.FORBIDDEN,
                message: HttpMessage.INVALID_PASSWORD,
                data: null,
            }
        }

        
      }
    
      // Método para generar el token JWT
      async login(user: any) {
        const payload = { ...user }; // Payload del token
        return {
          access_token: this.jwtService.sign(payload, {
            expiresIn: this.configService.get<string>('jwt.signOptions.expiresIn'),
          }), // Genera el token JWT
        };
      }
}
