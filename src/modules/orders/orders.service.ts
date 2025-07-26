import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, LessThan, LessThanOrEqual, Repository } from 'typeorm';
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
import { Invoice } from '../invoice/entities/invoice.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from '../queue/queue.service';
import { formatRupiah } from 'src/utils/format';
import { link } from 'fs';
const { REGISTRAR_CUSTOMER_ID, HOST_SERVER, SITE_URL } = Env();
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
    private readonly queueService: QueueService,
  ) {}

  async create(
    createOrderDto: CreateOrdersDto,
    user: IUserRequest,
  ): Promise<{ order: Orders; invoice: Invoice }> {
    const {
      domain_name,
      domain_id,
      product_id,
      description,
      promo_id,
      template_id,
      phone,
      address,
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

      if (!domainAvailability?.data?.[0]?.available) {
        throw new BadRequestException('Domain has been taken');
      }

      // update user address and phone when user dont have phone and address
      if (!userData.phone || !userData.address) {
        this.userService.updateWithTransaction(queryRunner, userData, {
          address,
          phone,
        });
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
      order.address = address;
      order.phone = phone;

      // Create order
      await this.ordersRepository.save(order);

      // Create invoice
      const invoiceData = await this.invoiceService.createWithTransaction(
        queryRunner,
        {
          order: order,
          user: userData,
          total: order.total,
          due_date: moment().add(1, 'week').toDate(),
          type: TypeInvoice.NEW_ORDER,
          status: StatusInvoice.PENDING,
        },
      );

      await queryRunner.commitTransaction();

      // notif email new-order
      await this.queueService.addQueueEmail({
        to: userData.email,
        cc: 'support@naiweb.id',
        subject: `Order Invoice #${invoiceData.invoice_number}`,
        templateName: 'new-order',
        context: {
          userName: userData?.name,
          domainName: order?.domain_name,
          productTitle: order?.product?.title,
          domainAmount: formatRupiah(order.domain.amount) ,
          productAmount: formatRupiah(order.product.amount),
          duration: order?.product?.duration,
          total: formatRupiah(order.total),
          dueDate: moment(invoiceData?.due_date).format('DD MMMM YYYY'),
          template: order?.template?.title,
          invoiceNumber: invoiceData?.invoice_number,
          link: `https://${SITE_URL}/dashboard/invoice/${invoiceData?.id}`,
        },
      });
      
      return { order, invoice: invoiceData };
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
      this.logger.log('resCf', resCf);

      // create cloudflare dns record
      await this.cloudflareService.addDnsRecord({
        zoneId: resCf.result.id,
        name: order.domain_name,
        type: 'A',
        content: HOST_SERVER,
        ttl: 3600,
        proxied: true,
        comment: 'Create A record by activate order naiweb',
      });

      await this.cloudflareService.addDnsRecord({
        zoneId: resCf.result.id,
        name: 'www',
        type: 'CNAME',
        content: order.domain_name,
        ttl: 3600,
        proxied: true,
        comment: 'Create CNAME record by activate order naiweb',
      });

      // update NS
      await this.registrarService.updateNS(
        REGISTRAR_CUSTOMER_ID,
        resReg.data.id,
        {
          nameservers: resCf.result.name_servers,
        },
      );

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

      // update order status
      order.status = StatusOrder.ACTIVE;
      order.expired_date = moment()
        .add(order.product.duration, 'years')
        .toDate();
      await this.ordersRepository.save(order);

      // add job queue for deploy site
      await this.queueService.addQueueDeploy({
        data: {
          db_name: order.domain_name.split('.')[0],
          db_user: order.domain_name.split('.')[0],
          db_password: Math.random().toString(36).substring(2, 15),
          // TODO: generate random port in range 8000 - 9000
          port: Math.floor(Math.random() * (9000 - 8000 + 1)) + 8000,
          domain_name: order?.domain_name,
          demo: order?.template?.title.toLowerCase().split(' ').join('_'),
        },
      });

      await queryRunner.commitTransaction();

      // notif email order-activation
      await this.queueService.addQueueEmail({
        to: order.user.email,
        cc: 'support@naiweb.id',
        subject: 'Aktivasi Order',
        templateName: 'order-activation',
        context: {
          userName: order?.user?.name,
          domainName: order?.domain_name,
          productTitle: order?.product?.title,
          expiredAt: moment(order?.expired_date).format('DD MMMM YYYY'),
        },
      });

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
          'invoices',
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

  // cron for checking order expired date
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkOrderExpired() {
    this.logger.log('Starting checkOrderExpired cron job');
    const queryRunner =
      this.ordersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // get all order data with status active or renewed
      const targetDateStart = moment().add(7, 'days').startOf('day').toDate();
      const targetDateEnd = moment().add(7, 'days').endOf('day').toDate();

      const orders = await this.ordersRepository.find({
        where: {
          status: In([StatusOrder.ACTIVE, StatusOrder.RENEWED]),
          expired_date: Between(targetDateStart, targetDateEnd),
        },
        relations: ['user', 'domain', 'product'],
      });

      this.logger.log(`Found ${orders.length} expired orders to process`);

      // update with transaction order status to expired
      await queryRunner.manager.update(
        Orders,
        { id: In(orders.map((order) => order.id)) },
        { status: StatusOrder.EXPIRED },
      );

      const emailPayloads = []

      // when order has expired, create invoice for renewal using promise.all
      await Promise.all(
        orders.map(async (order) => {
          const invoice = await this.invoiceService.createWithTransaction(queryRunner, {
            order: order,
            user: order.user,
            status: StatusInvoice.PENDING,
            due_date: moment().add(1, 'week').toDate(),
            type: TypeInvoice.RENEWAL,
            total: order.total,
          });

          // notif email expired
          emailPayloads.push({
            to: order.user.email,
            cc: 'support@naiweb.id',
            subject: `Website ${order.domain_name} Expired`,
            templateName: 'expired-service',
            context: {
              invoiceNumber: invoice?.invoice_number,
              userName: order?.user?.name,
              domainName: order?.domain_name,
              domainAmount: formatRupiah(order.domain.amount),
              productAmount: formatRupiah(order.product.amount),
              duration: order?.product?.duration,
              productTitle: order?.product?.title,
              total: formatRupiah(order.total),
              expiredDate: moment(order?.expired_date).format('DD MMMM YYYY'),
              link: `https://${SITE_URL}/dashboard/invoice/${invoice?.id}`,
            },
          });
        }),
      );

      await queryRunner.commitTransaction();
      this.logger.log(
        'Successfully processed expired orders and created renewal invoices',
      );

      await Promise.all(
        emailPayloads.map((email) => this.queueService.addQueueEmail(email))
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error in checkOrderExpired cron job:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
