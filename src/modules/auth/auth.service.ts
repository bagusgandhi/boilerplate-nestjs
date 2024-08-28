import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { SignInDto } from './dto/signin.dto';
import { JwtPayload } from './interface/jwt.interface';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  async validatePassword(password: string, hashed: string) {
    return await bcrypt.compare(password, hashed);
  }

  async signIn(signInDto: SignInDto) {
    try {
      const user = await this.userService.findUserByEmail(signInDto.email);
      const { id, roles, password } = user;

      const matched = await this.validatePassword(
        signInDto.password,
        password,
      );

      if (matched) {
        const payload: JwtPayload = {
          id: id,
          role: roles,
        };

        return {
          access_token: this.jwtService.sign(payload),
          user: user,
        };
      } else {
        throw new HttpException(
          'Email atau password tidak sesuai!',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async signUp(signUpDto: SignUpDto) {
    try {

      const { id, roles } = await this.userService.create({
        ...signUpDto,
      });

      const payload: JwtPayload = {
        id: id,
        role: roles,
      };

      return {
        access_token: this.jwtService.sign(payload),
        // user: user,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }
}
