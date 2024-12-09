import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUpdateMaintenanceDto } from './dto/create-maintenance.dto';
import { ParamsUpdateMaintenanceDto } from './dto/params-update-maintenance.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { FilterListMaintenanceDto } from './dto/filter-list-maintenance.dto';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';
import { ApiKeyGuard } from '../auth/guard/api-key.guard';
import { AssetService } from '../asset/asset.service';
import { UpdateRoschaAssetDto } from '../asset/dto/update-roscha.dto';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('Maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
    private readonly assetService: AssetService,
  ) {}

  @ApiOperation({
    summary: 'Upsert maintenance.',
  })
  @ApiBearerAuth()
  @Patch()
  async upsert(@Body() body: CreateUpdateMaintenanceDto, @GetUser() user: IUserRequest) {
    return this.maintenanceService.upsert(body, user);
  }

  @ApiOperation({
    summary: 'Upsert maintenance.',
  })
  // @Public()
  @UseGuards(ApiKeyGuard)
  @Post('/roscha')
  async createFromRoscha(@Body() body: UpdateRoschaAssetDto) {
    return this.assetService.externalRoschaUpdate(body);
  }

  // @ApiOperation({
  //   summary: 'Update maintenance.',
  // })
  // @ApiBearerAuth()
  // @Patch()
  // async update(@Body() body: CreateUpdateMaintenanceDto) {
  //   return this.maintenanceService.update(body);
  // }

  @ApiOperation({
    summary: 'Get all Maintenance data.',
  })
  @ApiBearerAuth()
  @Get()
  async getAll(@Query() query: FilterListMaintenanceDto) {
    return this.maintenanceService.getAll(query);
  }

  @ApiOperation({
    summary: 'Get Maintenance data by id.',
  })
  @ApiBearerAuth()
  @Get(':id')
  async get(@Param() params: UuidParamDto) {
    return this.maintenanceService.get(params.id as string);
  }
}
