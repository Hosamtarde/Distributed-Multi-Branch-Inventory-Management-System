import { IsString, IsNotEmpty, IsNumber, Min, IsUUID } from 'class-validator';

export class CreateProductVariantDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsNotEmpty()
  variantName!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsUUID()
  @IsNotEmpty()
  productId!: string;
}