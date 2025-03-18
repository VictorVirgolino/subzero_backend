import { Test, TestingModule } from '@nestjs/testing';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';

describe('DeviceController', () => {
  let deviceController: DeviceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [DeviceService],
    }).compile();

    deviceController = app.get<DeviceController>(DeviceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(deviceController.getHello()).toBe('Hello World!');
    });
  });
});
