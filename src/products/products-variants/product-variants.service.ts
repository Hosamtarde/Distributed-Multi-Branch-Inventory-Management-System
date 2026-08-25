import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../products-variants/entities/product-variant.entity';
import { CreateProductVariantDto } from '../products-variants/dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../products-variants/dto/update-product-variant.dto';
import { ProductsService } from '../products.service';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private variantsRepository: Repository<ProductVariant>,
    @Inject(forwardRef(() => ProductsService))
    private productsService: ProductsService,
  ) {}

  async create(dto: CreateProductVariantDto): Promise<ProductVariant> {
    const product = await this.productsService.findOne(dto.productId);

    const variant = this.variantsRepository.create({
      sku: dto.sku,
      variantName: dto.variantName,
      price: dto.price,
      product,
    });

    return this.variantsRepository.save(variant);
  }

  async findAll(): Promise<ProductVariant[]> {
    return this.variantsRepository.find({ relations: { product: true } });
  }

  async findOne(id: string): Promise<ProductVariant> {
    const variant = await this.variantsRepository.findOne({
      where: { id },
      relations: { product: true },
    });

    if (!variant) {
      throw new NotFoundException(`Variant with id ${id} not found`);
    }

    return variant;
  }

  async findByProduct(productId: string): Promise<ProductVariant[]> {
    return this.variantsRepository.find({
      where: { product: { id: productId } },
      relations: { product: true },
    });
  }

  async update(
    id: string,
    dto: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    const variant = await this.findOne(id);

    if (dto.productId) {
      const product = await this.productsService.findOne(dto.productId);
      variant.product = product;
    }

    Object.assign(variant, {
      sku: dto.sku ?? variant.sku,
      variantName: dto.variantName ?? variant.variantName,
      price: dto.price ?? variant.price,
    });

    return this.variantsRepository.save(variant);
  }

  async remove(id: string): Promise<void> {
    const variant = await this.findOne(id);
    await this.variantsRepository.remove(variant);
  }
}