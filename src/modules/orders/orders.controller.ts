import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrdersDto } from './dto/create-orders.dto';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';
import { Permissions } from 'src/decorators/permission.decorator';
import { PaginationDto } from 'src/global/dto/pagination.dto';
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({
    summary: 'Create a order.',
  })
  @ApiBearerAuth()
  @Post()
  async create(
    @Body() createOrderDto: CreateOrdersDto,
    @GetUser() user: IUserRequest,
  ) {
    return this.ordersService.create(createOrderDto, user);
  }

  @ApiOperation({
    summary: 'Get all orders.',
  })
  @ApiBearerAuth()
  @Permissions('orderManagement.viewAllOrder')
  @Get()
  async findAll(@Query() query: PaginationDto) {
    return this.ordersService.findAll(query);
  }

  @ApiOperation({
    summary: 'Get all orders by user.',
  })
  @ApiBearerAuth()
  @Get('me')
  async findByUser(
    @Query() query: PaginationDto,
    @GetUser() user: IUserRequest,
  ) {
    return this.ordersService.findByUser(user, query);
  }

  @ApiOperation({
    summary: 'Get a order by id.',
  })
  @ApiBearerAuth()
  @Permissions('orderManagement.viewAllOrder')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @ApiOperation({
    summary: 'Get a order by id and user.',
  })
  @ApiBearerAuth()
  @Get('me/:id')
  async findOneByUser(@Param('id') id: string, @GetUser() user: IUserRequest) {
    return this.ordersService.findOneByUser(id, user);
  }
}
