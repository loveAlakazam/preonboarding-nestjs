import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "@src/commons/entity/base.entity";
import { BoardEntity } from "@boards/entity/boards.entity";
import { CommentEntity } from "@comments/entity/comments.entity";

@Entity({
  name: "users",
})
export class UserEntity extends BaseEntity {
  // mysql에서는 BIGINT 타입으로 저장되지만, typescript에서는 string으로 다룸.
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column()
  nickname: string;

  @Column()
  password: string;

  // users:boards=1:N
  @OneToMany(() => BoardEntity, (board) => board.user, { cascade: true })
  boards: BoardEntity[];

  // users:comments=1:N
  @OneToMany(() => CommentEntity, (comment) => comment.user, { cascade: true })
  comments: CommentEntity[];
}
