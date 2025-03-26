import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDomainDto {
  @ApiProperty({
    example: 'example.com',
    description: 'The name of the domain',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 1,
    description: 'The customer id of the domain',
  })
  @IsNumber()
  @IsNotEmpty()
  customer_id: number;

  // default 1 year
  @ApiProperty({
    example: 1,
    description: 'The period years of the domain',
  })
  @IsNumber()
  @IsNotEmpty()
  period: number;

  @ApiProperty({
    example: false,
    description: 'Include premium domains',
  })
  @IsBoolean()
  @IsOptional()
  include_premium_domains?: boolean;

  @ApiProperty({
    example: false,
    description: 'Buy whois protection',
  })
  @IsBoolean()
  @IsOptional()
  buy_whois_protection?: boolean;

  @ApiProperty({
    example: false,
    description: 'Buy whois protection',
  })
  @IsNumber()
  @IsOptional()
  registrant_contact_id?: number;

  @ApiProperty({
    example: ['ns1.example.com', 'ns2.example.com'],
    description: 'The nameservers of the domain',
  })
  @IsArray()
  @IsOptional()
  nameservers?: string[];
}
