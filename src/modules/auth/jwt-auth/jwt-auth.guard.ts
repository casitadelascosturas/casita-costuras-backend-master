// src/auth/jwt-auth.guard.ts

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  private readonly publicRoutesWithPrefix: string[];

  constructor(private reflector: Reflector, private configService: ConfigService) {
    super();
    const prefixGlobalApi = this.configService.get<string>('PREFIX_GLOBAL_API');
    const publicRoutesPath = path.join(__dirname, '../../../assets/data/public-routes.json');
    const publicRoutes: string[] = JSON.parse(fs.readFileSync(publicRoutesPath, 'utf8'));
    this.publicRoutesWithPrefix = publicRoutes.map(route => `${prefixGlobalApi}${route}`);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    if (this.publicRoutesWithPrefix.includes(path)) {
      return true;
    }

    // const result = super.canActivate(context);
    const result = await super.canActivate(context);
    if (result instanceof Observable) {
      return result.toPromise();
    }

    return result;
  }
}
