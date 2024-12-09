// api-key.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Env } from 'src/config/env-loader';

const { API_KEY_SECRET } = Env();

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly validApiKey = API_KEY_SECRET;  // You can also use environment variables or a config service

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Get API key from headers or query params
    const apiKey = request.headers['x-api-key'] || request.query.apiKey;

    // Check if the API key is valid
    if (apiKey !== this.validApiKey) {
      throw new ForbiddenException('Invalid API key');
    }

    return true;
  }
}
