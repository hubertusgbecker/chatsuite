import type { HealthResponseDto, WelcomeResponseDto } from '@chatsuite/core';
import { Controller, Get } from '@nestjs/common';

// biome-ignore lint/style/useImportType: NestJS DI requires value import for injectable classes
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData(): WelcomeResponseDto {
    return this.appService.getData();
  }

  @Get('health')
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.0.0',
      uptime: process.uptime(),
    };
  }
}
