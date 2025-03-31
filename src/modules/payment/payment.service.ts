import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoiceService } from '../invoice/invoice.service';
import { StatusInvoice, TypeInvoice } from '../invoice/dto/update-invoice.dto';
import { OrdersService } from '../orders/orders.service';
import { Invoice } from '../invoice/entities/invoice.entity';
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

  async createWithTransaction(
    queryRunner: QueryRunner,
    body: CreatePaymentDto,
    invoice: Invoice,
  ): Promise<Payment> {
    const payment = new Payment();
    payment.invoice = invoice;
    payment.transaction_details = body.transaction_details;
    payment.amount = body.amount;
    payment.status = body.status;
    await queryRunner.manager.save(Payment, payment);
    return payment;
  }

  // this only handle invoice and payment data
  async webhook(body: any): Promise<any> {
    const queryRunner =
      this.paymentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      this.logger.log('Received Midtrans webhook:', body);

      // Extract relevant data from Midtrans webhook
      const {
        order_id,
        transaction_status,
        payment_type,
        transaction_time,
        fraud_status,
        acquirer,
        gross_amount,
        currency,
      } = body;

      // Find the invoice first
      const invoice = await this.invoiceService.findByInvoiceNumber(order_id);

      console.info('invoice', invoice.order.id);

      // Create new payment record
      const payment = this.paymentRepository.create({
        invoice,
        transaction_details: {
          payment_type,
          transaction_time,
          fraud_status,
          transaction_status,
          acquirer,
          currency,
        },
        amount: parseInt(gross_amount),
      });

      // Handle different transaction statuses
      switch (transaction_status) {
        case 'capture':
          if (fraud_status === 'challenge') {
            payment.status = PaymentStatus.PENDING;
          } else if (fraud_status === 'accept') {
            payment.status = PaymentStatus.SUCCESS;
            // Update invoice status to paid
            await this.invoiceService.updateWithTransaction(
              queryRunner,
              invoice.id,
              { status: StatusInvoice.PAID },
            );

            if (invoice.type === TypeInvoice.NEW_ORDER) {
              await this.ordersService.activateOrder(invoice.order.id);
            }
          }
          break;
        case 'settlement':
          payment.status = PaymentStatus.SUCCESS;
          // Update invoice status to paid
          await this.invoiceService.updateWithTransaction(
            queryRunner,
            invoice.id,
            { status: StatusInvoice.PAID },
          );

          if (invoice.type === TypeInvoice.NEW_ORDER) {
            await this.ordersService.activateOrder(invoice.order.id);
          }
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

      // Save the new payment using the query runner
      await queryRunner.manager.save(Payment, payment);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `New payment record created for invoice ${order_id} with status ${payment.status}`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error processing Midtrans webhook:', error);
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
