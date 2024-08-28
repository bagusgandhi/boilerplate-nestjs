import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class SignInDto {
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
}
