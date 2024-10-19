import { Controller, Get, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { ResponseDto } from 'src/common/dto/response.dto';

@Controller('sales')
export class SalesController {

  constructor(private readonly salesService: SalesService) {}

  @Get('top-products')
  async getTopProducts(
    @Query('month') month?: number,
    @Query('quarter') quarter?: number,
    @Query('year') year?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<ResponseDto> {
    return this.salesService.getTopProducts({ month, quarter, year, startDate, endDate });
  }

  @Get('top-services')
  async getTopServices(
    @Query('month') month?: number,
    @Query('quarter') quarter?: number,
    @Query('year') year?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<ResponseDto> {
    return this.salesService.getTopServices({ month, quarter, year, startDate, endDate });
  }

  @Get('quarterly-sales')
  async getQuarterlySales(@Query('year') year?: number): Promise<ResponseDto> {
    return this.salesService.getQuarterlySales(year);
  }

  @Get('monthly-sales')
  async getMonthlySales(
    @Query('year') year?: number, // Filtro opcional de año
    @Query('month') month?: number // Filtro opcional de mes
  ): Promise<ResponseDto> {
    // Llamamos al servicio y pasamos los filtros
    return this.salesService.getMonthlySales({ year, month });
  }
}
