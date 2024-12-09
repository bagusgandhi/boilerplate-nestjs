import { HttpException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MaintenanceLog } from './entities/maintenance-log.entity';
import { Brackets, QueryRunner, Repository } from 'typeorm';
import { AssetService } from '../asset/asset.service';
import { FlowService } from '../flow/flow.service';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';
import { Asset } from '../asset/entities/asset.entity';
import { Flow } from '../flow/entities/flow.entity';
import { User } from '../user/entities/user.entity';
import { PaginationDto } from 'src/global/dto/pagination.dto';

@Injectable()
export class MaintenanceLogService {

  constructor(
    @InjectRepository(MaintenanceLog)
    private maintenanceLogRepository: Repository<MaintenanceLog>,
    @Inject(forwardRef(() => AssetService))
    private readonly assetService: AssetService,
    private flowService: FlowService,
  ) {}

  async get(id: string) {
    try {
      const data = await this.maintenanceLogRepository.findOne({
        where: { id },
        relations: ['asset', 'flow'],
      });

      if (!data) {
        throw new HttpException('Maintenance Log data not found', 404);
      }

      return data;
    } catch (error) {
      throw new Error('Error Get flow by id: ' + error.message);
    }
  }

  async getAll(params: PaginationDto) {
    try {
      const query = this.maintenanceLogRepository
        .createQueryBuilder('maintenance_log')
        .leftJoinAndSelect('maintenance_log.asset', 'asset')
        .leftJoinAndSelect('maintenance_log.flow', 'flow')
        .orderBy('maintenance_log.created_at', 'DESC')
        .skip((params?.page - 1) * params?.limit)
        .take(params?.limit);

      if (params?.search) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('asset.name LIKE :search', { search: `%${params?.search}%` })
              .orWhere('asset.asset_type LIKE :search', { search: `%${params?.search}%` })
              .orWhere('flow.name LIKE :search', { search: `%${params?.search}%` })
          })
        );
      }

      const [results, total] = await query.getManyAndCount();

      return {
        page: params?.page,
        total,
        results,
      };
    } catch (error) {
      throw new Error('Error Get maintenance-log data: ' + error.message);
    }
  }

  async createWithTransaction(
    queryRunner: QueryRunner,
    body: CreateMaintenanceLogDto,
    user?: User
  ) {
    let assetData: Asset | undefined = undefined, 
      parentAssetData: Asset | undefined = undefined,
      gerbongAssetData: Asset | undefined = undefined,
      flowData: Flow | undefined = undefined;

    body.asset_id &&
      (assetData = await this.assetService.getWithEntityManager(
        body.asset_id,
        queryRunner.manager,
      ));
    body.parent_asset_id &&
      (parentAssetData = await this.assetService.getWithEntityManager(
        body.parent_asset_id,
        queryRunner.manager,
      ));
    body.gerbong_asset_id &&
      (gerbongAssetData = await this.assetService.getWithEntityManager(
        body.gerbong_asset_id,
        queryRunner.manager,
      ));
    body.flow && (flowData = await this.flowService.getByName(body.flow));

    const newMaintenanceLog = new MaintenanceLog();
    newMaintenanceLog.asset = assetData;
    newMaintenanceLog.flow = flowData;
    newMaintenanceLog.parent_asset = parentAssetData;
    newMaintenanceLog.bogie = body.bogie;
    newMaintenanceLog.paramsValue = body.paramsValue;
    newMaintenanceLog.details = body.details;
    newMaintenanceLog.asset_type = body.asset_type;
    user && (newMaintenanceLog.user = user);
    newMaintenanceLog.gerbong_asset = gerbongAssetData;

    // Save the maintenance record using the provided transaction.
    return queryRunner.manager.save(MaintenanceLog, newMaintenanceLog);
  }

  async createWithTransactionFromRoscha(
    queryRunner: QueryRunner,
    body: CreateMaintenanceLogDto
  ) {
    let assetData: Asset | undefined = undefined, 
      parentAssetData: Asset | undefined = undefined,
      gerbongAssetData: Asset | undefined = undefined,
      flowData: Flow | undefined = undefined;

    body.asset_id &&
      (assetData = await this.assetService.getWithEntityManager(
        body.asset_id,
        queryRunner.manager,
      ));
    body.parent_asset_id &&
      (parentAssetData = await this.assetService.getWithEntityManager(
        body.parent_asset_id,
        queryRunner.manager,
      ));
    body.gerbong_asset_id &&
      (gerbongAssetData = await this.assetService.getWithEntityManager(
        body.gerbong_asset_id,
        queryRunner.manager,
      ));
    body.flow && (flowData = await this.flowService.getByName(body.flow));

    const newMaintenanceLog = new MaintenanceLog();
    newMaintenanceLog.asset = assetData;
    newMaintenanceLog.flow = flowData;
    newMaintenanceLog.parent_asset = parentAssetData;
    newMaintenanceLog.bogie = parentAssetData.bogie;
    newMaintenanceLog.paramsValue = body.paramsValue;
    newMaintenanceLog.details = body.details;
    newMaintenanceLog.asset_type = body.asset_type;
    newMaintenanceLog.gerbong_asset = gerbongAssetData;

    // Save the maintenance record using the provided transaction.
    return queryRunner.manager.save(MaintenanceLog, newMaintenanceLog);
  }

  async create(body: CreateMaintenanceLogDto, user: User) {
    const queryRunner =
      this.maintenanceLogRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await this.createWithTransaction(queryRunner, body, user);

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error creating maintenance log: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

}
