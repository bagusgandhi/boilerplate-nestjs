import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1733135388160 implements MigrationInterface {
    name = 'SchemaUpdate1733135388160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maintenance_log" ADD "gerbongAssetId" uuid`);
        await queryRunner.query(`ALTER TABLE "maintenance_log" ADD CONSTRAINT "FK_055ec81f51d4ee379ab6e77f6fc" FOREIGN KEY ("gerbongAssetId") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maintenance_log" DROP CONSTRAINT "FK_055ec81f51d4ee379ab6e77f6fc"`);
        await queryRunner.query(`ALTER TABLE "maintenance_log" DROP COLUMN "gerbongAssetId"`);
    }

}
