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
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { DomainModule } from './modules/domain/domain.module';
import { PromoModule } from './modules/promo/promo.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TemplateModule } from './modules/templates/template.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CloudflareModule } from './modules/cloudflare/cloudflare.module';
import { SitesModule } from './modules/sites/sites.module';
import { RegistrarModule } from './modules/registrar/registrar.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from './modules/queue/queue.module';

const {
  EMAIL_HOST,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
} = Env();

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
    ProductsModule,
    OrdersModule,
    InvoiceModule,
    DomainModule,
    PromoModule,
    CategoriesModule,
    TemplateModule,
    PaymentModule,
    CloudflareModule,
    SitesModule,
    RegistrarModule,
    BullModule.forRoot({
      connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
      },
    }),
    QueueModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
