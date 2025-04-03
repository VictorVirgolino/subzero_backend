import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EachMessagePayload } from 'kafkajs';
import { KafkaService } from '../kafka.service';
import { SchemaRegistryService } from '../schema/schema-registry.service';

@Injectable()
export class DeviceDataConsumer implements OnModuleInit {
  private readonly TOPIC = 'device-service-esp-history-data';
  private readonly logger = new Logger(DeviceDataConsumer.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly schemaRegistry: SchemaRegistryService
  ) {}

  async onModuleInit() {
    await this.startConsumer();
  }

  private async startConsumer() {
    const consumer = this.kafkaService.createConsumer('device-consumer-group');
    
    await consumer.connect();
    await consumer.subscribe({ 
      topic: this.TOPIC,
      fromBeginning: true
    });

    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.processMessage(payload);
      }
    });
  }

  private async processMessage(payload: EachMessagePayload) {
    try {
      if (!payload.message.value) {
        this.logger.warn('Mensagem recebida sem conteúdo');
        return;
      }

      const decoded = await this.schemaRegistry.decode(payload.message.value as Buffer);
      this.logger.log('Mensagem recebida:', decoded);
      
    } catch (error) {
      this.logger.error('Erro ao processar mensagem:', error);
    }
  }
}