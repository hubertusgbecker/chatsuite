import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { HealthResponseDto, WelcomeResponseDto } from './dto';

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
