import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import {
  Brackets,
  EntityManager,
  FindOptionsWhere,
  Like,
  QueryRunner,
  Repository,
} from 'typeorm';
import { PaginationDto } from 'src/global/dto/pagination.dto';
import { AssetType, CreateUpdateAssetDto } from './dto/create-update-asset.dto';
import { MaintenanceService } from '../maintenance/maintenance.service';
import { SwapAssetDto } from './dto/swap-asset.dto';
import { MaintenanceLogService } from '../maintenance-log/maintenance-log.service';
import { CreateMaintenanceLogDto } from '../maintenance-log/dto/create-maintenance-log.dto';
import { User } from '../user/entities/user.entity';
import { IUserRequest } from 'src/decorators/get-user.decorator';
import { UserService } from '../user/user.service';
import { FilterAliasDto } from './dto/filter-alias.dto';
import { v4 as uuidv4 } from 'uuid';
import { applyDynamicOrder } from 'src/utils/dynamic-order';
import { CreateUpdateMaintenanceDto } from '../maintenance/dto/create-maintenance.dto';
// import { MaintenanceService } from '../maintenance/maintenance.service';
// import { FlowService } from '../flow/flow.service';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @Inject(forwardRef(() => MaintenanceService))
    private readonly maintenanceService: MaintenanceService,
    @Inject(forwardRef(() => MaintenanceLogService))
    private readonly maintenanceLogService: MaintenanceLogService,
    private readonly userService: UserService,
  ) {}

  async get(id: string, type?: AssetType) {
    try {
      const data = await this.assetRepository.findOne({
        where: { id, asset_type: type },
        relations: [
          'parent_asset',
          'children',
          'maintenance',
          'maintenance.flow',
        ],
      });

      if (!data) {
        throw new HttpException('Asset data not found', 404);
      }

      return this.buildAssetTree(data);
      // return data;
    } catch (error) {
      throw new Error('Error Get Asset by id: ' + error.message);
    }
  }

  async getWithEntityManager(
    id: string,
    manager?: EntityManager,
  ): Promise<Asset> {
    const repository = manager
      ? manager.getRepository(Asset)
      : this.assetRepository;
    const asset = await repository.findOne({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  private async buildAssetTree(asset: Asset): Promise<any> {
    const children = await this.assetRepository.find({
      where: { parent_asset: { id: asset.id } }, // Load children of the current asset
      relations: [
        'parent_asset',
        'children',
        'maintenance',
        'maintenance.flow',
      ],
    });

    // Recursively build the tree for each child
    const childrenWithNested = await Promise.all(
      children.map((child) => this.buildAssetTree(child)),
    );

    // console.log('children', children);

    return { ...asset, children: childrenWithNested };
  }

  async getByRfid(rfid: string) {
    try {
      const data = await this.assetRepository.findOne({
        where: { rfid },
        relations: [
          'parent_asset',
          'children',
          'maintenance',
          'maintenance.flow',
        ],
      });

      if (!data) {
        throw new HttpException('Asset data not found', 404);
      }

      return this.buildAssetTree(data);
      // return data;
    } catch (error) {
      throw new Error('Error Get Asset by id: ' + error.message);
    }
  }

  async getByName(name: string, query?: any) {
    try {
      const whereCondition: any = { name };
      if (query.asset_type) {
        whereCondition.asset_type = query.asset_type; // Include assetType if provided
      }

      const data = await this.assetRepository.findOne({
        where: whereCondition,
        relations: [
          'parent_asset',
          'children',
          'maintenance',
          'maintenance.flow',
        ],
      });

      if (!data) {
        throw new HttpException('Asset data not found', 404);
      }

      return this.buildAssetTree(data);
      // return data;
    } catch (error) {
      throw new Error('Error Get Asset by id: ' + error.message);
    }
  }

  async create(body: CreateUpdateAssetDto, user?: IUserRequest) {
    const queryRunner =
      this.assetRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userData: User = await this.userService.findUserById(
        user.id as any,
      );

      const newAsset = new Asset();
      newAsset.name = body.name;
      newAsset.rfid = body.rfid;
      newAsset.asset_type = body.asset_type;
      newAsset.carriage_type = body.carriage_type;
      newAsset.factory = body.factory;

      switch (body.asset_type) {
        case AssetType.TRAIN_SET:
          if (body.parent_asset_id) {
            throw new BadRequestException(
              'For asset type "Train Set", parent asset ID must be null',
            );
          }
          break;
        case AssetType.GERBONG:
          if (body.parent_asset_id) {
            const parentAsset = await this.assetRepository.findOne({
              where: { id: body.parent_asset_id },
            });

            if (!parentAsset) {
              throw new NotFoundException(`Parent asset not found`);
            }

            if (parentAsset.asset_type !== AssetType.TRAIN_SET) {
              throw new BadRequestException(
                'For asset type "Gerbong", parent asset must be of type "Train Set" or null',
              );
            }
            newAsset.parent_asset = parentAsset;
          }
          break;
        case AssetType.BOGIE:
          if (body.parent_asset_id) {
            const parentAsset = await this.assetRepository.findOne({
              where: { id: body.parent_asset_id },
            });

            if (!parentAsset) {
              throw new NotFoundException(`Parent asset not found`);
            }

            if (parentAsset.asset_type !== AssetType.GERBONG) {
              throw new BadRequestException(
                'For asset type "Bogie", parent asset must be of type "Gerbong" or null',
              );
            }

            newAsset.parent_asset = parentAsset;
            newAsset.name = body.name;
            newAsset.bogie = body.bogie;
          }
          break;
        case AssetType.KEPING_RODA:
          if (body.parent_asset_id) {
            const parentAsset = await this.assetRepository.findOne({
              where: { id: body.parent_asset_id },
            });

            if (!parentAsset) {
              throw new NotFoundException(`Parent asset not found`);
            }

            if (parentAsset.asset_type !== AssetType.BOGIE) {
              throw new BadRequestException(
                'For asset type "Keping Roda", parent asset must be of type "Bogie" or null',
              );
            }
            newAsset.parent_asset = parentAsset;
            newAsset.status = 'active';
          }
          break;
      }

      const result = await queryRunner.manager.save(Asset, newAsset);

      if (body.asset_type === AssetType.GERBONG) {
        await this.maintenanceService.createWithTransaction(queryRunner, {
          asset_id: result.id,
          flow: undefined,
        });
      }

      // insert maintenance log
      const logPayload: CreateMaintenanceLogDto = {
        asset_id: result.id,
        flow: body.flow,
        asset_type: body.asset_type,
        parent_asset_id: body.parent_asset_id,
        bogie: body.bogie,
        paramsValue: body.paramsValue,
        details: {
          info: 'insert new asset',
        },
      };

      await this.maintenanceLogService.createWithTransaction(
        queryRunner,
        logPayload,
        userData,
      );

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error creating flow: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, body: CreateUpdateAssetDto, user?: IUserRequest) {
    const queryRunner =
      this.assetRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { parent_asset_id, ...data } = body;
    const logPayload: CreateMaintenanceLogDto = {};

    try {
      const userData: User = await this.userService.findUserById(
        user.id as any,
      );

      const existingAsset = await this.assetRepository.findOne({
        where: { id },
        relations: ['parent_asset', 'children'],
      });

      console.log('existingAsset', existingAsset);

      if (!existingAsset) {
        throw new HttpException('Asset data not found', 404);
      }

      Object.assign(existingAsset, data);

      if (body.hasOwnProperty('parent_asset_id')) {
        switch (existingAsset.asset_type) {
          case AssetType.TRAIN_SET:
            if (parent_asset_id) {
              throw new BadRequestException(
                'For asset type "Train Set", parent asset ID must be null',
              );
            }
            break;
          case AssetType.GERBONG:
            if (parent_asset_id) {
              const parentAsset = await this.assetRepository.findOne({
                where: { id: parent_asset_id },
              });

              if (!parentAsset) {
                throw new NotFoundException(`Parent asset not found`);
              }

              if (parentAsset.asset_type !== AssetType.TRAIN_SET) {
                throw new BadRequestException(
                  'For asset type "Gerbong", parent asset must be of type "trainSet" or null',
                );
              }
              existingAsset.parent_asset = parentAsset;
            }
            break;
          case AssetType.BOGIE:
            if (parent_asset_id) {
              const parentAsset = await this.assetRepository.findOne({
                where: { id: parent_asset_id },
              });

              if (!parentAsset) {
                throw new NotFoundException(`Parent asset not found`);
              }

              if (parentAsset.asset_type !== AssetType.GERBONG) {
                throw new BadRequestException(
                  'For asset type "Bogie", parent asset must be of type "Gerbong" or null',
                );
              }
              existingAsset.parent_asset = parentAsset;
            }
            break;
          case AssetType.KEPING_RODA:
            if (parent_asset_id) {
              const parentAsset = await this.assetRepository.findOne({
                where: { id: parent_asset_id },
              });

              if (!parentAsset) {
                throw new NotFoundException(`Parent asset not found`);
              }

              if (parentAsset.asset_type !== AssetType.BOGIE) {
                throw new BadRequestException(
                  'For asset type "Keping Roda", parent asset must be of type "Bogie" or null',
                );
              }
              existingAsset.parent_asset = parentAsset;
            }
            break;
        }
      }

      if (body.parent_asset_id === null) {
        existingAsset.parent_asset = null;
      }

      logPayload.asset_type = existingAsset.asset_type;

      if (
        body.hasOwnProperty('paramsValue') &&
        existingAsset.asset_type === AssetType.KEPING_RODA
      ) {
        existingAsset.paramsValue = {
          ...existingAsset.paramsValue,
          ...body.paramsValue,
        };

        logPayload.paramsValue = existingAsset.paramsValue;
        logPayload.asset_id = existingAsset.id;
        logPayload.flow = body.flow;
        logPayload.parent_asset_id = existingAsset.parent_asset?.id;

        const gerbong = await this.findGerbongByBogie(existingAsset.id);
        logPayload.gerbong_asset_id = gerbong?.id;
        logPayload.program = body.program;

        // upsert maintenance flow to 'pengukuran'
        await this.maintenanceService.upsert(
          {
            asset_id: gerbong?.id, // case
            flow: body.flow,
            program: body.program,
          },
          user,
        );
      }

      if (body.status === 'not_feasible') {
        // insert maintenance log
        logPayload.flow = body.flow;
        logPayload.details = {
          details: {
            info: 'remove asset',
          },
        };
        (logPayload.asset_id = existingAsset.id),
          (logPayload.asset_type = AssetType.KEPING_RODA);

        const gerbong = await this.findGerbongByBogie(existingAsset.id);

        await this.maintenanceService.upsert(
          {
            asset_id: gerbong?.id, // case
            flow: body.flow,
            program: body.program,
          },
          user,
        );
      }

      const result = await queryRunner.manager.save(Asset, existingAsset);

      // console.log(logPayload)
      // insert maintenance log
      await this.maintenanceLogService.createWithTransaction(
        queryRunner,
        logPayload,
        userData,
      );

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error updating asset: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updateFromRoscha(
    queryRunner: QueryRunner,
    name: string,
    body: { paramsValue: any },
  ) {
    const updatedAsset = await this.getByName(name);
    updatedAsset.paramsValue = body.paramsValue;
    updatedAsset.status = 'active';

    return queryRunner.manager.save(Asset, updatedAsset);
  }

  async swapAsset(body: SwapAssetDto, user?: IUserRequest) {
    const queryRunner =
      this.assetRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { active_asset_id, inactive_asset_id, parent_asset_id } = body;

    try {
      const userData: User = await this.userService.findUserById(
        user.id as any,
      );

      const parentAsset = await this.assetRepository.findOne({
        where: { id: parent_asset_id },
      });

      const inUsedAsset = await this.assetRepository.findOneBy({
        id: active_asset_id,
      });
      inUsedAsset.parent_asset = parentAsset;
      inUsedAsset.status = 'active';
      await queryRunner.manager.save(Asset, inUsedAsset);

      const notInUsedAsset = await this.assetRepository.findOneBy({
        id: inactive_asset_id,
      });
      // notInUsedAsset.parent_asset = null;
      notInUsedAsset.status = 'inactive';
      await queryRunner.manager.save(Asset, notInUsedAsset);

      const assetData = await this.get(parent_asset_id);

      await this.maintenanceService.upsert(
        {
          asset_id: assetData.parent_asset?.id, // case
          flow: body.flow,
        },
        user,
      );

      // insert maintenance log
      const logPayload = {
        flow: body.flow,
        details: {
          info: 'swap asset',
          data: {
            inUsedAsset,
            notInUsedAsset,
          },
        },
        parent_asset_id: parentAsset.id,
        asset_type: AssetType.KEPING_RODA,
      };

      await this.maintenanceLogService.createWithTransaction(
        queryRunner,
        logPayload,
        userData,
      );

      await queryRunner.commitTransaction();

      return {
        inUsedAsset,
        notInUsedAsset,
      };
    } catch (error) {
      throw new Error('Error Swap Asset: ' + error.message);
    }
  }

  async getAll(params: FilterAliasDto) {
    try {
      let query = this.assetRepository
        .createQueryBuilder('asset')
        .leftJoinAndSelect('asset.maintenance', 'maintenance');

      if(params?.with_children){
        query = query
        .leftJoinAndSelect('asset.children', 'children')
        .leftJoinAndSelect('children.children', 'grandchildren')
        .leftJoinAndSelect('grandchildren.children', 'greatgrandchildren');
      }

      if (!params?.viewAll) {
        query.skip((params?.page - 1) * params?.limit).take(params?.limit);
      }

      if (params?.search) {
        if(params?.with_children){
          query.andWhere(
            new Brackets((qb) => {
              qb.where('asset.name LIKE :search', { search: `%${params?.search}%` })
                .orWhere('children.name LIKE :search', { search: `%${params?.search}%` })
                .orWhere('grandchildren.name LIKE :search', { search: `%${params?.search}%` })
                .orWhere('greatgrandchildren.name LIKE :search', { search: `%${params?.search}%` });
            })
          );
        } else {
          query.andWhere('asset.name LIKE :search', {
            search: `%${params?.search}%`,
          });
        }
      }

      if (params?.asset_type) {
        query.andWhere('asset.asset_type = :asset_type', {
          asset_type: params?.asset_type,
        });
      }

      if (params?.asset_types) {
        query.andWhere('asset.asset_type IN (:...asset_types)', {
          asset_types: params.asset_types,
        });
      }

      if (params?.parent_asset_id) {
        query.andWhere('asset.parentAssetId = :parent_asset_id', {
          parent_asset_id: params?.parent_asset_id,
        });
      }

      if (params?.children_alias) {
        query.andWhere('asset.alias = :children_alias', {
          children_alias: params?.children_alias,
        });
      }

      if (params?.is_maintenance !== undefined) {
        query.andWhere('maintenance.is_maintenance = :is_maintenance', {
          is_maintenance: params?.is_maintenance,
        });
      }

      if (params?.order) {
        const allowedColumns = ['created_at', 'updated_at', 'name'];
        query = applyDynamicOrder(query, 'asset', params.order, allowedColumns);
      }

      const [results, total] = await query.getManyAndCount();

      return {
        page: params?.page,
        total,
        results,
      };
    } catch (error) {
      throw new Error('Error Get asset data: ' + error.message);
    }
  }

  async delete(id: string, user: IUserRequest) {
    const queryRunner =
      this.assetRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingAsset = await this.assetRepository.findOne({
        where: { id },
        relations: ['maintenance'],
      });
      const userData = await this.userService.findUserById(user.id as any);

      if (!existingAsset) {
        throw new HttpException('Asset data not found', 404);
      }

      const randomName = `${existingAsset.name}_deleted_${uuidv4()}`;
      await queryRunner.manager.update(
        Asset,
        { id },
        { name: randomName, rfid: null },
      );

      if(existingAsset.asset_type === AssetType.GERBONG){
        existingAsset.maintenance = null;
        await queryRunner.manager.save(existingAsset);

        await this.maintenanceService.updateWithTransaction(queryRunner, {
          asset_id: existingAsset.id,
          is_maintenance:false
        })
      }

      // existingAsset.parent_asset = null;
      // existingAsset.children = null;


      await queryRunner.manager.softDelete(Asset, { id });

      // insert action log
      // await this.actionLogRepository.insertData(queryRunner.manager, someData);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error creating asset: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findGerbongByBogie(id: string) {
    try {
      // Fetch the gerbong directly using the parent_asset relationship chain
      const data = await this.assetRepository.findOne({
        where: { id },
        relations: [
          'parent_asset', // Bogie
          'parent_asset.parent_asset', // Gerbong
        ],
      });

      if (!data) {
        throw new Error('Asset not found with the given ID');
      }

      const gerbong = data.parent_asset?.parent_asset;

      if (!gerbong || gerbong.asset_type !== 'Gerbong') {
        throw new Error('Gerbong not found in the asset hierarchy');
      }

      return gerbong; // Return the gerbong asset
    } catch (error) {
      throw new Error(
        'Error while finding Gerbong by Bogie ID: ' + error.message,
      );
    }
  }
}
