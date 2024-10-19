import { Controller } from '@nestjs/common';
import { ProductsStockService } from './products-stock.service';

@Controller('products-stock')
export class ProductsStockController {
  constructor(private readonly productsStockService: ProductsStockService) {}
}
