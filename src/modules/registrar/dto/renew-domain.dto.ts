import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RenewDomainDto {
  // default 1 year
  @ApiProperty({
    example: 1,
    description: 'The period years of the domain',
  })
  @IsNumber()
  @IsNotEmpty()
  period: number;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Current expiry date of the order (Y-m-d)',
  })
  @IsString()
  @IsNotEmpty()
  current_date: string;

  @ApiProperty({
    example: false,
    description: 'Buy whois protection',
  })
  @IsBoolean()
  @IsOptional()
  buy_whois_protection?: boolean;
}
