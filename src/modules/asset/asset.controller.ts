import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/decorators/permission.decorator';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { AssetService } from './asset.service';
import { CreateUpdateAssetDto } from './dto/create-update-asset.dto';
import { RfidParamDto } from 'src/global/dto/params-rfid.dto';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';
import { FilterAliasDto } from './dto/filter-alias.dto';
import { NameParamDto } from 'src/global/dto/params-name.dto';

@ApiTags('Asset')
@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @ApiOperation({
    summary: 'Get all asset data.',
  })
  @ApiBearerAuth()
  @Permissions('assetManagement.viewAllAsset')
  @Get()
  async getAll(@Query() query: FilterAliasDto) {
    console.log(query)
    return this.assetService.getAll(query);
  }

  @ApiOperation({
    summary: 'Add New Asset.',
  })
  @ApiBearerAuth()
  @Permissions('assetManagement.addNewAsset')
  @Post()
  async create(@Body() body: CreateUpdateAssetDto, @GetUser() user: IUserRequest) {
    return this.assetService.create(body, user);
  }

  @ApiOperation({
    summary: 'Get asset by name.',
  })
  @ApiBearerAuth()
  @Permissions('assetManagement.viewAllAsset')
  @Get('name/:name')
  async getByName(@Param() params: NameParamDto, @Query() query: { flow?: string }) {
    return this.assetService.getByName(params.name as string, query);
  }

  @ApiOperation({
    summary: 'Get asset by rfid.',
  })
  @ApiBearerAuth()
  @Permissions('assetManagement.viewAllAsset')
  @Get('rfid/:rfid')
  async getByRfid(@Param() params: RfidParamDto) {
    return this.assetService.getByRfid(params.rfid as string);
  }

  @ApiOperation({
    summary: 'Get asset by id.',
  })
  @ApiBearerAuth()
  @Permissions('assetManagement.viewAllAsset')
  @Get(':id')
  async get(@Param() params: UuidParamDto) {
    return this.assetService.get(params.id as string);
  }

  @ApiOperation({
    summary: 'Update asset by id.',
  })
  @ApiBearerAuth()
  @Permissions('assetManagement.updateAsset')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: CreateUpdateAssetDto, @GetUser() user: IUserRequest) {
    return this.assetService.update(id, body, user);
  }

  @ApiOperation({
    summary: 'Delete asset by id.',
  })
  @ApiBearerAuth()
  @Permissions('assetManagement.deleteAsset')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.assetService.delete(id);
  }
}
