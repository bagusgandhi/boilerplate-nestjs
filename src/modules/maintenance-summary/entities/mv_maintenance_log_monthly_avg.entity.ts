import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('mv_maintenance_log_monthly_avg')
export class MaintenanceSummaryMonthlyAvg {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz' })
  month_year: Date;

  @Column({
    type: 'varchar',
    length: 20,
  })
  train_set: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  gerbong: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>; // Flexible JSON object

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  program: string;

  @Column({ type: 'int' })
  total_count: number;
}
