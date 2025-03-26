import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

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
}
