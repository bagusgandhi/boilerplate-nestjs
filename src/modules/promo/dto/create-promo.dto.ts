import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromoDto {
  @ApiProperty({
    example: 'Promo 10%',
    description: 'The name of the promo',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'This is Description Promo for Toko Online',
    description: 'The Description of the promo',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 100000,
    description: 'The price of the promo',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
