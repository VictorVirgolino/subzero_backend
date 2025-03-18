import { Controller, Get } from '@nestjs/common';
import { DeviceService } from './device.service';

@Controller()
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  getHello(): string {
    return this.deviceService.getHello();
  }
}
