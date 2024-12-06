import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1733234364752 implements MigrationInterface {
    name = 'SchemaUpdate1733234364752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maintenance_log" ADD "program" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maintenance_log" DROP COLUMN "program"`);
    }

}
