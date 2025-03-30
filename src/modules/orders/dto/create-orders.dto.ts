import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrdersDto {
  @ApiProperty({
    example: 'Domain Name',
    description: 'The name of the domain',
  })
  @IsString()
  @IsNotEmpty()
  domain_name: string;

  @ApiProperty({
    example: 'Description',
    description: 'The description of the order',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Phone number of the user',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: '123 Main St, City, Country',
    description: 'Address of the user',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 'Domain ID',
    description: 'The ID of the domain',
  })
  @IsUUID()
  @IsNotEmpty()
  domain_id: string;

  @ApiProperty({
    example: 'Product ID',
    description: 'The ID of the product',
  })
  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({
    example: 'Template ID',
    description: 'The ID of the template',
  })
  @IsUUID()
  @IsNotEmpty()
  template_id?: string;

  @ApiProperty({
    example: 'Promo ID',
    description: 'The ID of the promo',
  })
  @IsUUID()
  @IsOptional()
  promo_id?: string;
}
