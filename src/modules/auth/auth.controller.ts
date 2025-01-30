import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/decorators/public.decorator';
import { SignInDto } from './dto/signin.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { RefreshAuthGuard } from './guard/refresh-auth.guard';
import { ApiKeyGuard } from './guard/apikey.guard';
import { SignInApiKeyDto } from './dto/signin-apikey.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';
import { UpdateUserDto } from '../user/dto/update-user.dto';

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

  @ApiOperation({
    summary: 'Refresh Token.',
  })
  // @UseGuards(RefreshAuthGuard)
  @Public()
  @Post('/refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @UseGuards(ApiKeyGuard)
  @Public()
  @Post('/google')
  async signIn(@Body() signInApiKeyDto: SignInApiKeyDto) {
    return await this.authService.signInWithApiKey(signInApiKeyDto, 'google');
  }

  @ApiOperation({
    summary: 'Forgot password',
  })
  @Public()
  @Post('/forgot-password')
  async forgotPassword(@Body() body: Pick<SignInDto, 'email'>) {
    return await this.authService.forgotPassword(body.email);
  }


  @ApiOperation({
    summary: 'Forgot password',
  })
  @Public()
  @Post('/reset-password/:resetToken')
  async resetPassword(@Param() params: Pick<UpdateUserDto, 'resetToken'>, @Body() body: Pick<UpdateUserDto, 'password'>) {
    return await this.authService.resetPassword(params.resetToken, body.password);
  }
}
