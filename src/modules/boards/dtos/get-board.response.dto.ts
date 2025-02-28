import { ApiOperation, ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IBoard } from "./board.interface";
import { CommentDto } from "@comments/dtos/comment.dto";

export class GetBoardResponseDto implements IBoard {
  @Expose()
  @ApiProperty({ description: "id", example: "1" })
  id: string;

  @Expose()
  @ApiProperty({ description: "title", example: "게시글 제목" })
  title: string;

  @Expose()
  @ApiProperty({ description: "content", example: "게시글 내용" })
  content: string;

  @Expose()
  @ApiProperty({
    description: "createdAt",
    example: "2025-02-28T18:00:00.000Z",
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: "author",
    example: "작성자 닉네임",
  })
  author: string;

  @Expose()
  @ApiProperty({
    description: "comments",
    example: [],
  })
  comments: CommentDto[];

  @Exclude()
  password: string;
}
