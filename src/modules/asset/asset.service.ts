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
import { EntityManager, Repository } from 'typeorm';
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

      return data;
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
    // Recursively build children tree
    const children = await this.assetRepository.find({
      where: { parent_asset: asset },
      relations: ['children'],
    });

    const tree = {
      id: asset.id,
      name: asset.name,
      rfid: asset.rfid,
      asset_type: asset.asset_type,
      parent_asset: asset.parent_asset
        ? {
            id: asset.parent_asset.id,
            name: asset.parent_asset.name,
            rfid: asset.parent_asset.rfid,
          }
        : null,
      children: await Promise.all(
        children.map((child) => this.buildAssetTree(child)),
      ),
    };

    return tree;
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

      // return this.buildAssetTree(asset);
      return data;
    } catch (error) {
      throw new Error('Error Get Asset by id: ' + error.message);
    }
  }

  async getByName(name: string, query: any) {
    try {
      const data = await this.assetRepository.findOne({
        where: { name },
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

      if (query.flow && data.asset_type === AssetType.GERBONG) {
        await this.maintenanceService.upsert({
          asset_id: data.id,
          flow: query.flow,
        });
      }

      // return this.buildAssetTree(asset);
      return data;
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
            newAsset.name = `${parentAsset.name}_${body.name}`;
            newAsset.alias = body.name;
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
          }
          break;
      }

      const result = await queryRunner.manager.save(Asset, newAsset);

      // if (body.asset_type === AssetType.GERBONG) {
      //   await this.maintenanceService.createWithTransaction(queryRunner, {
      //     asset_id: result.id,
      //     flow: 'inisialisasi',
      //   });
      // }

      // insert maintenance log
      const logPayload: CreateMaintenanceLogDto = {
        asset_id: result.id,
        flow: 'inisialisasi',
        asset_type: body.asset_type,
        parent_asset_id: body.parent_asset_id,
        bogie: body.bogie,
        paramsValue: body.paramsValue,
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
      const existingAsset = await this.assetRepository.findOneBy({ id });

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

      if (body.hasOwnProperty('paramsValue')) {
        existingAsset.paramsValue = {
          ...existingAsset.paramsValue,
          ...body.paramsValue,
        };

        logPayload.paramsValue = existingAsset.paramsValue;
        logPayload.asset_id = existingAsset.id;
        logPayload.flow = 'pengukuran';
        logPayload.asset_type = existingAsset.asset_type;
        logPayload.parent_asset_id = existingAsset.parent_asset?.id;

        // update maintenance flow to 'pengukuran'
        await this.maintenanceService.update({
          asset_id: existingAsset.parent_asset?.id, // case 
          flow: 'pengukuran',
        });
      }

      const result = await queryRunner.manager.save(Asset, existingAsset);

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
      throw new Error('Error creating flow: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async swapAsset(body: SwapAssetDto) {
    const queryRunner =
      this.assetRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { active_asset_id, inactive_asset_id, parent_asset_id } = body;

    try {
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
      notInUsedAsset.parent_asset = null;
      notInUsedAsset.status = 'inactive';
      await queryRunner.manager.save(Asset, notInUsedAsset);

      // insert maintenance log
      const logPayload = {
        flow: 'inisialisasi',
        details: {
          info: 'swap asset',
          data: {
            inUsedAsset,
            notInUsedAsset
          }
        },
        parent_asset_id: parentAsset.id
      }

      await this.maintenanceLogService.createWithTransaction(
        queryRunner,
        logPayload,
        null,
      );

      await queryRunner.commitTransaction();

      return {
        inUsedAsset,
        notInUsedAsset,
      };
    } catch (error) {
      throw new Error('Error Get flow data: ' + error.message);
    }
  }

  async getAll(params: FilterAliasDto) {
    try {
      const query = this.assetRepository
        .createQueryBuilder('asset')
        .orderBy(params.order)
        .skip((params?.page - 1) * params?.limit)
        .take(params?.limit);

      if (params?.search) {
        query.andWhere('asset.name LIKE :search', {
          search: `%${params?.search}%`,
        });
      }

      if(params?.asset_type) {
        query.andWhere('asset.asset_type = :asset_type', {
          asset_type: params?.asset_type,
        });
      }

      if(params?.parent_asset_id) {
        query.andWhere('asset.parentAssetId = :parent_asset_id', {
          parent_asset_id: params?.parent_asset_id,
        });
      }

      if(params?.children_alias) {
        query.andWhere('asset.alias = :children_alias', {
          children_alias: params?.children_alias,
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

  async delete(id: string) {
    const queryRunner =
      this.assetRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingFlow = await this.assetRepository.findOneBy({ id });

      if (!existingFlow) {
        throw new HttpException('Flow data not found', 404);
      }

      await queryRunner.manager.delete(Asset, { id });

      // insert action log
      // await this.actionLogRepository.insertData(queryRunner.manager, someData);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error creating flow: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
