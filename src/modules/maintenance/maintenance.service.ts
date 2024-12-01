import { HttpException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Maintenance } from './entities/maintenance.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateUpdateMaintenanceDto } from './dto/create-maintenance.dto';
import { FlowService } from '../flow/flow.service';
import { AssetService } from '../asset/asset.service';
import { Asset } from '../asset/entities/asset.entity';
import { Flow } from '../flow/entities/flow.entity';
import { AssetType } from '../asset/dto/create-update-asset.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { MaintenanceLogService } from '../maintenance-log/maintenance-log.service';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private maintenanceRepository: Repository<Maintenance>,
    @Inject(forwardRef(() => AssetService))
    private readonly assetService: AssetService,
    private flowService: FlowService,
    private maintenanceLogService: MaintenanceLogService
  ) {}

  async get(id: string) {
    try {
      const data = await this.maintenanceRepository.findOne({
        where: { id },
        relations: ['asset', 'flow'],
      });

      if (!data) {
        throw new HttpException('Flow data not found', 404);
      }

      return data;
    } catch (error) {
      throw new Error('Error Get flow by id: ' + error.message);
    }
  }

  async getByAssetId(id: string) {
    try {
      const data = await this.maintenanceRepository.findOne({
        where: { asset: { id } },
        relations: ['asset', 'flow'],
      });

      if (!data) {
        throw new HttpException('Flow data not found', 404);
      }

      return data;
    } catch (error) {
      throw new Error('Error Get flow by id: ' + error.message);
    }
  }

  async getAll(params: PaginationDto) {
    try {
      const query = this.maintenanceRepository
        .createQueryBuilder('maintenance')
        .orderBy(params.order)
        .skip((params?.page - 1) * params?.limit)
        .take(params?.limit);

      if (params?.search) {
        query.andWhere('maintenance.asset.name LIKE :search', {
          search: `%${params?.search}%`,
        });
      }

      const [results, total] = await query.getManyAndCount();

      return {
        page: params?.page,
        total,
        results,
      };
    } catch (error) {
      throw new Error('Error Get flow data: ' + error.message);
    }
  }

  async update(body: CreateUpdateMaintenanceDto) {
    let assetData: Asset | undefined = undefined,
      flowData: Flow | undefined = undefined;
    const queryRunner =
      this.maintenanceRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      body.flow && (flowData = await this.flowService.getByName(body.flow));
      body.asset_id &&
        (assetData = await this.assetService.get(
          body.asset_id,
          AssetType.GERBONG,
        ));

      const existingMaintenance = await this.maintenanceRepository.findOneBy({
        asset: assetData,
      });

      if (!existingMaintenance) {
        throw new HttpException('Flow data not found', 404);
      }

      flowData && (existingMaintenance.flow = flowData);

      const result = await queryRunner.manager.save(
        Maintenance,
        existingMaintenance,
      );

      // insert action log
      // await this.actionLogRepository.insertData(queryRunner.manager, someData);

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error creating maintenance data: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async create(body: CreateUpdateMaintenanceDto) {
    const queryRunner =
      this.maintenanceRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await this.createWithTransaction(queryRunner, body);

      // insert action log
      // await this.actionLogRepository.insertData(queryRunner.manager, someData);

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error creating flow: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async createWithTransaction(
    queryRunner: QueryRunner,
    body: CreateUpdateMaintenanceDto,
  ) {
    let assetData: Asset | undefined = undefined,
      flowData: Flow | undefined = undefined;

    // console.log(body);

    body.asset_id &&
      (assetData = await this.assetService.getWithEntityManager(
        body.asset_id,
        queryRunner.manager,
      ));
    body.flow && (flowData = await this.flowService.getByName(body.flow));

    const newMaintenance = new Maintenance();
    newMaintenance.asset = assetData;
    newMaintenance.flow = flowData;

    // Save the maintenance record using the provided transaction.
    return queryRunner.manager.save(Maintenance, newMaintenance);
  }

  async upsert(body: CreateUpdateMaintenanceDto) {
    let assetData: Asset | undefined = undefined,
    flowData: Flow | undefined = undefined;
    const queryRunner =
    this.maintenanceRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      body.flow && (flowData = await this.flowService.getByName(body.flow));
      body.asset_id &&
        (assetData = await this.assetService.get(
          body.asset_id,
          AssetType.GERBONG,
        ));

      if (!assetData || !flowData) {
        throw new Error('Asset or Flow not found');
      }

      let maintenanceData = await this.getByAssetId(assetData.id);

      if (!maintenanceData) {
        maintenanceData = await this.createWithTransaction(queryRunner, body);
      } else {
        maintenanceData = await this.update(body);
      }

      await queryRunner.commitTransaction();
      return maintenanceData;
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error creating or updating maintenance data: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
