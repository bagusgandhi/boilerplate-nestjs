import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1736173211547 implements MigrationInterface {
    name = 'SchemaUpdate1736173211547'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mv_maintenance_log_monthly_keping_roda_avg" ("id" uuid NOT NULL, "month_year" TIMESTAMP WITH TIME ZONE NOT NULL, "asset_name" character varying(20) NOT NULL, "train_set" character varying(20) NOT NULL, "gerbong" character varying(20) NOT NULL, "details" jsonb, "bogie_type" character varying(20), "bogie" character varying(20), "avg_diameter" double precision, "avg_flank" double precision, "total_records" integer NOT NULL, CONSTRAINT "PK_dacd70bf96d5b1366e8f9632b63" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mv_maintenance_log_monthly_avg" ("id" uuid NOT NULL, "month_year" TIMESTAMP WITH TIME ZONE NOT NULL, "train_set" character varying(20) NOT NULL, "gerbong" character varying(20) NOT NULL, "details" jsonb, "program" character varying(20), "total_count" integer NOT NULL, CONSTRAINT "PK_0e92073d474977ccdd05c419cd2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "asset" ADD "treshold" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "treshold"`);
        await queryRunner.query(`DROP TABLE "mv_maintenance_log_monthly_avg"`);
        await queryRunner.query(`DROP TABLE "mv_maintenance_log_monthly_keping_roda_avg"`);
    }

}
