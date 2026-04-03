/**
 * ChatSuite API Customer Service entry point.
 *
 * Configures and starts the NestJS application with global
 * exception handling, validation, and security middleware.
 */

import 'reflect-metadata';

import { configureApp } from '@chatsuite/core';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}/api`);
}

// Bootstrap when run directly or via Nx node executor
const isDirectRun = require.main === module;
const isNxServe = process.env.NX_TASK_TARGET_TARGET === 'serve';
if (isDirectRun || isNxServe) {
  void bootstrap();
}
