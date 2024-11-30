import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Env } from '../config/env-loader';
// import { SeederOptions } from 'typeorm-extension';
const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } = Env();

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  // entities: ['src/**/*.entity{.ts,.js}'],
  synchronize: false,
  dropSchema: false,
  logging: true,
  migrations: ['src/database/migrations/**/*.ts'],
  migrationsTableName: 'migration_table',
};

export default typeOrmConfig;
