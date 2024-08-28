import {
  IsString,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateModuleDto {

  @ApiProperty({
    example: 'User Management',
    description: 'The name of the module',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: ['87c4daea-1b59-4c7b-9f79-4ce75b7f6fdc', '3a64d9a1-51dc-49c8-8e71-65902aedfaf4'],
    description: 'The ids of the permissions',
  })
  @IsArray()
  @IsOptional()
  permissionIds?: string[];

}
