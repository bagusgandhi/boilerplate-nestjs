import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UuidParamDto } from 'src/global/dto/params-id.dto';
import { Role } from 'src/modules/role/entities/role.entity';

export interface IUserRequest {
  roles: Role;
  id: string;
  email: string;
  name: string;
}

export const GetUser = createParamDecorator((_data, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest();
  console.log("inside decorator", user)
  return user as IUserRequest;
});
