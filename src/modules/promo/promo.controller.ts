import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromoService } from './promo.service';
import { Permissions } from 'src/decorators/permission.decorator';
import { CreatePromoDto } from './dto/create-promo.dto';
import { Promo } from './entities/promo.entity';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('Promo')
@Controller('promo')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @ApiOperation({
    summary: 'Get all promo',
  })
  @Public()
  @Get()
  async findAll(): Promise<Promo[]> {
    return this.promoService.findAll();
  }

  @ApiOperation({
    summary: 'Get promo by id',
  })
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Promo> {
    return this.promoService.findOne(id);
  }

  @ApiOperation({
    summary: 'Create promo',
  })
  @ApiBearerAuth()
  // @Permissions('promoManagement.createPromo')
  @Post()
  async create(@Body() body: CreatePromoDto): Promise<Promo> {
    return this.promoService.create(body);
  }

  @ApiOperation({
    summary: 'Update promo',
  })
  @ApiBearerAuth()
  @Permissions('promoManagement.updatePromo')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: CreatePromoDto,
  ): Promise<Promo> {
    return this.promoService.update(id, body);
  }

  @ApiOperation({
    summary: 'Delete promo',
  })
  @ApiBearerAuth()
  @Permissions('promoManagement.deletePromo')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.promoService.delete(id);
  }
}
