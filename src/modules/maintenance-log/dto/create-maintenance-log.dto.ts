import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AssetType {
  TRAIN_SET = 'Train Set',
  GERBONG = 'Gerbong',
  KEPING_RODA = 'Keping Roda',
  BOGIE = 'Bogie',
}

export enum CarriageType {
  GT = 'GT',
  GB = 'GB',
}

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

export class CreateMaintenanceLogDto {

  @ApiProperty({
    example: 'b9c63c51-20ae-4fe6-9a39-9641e7d4ecc5',
    description: 'The id of the Asset',
  })
  @IsUUID()
  @IsOptional()
  asset_id?: string;

  @ApiProperty({
    example: 'Train Set',
    description: 'The Asset Type',
  })
  @IsEnum(AssetType)
  @IsOptional()
  asset_type?: AssetType;

  @ApiProperty({
    example: '1.1',
    description: 'Bogie',
  })
  @IsEnum(BogieType)
  @IsOptional()
  bogie?: BogieType;

  @ApiProperty({
    example: 'inisialisasi',
    description: 'The flow / phase maintenance name',
  })
  @IsString()
  @IsOptional()
  flow?: string;

  @ApiProperty({
    example: 'b9c63c51-20ae-4fe6-9a39-9641e7d4ecc5',
    description: 'The Parrent of Asset',
  })
  @IsUUID()
  @IsOptional() // Optional if parentAsset can be null
  parent_asset_id?: string; // This will hold the ID of the parent asset

  @ApiProperty({
    example: { "diameter": 800, "flank": 10 },
    description: 'The params value maintenance',
  })
  @IsObject()
  @IsOptional()
  paramsValue?: Record<string, any>;

  @ApiProperty({
    example: { action: "swap", data: {}},
    description: 'The details value maintenance',
  })
  @IsObject()
  @IsOptional()
  details?: Record<string, any>;
}
