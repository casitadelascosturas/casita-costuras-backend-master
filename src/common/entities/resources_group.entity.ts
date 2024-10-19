import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Resource } from './resource.entity';

@Entity('resources_group')
export class ResourcesGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  name: string;

  @Column()
  separator: boolean;

  @ManyToMany(() => Resource, resource => resource.resourcesGroups, { nullable: true })
  @JoinTable({ name: 'resources_resources_group' }) // Tabla intermedia para la relación muchos a muchos
  resources: Resource[];
}
