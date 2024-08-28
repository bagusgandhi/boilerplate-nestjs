import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';
import { SignUpDto } from '../auth/dto/signup.dto';
import { Roles } from 'src/decorators/role.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/decorators/permission.decorator';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { GetUserDto } from './dto/get-user.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Get all user.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.viewListOfUser')
  @Get()
  async getAll(@Query() query: GetUserDto) {
    return await this.userService.findAll(query);
  }

  @ApiOperation({
    summary: 'Add New user.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.addNewUser')
  @Post()
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.userService.create(signUpDto);
  }

  @ApiOperation({
    summary: 'Get current user profile.',
  })
  @ApiBearerAuth()
  @Get('/profile')
  async getProfile(@GetUser() user: IUserRequest) {
    return await this.userService.findUserById(user.id as any);
  }

  @ApiOperation({
    summary: 'Get User by id.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.viewListOfUser')
  @Get(':id')
  async getUserById(@Param() params: UuidParamDto) {
    return await this.userService.findUserById(params.id as any);
  }

  @ApiOperation({
    summary: 'Update user by id.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.updateUser')
  @Patch(':id')
  async updateUserById(
    @Param() params: UuidParamDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(params.id as any, updateUserDto);
  }

  @ApiOperation({
    summary: 'Delete user by id.',
  })
  @ApiBearerAuth()
  @Permissions('userManagement.deleteUser')
  @Delete(':id')
  async deleteUserById(@Param() params: UuidParamDto) {
    return await this.userService.delete(params.id);
  }
}
