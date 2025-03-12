import { Expose } from "class-transformer";
import { IComment } from "./comment.interface";
import { ApiProperty } from "@nestjs/swagger";

export class CreateNewCommentResponseDto implements IComment {
  @Expose()
  @ApiProperty({ description: "id", example: "1" })
  id: string;

  @Expose()
  @ApiProperty({ description: "content", example: "댓글 내용을 입력해주세요." })
  content: string;

  @Expose()
  @ApiProperty({ description: "author", example: "testUser" })
  author: string;

  @Expose()
  @ApiProperty({
    description: "createdAt",
    example: "2025-03-05T20:13:00.000Z",
  })
  createdAt: Date;
}
