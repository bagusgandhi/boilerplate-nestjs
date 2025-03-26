import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Orders } from 'src/modules/orders/entities/orders.entity';

export enum StatusSite {
  ACTIVE = 'active',
  ON_PROGRESS = 'on progress',
  EXPIRED = 'expired',
}

export class CreateSiteDto {
  @ApiProperty({
    example: 'Cloudflare Zone ID',
    description: 'The ID of the Cloudflare Zone',
  })
  @IsString()
  @IsNotEmpty()
  cloudflare_zone_id: string;

  @ApiProperty({
    example: 'Database Name',
    description: 'The name of the database',
  })
  @IsString()
  @IsNotEmpty()
  db_name: string;

  @ApiProperty({
    example: 'Database User',
    description: 'The user of the database',
  })
  @IsString()
  @IsNotEmpty()
  db_user: string;

  @ApiProperty({
    example: 'Database Password',
    description: 'The password of the database',
  })
  @IsString()
  @IsNotEmpty()
  db_password: string;

  @ApiProperty({
    example: 'Port',
    description: 'The port of the database',
  })
  @IsNumber()
  @IsNotEmpty()
  port: number;

  @ApiProperty({
    example: 'Status',
    description: 'The status of the site',
  })
  @IsEnum(StatusSite)
  @IsNotEmpty()
  status: StatusSite;

  @ApiProperty({
    description: 'The orders of the site',
  })
  @IsObject()
  @IsNotEmpty()
  order: Orders;
}
