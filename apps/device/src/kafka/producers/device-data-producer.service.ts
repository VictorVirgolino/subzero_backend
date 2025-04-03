import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../kafka.service';
import { SchemaRegistryService } from '../schema/schema-registry.service';

@Injectable()
export class DeviceDataProducer implements OnModuleInit {
  private readonly logger = new Logger(DeviceDataProducer.name);
  private producerInitialized = false;

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly schemaRegistry: SchemaRegistryService
  ) {}

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize() {
    await this.schemaRegistry.initialize();
    this.producerInitialized = true;
    this.logger.log('Producer inicializado');
  }

  public async send(payload: any) {
    if (!this.producerInitialized) {
      throw new Error('Producer não inicializado');
    }

    try {
      const encoded = await this.schemaRegistry.getRegistry().encode(
        this.schemaRegistry.getSchemaId(),
        payload
      );
      
      await this.kafkaService.getProducer().send({
        topic: 'device-service-esp-history-data',
        messages: [{ value: encoded }]
      });
      
      this.logger.log('Mensagem enviada com sucesso');
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem', error.stack);
      throw error;
    }
  }
}