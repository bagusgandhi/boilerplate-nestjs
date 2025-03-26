import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1742690739135 implements MigrationInterface {
    name = 'SchemaUpdate1742690739135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "promo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "amount" numeric NOT NULL, CONSTRAINT "PK_49d7e83df682fb7e87187e1c843" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."invoice_status_enum" AS ENUM('paid', 'pending', 'canceled')`);
        await queryRunner.query(`CREATE TYPE "public"."invoice_type_enum" AS ENUM('renewal', 'new_order')`);
        await queryRunner.query(`CREATE TABLE "invoice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying, "total" numeric NOT NULL, "status" "public"."invoice_status_enum" NOT NULL DEFAULT 'pending', "due_date" TIMESTAMP, "type" "public"."invoice_type_enum" NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "orderId" uuid, "userId" uuid, CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "domain" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "amount" numeric NOT NULL, CONSTRAINT "PK_27e3ec3ea0ae02c8c5bceab3ba9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('active', 'renewed', 'expired', 'canceled', 'pending')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "domain_name" character varying, "description" character varying, "total" numeric NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "expired_date" TIMESTAMP, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "productId" uuid, "domainId" uuid, "promoId" uuid, "userId" uuid, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."products_duration_enum" AS ENUM('6', '12', '24', '36')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "amount" numeric NOT NULL, "duration" "public"."products_duration_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productId" uuid, "categoryId" uuid, CONSTRAINT "PK_0dce9bc93c2d2c399982d04bef1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "template_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "templateId" uuid, "categoryId" uuid, CONSTRAINT "PK_fcc56203b1c92e296f3a1ab2e74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "url" character varying NOT NULL, "total" numeric NOT NULL, CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_f494ce6746b91e9ec9562af4857" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_f8e849201da83b87f78c7497dde" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_8624dad595ae567818ad9983b33" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_5e3dec44a7a52441c7beb85df2b" FOREIGN KEY ("domainId") REFERENCES "domain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_acfda253a0d05ff3dbbe1e6eb58" FOREIGN KEY ("promoId") REFERENCES "promo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_category" ADD CONSTRAINT "FK_930110e92aed1778939fdbdb302" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_category" ADD CONSTRAINT "FK_559e1bc4d01ef1e56d75117ab9c" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "template_category" ADD CONSTRAINT "FK_18897f0a52cae4da45bb2bc51b3" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "template_category" ADD CONSTRAINT "FK_2df7de1834ccedb6d528934d24a" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "template_category" DROP CONSTRAINT "FK_2df7de1834ccedb6d528934d24a"`);
        await queryRunner.query(`ALTER TABLE "template_category" DROP CONSTRAINT "FK_18897f0a52cae4da45bb2bc51b3"`);
        await queryRunner.query(`ALTER TABLE "product_category" DROP CONSTRAINT "FK_559e1bc4d01ef1e56d75117ab9c"`);
        await queryRunner.query(`ALTER TABLE "product_category" DROP CONSTRAINT "FK_930110e92aed1778939fdbdb302"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_acfda253a0d05ff3dbbe1e6eb58"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_5e3dec44a7a52441c7beb85df2b"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_8624dad595ae567818ad9983b33"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_f8e849201da83b87f78c7497dde"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_f494ce6746b91e9ec9562af4857"`);
        await queryRunner.query(`DROP TABLE "templates"`);
        await queryRunner.query(`DROP TABLE "template_category"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "product_category"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_duration_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "domain"`);
        await queryRunner.query(`DROP TABLE "invoice"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_status_enum"`);
        await queryRunner.query(`DROP TABLE "promo"`);
    }

}
