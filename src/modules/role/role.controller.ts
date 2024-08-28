import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permissions } from 'src/decorators/permission.decorator';
import { UuidParamDto } from 'src/global/dto/params-id.dto';


@ApiTags('Roles')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({
    summary: 'Get all role.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.viewAllRoles')
  @Get()
  async getAll(@Query() query: PaginationDto) {
    return await this.roleService.findAll(query);
  }

  @ApiOperation({
    summary: 'Add New role.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.addNewRole')
  @Post()
  async signUp(@Body() body: CreateRoleDto) {
    return await this.roleService.create(body);
  }

  @ApiOperation({
    summary: 'Get role by id.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.viewAllRoles')
  @Get(':id')
  async getRoleById(@Param() params: UuidParamDto) {
    return await this.roleService.findRoleById(params.id as any);
  }

  @ApiOperation({
    summary: 'Delete role by id.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.deleteRole')
  @Delete(':id')
  async deleteRoleById(@Param('id') id: string) {
    return await this.roleService.delete(id);
  }

  @ApiOperation({
    summary: 'Update role by id.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.updateRole')
  @Put(':id')
  async updateRoleById(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return await this.roleService.update(id, body);
  }
}
