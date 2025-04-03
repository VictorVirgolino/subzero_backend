import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, Admin, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize() {
    this.kafka = new Kafka({
      clientId: 'device-service',
      brokers: ['redpanda:9092'],
      connectionTimeout: 30000,
      retry: {
        maxRetryTime: 45000,
        initialRetryTime: 10000,
        retries: 15
      }
    });

    await this.connectProducer();
    await this.ensureTopicExists();
  }

  private async connectProducer() {
    this.producer = this.kafka.producer();
    try {
      await this.producer.connect();
      this.logger.log('Producer conectado ao Kafka');
    } catch (err) {
      throw new Error(`Falha na conexão do Producer: ${err.message}`);
    }
  }

  private async ensureTopicExists() {
    this.admin = this.kafka.admin();
    const topic = 'device-service-esp-history-data';
    
    try {
      await this.admin.connect();
      const topics = await this.admin.listTopics();
      
      if (!topics.includes(topic)) {
        await this.admin.createTopics({
          topics: [{
            topic,
            numPartitions: 1,
            replicationFactor: 1
          }]
        });
        this.logger.log(`Tópico ${topic} criado`);
      }
    } finally {
      await this.admin.disconnect();
    }
  }

  public getProducer() {
    return this.producer;
  }

  public createConsumer(groupId: string) {
    return this.kafka.consumer({ 
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 10000
    });
  }
}