import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceSummaryMonthlyAvg } from './entities/mv_maintenance_log_monthly_avg.entity';
import { MaintenanceSummaryMonthlyKepingRodaAvg } from './entities/mv_maintenance_log_monthly_keping_roda_avg.entity';
import { FilterMaintenanceSummaryMonthlyAvgDto } from './dto/filter-maintenance-summary-monthly-avg.dto';
import { applyDynamicOrder } from 'src/utils/dynamic-order';
import { FilterMaintenanceSummaryKepingRodaAvgDto } from './dto/filter-maintenance-summary-keping-roda-avg.dto';
import { DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as PDFDocument from 'pdfkit';
import * as moment from 'moment';
import { Response } from 'express';

@Injectable()
export class MaintenanceSummaryService {
  private readonly logger = new Logger(MaintenanceSummaryService.name);
  constructor(
    @InjectRepository(MaintenanceSummaryMonthlyAvg)
    private maintenanceSummaryMonthlyAvgRepository: Repository<MaintenanceSummaryMonthlyAvg>,
    @InjectRepository(MaintenanceSummaryMonthlyKepingRodaAvg)
    private maintenanceSummaryMonthlyKepingRodaAvgRepository: Repository<MaintenanceSummaryMonthlyKepingRodaAvg>,
    private readonly dataSource: DataSource,
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
        query.andWhere(
          'mv_maintenance_log_monthly_avg.gerbong IN (:...gerbongs)',
          {
            gerbongs: params?.gerbong,
          },
        );
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

  async exportMonthlyAvgAsPDF(
    params: FilterMaintenanceSummaryMonthlyAvgDto,
    res: Response,
  ) {
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
        query.andWhere(
          'mv_maintenance_log_monthly_avg.gerbong IN (:...gerbongs)',
          {
            gerbongs: params?.gerbong,
          },
        );
      }

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

      const results = await query.getMany();

      if (results.length === 0) {
        throw new Error('No data found for the specified filters');
      }

      // Generate PDF to buffer
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      let buffer: Buffer;

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        buffer = Buffer.concat(chunks);
      });

      doc.fontSize(18).text('Monthly Maintenance Average Report', {
        align: 'center',
      });
      doc.moveDown(2);

      // Table headers
      const tableHeaders = [
        'Train Set',
        'Gerbong',
        'Month-Year',
        'Total Count',
        'Details'
      ];
      const columnWidths = [100, 100, 100, 100];
      const startX = doc.x;
      let startY = doc.y;

      // Draw table headers
      doc.fontSize(12).font('Helvetica-Bold');
      tableHeaders.forEach((header, index) => {
        doc.text(
          header,
          startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
          startY,
          {
            width: columnWidths[index],
            align: 'center',
          },
        );
      });

      // Draw a line under the headers
      startY += 20;
      doc
        .moveTo(startX, startY)
        .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), startY)
        .stroke();

      // Draw table rows
      doc.font('Helvetica').fontSize(10);
      results.forEach((item) => {
        startY += 20;
        if (startY > doc.page.height - 50) {
          doc.addPage();
          startY = 30;
        }
        
        const rowData = [
          item.train_set,
          item.gerbong,
          moment(item.month_year).format('MMM YYYY'),
          item.total_count
        ];
        rowData.forEach((data, index) => {
          doc.text(
            String(data),
            startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
            startY,
            {
              width: columnWidths[index],
              align: 'center',
            },
          );
        });
      });

      doc.end();

      // Wait until the document is fully written
      await new Promise((resolve) => doc.on('end', resolve));

      // Set response headers for PDF file
      const fileName = `Monthly_Maintenance_Avg_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );
      res.setHeader('Content-Length', buffer.byteLength);

      return res.send(buffer);
    } catch (error) {
      throw new Error(
        'Error exporting maintenance data to PDF: ' + error.message,
      );
    }
  }

  async getAllMonthlySeries(
    params: FilterMaintenanceSummaryMonthlyAvgDto,
  ): Promise<any> {
    const { train_set, gerbong, startedAt, endedAt } = params;

    let whereClauses: string[] = [];
    let parameters: any[] = [];

    // Use a counter for parameter placeholders
    let paramIndex = 1;

    // Add train_set filter if provided
    if (train_set && train_set.length > 0) {
      whereClauses.push(`"train_set" = ANY($${paramIndex++})`);
      parameters.push(train_set);
    }

    // Add gerbong filter if provided
    if (gerbong && gerbong.length > 0) {
      whereClauses.push(`"gerbong" = ANY($${paramIndex++})`);
      parameters.push(gerbong);
    }

    // Add date range filter if provided
    if (startedAt) {
      whereClauses.push(`"month_year" >= $${paramIndex++}`);
      parameters.push(startedAt);
    }

    if (endedAt) {
      whereClauses.push(`"month_year" <= $${paramIndex++}`);
      parameters.push(endedAt);
    }

    // Construct WHERE clause
    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      WITH 
          expanded_data AS (
              SELECT
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
          month_year, total_count
      ORDER BY month_year ASC;
    `;

    console.log('query: ', query);
    console.log('whereClause: ', whereClause);
    console.log('parameters: ', parameters);

    // Execute query with parameters
    return await this.maintenanceSummaryMonthlyAvgRepository.query(
      query,
      parameters,
    );
  }

  async getAllMonthlyCount(
    params: FilterMaintenanceSummaryMonthlyAvgDto,
  ): Promise<any> {
    const { train_set, gerbong, startedAt, endedAt } = params;

    let whereClauses: string[] = [];
    let parameters: any[] = [];

    // Use a counter for parameter placeholders
    let paramIndex = 1;

    // Add train_set filter if provided
    if (train_set && train_set.length > 0) {
      whereClauses.push(`"train_set" = ANY($${paramIndex++})`);
      parameters.push(train_set);
    }

    // Add gerbong filter if provided
    if (gerbong && gerbong.length > 0) {
      whereClauses.push(`"gerbong" = ANY($${paramIndex++})`);
      parameters.push(gerbong);
    }

    // Add date range filter if provided
    if (startedAt) {
      whereClauses.push(`"month_year" >= $${paramIndex++}`);
      parameters.push(startedAt);
    }

    if (endedAt) {
      whereClauses.push(`"month_year" <= $${paramIndex++}`);
      parameters.push(endedAt);
    }

    // Construct WHERE clause
    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      WITH 
          expanded_data AS (
              SELECT
                  ml."month_year",
                  total_count 
              FROM
                  mv_maintenance_log_monthly_avg ml 
              ${whereClause}
          ),
          averages AS (
              SELECT
                  month_year,
                  SUM(total_count) AS total_count
              FROM
                  expanded_data
              GROUP BY
                  month_year
          )
      SELECT
          month_year,
          total_count
      FROM
          averages
      GROUP BY
          month_year, total_count
      ORDER BY month_year ASC;
    `;

    // Execute query with parameters
    return await this.maintenanceSummaryMonthlyAvgRepository.query(
      query,
      parameters,
    );
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

  async refreshMaterializedView(viewName: string) {
    const query = `REFRESH MATERIALIZED VIEW ${viewName}`;
    try {
      await this.dataSource.query(query);
      this.logger.log(`Materialized view ${viewName} refreshed successfully.`);
    } catch (error) {
      this.logger.error(
        `Error refreshing materialized view ${viewName}: ${error.message}`,
      );
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_HOUR) // Change this to the desired interval
  async handleCron() {
    this.logger.log('Scheduled task to refresh materialized views started.');

    // mv_maintenance_log_monthly_keping_roda_avg
    await this.refreshMaterializedView(
      'mv_maintenance_log_monthly_keping_roda_avg',
    );

    // mv_maintenance_log_monthly_avg
    await this.refreshMaterializedView('mv_maintenance_log_monthly_avg ');
  }
}
