import { Env } from '../config/env-loader';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } = Env();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  // entities: ['src/**/*.entity{.ts,.js}'],
  // synchronize: true, // dont uncomment it in production
  synchronize: false,
  dropSchema: false,
  logging: true,
  seeds: ['dist/database/seeds/**/*.js'],
  migrations: ['dist/database/migrations/schema-update/**/*.ts'],
  migrationsTableName: 'migration_table',
};

export const dataSource = new DataSource(options);
