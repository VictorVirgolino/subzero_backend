import { Injectable } from '@nestjs/common';
import { DeviceDataProducer } from './kafka/producers/device-data-producer.service';

@Injectable()
export class DeviceService {
  constructor(private readonly deviceProducer: DeviceDataProducer) {}

  async handleDevice(payload: any) {
    await this.deviceProducer.send(payload);
  }
}
