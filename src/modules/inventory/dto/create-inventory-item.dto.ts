import { IsUUID, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @IsUUID()
  @IsNotEmpty()
  variantId!: string;

  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @IsInt()
  @Min(0)
  quantity!: number;
}