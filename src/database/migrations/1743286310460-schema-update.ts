import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1743286310460 implements MigrationInterface {
    name = 'SchemaUpdate1743286310460'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "template_category" DROP CONSTRAINT "FK_18897f0a52cae4da45bb2bc51b3"`);
        await queryRunner.query(`ALTER TYPE "public"."products_duration_enum" RENAME TO "products_duration_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."products_duration_enum" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10')`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "duration" TYPE "public"."products_duration_enum" USING "duration"::"text"::"public"."products_duration_enum"`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "duration" SET DEFAULT '1'`);
        await queryRunner.query(`DROP TYPE "public"."products_duration_enum_old"`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "duration" SET DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "template_category" ADD CONSTRAINT "FK_18897f0a52cae4da45bb2bc51b3" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "template_category" DROP CONSTRAINT "FK_18897f0a52cae4da45bb2bc51b3"`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "duration" DROP DEFAULT`);
        await queryRunner.query(`CREATE TYPE "public"."products_duration_enum_old" AS ENUM('6', '12', '24', '36')`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "duration" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "duration" TYPE "public"."products_duration_enum_old" USING "duration"::"text"::"public"."products_duration_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."products_duration_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."products_duration_enum_old" RENAME TO "products_duration_enum"`);
        await queryRunner.query(`ALTER TABLE "template_category" ADD CONSTRAINT "FK_18897f0a52cae4da45bb2bc51b3" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
