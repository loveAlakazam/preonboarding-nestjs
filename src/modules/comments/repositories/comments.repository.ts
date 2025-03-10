import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEntity } from "../entity/comments.entity";
import { Repository } from "typeorm";

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private dataSource: Repository<CommentEntity>,
  ) {}

  async create(newComment: any) {
    return await this.dataSource.save({ ...newComment });
  }

  async update(updatedComment: any) {
    return await this.dataSource.save({ ...updatedComment });
  }

  async findOneById(id: string) {
    return await this.dataSource.findOneBy({ id });
  }

  async findCommentsByBoardId(boardId: string) {
    return await this.dataSource.find({
      where: { board: { id: boardId } },
      relations: {
        board: true,
        user: true,
      },
      order: {
        createdAt: "ASC",
      },
    });
  }

  async delete(id: string) {
    // soft-delete
    await this.dataSource.softDelete(id);
  }
  async remove(id: string) {
    // hard-delete
    await this.dataSource.delete(id);
  }
}
