import { Test, TestingModule } from '@nestjs/testing';
import { ProductsStockService } from './products-stock.service';

describe('ProductsStockService', () => {
  let service: ProductsStockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsStockService],
    }).compile();

    service = module.get<ProductsStockService>(ProductsStockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
