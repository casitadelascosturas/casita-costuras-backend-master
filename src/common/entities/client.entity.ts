import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from './order.entity';
import { Sale } from './sales.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ default: false })
  whatsapp: boolean;

  @OneToMany(() => Order, order => order.client, { nullable: true })
  orders: Order[];

  @OneToMany(() => Sale, sale => sale.client, { nullable: true })
  sales: Sale[];

}
