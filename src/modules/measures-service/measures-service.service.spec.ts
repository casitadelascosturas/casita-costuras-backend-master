import { Test, TestingModule } from '@nestjs/testing';
import { MeasuresServiceService } from './measures-service.service';

describe('MeasuresServiceService', () => {
  let service: MeasuresServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeasuresServiceService],
    }).compile();

    service = module.get<MeasuresServiceService>(MeasuresServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
