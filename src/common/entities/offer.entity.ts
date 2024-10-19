import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OfferProductService } from './offer-product-service.entity';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discount: number;

  @Column()
  type_discount: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => OfferProductService, offerProductService => offerProductService.offer, { nullable: true })
  offerProductServices: OfferProductService[];
}
