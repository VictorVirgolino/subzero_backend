import { Injectable } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'device-service',
      brokers: ['redpanda:9092'],
      connectionTimeout: 15000,
      retry: {
        maxRetryTime: 45000,
        initialRetryTime: 10000,
        retries: 15
      }
    });
  }

  async initialize() {
    await this.testConnection();
    this.producer = this.kafka.producer();
    await this.producer.connect();
  }

  private async testConnection() {
    const admin = this.kafka.admin();
    try {
      await admin.connect();
      await admin.listTopics();
      await admin.disconnect();
    } catch (err) {
      throw new Error(`Failed to connect to Kafka: ${err.message}`);
    }
  }

  getProducer() {
    return this.producer;
  }

  createConsumer(groupId: string) {
    this.consumer = this.kafka.consumer({ 
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 10000
    });
    return this.consumer;
  }
}