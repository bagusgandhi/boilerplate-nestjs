import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StatusType {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  NOT_FEASIBLE = 'not_feasible'
}

export class UpdateRoschaAssetDto {
  @ApiProperty({
    example: 'KP100200',
    description: 'The name of the Asset',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: { "diameter": 800, "flens": 50 },
    description: 'The params value maintenance',
  })
  @IsObject()
  @IsOptional()
  paramsValue?: Record<string, any>;

  @ApiProperty({
    example: 'Program',
    description: 'The program of maintenance',
    required: false,
  })
  @IsString()
  @IsOptional()
  program?: string;

  @ApiProperty({
    example: 'WO Number',
    description: 'The program of wo number',
    required: false,
  })
  @IsString()
  @IsOptional()
  wo_number?: string;;
}
