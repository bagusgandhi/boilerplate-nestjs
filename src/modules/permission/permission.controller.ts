import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permissions } from 'src/decorators/permission.decorator';

@ApiTags('Permission')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({
    summary: 'Add new permission.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.addPermission')
  @Post()
  async createPermission(@Body() body: CreatePermissionDto) {
    return await this.permissionService.createPermission(body);
  }
  
  @ApiOperation({
    summary: 'Get all modules.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.viewAllModules')
  @Get('/modules')
  async getAll() {
    return await this.permissionService.findAllModule();
  }

  @ApiOperation({
    summary: 'Get modules by id.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.viewAllModules')
  @Get('/modules/:id')
  async getAllById(@Param('id') id: string) {
    return await this.permissionService.findModuleById(id);
  }

  @ApiOperation({
    summary: 'Add new modules.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.addNewModule')
  @Post('/modules')
  async create(@Body() body: CreateModuleDto) {
    return await this.permissionService.createModule(body);
  }

  @ApiOperation({
    summary: 'Update module by id.',
  })
  @ApiBearerAuth()
  @Put('/modules/:id')
  async updateModuleById(@Param('id') id: string, @Body() body: UpdateModuleDto) {
    return await this.permissionService.updateModule(id, body);
  }

  @ApiOperation({
    summary: 'Delete module by id.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.deleteModule')
  @Delete('/modules/:id')
  async deleteModuleById(@Param('id') id: string) {
    return await this.permissionService.deleteModule(id);
  }

  @ApiOperation({
    summary: 'Update permission.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.updatePermission')
  @Patch(':id')
  async updatePermission(@Param('id') id: string, @Body() body: UpdatePermissionDto) {
    return await this.permissionService.updatePermission(id, body);
  }

  @ApiOperation({
    summary: 'Get permission by id.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.viewAllModules')
  @Get(':id')
  async getPermissionById(@Param('id') id: string) {
    return await this.permissionService.findPermissionById(id);
  }

  @ApiOperation({
    summary: 'Delete permission by id.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.deletePermission')
  @Delete(':id')
  async deletePermissionById(@Param('id') id: string) {
    return await this.permissionService.deletePermission(id);
  }

}
