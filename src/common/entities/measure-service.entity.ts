import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Service } from './service.entity';
import { Measure } from './measure.entity';

@Entity('measures_service')
export class MeasuresServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Service, (service) => service.measuresService, { nullable: true })
  service: Service;

  @ManyToOne(() => Measure, (measure) => measure.measuresService, { nullable: true })
  measure: Measure;

  @Column({ nullable: true })
  description: string;
}