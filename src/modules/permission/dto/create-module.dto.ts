import {
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleDto {

  @ApiProperty({
    example: 'User Management',
    description: 'The name of the module',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

}
