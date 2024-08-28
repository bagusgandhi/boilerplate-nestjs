import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/decorators/public.decorator';
import { SignInDto } from './dto/signin.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Login user.',
  })
  @Public()
  @Post('/login')
  async login(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto);
  }
}
