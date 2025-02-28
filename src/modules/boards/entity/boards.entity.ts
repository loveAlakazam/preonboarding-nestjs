import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BaseEntity } from "@src/commons/entity/base.entity";
import { UserEntity } from "@users/entity/users.entity";
import { CommentEntity } from "@comments/entity/comments.entity";

@Entity({
  name: "boards",
})
export class BoardEntity extends BaseEntity {
  // mysql에서는 BIGINT 타입으로 저장되지만, typescript에서는 string으로 다룸.
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column()
  title: string;

  @Column()
  content: string;
  @Column()
  password: string;

  // users:boards=1:N
  @ManyToOne(() => UserEntity, (user) => user.boards, {
    createForeignKeyConstraints: false,
    onDelete: "CASCADE",
  })
  user: UserEntity;

  // boards:comments=1:N
  @OneToMany(() => CommentEntity, (comment) => comment.user, {
    cascade: true,
  })
  comments: CommentEntity[];
}
