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
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_PORT: +process.env.EMAIL_PORT || 587, // Default to 587 if not set
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: +process.env.REDIS_PORT || 6379, // Default to 6379 if not set
});
