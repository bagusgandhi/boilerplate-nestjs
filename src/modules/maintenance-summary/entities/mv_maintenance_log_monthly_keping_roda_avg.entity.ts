import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('mv_maintenance_log_monthly_keping_roda_avg')
export class MaintenanceSummaryMonthlyKepingRodaAvg {
  @PrimaryColumn('uuid')
  id: string;
  
  @Column({ type: 'timestamptz' })
  month_year: Date;

  @Column({
    type: 'varchar',
    length: 20
  })
  asset_name: string;

  @Column({
    type: 'varchar',
    length: 20
  })
  train_set: string;

  @Column({
    type: 'varchar',
    length: 20
  })
  gerbong: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>; // Flexible JSON object

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true
  })
  bogie_type: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true
  })
  bogie: string;

  @Column({
    type: 'float8',
    nullable: true
  })
  avg_diameter: number;

  @Column({
    type: 'float8',
    nullable: true
  })
  avg_flank: number;

  @Column({ type: 'int' })
  total_records: number;
}

