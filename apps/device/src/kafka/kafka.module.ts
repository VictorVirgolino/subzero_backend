import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { SchemaRegistryService } from './schema/schema-registry.service';
import { DeviceDataProducer } from './producers/device-data-producer.service';
import { DeviceDataConsumer } from './consumers/device-data-consumer.service';

@Module({
  providers: [
    KafkaService,
    SchemaRegistryService,
    DeviceDataProducer,
    DeviceDataConsumer
  ],
  exports: [
    KafkaService,
    SchemaRegistryService,
    DeviceDataProducer,
    DeviceDataConsumer
  ],
})
export class KafkaModule implements OnModuleInit {
  private readonly logger = new Logger(KafkaModule.name);

  constructor(
    private readonly schemaRegistry: SchemaRegistryService,
    private readonly kafkaService: KafkaService
  ) {}

  async onModuleInit() {
    try {
      await this.schemaRegistry.initialize();
      await this.kafkaService.onModuleInit();
      this.logger.log('Módulo Kafka inicializado com sucesso');
    } catch (error) {
      this.logger.error('Falha crítica na inicialização do Kafka', error.stack);
      process.exit(1);
    }
  }
}