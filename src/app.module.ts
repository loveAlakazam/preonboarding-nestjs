import { Module, OnModuleInit } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "@users/users.module";
import { BoardsModule } from "./modules/boards/boards.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { UserEntity } from "@users/entity/users.entity";
import { BoardEntity } from "@boards/entity/boards.entity";
import { CommentEntity } from "@comments/entity/comments.entity";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: (() => {
        switch (process.env.NODE_ENV) {
          case "production":
            return "production.env";
          default:
            return ".env";
        }
      })(),
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get<string>("DB_HOST", "localhost"),
        port: configService.get<number>("DB_PORT", 3306),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_NAME"),
        synchronize:
          configService.get<string>("NODE_ENV") === "production" ? false : true,
        logging:
          configService.get<string>("NODE_ENV") === "production" ? false : true,
        entities: [UserEntity, BoardEntity, CommentEntity],
        // dropSchema: configService.get<string>("NODE_ENV") === "production" ? false : true,
      }),
      inject: [ConfigService], // ConfigService 주입
    }),
    UsersModule,
    BoardsModule,
    CommentsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    console.log("The module has been initialized");
  }
}
