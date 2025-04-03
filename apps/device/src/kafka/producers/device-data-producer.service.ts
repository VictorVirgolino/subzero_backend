import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../kafka.service';
import { SchemaRegistryService } from '../schema/schema-registry.service';

@Injectable()
export class DeviceDataProducer implements OnModuleInit {
  private producer;
  
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly schemaRegistry: SchemaRegistryService,
  ) {}

  async onModuleInit() {
    await this.schemaRegistry.initialize(); 
    this.producer = this.kafkaService.getProducer();
    await this.producer.connect();
  }

  async send(payload: any) {
    const encoded = await this.schemaRegistry
      .getRegistry()
      .encode(this.schemaRegistry.getSchemaId(), payload);
      
    await this.producer.send({
      topic: 'device-service-esp-history-data',
      messages: [{
        value: encoded,
        headers: {
          'schemaId': this.schemaRegistry.getSchemaId(),
          'valueSubject': 'device-service-esp-history-data-value'
        }
      }],
    });
    console.log('📤 [Kafka] Sent:', payload);
  }
}