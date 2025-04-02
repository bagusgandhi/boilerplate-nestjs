import { Controller, Get, Param, Query } from '@nestjs/common';
import { SitesService } from './sites.service';
import { IUserRequest } from 'src/decorators/get-user.decorator';
import { GetUser } from 'src/decorators/get-user.decorator';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { Permissions } from 'src/decorators/permission.decorator';

@ApiTags('Sites')
@Controller('sites')
export class SitesController {
  constructor(private readonly siteService: SitesService) {}

  @ApiOperation({
    summary: 'Get all sites by user.',
  })
  @ApiBearerAuth()
  @Get('me')
  async findByUser(
    @Query() query: PaginationDto,
    @GetUser() user: IUserRequest,
  ) {
    return this.siteService.findByUser(user, query);
  }

  @ApiOperation({
    summary: 'Get a site by id.',
  })
  @Permissions('siteManagement.viewAllSite')
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.siteService.findOne(id);
  }

  @ApiOperation({
    summary: 'Get a site by id and user.',
  })
  @ApiBearerAuth()
  @Get('me/:id')
  async findOneByUser(@Param('id') id: string, @GetUser() user: IUserRequest) {
    return this.siteService.findOneByUser(id, user);
  }
}
