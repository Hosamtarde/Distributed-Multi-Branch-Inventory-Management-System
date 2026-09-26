import { IsInt, IsNotEmpty } from 'class-validator';

export class AdjustQuantityDto {
  @IsInt()
  @IsNotEmpty()
  quantity!: number;
}