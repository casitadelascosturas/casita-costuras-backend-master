import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrder } from 'src/common/entities/service-order.entity';

import { Order } from 'src/common/entities/order.entity';
import { Client } from 'src/common/entities/client.entity';
import { ProductOrder } from 'src/common/entities/product-order.entity';
import { MeasuresServiceOrder } from 'src/common/entities/measure-service-order.entity';
import { TasksEntity } from 'src/common/entities/tasks.entity';
import { User } from 'src/common/entities/user.entity';
import { Service } from 'src/common/entities/service.entity';
import { Product } from 'src/common/entities/product.entity';
import { Sale } from 'src/common/entities/sales.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Order,
    Client,
    ProductOrder,
    ServiceOrder,
    MeasuresServiceOrder,
    TasksEntity,
    User, 
    Service,
    Product,
    Sale
  ])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
