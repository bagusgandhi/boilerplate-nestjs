import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orders, StatusOrder } from './entities/orders.entity';
import { CreateOrdersDto } from './dto/create-orders.dto';
import { DomainService } from '../domain/domain.service';
import { ProductsService } from '../products/products.service';
import { PromoService } from '../promo/promo.service';
import { User } from '../user/entities/user.entity';
import { IUserRequest } from 'src/decorators/get-user.decorator';
import { UserService } from '../user/user.service';
import { TemplatesService } from '../templates/templates.service';
import { InvoiceService } from '../invoice/invoice.service';
import { TypeInvoice, StatusInvoice } from '../invoice/dto/create-invoice.dto';
import * as moment from 'moment';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { RegistrarService } from '../registrar/registrar.service';
import { StatusSite } from '../sites/dto/create-site.dto';
import { Env } from 'src/config/env-loader';
import { CloudflareService } from '../cloudflare/cloudflare.service';
import { SitesService } from '../sites/sites.service';
const { REGISTRAR_CUSTOMER_ID, HOST_SERVER } = Env();
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    private readonly domainService: DomainService,
    private readonly productService: ProductsService,
    private readonly promoService: PromoService,
    private readonly userService: UserService,
    private readonly templateService: TemplatesService,
    private readonly invoiceService: InvoiceService,
    private readonly registrarService: RegistrarService,
    private readonly cloudflareService: CloudflareService,
    private readonly sitesService: SitesService,
  ) {}

  async create(
    createOrderDto: CreateOrdersDto,
    user: IUserRequest,
  ): Promise<Orders> {
    const {
      domain_name,
      domain_id,
      product_id,
      description,
      promo_id,
      template_id,
    } = createOrderDto;
    const queryRunner =
      this.ordersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const domain = await this.domainService.findOne(domain_id);
      const product = await this.productService.findOne(product_id);
      const promo = await this.promoService.findOne(promo_id);
      const userData: User = await this.userService.findUserById(
        user.id as any,
      );
      const template = await this.templateService.findOne(template_id);

      // check domain availability (next feature)
      const domainAvailability =
        await this.registrarService.checkDomainAvailability(domain_name);

      if (!domainAvailability.available) {
        throw new BadRequestException('Domain has been taken');
      }

      // init order
      const order = new Orders();
      order.domain = domain;
      order.product = product;
      order.promo = promo;
      order.domain_name = domain_name;
      order.description = description;
      order.user = userData;
      order.template = template;
      order.expired_date = moment().add(product.duration, 'years').toDate();

      // Create order
      await this.ordersRepository.save(order);

      // Create invoice
      await this.invoiceService.createWithTransaction(queryRunner, {
        order: order,
        user: userData,
        total: order.total,
        due_date: moment().add(1, 'week').toDate(),
        type: TypeInvoice.NEW_ORDER,
        status: StatusInvoice.PENDING,
      });
      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async activateOrder(id: string) {
    const queryRunner =
      this.ordersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await this.findOne(id);
      if (order.status === StatusOrder.ACTIVE) {
        throw new BadRequestException('Order already activated');
      }

      // register domain
      const resReg = await this.registrarService.registerDomain({
        name: order.domain_name,
        period: order.product.duration,
        customer_id: REGISTRAR_CUSTOMER_ID,
      });

      // register cloudflare zones
      const resCf = await this.cloudflareService.addDomain(order.domain_name);

      // create cloudflare dns record
      await this.cloudflareService.addDnsRecord({
        zoneId: resCf.result.id,
        name: order.domain_name,
        type: 'A',
        content: HOST_SERVER,
        ttl: 3600,
        proxied: true,
      });

      // update NS
      await this.registrarService.updateNS(
        REGISTRAR_CUSTOMER_ID,
        resReg.result.id,
        {
          nameservers: resCf.result.name_servers,
        },
      );

      // update order status
      order.status = StatusOrder.ACTIVE;
      order.expired_date = moment()
        .add(order.product.duration, 'years')
        .toDate();
      await this.ordersRepository.save(order);

      // create sites
      await this.sitesService.createWithTransaction(queryRunner, {
        cloudflare_zone_id: resCf.result.id,
        // TODO: generate random db name
        db_name: order.domain_name.split('.')[0],
        db_user: order.domain_name.split('.')[0],
        db_password: Math.random().toString(36).substring(2, 15),
        // TODO: generate random port in range 8000 - 9000
        port: Math.floor(Math.random() * (9000 - 8000 + 1)) + 8000,
        status: StatusSite.ACTIVE,
        order: order,
      });

      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    query: PaginationDto,
  ): Promise<{ data: Orders[]; total: number }> {
    try {
      const { page, limit, search, viewAll } = query;
      const skip = (page - 1) * limit;

      const queryBuilder = this.ordersRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user');

      if (search) {
        queryBuilder
          .where('order.domain_name ILIKE :search', { search: `%${search}%` })
          .orWhere('user.email ILIKE :search', { search: `%${search}%` });
      }

      if (!viewAll) {
        queryBuilder.skip(skip).take(limit);
      }

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data,
        total,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findByUser(
    user: IUserRequest,
    query: PaginationDto,
  ): Promise<{ data: Orders[]; total: number }> {
    try {
      const { page, limit, search, viewAll } = query;
      const skip = (page - 1) * limit;

      const queryBuilder = this.ordersRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .where('order.user.id = :user', { user: user.id });

      if (search) {
        queryBuilder.where('order.domain_name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      if (!viewAll) {
        queryBuilder.skip(skip).take(limit);
      }

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data,
        total,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Orders> {
    try {
      const order = await this.ordersRepository.findOne({
        where: { id },
        relations: [
          'user',
          'domain',
          'product',
          'promo',
          'template',
          'invoice',
        ],
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      return order;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findOneByUser(id: string, user: IUserRequest): Promise<Orders> {
    try {
      const order = await this.ordersRepository.findOne({
        where: { id, user: { id: user.id } },
        relations: [
          'user',
          'domain',
          'product',
          'promo',
          'template',
          'invoice',
        ],
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      return order;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
