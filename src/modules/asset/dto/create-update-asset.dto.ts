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

export enum StatusType {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  NOT_FEASIBLE = 'not_feasible'
}

export class CreateUpdateAssetDto {
  @ApiProperty({
    example: 'JOKER',
    description: 'The name of the Asset',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '9876543321',
    description: 'RFID Number',
  })
  @IsString()
  @IsOptional()
  rfid?: string;

  @ApiProperty({
    example: 'Train Set',
    description: 'The Asset Type',
  })
  @IsEnum(AssetType)
  @IsNotEmpty()
  asset_type: AssetType;

  @ApiProperty({
    example: 'GB',
    description: 'The Carriage Type',
  })
  @IsEnum(CarriageType)
  @IsOptional()
  carriage_type?: CarriageType;

  @ApiProperty({
    example: 'GB - KKBW 50T (INKA)',
    description: 'The Factory of Asset',
  })
  @IsString()
  @IsOptional()
  factory?: string;

  @ApiProperty({
    description: 'The Location of Asset Storage',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: '1.1',
    description: 'Bogie',
  })
  @IsEnum(BogieType)
  @IsOptional()
  bogie?: BogieType;

  @ApiProperty({
    example: 'b9c63c51-20ae-4fe6-9a39-9641e7d4ecc5',
    description: 'The Parrent of Asset',
  })
  @IsOptional() // Optional if parentAsset can be null
  // @IsUUID()
  parent_asset_id?: string | null; // This will hold the ID of the parent asset

  @ApiProperty({
    example: { "diameter": 800, "flank": 10 },
    description: 'The params value maintenance',
  })
  @IsObject()
  @IsOptional()
  paramsValue?: Record<string, any>;

  @ApiProperty({
    example: 'inisialisasi',
    description: 'The flow / phase maintenance name',
    required: false,
  })
  @IsString()
  @IsOptional()
  flow?: string;

  @ApiProperty({
    example: 'Status Asset',
    description: 'The Status of Asset',
    required: false,
  })
  @IsEnum(StatusType)
  @IsOptional()
  status?: StatusType;

  @ApiProperty({
    example: 'Program Maintenance',
    description: 'The Program of maintenance',
    required: false,
  })
  @IsString()
  @IsOptional()
  program?: string;
}
