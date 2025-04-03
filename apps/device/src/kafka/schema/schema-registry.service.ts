import { Injectable, Logger } from '@nestjs/common';
import { SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SchemaRegistryService {
  private readonly logger = new Logger(SchemaRegistryService.name);
  private registry: SchemaRegistry;
  private schemaId: number;
  private readonly maxRetries = 10;
  private readonly retryDelay = 5000;

  async initialize() {
    await this.initializeRegistry();
    await this.registerSchema();
  }

  private async initializeRegistry() {
    this.registry = new SchemaRegistry({ 
      host: 'http://schema-registry:8081',
      [Symbol.for('socket.connection.setup.timeout.ms')]: 15000
    });

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.registry.getLatestSchemaId('dummy-subject');
        this.logger.log('Connected to Schema Registry');
        return;
      } catch (err) {
        if (attempt === this.maxRetries) {
          throw new Error(`Failed to connect to Schema Registry after ${this.maxRetries} attempts`);
        }
        this.logger.warn(`Schema Registry connection attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
  }

  private async registerSchema() {
    const schemaPath = path.join(__dirname, '../../resources/avro/device-data.avsc');
    
    try {
      const schema = fs.readFileSync(schemaPath, { encoding: 'utf8' });
      const { id } = await this.registry.register({
        type: SchemaType.AVRO,
        schema,
      });
      this.schemaId = id;
      this.logger.log(`Schema registered with ID: ${this.schemaId}`);
    } catch (error) {
      this.logger.error('Schema registration failed', error.stack);
      throw error;
    }
  }

  getRegistry() {
    return this.registry;
  }

  getSchemaId() {
    return this.schemaId;
  }
}