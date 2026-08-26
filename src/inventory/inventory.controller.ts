import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { AdjustQuantityDto } from './dto/adjust-quantity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async findAll() {
    return this.inventoryService.findAll();
  }

  @Get('branch/:branchId')
  async findByBranch(@Param('branchId') branchId: string) {
    return this.inventoryService.findByBranch(branchId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.BRANCH_MANAGER)
  @Post()
  async create(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.BRANCH_MANAGER)
  @Put(':id/adjust')
  async adjustQuantity(
    @Param('id') id: string,
    @Body() dto: AdjustQuantityDto,
  ) {
    return this.inventoryService.adjustQuantity(id, dto);
  }
}