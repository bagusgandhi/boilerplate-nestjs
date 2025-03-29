import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1743207871700 implements MigrationInterface {
    name = 'SchemaUpdate1743207871700'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" ADD "img_url" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "img_url"`);
    }

}
