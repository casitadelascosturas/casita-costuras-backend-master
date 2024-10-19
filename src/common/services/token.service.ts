import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService {
    private secret: string;
    constructor(
      private configService: ConfigService
    ) {
      this.secret = this.configService.get<string>('JWT_SECRET_KEY');
    }

    generateToken(payload: object, expiresIn: string): string {
      return jwt.sign(payload, this.secret, { expiresIn });
    }
  
    verifyToken(token: string): any {
      return jwt.verify(token, this.secret);
    }
}
