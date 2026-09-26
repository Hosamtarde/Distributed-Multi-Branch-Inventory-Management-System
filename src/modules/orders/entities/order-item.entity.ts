import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { ProductVariant } from '../../products/products-variants/entities/product-variant.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order!: Order;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT', nullable: false })
  variant!: ProductVariant;

  @Column('int')
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number; // price snapshot at the moment of sale

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal!: number; // quantity x unitPrice
}