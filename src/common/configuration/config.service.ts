import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomConfigService {
  constructor(private configService: ConfigService) {}

  get<T>(key: string, def?: T): T {
    return this.configService.get<T>(key) || (def as T);
  }

  getPort(): string {
    return this.get<string>('PORT', '8000');
  }

  getAppEnv(): string {
    return this.get<string>('APP_ENV', 'PROD');
  }

  isDev(): boolean {
    return this.getAppEnv() === 'DEV';
  }

  getDbHost() {
    return this.get('DB_HOST', 'localhost');
  }
  getDbPort() {
    return this.get('DB_PORT', '5432');
  }
  getDbUsername() {
    return this.get('DB_USERNAME', 'postgres');
  }
  getDbPassword() {
    return this.get('DB_PASSWORD', 'postgres');
  }
  getDbDatabase() {
    return this.get('DB_DATABASE', 'postgres');
  }
}
