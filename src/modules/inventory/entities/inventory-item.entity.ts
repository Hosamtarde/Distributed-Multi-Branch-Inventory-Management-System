import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  VersionColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { ProductVariant } from '../../products/products-variants/entities/product-variant.entity';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('inventory')
@Unique(['variant', 'branch'])
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  variant!: ProductVariant;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  branch!: Branch;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @VersionColumn()
  version!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}