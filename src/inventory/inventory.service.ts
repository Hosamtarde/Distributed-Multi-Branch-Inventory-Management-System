import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { AdjustQuantityDto } from './dto/adjust-quantity.dto';
import { ProductVariantsService } from '../products/products-variants/product-variants.service';
import { BranchesService } from '../branches/branches.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    private variantsService: ProductVariantsService,
    private branchesService: BranchesService,
  ) {}

  async create(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    const variant = await this.variantsService.findOne(dto.variantId);
    const branch = await this.branchesService.findOne(dto.branchId);

    const existing = await this.inventoryRepository.findOne({
      where: {
        variant: { id: dto.variantId },
        branch: { id: dto.branchId },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Inventory record already exists for this variant and branch',
      );
    }

    const item = this.inventoryRepository.create({
      variant,
      branch,
      quantity: dto.quantity,
    });

    return this.inventoryRepository.save(item);
  }

  async findAll(): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      relations: { variant: true, branch: true },
    });
  }

  async findOne(id: string): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({
      where: { id },
      relations: { variant: true, branch: true },
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with id ${id} not found`);
    }

    return item;
  }

  async findByBranch(branchId: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      where: { branch: { id: branchId } },
      relations: { variant: true, branch: true },
    });
  }

  async adjustQuantity(
    id: string,
    dto: AdjustQuantityDto,
  ): Promise<InventoryItem> {
    return this.inventoryRepository.manager.transaction(async (manager) => {
      // الخطوة 1: نقرأ السجل بدون أي relations، مع القفل الحقيقي
      const item = await manager.findOne(InventoryItem, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!item) {
        throw new NotFoundException(`Inventory item with id ${id} not found`);
      }

      const newQuantity = item.quantity + dto.quantity;

      if (newQuantity < 0) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${item.quantity}, requested: ${Math.abs(dto.quantity)}`,
        );
      }

      item.quantity = newQuantity;
      await manager.save(item);

      // الخطوة 2: بعد ما نحفظ بأمان، نجيب النسخة الكاملة (مع العلاقات) للرد فقط
      const result = await manager.findOne(InventoryItem, {
        where: { id },
        relations: { variant: true, branch: true },
      });

      return result!;
    });
  }
}