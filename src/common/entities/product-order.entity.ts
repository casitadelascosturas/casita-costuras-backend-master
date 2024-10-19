import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('products_order')
export class ProductOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column()
  cost: number;//añadi campo de costo para saber cuanto costo este producto ya que esto puede variar en la informacion general del producto

  @Column()
  price_final: number;

  @ManyToOne(() => Order, order => order.productOrders, { nullable: true })
  order: Order;

  @ManyToOne(() => Product, product => product.productOrders, { nullable: true })
  product: Product;
}
