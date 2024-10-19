import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ServiceOrder } from './service-order.entity';

@Entity('measures_service_order')
export class MeasuresServiceOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: false })
  name_measures: string;

  @Column()
  value_measures: string;

  @ManyToOne(() => ServiceOrder, serviceOrder => serviceOrder.measuresServiceOrders, { nullable: true })
  serviceOrder: ServiceOrder;
}
