import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsEnum,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum BogieType {
  Bogie_1_1 = '1.1',
  Bogie_1_2 = '1.2',
  Bogie_1_3 = '1.3',
  Bogie_1_4 = '1.4',
  Bogie_2_1 = '2.1',
  Bogie_2_2 = '2.2',
  Bogie_2_3 = '2.3',
  Bogie_2_4 = '2.4'
}

export class CreateUpdateMaintenanceDto {

  @ApiProperty({
    example: 'b9c63c51-20ae-4fe6-9a39-9641e7d4ecc5',
    description: 'The id of the Asset',
  })
  @IsUUID()
  @IsNotEmpty()
  asset_id: string;

  @ApiProperty({
    example: 'inisialisasi',
    description: 'The flow / phase maintenance name',
  })
  @IsString()
  @IsOptional()
  flow?: string;

  @ApiProperty({
    example: 'Program Maintenance',
    description: 'The Program of maintenance',
    required: false,
  })
  @IsString()
  @IsOptional()
  program?: string;

  @ApiProperty({
    description: 'Status Maintenance',
    required: false,
  })
  @Transform(({ value }) => (value === undefined || value === null ? undefined : value === 'true' || value === true))
  @IsBoolean()
  @IsOptional()
  is_maintenance?: boolean;

}
