import { Controller, Post, Body } from '@nestjs/common';
import { DeviceService } from './device.service';

@Controller('device')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
  ) {}

  @Post('send')
  async send(@Body() payload: any) {
    await this.deviceService.handleDevice(payload);
    return { message: 'Mensagem enviada com sucesso ✅' };
  }
}
