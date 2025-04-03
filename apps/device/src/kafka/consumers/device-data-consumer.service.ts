import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EachMessagePayload } from 'kafkajs';
import { KafkaService } from '../kafka.service';
import { SchemaRegistryService } from '../schema/schema-registry.service';

@Injectable()
export class DeviceDataConsumer implements OnModuleInit {
  private readonly logger = new Logger(DeviceDataConsumer.name);
  private consumer;

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly schemaRegistry: SchemaRegistryService
  ) {}

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize() {
    await this.schemaRegistry.initialize();
    
    this.consumer = this.kafkaService.createConsumer('device-consumer-group');
    await this.consumer.connect();
    await this.consumer.subscribe({ 
      topic: 'device-service-esp-history-data',
      fromBeginning: true
    });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.processMessage(payload);
      }
    });
    
    this.logger.log('Consumer inicializado e ouvindo mensagens');
  }

  private async processMessage(payload: EachMessagePayload) {
    try {
      const { message } = payload;
      if (!message.value) return;

      const decoded = await this.schemaRegistry.getRegistry().decode(message.value);
      this.logger.log(`Mensagem recebida: ${JSON.stringify(decoded)}`);
      
    } catch (error) {
      this.logger.error('Erro ao processar mensagem', error.stack);
    }
  }

  async onApplicationShutdown() {
    await this.consumer.disconnect();
  }
}