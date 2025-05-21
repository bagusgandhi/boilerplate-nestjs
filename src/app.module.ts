import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './modules/auth/guard/role.guard';
import { PermissionsGuard } from './modules/auth/guard/permission.guard';
import { JwtAuthGuard } from './modules/auth/guard/jwt.guard';
import { UploadsModule } from './modules/uploads/uploads.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { Env } from './config/env-loader';
import { ContractModule } from './modules/contract/contract.module';
import { StepProgressModule } from './modules/step-progress/step-progress.module';
import { StepGroupModule } from './modules/step-group/step-group.module';
import { BusinessPermitsModule } from './modules/business_permits/business_permits.module';
import { CorporateDocumentsModule } from './modules/corporate_documents/corporate_documents.module';

const { EMAIL_HOST, EMAIL_USERNAME, EMAIL_PASSWORD } = Env();

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    UploadsModule,
    MailerModule.forRoot({
      transport: {
        host: EMAIL_HOST,
        auth: {
          user: EMAIL_USERNAME,
          pass: EMAIL_PASSWORD,
        },
      },
    }),
    ContractModule,
    StepProgressModule,
    StepGroupModule,
    BusinessPermitsModule,
    CorporateDocumentsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard
    }
  ],
})
export class AppModule {}
