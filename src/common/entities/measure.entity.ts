import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { MeasuresServiceEntity } from './measure-service.entity';
import { FilesEntity } from './files.entity';

@Entity('measures')
export class Measure {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  measure_value: string;

  @ManyToOne(() => FilesEntity, { nullable: true }) // Relación ManyToOne opcional con la tabla de archivos
  image: FilesEntity;

  @OneToMany(() => MeasuresServiceEntity, measuresService => measuresService.measure, { nullable: true })
  measuresService: MeasuresServiceEntity[];
}
