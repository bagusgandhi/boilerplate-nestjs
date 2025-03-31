import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './entities/orders.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProductsModule } from '../products/products.module';
import { DomainModule } from '../domain/domain.module';
import { PromoModule } from '../promo/promo.module';
import { UserModule } from '../user/user.module';
import { TemplateModule } from '../templates/template.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { RegistrarModule } from '../registrar/registrar.module';
import { CloudflareModule } from '../cloudflare/cloudflare.module';
import { SitesModule } from '../sites/sites.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    ProductsModule,
    DomainModule,
    PromoModule,
    UserModule,
    TemplateModule,
    InvoiceModule,
    RegistrarModule,
    CloudflareModule,
    SitesModule,
    QueueModule,
    TypeOrmModule.forFeature([Orders]),
  ],
  providers: [OrdersService],
  exports: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
