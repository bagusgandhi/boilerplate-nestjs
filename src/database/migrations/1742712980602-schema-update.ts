import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1742712980602 implements MigrationInterface {
    name = 'SchemaUpdate1742712980602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "total"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "templateId" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a8c0dab49a4837c0dc8d37dc31b" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_a8c0dab49a4837c0dc8d37dc31b"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "templateId"`);
        await queryRunner.query(`ALTER TABLE "templates" ADD "total" numeric NOT NULL`);
    }

}
