import {
  IsString,
  IsNotEmpty,
  IsOptional,
  // IsUUID,
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Orders } from 'src/modules/orders/entities/orders.entity';
import { User } from 'src/modules/user/entities/user.entity';

export enum StatusInvoice {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELED = 'canceled',
}

export enum TypeInvoice {
  RENEWAL = 'renewal',
  NEW_ORDER = 'new_order',
}

export class UpdateInvoiceDto {
  @ApiProperty({
    example: 'Description',
    description: 'The description of the order',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'Order ID',
    description: 'The ID of the order',
  })
  @IsObject()
  @IsOptional()
  order?: Orders;

  @ApiProperty({
    example: 'User ID',
    description: 'The ID of the user',
  })
  @IsObject()
  @IsOptional()
  user?: User;

  @ApiProperty({
    example: 'pending',
    description: 'The status of the invoice (pending, paid, canceled)',
  })
  @IsEnum(StatusInvoice)
  @IsNotEmpty()
  status: StatusInvoice;

  @ApiProperty({
    example: '2025-01-01',
    description: 'The due date of the invoice',
  })
  @IsDate()
  @IsNotEmpty()
  due_date: Date;

  @ApiProperty({
    example: 'renewal',
    description: 'The type of the invoice (renewal, new_order)',
  })
  @IsEnum(TypeInvoice)
  @IsNotEmpty()
  type: TypeInvoice;

  @ApiProperty({
    example: 100,
    description: 'The total of the invoice',
  })
  @IsNumber()
  @IsNotEmpty()
  total: number;
}
