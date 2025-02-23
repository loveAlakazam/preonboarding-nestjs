import { Column, CreateDateColumn, DeleteDateColumn } from "typeorm";

export class BaseEntity {
  @Column("created_at")
  @CreateDateColumn()
  createdAt: Date;

  @Column("deleted_at")
  @DeleteDateColumn()
  deletedAt: Date;
}
