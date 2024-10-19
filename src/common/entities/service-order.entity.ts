import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Service } from './service.entity';
import { MeasuresServiceOrder } from './measure-service-order.entity';
import { Order } from './order.entity';
import { TasksEntity } from './tasks.entity';
import { User } from './user.entity';

@Entity('services_order')
export class ServiceOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.serviceOrders, { nullable: true })
  order: Order;

  @ManyToOne(() => Service, service => service.serviceOrders, { nullable: true })
  service: Service;

  @Column()
  cost: number;//de igual manera es lo mismo que la entidad anterior

  @Column()
  price_final: number;

  @OneToOne(() => TasksEntity, task => task.serviceOrder, { nullable: true, cascade: true })
  @JoinColumn()
  task: TasksEntity;
  
  @OneToMany(() => MeasuresServiceOrder, measuresServiceOrder => measuresServiceOrder.serviceOrder, { nullable: true })
  measuresServiceOrders: MeasuresServiceOrder[];

}