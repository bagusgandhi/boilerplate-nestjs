import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  // IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
// import { SignUpDto } from 'src/modules/auth/dto/signup.dto';

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
  @IsOptional()
  template_id?: string;

  @ApiProperty({
    example: 'Promo ID',
    description: 'The ID of the promo',
  })
  @IsUUID()
  @IsOptional()
  promo_id?: string;

  // @ApiProperty({
  //   example: 'Account',
  //   description: 'Register Account',
  // })
  // @IsObject()
  // @IsOptional()
  // account?: SignUpDto;
}
