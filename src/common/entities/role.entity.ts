import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { ResourceRole } from './resource-role.entity';
import { RolePermission } from './permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => User, user => user.role, { nullable: true })
  users: User[];

  @OneToMany(() => ResourceRole, resourceRole => resourceRole.role, { nullable: true })
  resourceRoles: ResourceRole[];

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role, { nullable: true })
  rolePermissions: RolePermission[];
}
