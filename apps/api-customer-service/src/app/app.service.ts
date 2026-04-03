import type { WelcomeResponseDto } from '@chatsuite/core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): WelcomeResponseDto {
    return {
      message: 'Welcome to api-customer-service of ChatSuite!',
    };
  }
}
