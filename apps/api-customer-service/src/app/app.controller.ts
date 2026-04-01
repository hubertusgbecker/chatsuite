import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData(): { message: string } {
    return this.appService.getData();
  }

  @Get('health')
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.0.0',
      uptime: process.uptime(),
    };
  }
}
