import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1733357790875 implements MigrationInterface {
    name = 'SchemaUpdate1733357790875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset" ADD "location" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "location"`);
    }

}
