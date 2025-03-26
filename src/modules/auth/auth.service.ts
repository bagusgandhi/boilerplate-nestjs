import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { SignInDto } from './dto/signin.dto';
import { JwtPayload } from './interface/jwt.interface';
import { SignUpDto } from './dto/signup.dto';
import { SignInApiKeyDto } from './dto/signin-apikey.dto';
import { Env } from 'src/config/env-loader';
import { MailerService } from '@nestjs-modules/mailer';
const { SECRET_API_KEY } = Env();

@Injectable()
export class AuthService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailService: MailerService,
  ) {}

  validateApiKey(apiKey: string) {
    return apiKey === SECRET_API_KEY;
  }

  async validatePassword(password: string, hashed: string) {
    return await bcrypt.compare(password, hashed);
  }

  async signIn(signInDto: SignInDto) {
    try {
      const user = await this.userService.findUserByEmail(signInDto.email);

      if (!user) {
        throw new HttpException(
          'Email atau password tidak sesuai!',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { id, name, email, roles, password, provider } = user;

      if (provider !== 'basic' && password === null) {
        throw new HttpException(
          'Akun anda menggunakan oAuth, silahkan login melalui oAuth',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const matched = await this.validatePassword(signInDto.password, password);

      if (matched) {
        const payload: JwtPayload = { id };

        return {
          access_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
          refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
          user: {
            id,
            email,
            name,
            roles,
          },
        };
      } else {
        throw new HttpException(
          'Email atau password tidak sesuai!',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (error) {
      this.logger.error(error);
      // throw new HttpException(error.message, error.statusCode);
      throw error;
    }
  }

  async signUp(signUpDto: SignUpDto) {
    try {
      const { id, email, name, roles } = await this.userService.create({
        ...signUpDto,
      });

      const payload: JwtPayload = { id };

      return {
        access_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
        refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
        user: {
          id,
          email,
          name,
          roles,
        },
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const payload = { id: decoded.id };
      return {
        access_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async signInWithApiKey(signInApiKey: SignInApiKeyDto, provider: string) {
    try {
      const user = await this.userService.findUserByEmail(signInApiKey.email);

      if (!user) {
        const newUser = await this.userService.createFromApiKey(
          signInApiKey,
          provider,
        );

        const payload: JwtPayload = { id: newUser.id };

        return {
          access_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
          refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            roles: newUser.roles,
          },
        };
      } else {
        const payload: JwtPayload = { id: user.id };

        return {
          access_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
          refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
          },
        };
      }
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async forgotPassword(email: string): Promise<string | boolean> {
    try {
      const user = await this.userService.findUserByEmail(email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const payload: JwtPayload = { id: user.id };

      // Generate a token (valid for 1 hour)
      const resetToken = this.jwtService.sign(payload, { expiresIn: '1h' });

      user.resetToken = resetToken;
      user.resetTokenExpires = new Date(Date.now() + 3600 * 1000); // 1 hour from now

      // console.info(user);
      await this.userService.update(user.id as any, user);

      await this.mailService.sendMail({
        from: 'Boilerplate Admin <admin@boilerplate.naiweb.my.id>',
        to: email,
        subject: `Reset Password Boilerplate Account`,
        text: `Reset Password Boilerplate Account http://localhost:8000/api/v1/auth/reset-password/${resetToken}`,
      });

      // // TODO: Send Email with Reset Link
      return resetToken; // For now, return token (replace with email logic)
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<any> {
    let decoded: any;
    try {
      decoded = this.jwtService.verify(resetToken);
    } catch (err) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userService.findUserById(decoded.id);
    if (
      !user ||
      user.resetToken !== resetToken ||
      user.resetTokenExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired token');
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await this.userService.update(user.id as any, user);

    return { message: 'Password reset successfully' };
  }
}
