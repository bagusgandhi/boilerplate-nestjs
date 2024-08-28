import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserRepository } from './repositories/user.repository';
import { UserController } from './user.controller';
import { RoleModule } from '../role/role.module';
import { RoleRepository } from '../role/repositories/role.repository';

@Module({
  imports: [
    RoleModule,
    TypeOrmModule.forFeature([User])],
  providers: [UserService, UserRepository, RoleRepository],
  exports: [UserService],
  controllers: [UserController],

})
export class UserModule {}
