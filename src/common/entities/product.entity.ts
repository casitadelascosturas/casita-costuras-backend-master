import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { ProductOrder } from './product-order.entity';
import { ProductStock } from './product-stock.entity';
import { OfferProductService } from './offer-product-service.entity';
import { FilesEntity } from './files.entity';
import { Sale } from './sales.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToOne(() => FilesEntity, { nullable: true, cascade: true })  // Relación OneToOne con FilesEntity
  @JoinColumn()
  image: FilesEntity;

  @Column({ nullable: true })//se añade ya que normalmente estos productos no tienen precio fijo y se negocian
  price_sale_min: number;

  @Column({ nullable: true })//se añade ya que normalmente estos productos no tienen precio fijo y se negocian
  price_sale_max: number;

  @Column({ nullable: true })
  status: boolean;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => ProductOrder, productOrder => productOrder.product, { nullable: true })
  productOrders: ProductOrder[];

  @OneToMany(() => ProductStock, productStock => productStock.product, { nullable: true })
  productStocks: ProductStock[];

  @OneToMany(() => OfferProductService, offerProductService => offerProductService.product, { nullable: true })
  offerProductServices: OfferProductService[];

  @OneToMany(() => Sale, sale => sale.product, { nullable: true })
  sales: Sale[];

}
