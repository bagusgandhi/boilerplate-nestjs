import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { IUserRequest } from 'src/decorators/get-user.decorator';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async createWithTransaction(
    queryRunner: QueryRunner,
    body: CreateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = new Invoice();
    invoice.order = body.order;
    invoice.user = body.user;
    invoice.total = body.total;
    invoice.status = body.status;
    invoice.due_date = body.due_date;
    invoice.type = body.type;
    invoice.description = body.description;
    await queryRunner.manager.save(Invoice, invoice);
    return invoice;
  }

  async updateWithTransaction(
    queryRunner: QueryRunner,
    id: string,
    body: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);
    invoice.status = body.status;
    invoice.due_date = body.due_date;
    invoice.type = body.type;
    invoice.description = body.description;
    await queryRunner.manager.save(Invoice, invoice);
    return invoice;
  }

  async findOne(id: string): Promise<Invoice> {
    try {
      const invoice = await this.invoiceRepository.findOne({
        where: { id },
        relations: ['order', 'user', 'payments'],
        select: {
          user: {
            email: true,
            name: true,
            phone: true,
            address: true,
          },
        },
      });
      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
      return invoice;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findAll(
    query: PaginationDto,
  ): Promise<{ data: Invoice[]; total: number }> {
    try {
      const { page, limit, search, viewAll } = query;
      const skip = (page - 1) * limit;

      const queryBuilder = this.invoiceRepository
        .createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.order', 'order')
        .leftJoinAndSelect('invoice.user', 'user');

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
  ): Promise<{ data: Invoice[]; total: number }> {
    try {
      const { page, limit, search, viewAll } = query;
      const skip = (page - 1) * limit;

      const queryBuilder = this.invoiceRepository
        .createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.order', 'order')
        .leftJoinAndSelect('invoice.user', 'user')
        .where('invoice.user.id = :user', { user: user.id });

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

  async findOneByUser(id: string, user: IUserRequest): Promise<Invoice> {
    try {
      const invoice = await this.invoiceRepository.findOne({
        where: { id, user: { id: user.id } },
        relations: ['order.product', 'order.domain', 'order.promo', 'user'],
        select: {
          user: {
            email: true,
            name: true,
            phone: true,
            address: true,
          },
        },
      });
      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
      return invoice;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findByInvoiceUser(
    invoice_number: string,
    user: IUserRequest,
  ): Promise<Invoice> {
    try {
      const invoice = await this.invoiceRepository.findOne({
        where: { invoice_number, user: { id: user.id } },
        relations: ['order', 'user'],
        select: {
          user: {
            email: true,
            name: true,
          },
        },
      });
      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
      return invoice;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
