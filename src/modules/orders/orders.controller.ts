import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import { Order } from 'src/common/entities/order.entity';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Post('page')
    findAll(
      @Body() { page, size, orderBy, sort, filters }: 
      { page: number, size: number,orderBy: string, sort: 'asc'|'desc', filters: Partial<Order> }): Promise<ResponsePageDto> {
      return this.ordersService.page(page, size, orderBy, sort.toUpperCase() as 'ASC' | 'DESC', filters);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<ResponseDto> {
    return this.ordersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto): Promise<ResponseDto> {
    return this.ordersService.update(id, updateOrderDto);
  }

}
