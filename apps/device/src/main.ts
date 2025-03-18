import { NestFactory } from '@nestjs/core';
import { DeviceModule } from './device.module';

async function bootstrap() {
  const app = await NestFactory.create(DeviceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
