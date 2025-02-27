import { Exclude, Expose } from "class-transformer";
import { BoardDto } from "./board.dto.interface";
import { ApiProperty } from "@nestjs/swagger";

export class CreateNewBoardResponseDto implements BoardDto {
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
  @ApiProperty({ description: "content", example: "게시글 내용" })
  content: string;

  @Expose()
  @ApiProperty({
    description: "createdAt",
    example: "2025-02-27T00:00:00.000Z",
  })
  createdAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<CreateNewBoardResponseDto>) {
    Object.assign(this, partial);
  }
}
