import { Test, TestingModule } from '@nestjs/testing';
import { SewingServicesController } from './sewing-services.controller';
import { SewingServicesService } from './sewing-services.service';

describe('SewingServicesController', () => {
  let controller: SewingServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SewingServicesController],
      providers: [SewingServicesService],
    }).compile();

    controller = module.get<SewingServicesController>(SewingServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
