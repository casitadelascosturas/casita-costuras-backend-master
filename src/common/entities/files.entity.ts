import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Measure } from './measure.entity';
import { Product } from './product.entity';

@Entity('files')
export class FilesEntity {
    @PrimaryGeneratedColumn() id: string;

    @Column()
    name: string;
  
    @Column()
    url: string;
  
    @Column()
    path: string;
  
    @OneToOne(() => Measure, (measure) => measure.image)  // Relación OneToOne con Measure
    measure: Measure;

    @OneToOne(() => Product, (product) => product.image)  // Relación OneToOne con Product
    product: Product;
}
