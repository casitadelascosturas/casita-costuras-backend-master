import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/common/entities/product.entity';
import { FirebaseService } from 'src/common/services/firebase.service';
import { FilesEntity } from 'src/common/entities/files.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, FilesEntity])],
  controllers: [ProductsController],
  providers: [ProductsService, FirebaseService],
})
export class ProductsModule {}
