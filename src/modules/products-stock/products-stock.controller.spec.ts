import { Test, TestingModule } from '@nestjs/testing';
import { ProductsStockController } from './products-stock.controller';
import { ProductsStockService } from './products-stock.service';

describe('ProductsStockController', () => {
  let controller: ProductsStockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsStockController],
      providers: [ProductsStockService],
    }).compile();

    controller = module.get<ProductsStockController>(ProductsStockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
