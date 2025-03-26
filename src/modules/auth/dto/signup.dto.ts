import {
  IsPhoneNumber,
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'The password of the user',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  @IsString()
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Karanggayam RT07, Bantul, Bantul, Yogyakarta',
    description: 'The users adress',
  })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({
    example: '+628123456789',
    description: 'The users phone number',
  })
  @IsOptional()
  @IsPhoneNumber('ID', { message: 'Invalid phone number format' }) // 'ID' for Indonesia, change as needed
  phone: string;
}
