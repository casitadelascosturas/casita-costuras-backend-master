import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasuresServiceOrder } from 'src/common/entities/measure-service-order.entity';
import { ServiceOrder } from 'src/common/entities/service-order.entity';
import { TasksEntity } from 'src/common/entities/tasks.entity';
import { Order } from 'src/common/entities/order.entity';
import { User } from 'src/common/entities/user.entity';
import { Client } from 'src/common/entities/client.entity';
import { SmsService } from 'src/common/modules/sms/services/sms.service';
import { MailsService } from 'src/common/modules/mails/services/mails.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TasksEntity, ServiceOrder, MeasuresServiceOrder, Order, User, Client]),
    AuthModule],
  controllers: [TasksController],
  providers: [TasksService, SmsService, MailsService],
})
export class TasksModule {}
