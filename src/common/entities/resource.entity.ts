import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { ResourcesGroup } from './resources_group.entity';
import { RolePermission } from './permission.entity';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  icon: string;

  @Column()
  label: string;

  @Column()
  path: string;

  @Column()
  footer: boolean;

  @ManyToMany(() => ResourcesGroup, resourcesGroup => resourcesGroup.resources, { nullable: true })
  resourcesGroups: ResourcesGroup[];

  @OneToMany(() => RolePermission, rolePermission => rolePermission.resource, { nullable: true })
  rolePermissions: RolePermission[];
}
