import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoiceService } from '../invoice/invoice.service';
import { StatusInvoice } from '../invoice/dto/update-invoice.dto';
import { OrdersService } from '../orders/orders.service';
// import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly invoiceService: InvoiceService,
    private readonly ordersService: OrdersService,
  ) {}

  async create(body: CreatePaymentDto): Promise<Payment> {
    // return this.paymentRepository.save(body);
    try {
      return this.paymentRepository.save(body);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async webhook(body: any): Promise<any> {
    try {
      this.logger.log('Received Midtrans webhook:', body);

      // Extract relevant data from Midtrans webhook
      const {
        order_id,
        transaction_status,
        payment_type,
        transaction_time,
        fraud_status,
      } = body;

      // Find the payment record
      const payment = await this.paymentRepository.findOne({
        where: { invoice: { id: order_id } },
        relations: ['invoice'],
      });

      if (!payment) {
        this.logger.error(`Payment not found for order_id: ${order_id}`);
        throw new BadRequestException('Payment not found');
      }

      // Update payment details
      payment.transaction_details = {
        ...payment.transaction_details,
        payment_type,
        transaction_time,
        fraud_status,
      };

      // Handle different transaction statuses
      switch (transaction_status) {
        case 'capture':
          if (fraud_status === 'challenge') {
            payment.status = PaymentStatus.PENDING;
          } else if (fraud_status === 'accept') {
            payment.status = PaymentStatus.SUCCESS;
            // Update invoice status to paid
            await this.invoiceService.updateWithTransaction(
              this.paymentRepository.manager.connection.createQueryRunner(),
              payment.invoice.id,
              { status: StatusInvoice.PAID },
            );
          }
          break;
        case 'settlement':
          payment.status = PaymentStatus.SUCCESS;
          // Update invoice status to paid
          await this.invoiceService.updateWithTransaction(
            this.paymentRepository.manager.connection.createQueryRunner(),
            payment.invoice.id,
            { status: StatusInvoice.PAID },
          );
          break;
        case 'pending':
          payment.status = PaymentStatus.PENDING;
          break;
        case 'deny':
          payment.status = PaymentStatus.DENY;
          break;
        case 'cancel':
          payment.status = PaymentStatus.CANCEL;
          break;
        case 'expire':
          payment.status = PaymentStatus.EXPIRE;
          break;
        case 'refund':
          payment.status = PaymentStatus.REFUNDED;
          break;
        default:
          payment.status = PaymentStatus.UNKNOWN;
      }

      // Save the updated payment
      await this.paymentRepository.save(payment);

      return {
        success: true,
        message: `Payment ${order_id} status updated to ${payment.status}`,
      };
    } catch (error) {
      this.logger.error('Error processing Midtrans webhook:', error);
      throw new BadRequestException(error.message);
    }
  }
}
