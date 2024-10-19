import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Role } from './role.entity';
import { ResourcesGroup } from './resources_group.entity';

@Entity('resources_role')
@Unique(['role', 'resourcesGroup'])
export class ResourceRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Role, role => role.resourceRoles, { nullable: true })
  @JoinColumn({ name: 'id_role' }) // Clave foránea a la entidad Role
  role: Role;

  @ManyToOne(() => ResourcesGroup, resourcesGroup => resourcesGroup, { nullable: true })
  @JoinColumn({ name: 'id_resources_group' }) // Clave foránea a la entidad ResourcesGroup
  resourcesGroup: ResourcesGroup;
}
