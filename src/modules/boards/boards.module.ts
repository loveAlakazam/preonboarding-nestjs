import { Module } from "@nestjs/common";
import { BoardsService } from "./services/boards.service";
import { BoardsController } from "./controllers/boards.controller";
import { UsersModule } from "../users/users.module";
import { BoardRepository } from "./repositories/boards.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BoardEntity } from "./entity/boards.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BoardEntity]), UsersModule],
  providers: [BoardsService, BoardRepository],
  controllers: [BoardsController],
})
export class BoardsModule {}
