import * as dotenv from 'dotenv';
dotenv.config();

export const Env = () => ({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: +process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  PORT: process.env.PORT,
  PRIVATE_KEY_FILE: process.env.PRIVATE_KEY_FILE,
  PUBLIC_KEY_FILE: process.env.PUBLIC_KEY_FILE,
  SECRET_API_KEY: process.env.SECRET_API_KEY,
  API_KEY_SECRET: process.env.API_KEY_SECRET,
});
