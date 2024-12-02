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
import { FilterListMaintenanceDto } from './dto/filter-list-maintenance.dto';

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

      return data;
    } catch (error) {
      throw new Error('Error Get flow by id: ' + error.message);
    }
  }

  async getAll(params: FilterListMaintenanceDto) {
    try {
      const query = this.maintenanceRepository
        .createQueryBuilder('maintenance')
        .leftJoinAndSelect('maintenance.asset', 'asset')
        .leftJoinAndSelect('maintenance.flow', 'flow')
        .orderBy(params.order)
        .skip((params?.page - 1) * params?.limit)
        .take(params?.limit);

      if (params?.is_maintenance) {
        query.andWhere('maintenance.is_maintenance = :is_maintenance', {
          is_maintenance: params?.is_maintenance,
        });
      }

      if (params?.search) {
        query.andWhere(
          '(asset.name LIKE :search OR flow.name LIKE :search)', // Search in asset name or flow name
          { search: `%${params?.search}%` },
        );
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

      const existingMaintenance = await this.maintenanceRepository
        .createQueryBuilder('maintenance')
        .leftJoinAndSelect('maintenance.asset', 'asset') // LEFT JOIN with Asset entity
        .where('asset.id = :assetId', { assetId: assetData.id }) // Filter based on the asset ID
        .getOne();

      if (!existingMaintenance) {
        throw new HttpException('maaintenance data not found', 404);
      }

      flowData && (existingMaintenance.flow = flowData);
      flowData && (existingMaintenance.is_maintenance = true);


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

    // console.log("assetData", assetData)

    const newMaintenance = new Maintenance();
    newMaintenance.asset = assetData;
    newMaintenance.flow = flowData;

    flowData && (newMaintenance.is_maintenance = true);

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
