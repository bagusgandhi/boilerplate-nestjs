import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flow } from './entities/flow.entity';
import { Repository } from 'typeorm';
import { CreateUpdateFlowDto } from './dto/create-update-flow.dto';
import { sortDto } from 'src/global/dto/sort.dto';
import { PaginationDto } from 'src/global/dto/pagination.dto';

@Injectable()
export class FlowService {
  constructor(
    @InjectRepository(Flow)
    private flowRepository: Repository<Flow>,
  ) {}

  async getByName(name: string) {
    try {
      const data = await this.flowRepository.findOneBy({ name });

      if (!data) {
        throw new HttpException('Flow data not found', 404);
      }

      return data;
    } catch (error) {
      throw new Error('Error Get flow by name: ' + error.message);
    }
  }

  async get(id: string) {
    try {
      const data = await this.flowRepository.findOneBy({ id });

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
      console.log(params.order)
      const query = this.flowRepository
        .createQueryBuilder('flow')
        .orderBy(params.order)
        .skip((params?.page - 1) * params?.limit)
        .take(params?.limit);

      if (params?.search) {
        query.andWhere('flow.name LIKE :search', {
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

  async create(body: CreateUpdateFlowDto) {
    const queryRunner =
      this.flowRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const count = await this.flowRepository.count();

      const newFlow = new Flow();
      newFlow.name = body.name;
      newFlow.description = body.description;
      newFlow.metadata = body.metadata;
      newFlow.position = count + 1;

      const result = await queryRunner.manager.save(Flow, newFlow);

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

  async update(id: string, body: CreateUpdateFlowDto) {
    const queryRunner =
      this.flowRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingFlow = await this.flowRepository.findOneBy({ id });

      if (!existingFlow) {
        throw new HttpException('Flow data not found', 404);
      }

      existingFlow.name = body.name;
      existingFlow.description = body.description;
      existingFlow.metadata = body.metadata;

      const result = await queryRunner.manager.save(Flow, existingFlow);

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

  async delete(id: string) {
    const queryRunner =
      this.flowRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingFlow = await this.flowRepository.findOneBy({ id });

      if (!existingFlow) {
        throw new HttpException('Flow data not found', 404);
      }

      await queryRunner.manager.delete(Flow, { id });

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

  async updateSort(body: sortDto) {
    const queryRunner =
      this.flowRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updatePromises = body?.sort?.map(
        async (id: string, idx: number) => {
          const result = await queryRunner.manager.update(Flow, id, {
            position: idx + 1,
          });
          if (result.affected === 0) {
            throw new Error(`Asset with id ${id} not found`);
          }
          return { id }; // Return the updated asset data if needed
        },
      );

      const updatedFlows = await Promise.all(updatePromises);

      // insert action log
      // await this.actionLogRepository.insertData(queryRunner.manager, someData);

      await queryRunner.commitTransaction();
      return updatedFlows;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error creating flow: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
