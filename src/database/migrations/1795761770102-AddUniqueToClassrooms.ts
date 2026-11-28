import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueToClassrooms1795761770102 implements MigrationInterface {
    name = 'AddUniqueToClassrooms1795761770102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9019d29e093cde039ad68e87b2" ON "users"  ("username") WHERE "deleted_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9019d29e093cde039ad68e87b2"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
    }

}
