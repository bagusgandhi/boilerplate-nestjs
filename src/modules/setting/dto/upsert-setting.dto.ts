import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertSettingDto {
  @ApiProperty({
    example: "uuid-of-the setting data",
    description: 'The UUID of setting data',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id?: string;
  
  @ApiProperty({
    example: [7, 14, 28],
    description: 'The many days of reminder before end_Date',
    required: false,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  reminder_days_before?: number[];

  @ApiProperty({
    example: ["uuid-user1", "uuid-user2"],
    description: 'The uuids of user',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userIds?: string[];

}
