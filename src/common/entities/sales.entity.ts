import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { Service } from './service.entity';
import { User } from './user.entity';
import { Client } from './client.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.sales, { nullable: true })
  order: Order; // Referencia a la orden de donde proviene la venta

  @ManyToOne(() => Product, product => product.id, { nullable: true })
  product: Product; // Producto vendido (puede ser nulo si es un servicio)

  @ManyToOne(() => Service, service => service.id, { nullable: true })
  service: Service; // Servicio prestado (puede ser nulo si es un producto)

  @ManyToOne(() => User, user => user.id)
  createdBy: User; // Usuario que gestionó la venta

  @ManyToOne(() => Client, client => client.id, { nullable: true })
  client: Client; // Cliente que realizó la compra (puede ser opcional)

  @Column()
  sale_date: Date; // Fecha y hora en que se registró la venta

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number; // Importe total de la venta

  @Column('int', { nullable: true })
  quantity: number; // Cantidad de producto/servicio vendido (solo relevante para productos)

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discount: number; // Descuento aplicado si es el caso (opcional)

  @Column('decimal', { precision: 10, scale: 2 })
  final_price: number; // Precio final después de descuentos, impuestos, etc.
}
