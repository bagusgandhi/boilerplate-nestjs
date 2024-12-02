import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { AssetType } from './create-update-asset.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';

export class FilterAliasDto extends PaginationDto {
  @ApiProperty({
    example: 'Bogie 1.1',
    description: 'The Asset children alias',
    required: false,
  })
  @IsString()
  @IsOptional()
  children_alias?: string;

  @ApiProperty({
    example: 'Bogie',
    description: 'The Asset Type',
    required: false,
  })
  @IsEnum(AssetType)
  @IsOptional()
  asset_type?: AssetType;

  @ApiProperty({
    example: 'b9c63c51-20ae-4fe6-9a39-9641e7d4ecc5',
    description: 'The Parrent of Asset',
    required: false,
  })
  @IsUUID()
  @IsOptional() // Optional if parentAsset can be null
  parent_asset_id?: string; // This will hold the ID of the parent asset

  @ApiProperty({
    example: 'inisialisasi',
    description: 'The flow / phase maintenance name',
    required: false,
  })
  @IsString()
  @IsOptional()
  flow?: string;
}
