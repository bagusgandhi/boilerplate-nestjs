import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { Permissions } from 'src/decorators/permission.decorator';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';
@ApiTags('Invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @ApiOperation({
    summary: 'Get all invoices.',
  })
  @ApiBearerAuth()
  @Permissions('invoiceManagement.viewAllInvoice')
  @Get()
  async findAll(@Query() query: PaginationDto) {
    return this.invoiceService.findAll(query);
  }

  @ApiOperation({
    summary: 'Get all invoices by user.',
  })
  @ApiBearerAuth()
  @Get('me')
  async findByUser(
    @Query() query: PaginationDto,
    @GetUser() user: IUserRequest,
  ) {
    return this.invoiceService.findByUser(user, query);
  }

  @ApiOperation({
    summary: 'Get a invoice by invoice number.',
  })
  @ApiBearerAuth()
  @Get('me/number/:invoice_number')
  async findOneByInvoiceNumber(
    @Param('invoice_number') invoice_number: string,
    @GetUser() user: IUserRequest,
  ) {
    return this.invoiceService.findByInvoiceUser(invoice_number, user);
  }

  @ApiOperation({
    summary: 'Get a invoice by id.',
  })
  @ApiBearerAuth()
  @Permissions('invoiceManagement.viewAllInvoice')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @ApiOperation({
    summary: 'Get a invoice by id and user.',
  })
  @ApiBearerAuth()
  @Get('me/:id')
  async findOneByUser(@Param('id') id: string, @GetUser() user: IUserRequest) {
    return this.invoiceService.findOneByUser(id, user);
  }
}
