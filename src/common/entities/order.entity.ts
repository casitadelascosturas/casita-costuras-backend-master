import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Client } from './client.entity';
import { User } from './user.entity';
import { ProductOrder } from './product-order.entity';
import { ServiceOrder } from './service-order.entity';
import { Sale } from './sales.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  telephone: string;

  @Column()
  total: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  advance_payment: number;

  @Column({ default: 0 })
  notify: number;

  @Column()
  creation_date: Date;

  @Column()
  deliver_date: Date;

  @Column({ nullable: true })
  completed_at: Date;//fecha y hora en que se completo el pedido

  @Column({ nullable: true })
  actual_deliver_date: Date;//fecha y hora en que el cliente recogio su pedido

  // @Column()
  // status: string;
  @Column({ type: 'enum', enum: ['PENDING', 'IN_PROCESS', 'FINALIZED', 'PENDING_DELIVERY', 'LATE', 'CANCEL'], default: 'PENDING' })
    status: 'PENDING' | 'IN_PROCESS' | 'FINALIZED' | 'LATE' | 'PENDING_DELIVERY' | 'CANCEL';

  @ManyToOne(() => User, user => user.orders, { nullable: true })
  user: User;

  @ManyToOne(() => Client, client => client.orders, { nullable: true })
  client: Client;

  @OneToMany(() => ProductOrder, productOrder => productOrder.order, { nullable: true })
  productOrders: ProductOrder[];

  @OneToMany(() => ServiceOrder, serviceOrder => serviceOrder.order, { nullable: true })
  serviceOrders: ServiceOrder[];

  @OneToMany(() => Sale, sale => sale.order, { nullable: true })
  sales: Sale[];

}
