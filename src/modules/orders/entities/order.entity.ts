import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderType, OrderStatus } from '../../../common/enums';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  orderNumber!: string; // ORD-20260926-4821

  @Column({ type: 'enum', enum: OrderType })
  type!: OrderType;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.CONFIRMED })
  status!: OrderStatus;

  @ManyToOne(() => Branch, { onDelete: 'RESTRICT', nullable: false })
  branch!: Branch;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  createdBy!: User | null;

  @Column({ nullable: true })
  customerName!: string;

  @Column({ nullable: true })
  customerPhone!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount!: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}