import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoriesModule } from '../categories/categories.module';
import { ProductVariantsModule } from './products-variants/product-variants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CategoriesModule,
    forwardRef(() => ProductVariantsModule),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}