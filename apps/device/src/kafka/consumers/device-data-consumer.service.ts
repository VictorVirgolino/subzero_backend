import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../kafka.service';
import { SchemaRegistryService } from '../schema/schema-registry.service';

@Injectable()
export class DeviceDataConsumer implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly schemaRegistry: SchemaRegistryService,
  ) {}

  async onModuleInit() {
    await this.schemaRegistry.initialize(); // Changed from .initialized to initialize()
    
    const consumer = this.kafkaService.createConsumer('device-consumer-group');
    await consumer.connect();
    await consumer.subscribe({ topic: 'device-service-esp-history-data' });

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const decoded = await this.schemaRegistry
          .getRegistry()
          .decode(message.value);
        console.log('📥 [Kafka] Received:', decoded);
      },
    });
  }
}