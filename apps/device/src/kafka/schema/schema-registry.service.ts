import { Injectable } from '@nestjs/common';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

@Injectable()
export class SchemaRegistryService {
  private readonly registry = new SchemaRegistry({
    host: 'http://schema-registry:8081',
  });

  async encode(subject: string, payload: any): Promise<Buffer> {
    const schemaId = await this.getSchemaId(subject);
    return this.registry.encode(schemaId, payload);
  }

  async decode(message: Buffer | null): Promise<any> {
    if (!message) {
      throw new Error('Cannot decode null message');
    }
    return this.registry.decode(message);
  }

  private async getSchemaId(subject: string): Promise<number> {
    try {
      return await this.registry.getLatestSchemaId(subject);
    } catch (error) {
      throw new Error(`Schema não registrado para subject: ${subject}. Registre manualmente primeiro.`);
    }
  }
}