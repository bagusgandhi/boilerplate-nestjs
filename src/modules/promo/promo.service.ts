import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promo } from './entities/promo.entity';
import { CreatePromoDto } from './dto/create-promo.dto';

@Injectable()
export class PromoService {
  private readonly logger = new Logger(PromoService.name);
  constructor(
    @InjectRepository(Promo)
    private promoRepository: Repository<Promo>,
  ) {}

  async create(createPromoDto: CreatePromoDto): Promise<Promo> {
    try {
      const promo = this.promoRepository.create(createPromoDto);
      return this.promoRepository.save(promo);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to create promo');
    }
  }

  async findAll(): Promise<Promo[]> {
    try {
      return this.promoRepository.find();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to find all promo');
    }
  }

  async findOne(id: string): Promise<Promo> {
    try {
      return this.promoRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to find promo');
    }
  }

  async update(id: string, updatePromoDto: CreatePromoDto): Promise<Promo> {
    try {
      const promo = await this.findOne(id);
      if (!promo) {
        throw new NotFoundException('Promo not found');
      }
      return this.promoRepository.save({ ...promo, ...updatePromoDto });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to update promo');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const promo = await this.findOne(id);
      if (!promo) {
        throw new NotFoundException('Promo not found');
      }
      await this.promoRepository.remove(promo);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to delete promo');
    }
  }
}
