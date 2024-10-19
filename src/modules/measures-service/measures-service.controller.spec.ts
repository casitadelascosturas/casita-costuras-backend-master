import { Test, TestingModule } from '@nestjs/testing';
import { MeasuresServiceController } from './measures-service.controller';
import { MeasuresServiceService } from './measures-service.service';

describe('MeasuresServiceController', () => {
  let controller: MeasuresServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeasuresServiceController],
      providers: [MeasuresServiceService],
    }).compile();

    controller = module.get<MeasuresServiceController>(MeasuresServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
