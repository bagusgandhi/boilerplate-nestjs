import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({
    example: 'Invoice ID',
    description: 'The ID of the invoice',
  })
  @IsNotEmpty()
  @IsString()
  invoice_id: string;

  @ApiProperty({
    example: 'Transaction Details',
    description: 'The details of the transaction',
  })
  @IsNotEmpty()
  @IsObject()
  transaction_details: any;

  @ApiProperty({
    example: 'Amount',
    description: 'The amount of the payment',
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'Status',
    description: 'The status of the payment',
  })
  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}
