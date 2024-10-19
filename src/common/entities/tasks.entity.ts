import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { ServiceOrder } from './service-order.entity';

@Entity('tasks')
export class TasksEntity {
    @PrimaryGeneratedColumn() id:number;

    @Column({ nullable: true })
    payment: string;

    @Column({ nullable: true })
    id_user_create: number;

    @Column({ nullable: true })
    create_day: Date;
    
    @Column({ nullable: true })
    init_day: Date;

    @Column({ nullable: true })
    end_day: Date;

    @ManyToOne(() => User, user => user.tasks, { nullable: true })
    user: User;

    @OneToOne(() => ServiceOrder, serviceOrder => serviceOrder.task, { nullable: true })
    serviceOrder: ServiceOrder;

    @Column({ type: 'enum', enum: ['PENDING', 'IN_PROCESS', 'FINALIZED', 'LATE', 'CANCEL'], default: 'PENDING' })
    status: 'PENDING' | 'IN_PROCESS' | 'FINALIZED' | 'LATE' | 'CANCEL';
    
}
