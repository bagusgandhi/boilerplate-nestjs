import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1742724801670 implements MigrationInterface {
    name = 'SchemaUpdate1742724801670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "timestamp"`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "timestamp" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
