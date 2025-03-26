import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1742980423194 implements MigrationInterface {
    name = 'SchemaUpdate1742980423194'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transaction_details" jsonb NOT NULL, "amount" numeric NOT NULL, "invoiceId" uuid, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sites_status_enum" AS ENUM('active', 'on progress', 'expired')`);
        await queryRunner.query(`CREATE TABLE "sites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cloudflare_zone_id" character varying NOT NULL, "db_name" character varying NOT NULL, "db_user" character varying NOT NULL, "db_password" character varying NOT NULL, "port" integer NOT NULL, "status" "public"."sites_status_enum" NOT NULL DEFAULT 'on progress', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_4f5eccb1dfde10c9170502595a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1b1653e97432f3e43182120080" ON "sites" ("cloudflare_zone_id", "db_name", "port") `);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_87223c7f1d4c2ca51cf69927844" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_87223c7f1d4c2ca51cf69927844"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1b1653e97432f3e43182120080"`);
        await queryRunner.query(`DROP TABLE "sites"`);
        await queryRunner.query(`DROP TYPE "public"."sites_status_enum"`);
        await queryRunner.query(`DROP TABLE "payment"`);
    }

}
