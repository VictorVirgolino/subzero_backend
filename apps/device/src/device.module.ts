import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { PostgresModule } from './databases/postgres.module';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }), 
    PostgresModule,
    KafkaModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
