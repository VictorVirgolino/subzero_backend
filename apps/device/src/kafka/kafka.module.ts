import { Module, OnModuleInit } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { SchemaRegistryService } from './schema/schema-registry.service';
import { DeviceDataProducer } from './producers/device-data-producer.service';
import { DeviceDataConsumer } from './consumers/device-data-consumer.service';

@Module({
  providers: [
    KafkaService,
    SchemaRegistryService,
    DeviceDataProducer,
    DeviceDataConsumer,
  ],
  exports: [
    KafkaService,
    SchemaRegistryService,
    DeviceDataProducer,
    DeviceDataConsumer,
  ],
})
export class KafkaModule implements OnModuleInit {
  constructor(
    private readonly schemaRegistryService: SchemaRegistryService,
    private readonly kafkaService: KafkaService
  ) {}

  async onModuleInit() {
    await this.schemaRegistryService.initialize();
    await this.kafkaService.initialize();
  }
}