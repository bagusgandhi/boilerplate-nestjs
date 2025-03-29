import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProductDuration {
  ONE_YEAR = 1,
  TWO_YEARS = 2,
  THREE_YEARS = 3,
  FOUR_YEARS = 4,
  FIVE_YEARS = 5,
  SIX_YEARS = 6,
  SEVEN_YEARS = 7,
  EIGHT_YEARS = 8,
  NINE_YEARS = 9,
  TEN_YEARS = 10,
}

export class CreateProductDto {
  @ApiProperty({
    example: 'Toko Online Starter',
    description: 'The name of the product',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'This is Description Product for Toko Online Starter',
    description: 'The Description of the product',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 100000,
    description: 'The price of the product',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 6,
    description: 'The duration of the product',
  })
  @IsNumber()
  @IsNotEmpty()
  duration: ProductDuration;

  @ApiProperty({
    example: ['"0ae30c55-2139-4173-b63a-cded587b5e23"'],
    description: 'The id categories of the product',
  })
  @IsArray()
  @IsUUID(4, { each: true })
  @IsNotEmpty()
  categories: string[];
}
