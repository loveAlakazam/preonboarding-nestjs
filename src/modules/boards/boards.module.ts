import { Module } from "@nestjs/common";
import { BoardsService } from "./services/boards.service";
import { BoardsController } from "./controllers/boards.controller";
import { UsersModule } from "../users/users.module";
import { BoardRepository } from "./repositories/boards.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BoardEntity } from "./entity/boards.entity";
import { CommentsModule } from "../comments/comments.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardEntity]),
    UsersModule,
    CommentsModule,
  ],
  providers: [BoardsService, BoardRepository],
  controllers: [BoardsController],
  exports: [BoardRepository],
})
export class BoardsModule {}
