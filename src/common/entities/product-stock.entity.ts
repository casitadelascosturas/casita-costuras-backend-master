import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_stocks')
export class ProductStock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bar_code: string;

  @Column()
  cost: string;

  @Column()
  units_available: number;

  @Column({ default: 0 })
  units_sold: number;

  @Column()
  init_price: string;

  @Column()
  max_price: string;

  @Column()
  date: Date;

  @Column()
  status: string;

  @Column({ nullable: true })
  expiration_date: Date;

  @ManyToOne(() => Product, product => product.productStocks, { nullable: true })
  product: Product;
}
