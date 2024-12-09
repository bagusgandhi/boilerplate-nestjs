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
import { applyDynamicOrder } from 'src/utils/dynamic-order';
import { User } from '../user/entities/user.entity';
import { IUserRequest } from 'src/decorators/get-user.decorator';
import { UserService } from '../user/user.service';
import { CreateMaintenanceFromRoschaDto } from './dto/create-maintenance-roscha.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private maintenanceRepository: Repository<Maintenance>,
    @Inject(forwardRef(() => AssetService))
    private readonly assetService: AssetService,
    private flowService: FlowService,
    private maintenanceLogService: MaintenanceLogService,
    private readonly userService: UserService,
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
      let query = this.maintenanceRepository
        .createQueryBuilder('maintenance')
        .leftJoinAndSelect('maintenance.asset', 'asset')
        .leftJoinAndSelect('maintenance.flow', 'flow');

      // query.andWhere('maintenance.asset_id IS NOT NULL');

      if (!params?.viewAll) {
        query.skip((params?.page - 1) * params?.limit).take(params?.limit);
      }

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

      if (params?.order) {
        const allowedColumns = ['created_at', 'updated_at'];
        query = applyDynamicOrder(
          query,
          'maintenance',
          params.order,
          allowedColumns,
        );
      }

      const [results, total] = await query.getManyAndCount();

      return {
        page: params?.page,
        total,
        results,
      };
    } catch (error) {
      throw new Error('Error Get maintenance data: ' + error.message);
    }
  }

  async update(body: CreateUpdateMaintenanceDto, user?: User) {
    let assetData: Asset | undefined = undefined,
      flowData: Flow | undefined = undefined,
      logPayload: any = {};
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

      body.is_maintenance === false &&
        (existingMaintenance.is_maintenance = false);
      body.flow === null && (existingMaintenance.flow = null);
      body.wo_number && (existingMaintenance.wo_number = body.wo_number);
      body.program && (existingMaintenance.program = body.program);

      logPayload.wo_number = body.wo_number;
      logPayload.asset_id = assetData.id;
      logPayload.flow = flowData?.name;
      logPayload.program = body.program;
      logPayload.asset_type = assetData.asset_type;

      await this.maintenanceLogService.createWithTransaction(
        queryRunner,
        logPayload,
        user,
      );

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

  async updateWithTransaction(
    queryRunner: QueryRunner,
    body: CreateUpdateMaintenanceDto,
  ) {
    let assetData: Asset | undefined = undefined;

    if(body.asset_id){
      assetData = await this.assetService.get(
        body.asset_id,
        AssetType.GERBONG,
      )
    }

    const existingMaintenance = await this.maintenanceRepository
    .createQueryBuilder('maintenance')
    .leftJoinAndSelect('maintenance.asset', 'asset') // LEFT JOIN with Asset entity
    .where('asset.id = :assetId', { assetId: assetData.id }) // Filter based on the asset ID
    .getOne();

    existingMaintenance.is_maintenance = body.is_maintenance;

    return await queryRunner.manager.save(
      Maintenance,
      existingMaintenance,
    );

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
    user?: User,
  ) {
    let assetData: Asset | undefined = undefined,
      logPayload: any = {},
      flowData: Flow | undefined = undefined;

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
    body.wo_number && (newMaintenance.wo_number = body.wo_number);
    body.program && (newMaintenance.program = body.program);


    logPayload.wo_number = body.wo_number;
    logPayload.asset_id = assetData.id;
    logPayload.flow = flowData?.name;
    logPayload.program = body.program;
    logPayload.asset_type = assetData.asset_type;

    await this.maintenanceLogService.createWithTransaction(
      queryRunner,
      logPayload,
      user,
    );

    // Save the maintenance record using the provided transaction.
    return queryRunner.manager.save(Maintenance, newMaintenance);
  }

  async upsert(body: CreateUpdateMaintenanceDto, user: IUserRequest) {
    let assetData: Asset | undefined = undefined;
    // flowData: Flow | undefined = undefined;
    const queryRunner =
      this.maintenanceRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // body.flow && (flowData = await this.flowService.getByName(body.flow));
      const userData: User = await this.userService.findUserById(
        user.id as any,
      );

      body.asset_id &&
        (assetData = await this.assetService.get(
          body.asset_id,
          AssetType.GERBONG,
        ));

      if (!assetData) {
        throw new Error('Asset not found');
      }

      let maintenanceData = await this.getByAssetId(assetData.id);

      if (!maintenanceData) {
        maintenanceData = await this.createWithTransaction(
          queryRunner,
          body,
          userData,
        );
      } else {
        maintenanceData = await this.update(body);
      }

      await queryRunner.commitTransaction();
      return maintenanceData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(
        'Error creating or updating maintenance data: ' + error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createMaintenanceFromRoscha(body: CreateMaintenanceFromRoschaDto) {
    let assetData: Asset | undefined = undefined;
    const queryRunner =
      this.maintenanceRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // get data
      body.gerbong &&
        (assetData = await this.assetService.getByName(body.gerbong, {
          asset_type: AssetType.GERBONG,
        }));

      // inset maintenance log

      // return data;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(
        'Error creating or updating maintenance data: ' + error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
