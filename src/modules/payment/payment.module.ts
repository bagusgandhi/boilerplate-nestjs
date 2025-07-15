import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceModule } from 'src/modules/invoice/invoice.module';
import { OrdersModule } from '../orders/orders.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [OrdersModule, InvoiceModule, TypeOrmModule.forFeature([Payment]), QueueModule],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
