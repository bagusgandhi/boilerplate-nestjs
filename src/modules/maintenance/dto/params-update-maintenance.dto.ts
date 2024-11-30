import {
  IsString,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParamsUpdateMaintenanceDto {

  @ApiProperty({
    example: 'b9c63c51-20ae-4fe6-9a39-9641e7d4ecc5',
    description: 'The id of the Asset',
  })
  @IsUUID()
  @IsNotEmpty()
  assetId: string;

  @ApiProperty({
    example: 'inisialisasi',
    description: 'The flow / phase maintenance name',
  })
  @IsString()
  @IsNotEmpty()
  flow: string;

}
