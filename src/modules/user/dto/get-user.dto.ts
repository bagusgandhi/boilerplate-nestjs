// update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/global/dto/pagination.dto';

export class GetUserDto extends PartialType(PaginationDto) {
  @ApiProperty({
    description: 'Filter user by role id',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roleId?: string[];
}
