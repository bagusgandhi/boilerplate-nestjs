import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Env } from 'src/config/env-loader';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const { PORT } = Env();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
  app.enableCors({
    origin: [
      'http://localhost:3000'
    ]
  });

  const config = new DocumentBuilder()
  .setTitle('BOILERPLATE API')
  .setDescription('The Boilerplate API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(PORT || 3009, () => {
    Logger.debug(`server runnning at port ${PORT || 3009}`);
  });
}
bootstrap();
