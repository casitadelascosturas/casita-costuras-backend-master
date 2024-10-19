import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { Resource } from './resource.entity';

@Entity('role_permissions')
export class RolePermission {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Role, role => role.rolePermissions, { nullable: true })
    @JoinColumn({ name: 'id_role' })
    role: Role;
  
    @ManyToOne(() => Resource, resource => resource.rolePermissions, { nullable: true })
    @JoinColumn({ name: 'id_resource' })
    resource: Resource;
  
    @Column({ default: false })
    canCreate: boolean;
  
    @Column({ default: false })
    canDelete: boolean;
  
    @Column({ default: false })
    canUpdate: boolean;

    @Column({ default: false })
    canPrint: boolean;
  
    @Column({ default: true })
    canRead: boolean;
}
