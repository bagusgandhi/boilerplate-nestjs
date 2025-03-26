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
  CLOUDFLARE_URL: process.env.CLOUDFLARE_URL,
  CLOUDFLARE_TOKEN: process.env.CLOUDFLARE_TOKEN,
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
  CLOUDFLARE_EMAIL: process.env.CLOUDFLARE_EMAIL,
  CLOUDFLARE_API_KEY: process.env.CLOUDFLARE_API_KEY,
  REGISTRAR_URL: process.env.REGISTRAR_URL,
  REGISTRAR_TOKEN: process.env.REGISTRAR_TOKEN,
  REGISTRAR_CUSTOMER_ID: parseInt(process.env.REGISTRAR_CUSTOMER_ID),
  HOST_SERVER: process.env.HOST_SERVER,
});
