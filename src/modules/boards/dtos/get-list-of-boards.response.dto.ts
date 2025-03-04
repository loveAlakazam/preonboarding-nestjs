import { Exclude, Expose } from "class-transformer";
import { IBoard } from "./board.interface";
import { ApiProperty } from "@nestjs/swagger";

export type GetListOfBoardsResponseDto = UnitOfList[];
export class UnitOfList implements IBoard {
  @Expose()
  @ApiProperty({ description: "id", example: "1" })
  id: string;

  @Expose()
  @ApiProperty({ description: "title", example: "게시글 제목" })
  title: string;

  @Expose()
  @ApiProperty({ description: "author", example: "작성자 닉네임" })
  author: string;

  @Expose()
  @ApiProperty({
    description: "createdAt",
    example: "2025-02-27T00:00:00.000Z",
  })
  createdAt: Date;

  @Exclude()
  content: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UnitOfList>) {
    Object.assign(this, partial);
  }
}
