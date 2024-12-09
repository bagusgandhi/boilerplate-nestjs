import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsObject,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BogieType } from './create-maintenance.dto';

export class CreateMaintenanceFromRoschaDto {
  @ApiProperty({
    example: 'GB456801',
    description: 'The ID of the gERBONG',
  })
  @IsUUID()
  @IsNotEmpty()
  gerbong: string;

  @ApiProperty({
    example: 'WO-37780',
    description: 'Work Order Number',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  wo_number: string;

  @ApiProperty({
    example: 'P1',
    description: 'The Program of maintenance',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  program: string;

  @ApiProperty({
    example: { "diameter": 800, "flens": 50 },
    description: 'The params value of maintenance',
  })
  @IsObject()
  @IsNotEmpty()
  paramsValue: Record<string, any>;
  
  @ApiProperty({
    example: '1.1',
    description: 'Bogie',
  })
  @IsEnum(BogieType)
  @IsNotEmpty()
  bogie: BogieType;
}
