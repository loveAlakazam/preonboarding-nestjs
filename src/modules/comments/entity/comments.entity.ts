import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "@src/commons/entity/base.entity";
import { BoardEntity } from "@boards/entity/boards.entity";
import { UserEntity } from "@users/entity/users.entity";

@Entity({
  name: "comments",
})
export class CommentEntity extends BaseEntity {
  // mysql에서는 BIGINT 타입으로 저장되지만, typescript에서는 string으로 다룸.
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column()
  content: string;

  // users:comments=1:N
  @ManyToOne(() => UserEntity, (user) => user.comments)
  user: UserEntity;

  // boards:comments=1:N
  @ManyToOne(() => BoardEntity, (board) => board.comments)
  board: BoardEntity;
}
