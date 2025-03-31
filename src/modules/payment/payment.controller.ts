import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Public } from 'src/decorators/public.decorator';
import { ApiOperation } from '@nestjs/swagger';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({
    summary: 'Payment webhook',
  })
  @Public()
  @Post('w3b007hok')
  async findAll(@Body() body: any): Promise<any> {
    return await this.paymentService.webhook(body);
  }
}
