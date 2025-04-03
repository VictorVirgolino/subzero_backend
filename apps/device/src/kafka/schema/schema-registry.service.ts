import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SchemaRegistryService implements OnModuleInit {
  private readonly logger = new Logger(SchemaRegistryService.name);
  private registry: SchemaRegistry;
  private schemaId: number;
  private readonly maxRetries = 15;
  private readonly retryDelay = 5000;

  async onModuleInit() {
    await this.initialize();
  }

  public async initialize() {
    await this.connectToRegistry();
    await this.registerSchema();
  }

  private async connectToRegistry() {
    this.registry = new SchemaRegistry({
      host: 'http://schema-registry:8081',
      [Symbol.for('socket.connection.setup.timeout.ms')]: 30000,
    });

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.registry.getLatestSchemaId('healthcheck-subject');
        break;
      } catch (err) {
        const errorCode = (err as any)?.errorCode;
        
        if (errorCode === 40401) { // Subject not found
          this.logger.log('Conexão com Schema Registry validada');
          return;
        }

        this.logger.warn(`Tentativa ${attempt}/${this.maxRetries} falhou: ${err.message}`);
        
        if (attempt === this.maxRetries) {
          throw new Error(`Falha na conexão após ${this.maxRetries} tentativas`);
        }

        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelay * Math.pow(1.5, attempt))
        );
      }
    }
  }

  private async registerSchema() {
    const schemaPath = path.join(__dirname, '../../resources/avro/device-data.avsc');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Arquivo de schema não encontrado: ${schemaPath}`);
    }

    try {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const { id } = await this.registry.register({
        type: SchemaType.AVRO,
        schema,
      });
      this.schemaId = id;
      this.logger.log(`Schema registrado com ID: ${this.schemaId}`);
    } catch (error) {
      this.logger.error('Falha no registro do schema', error.stack);
      throw error;
    }
  }

  public getRegistry() {
    if (!this.registry) throw new Error('Registry não inicializado');
    return this.registry;
  }

  public getSchemaId() {
    if (!this.schemaId) throw new Error('Schema ID não disponível');
    return this.schemaId;
  }
}