import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_PREFIX, API_VERSION } from './common/constants/app.constants';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 8080);
  const corsOrigins = configService.get<string[]>('app.corsOrigins', []);

  app.setGlobalPrefix(`${API_PREFIX}/${API_VERSION}`, {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });
  app.use(requestIdMiddleware);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('HTO API')
    .setDescription('HTO backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${API_PREFIX}/docs`, app, swaggerDocument);
  SwaggerModule.setup(
    `${API_PREFIX}/${API_VERSION}/docs`,
    app,
    swaggerDocument,
  );

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(port);
}

void bootstrap();
