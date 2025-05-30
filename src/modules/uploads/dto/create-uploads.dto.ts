import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Contract } from 'src/modules/contract/entities/contract.entity';
import { BusinessPermits } from 'src/modules/business_permits/entities/business-permits.entity';

export class CreateUploadsDto {

  @ApiProperty({
    example: 'image.png',
    description: 'The name of original file',
  })
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @ApiProperty({
    example: 2000,
    description: 'The size number of file',
  })
  @IsNumber()
  @IsOptional()
  size?: number;

  @ApiProperty({
    example: 2000,
    description: 'The size number of file',
  })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({
    example: 'contract',
    description: 'The contract of the upload',
  })
  @IsOptional()
  contract?: Contract;

  @ApiProperty({
    example: 'business_permits',
    description: 'The business permits of the upload',
  })
  @IsOptional()
  business_permits?: BusinessPermits;
}
