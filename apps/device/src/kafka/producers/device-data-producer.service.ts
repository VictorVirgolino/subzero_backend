import { Injectable } from '@nestjs/common';
import { KafkaService } from '../kafka.service';
import { SchemaRegistryService } from '../schema/schema-registry.service';

@Injectable()
export class DeviceDataProducer {
  private readonly TOPIC = 'device-service-esp-history-data';
  private readonly SUBJECT = `${this.TOPIC}-value`;

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly schemaRegistry: SchemaRegistryService
  ) {}

  async send(payload: any) {
    const encoded = await this.schemaRegistry.encode(this.SUBJECT, payload);
    await this.kafkaService.sendMessage(this.TOPIC, encoded);
  }
}