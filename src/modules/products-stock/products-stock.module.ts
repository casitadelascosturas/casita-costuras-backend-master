import { Module } from '@nestjs/common';
import { ProductsStockService } from './products-stock.service';
import { ProductsStockController } from './products-stock.controller';

@Module({
  controllers: [ProductsStockController],
  providers: [ProductsStockService],
})
export class ProductsStockModule {}
