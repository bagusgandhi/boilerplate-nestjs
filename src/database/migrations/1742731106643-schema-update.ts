import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1742731106643 implements MigrationInterface {
    name = 'SchemaUpdate1742731106643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "timestamp"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "timestamp" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
