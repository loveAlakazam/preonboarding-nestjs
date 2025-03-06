import { forwardRef, Module } from "@nestjs/common";
import { CommentsController } from "./controllers/comments.controller";
import { CommentsService } from "./services/comments.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentEntity } from "./entity/comments.entity";
import { UsersModule } from "../users/users.module";
import { CommentRepository } from "./repositories/comments.repository";
import { BoardsModule } from "../boards/boards.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    UsersModule,
    forwardRef(() => BoardsModule),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentRepository],
  exports: [CommentRepository],
})
export class CommentsModule {}
