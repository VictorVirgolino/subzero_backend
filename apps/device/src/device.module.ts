import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { PostgresModule } from './databases/postgres.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }), 
    PostgresModule
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
