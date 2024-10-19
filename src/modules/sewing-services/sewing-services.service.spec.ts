import { Test, TestingModule } from '@nestjs/testing';
import { SewingServicesService } from './sewing-services.service';

describe('SewingServicesService', () => {
  let service: SewingServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SewingServicesService],
    }).compile();

    service = module.get<SewingServicesService>(SewingServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
