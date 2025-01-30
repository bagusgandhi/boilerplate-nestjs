import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProvider1738158237106 implements MigrationInterface {
    name = 'AddUserProvider1738158237106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "uploads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "originalName" character varying NOT NULL, "size" bigint, "path" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "userId" uuid, CONSTRAINT "PK_d1781d1eedd7459314f60f39bd3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "provider" character varying NOT NULL DEFAULT 'basic'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "resetToken" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "resetTokenExpires" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "uploads" ADD CONSTRAINT "FK_632458210d8f0159857b0f05707" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "uploads" DROP CONSTRAINT "FK_632458210d8f0159857b0f05707"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetTokenExpires"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetToken"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "provider"`);
        await queryRunner.query(`DROP TABLE "uploads"`);
    }

}
