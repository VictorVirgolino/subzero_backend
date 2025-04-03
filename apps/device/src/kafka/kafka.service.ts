import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer, Admin } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;
  private consumers: Consumer[] = [];

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'device-service',
      brokers: ['redpanda:9092'],
      connectionTimeout: 10000,
      retry: {
        initialRetryTime: 3000,
        retries: 5
      }
    });

    await this.initializeProducer();
    await this.ensureTopicExists('device-service-esp-history-data');
  }

  private async initializeProducer() {
    this.producer = this.kafka.producer();
    await this.producer.connect();
    this.logger.log('Producer conectado ao Redpanda');
  }

  private async ensureTopicExists(topic: string) {
    this.admin = this.kafka.admin();
    await this.admin.connect();
    
    const existingTopics = await this.admin.listTopics();
    if (!existingTopics.includes(topic)) {
      await this.admin.createTopics({
        topics: [{
          topic,
          numPartitions: 1,
          replicationFactor: 1
        }]
      });
      this.logger.log(`Tópico ${topic} criado`);
    }
    await this.admin.disconnect();
  }

  public async sendMessage(topic: string, message: Buffer) {
    await this.producer.send({
      topic,
      messages: [{ value: message }]
    });
  }

  public createConsumer(groupId: string) {
    const consumer = this.kafka.consumer({ 
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 10000
    });
    
    this.consumers.push(consumer);
    return consumer;
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await Promise.all(this.consumers.map(consumer => consumer.disconnect()));
    this.logger.log('Conexões Kafka encerradas');
  }
}