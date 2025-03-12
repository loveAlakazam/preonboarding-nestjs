import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // dto에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // 정의되지 않은 속성이 들어오면 예외발생
      transform: true, // dto 내부에서 자동변환 적용
    }),
  );

  // cookie
  app.use(cookieParser());
  app.enableCors({
    origin: "http://localhost:3001",
    credentials: true,
  });

  // swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Pre-Onboarding API")
    .build();
  const swaggerFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, swaggerFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
