import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class SignInApiKeyDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'john doe',
    description: 'The name of the user',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
