import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1742698784916 implements MigrationInterface {
    name = 'SchemaUpdate1742698784916'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_aa79448dc3e959720ab4c13651d" UNIQUE ("title")`);
        await queryRunner.query(`ALTER TABLE "domain" ADD CONSTRAINT "UQ_9eaf5f85da0a098d5d6269bf16c" UNIQUE ("title")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "domain" DROP CONSTRAINT "UQ_9eaf5f85da0a098d5d6269bf16c"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_aa79448dc3e959720ab4c13651d"`);
    }

}
