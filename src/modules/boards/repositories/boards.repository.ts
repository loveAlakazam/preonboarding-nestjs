import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BoardEntity } from "../entity/boards.entity";
import { Repository } from "typeorm";
import { CreateNewBoardRequestDto } from "@boards/dtos/create-new-board.request.dto";

@Injectable()
export class BoardRepository {
  constructor(
    @InjectRepository(BoardEntity)
    private dataSource: Repository<BoardEntity>,
  ) {}

  findAll(): Promise<BoardEntity[]> {
    return this.dataSource.find({
      relations: {
        user: true,
      },
      // 작성날짜를 기준으로 내림차순 정렬
      order: { createdAt: "DESC" },
    });
  }

  findOneById(id: string): Promise<BoardEntity | null> {
    return this.dataSource.findOne({
      where: { id },
      relations: {
        user: true,
        comments: true,
      },
      order: {
        comments: {
          // 작성날짜를 기준으로 오름차순 정렬
          createdAt: "ASC",
        },
      },
    });
  }

  create(newBoard: any) {
    // todo: input-parameter: any -> dto class
    return this.dataSource.save(newBoard);
  }

  update(updatedBoard: any) {
    // todo: input-parameter: any -> dto class
    // 일부데이터만 저장할 수 있도록 수정...
    return this.dataSource.save({ ...updatedBoard });
  }

  async delete(id: string) {
    await this.dataSource.softDelete(id);
  }

  async remove(id: string) {
    await this.dataSource.delete({ id: id });
  }
}
