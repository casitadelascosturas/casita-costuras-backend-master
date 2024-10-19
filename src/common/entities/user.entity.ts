import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { Order } from './order.entity';
import { TasksEntity } from './tasks.entity';
import { Sale } from './sales.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column()
  verifyEmail: boolean = false;

  @Column()
  view_own_data: boolean = false;

  @Column()
  reset: boolean;

  @Column()
  passwordTemp: boolean;

  @ManyToOne(() => Role, role => role.users, { nullable: true })
  role: Role;

  @OneToMany(() => Order, order => order.user, { nullable: true })
  orders: Order[];

  @OneToMany(() => TasksEntity, task => task.user, { nullable: true })
  tasks: TasksEntity[]; // Relación de uno a muchos con las tareas

  @OneToMany(() => Sale, sale => sale.createdBy, { nullable: true })
  sales: Sale[];

}
