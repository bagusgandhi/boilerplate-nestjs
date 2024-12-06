import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';
import { AssetType } from './create-update-asset.dto';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { Transform, Type } from 'class-transformer';

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
    // example: 'Bogie',
    description: 'Filter by The Asset Types',
    required: false,
    // type: [String], // To indicate it can also be an array
  })
  @IsOptional()
  // @ValidateIf((o) => !Array.isArray(o.asset_type)) // Validate only if not an array
  // @IsEnum(AssetType, { each: false }) // Validate single value
  // @ValidateIf((o) => Array.isArray(o.asset_type)) // Validate only if it's an array
  @IsArray()
  @ArrayNotEmpty() // Ensure the array is not empty
  @IsEnum(AssetType, { each: true }) // Validate each element in the array
  // @Type(() => String) // Transform input into a string array if necessary
  asset_types?: AssetType | AssetType[];

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

  @ApiProperty({
    description: 'Status Maintenance',
    required: false,
  })
  @Transform(({ value }) => (value === undefined || value === null ? undefined : value === 'true' || value === true))
  @IsBoolean()
  @IsOptional()
  is_maintenance?: boolean;

}
