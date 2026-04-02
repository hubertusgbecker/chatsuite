import { Injectable } from '@nestjs/common';
import type { WelcomeResponseDto } from './dto';

@Injectable()
export class AppService {
  getData(): WelcomeResponseDto {
    return {
      message: 'Welcome to api-customer-service of ChatSuite!',
    };
  }
}
