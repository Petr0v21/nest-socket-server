import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:8080',
        'http://localhost:3000',
        'https://telegram-web-app-livid.vercel.app',
      ];

      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  };
  app.enableCors(corsOptions);
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log('Server runing on port ' + port);
}
bootstrap();
