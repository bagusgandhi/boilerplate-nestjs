import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1733095197267 implements MigrationInterface {
    name = 'SchemaUpdate1733095197267'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maintenance" ADD "is_maintenance" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maintenance" DROP COLUMN "is_maintenance"`);
    }

}
