import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDomainDto {
  @ApiProperty({
    example: 'Toko Online',
    description: 'The name of the domain',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'This is Description Category for Toko Online',
    description: 'The Description of the category',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 100000,
    description: 'The price of the domain',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
