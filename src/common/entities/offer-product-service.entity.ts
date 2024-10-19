import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Offer } from './offer.entity';
import { Product } from './product.entity';
import { Service } from './service.entity';

@Entity('offers_products_services')
export class OfferProductService {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Offer, offer => offer.offerProductServices, { nullable: true })
  offer: Offer;

  @ManyToOne(() => Product, product => product.offerProductServices, { nullable: true })
  product: Product;

  @ManyToOne(() => Service, service => service.offerProductServices, { nullable: true })
  service: Service;
}
