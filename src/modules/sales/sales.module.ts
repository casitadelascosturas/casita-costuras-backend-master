import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from 'src/common/entities/sales.entity';
import { Client } from 'src/common/entities/client.entity';
import { User } from 'src/common/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, Client, User])],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
