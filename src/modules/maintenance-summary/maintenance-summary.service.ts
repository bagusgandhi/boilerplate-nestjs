import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceSummaryMonthlyAvg } from './entities/mv_maintenance_log_monthly_avg.entity';
import { MaintenanceSummaryMonthlyKepingRodaAvg } from './entities/mv_maintenance_log_monthly_keping_roda_avg.entity';
import { FilterMaintenanceSummaryMonthlyAvgDto } from './dto/filter-maintenance-summary-monthly-avg.dto';
import { applyDynamicOrder } from 'src/utils/dynamic-order';
import { FilterMaintenanceSummaryKepingRodaAvgDto } from './dto/filter-maintenance-summary-keping-roda-avg.dto';

@Injectable()
export class MaintenanceSummaryService {
  constructor(
    @InjectRepository(MaintenanceSummaryMonthlyAvg)
    private maintenanceSummaryMonthlyAvgRepository: Repository<MaintenanceSummaryMonthlyAvg>,
    @InjectRepository(MaintenanceSummaryMonthlyKepingRodaAvg)
    private maintenanceSummaryMonthlyKepingRodaAvgRepository: Repository<MaintenanceSummaryMonthlyKepingRodaAvg>,
  ) {}

  async getAllMonthlyAvg(params: FilterMaintenanceSummaryMonthlyAvgDto) {
    try {
      let query =
        this.maintenanceSummaryMonthlyAvgRepository.createQueryBuilder(
          'mv_maintenance_log_monthly_avg',
        );

      if (!params?.viewAll) {
        query.skip((params?.page - 1) * params?.limit).take(params?.limit);
      }

      if (params?.train_set && Array.isArray(params?.train_set)) {
        query.andWhere(
          'mv_maintenance_log_monthly_avg.train_set IN (:...train_sets)',
          {
            train_sets: params?.train_set,
          },
        );
      }

      if (params?.gerbong && Array.isArray(params?.gerbong)) {
        query.andWhere('mv_maintenance_log_monthly_avg.gerbong IN (:...gerbongs)', {
          gerbongs: params?.gerbong,
        });
      }

      // Filter by date range
      if (params?.startedAt && params?.endedAt) {
        query.andWhere(
          'mv_maintenance_log_monthly_avg.month_year BETWEEN :startedAt AND :endedAt',
          {
            startedAt: params.startedAt,
            endedAt: params.endedAt,
          },
        );
      } else if (params?.startedAt) {
        query.andWhere(
          'mv_maintenance_log_monthly_avg.month_year >= :startedAt',
          { startedAt: params.startedAt },
        );
      } else if (params?.endedAt) {
        query.andWhere(
          'mv_maintenance_log_monthly_avg.month_year <= :endedAt',
          { endedAt: params.endedAt },
        );
      }

      if (params?.order) {
        const allowedColumns = ['train_set', 'gerbong', 'month_year'];
        query = applyDynamicOrder(
          query,
          'mv_maintenance_log_monthly_avg',
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

  async getAllMonthlySeries(params: FilterMaintenanceSummaryMonthlyAvgDto): Promise<any> {
    const { train_set, gerbong, startedAt, endedAt } = params;
  
    let whereClauses: string[] = [];
    let parameters: any[] = [];
  
    // Add train_set filter if provided
    if (train_set && train_set.length > 0) {
      whereClauses.push(`"train_set" = ANY($1)`);
      parameters.push(train_set);
    }
  
    // Add gerbong filter if provided
    if (gerbong && gerbong.length > 0) {
      whereClauses.push(`"gerbong" = ANY($2)`);
      parameters.push(gerbong);
    }
  
    // Add date range filter if provided
    if (startedAt) {
      whereClauses.push(`"month_year" >= $3`);
      parameters.push(startedAt);
    }
  
    if (endedAt) {
      whereClauses.push(`"month_year" <= $4`);
      parameters.push(endedAt);
    }
  
    // Construct WHERE clause
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  
    const query = `
      WITH 
          expanded_data AS (
              SELECT
                  --date_trunc('month', ml."month_year") AS month_year,
                  ml."month_year",
                  jsonb_array_elements(ml.details::JSONB) AS detail,
                  total_count 
              FROM
                  mv_maintenance_log_monthly_avg ml 
              ${whereClause}
          ),
          averages AS (
              SELECT
                  month_year,
                  detail->>'bogie_type' AS bogie_type,
                  AVG((detail->>'avg_diameter')::DOUBLE PRECISION) AS avg_diameter,
                  AVG((detail->>'avg_flens')::DOUBLE PRECISION) AS avg_flens,
                  SUM(total_count) AS total_count
              FROM
                  expanded_data
              GROUP BY
                  month_year, bogie_type
          )
      SELECT
          month_year,
          total_count,
          jsonb_object_agg(bogie_type, jsonb_build_object('avg_diameter', avg_diameter, 'avg_flens', avg_flens)) AS avg
      FROM
          averages
      GROUP BY
          month_year, total_count;
    `;
  
    // Execute query with parameters
    return await this.maintenanceSummaryMonthlyAvgRepository.query(query, parameters);
  }
  

  async getAllMonthlyKepingRodaAvg(
    params: FilterMaintenanceSummaryKepingRodaAvgDto,
  ) {
    try {
      let query =
        this.maintenanceSummaryMonthlyKepingRodaAvgRepository.createQueryBuilder(
          'mv_maintenance_log_monthly_keping_roda_avg',
        );

      if (!params?.viewAll) {
        query.skip((params?.page - 1) * params?.limit).take(params?.limit);
      }

      if (params?.keping_roda) {
        query.andWhere(
          'mv_maintenance_log_monthly_keping_roda_avg.asset_name = :keping_roda',
          {
            keping_roda: params?.keping_roda,
          },
        );
      }

      // Filter by date range
      if (params?.startedAt && params?.endedAt) {
        query.andWhere(
          'mv_maintenance_log_monthly_keping_roda_avg.month_year BETWEEN :startedAt AND :endedAt',
          {
            startedAt: params.startedAt,
            endedAt: params.endedAt,
          },
        );
      } else if (params?.startedAt) {
        query.andWhere(
          'mv_maintenance_log_monthly_keping_roda_avg.month_year >= :startedAt',
          { startedAt: params.startedAt },
        );
      } else if (params?.endedAt) {
        query.andWhere(
          'mv_maintenance_log_monthly_keping_roda_avg.month_year <= :endedAt',
          { endedAt: params.endedAt },
        );
      }

      if (params?.order) {
        const allowedColumns = ['train_set', 'gerbong', 'month_year'];
        query = applyDynamicOrder(
          query,
          'mv_maintenance_log_monthly_keping_roda_avg',
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
}
