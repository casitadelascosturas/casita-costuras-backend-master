import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { ServiceOrder } from './service-order.entity';
import { MeasuresServiceEntity } from './measure-service.entity';  // Corrige el nombre del archivo importado
import { OfferProductService } from './offer-product-service.entity';
import { Sale } from './sales.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  image: string;

  @Column()
  cost: number;

  @Column()
  cost_material: number;

  @Column()
  init_price: number;

  @Column()
  end_price: number;

  @OneToMany(() => ServiceOrder, serviceOrder => serviceOrder.service, { nullable: true })
  serviceOrders: ServiceOrder;

  @ManyToOne(() => MeasuresServiceEntity, measuresService => measuresService.service, { nullable: true })
  measuresService: MeasuresServiceEntity[];

  @OneToMany(() => OfferProductService, offerProductService => offerProductService.service, { nullable: true })
  offerProductServices: OfferProductService[];

  @OneToMany(() => Sale, sale => sale.service, { nullable: true })
  sales: Sale[];

}
