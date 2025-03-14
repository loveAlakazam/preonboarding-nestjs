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
import AppDataSource from "./database/mysql.datasource";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: (() => {
        switch (process.env.NODE_ENV) {
          case "production":
            return ".production.env";
          case "test":
            return ".test.env";
          default:
            return ".env";
        }
      })(),
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
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
