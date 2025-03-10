import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

export class UpdateCommentResponseDto {
  @Expose()
  @ApiProperty({ description: "id", example: "1" })
  id: string;

  @Expose()
  @ApiProperty({ description: "content", example: "댓글 내용을 입력해주세요." })
  content: string;

  @Expose()
  @ApiProperty({ description: "author", example: "testUser" })
  author: string;

  @Exclude()
  createdAt: Date;
}
