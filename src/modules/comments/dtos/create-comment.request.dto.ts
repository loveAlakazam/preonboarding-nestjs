import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { DEFAULT_COMMENT_CONTENT } from "../constants/comment.constant";
import { ApiProperty } from "@nestjs/swagger";

export class CreateNewCommentRequestDto {
  // boardId: 게시글 아이디
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: "게시글 id", example: "1" })
  boardId: string;

  // userId: 작성 유저 아이디
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: "댓글 작성자(회원) id", example: "1" })
  userId: string;

  // 댓글내용
  @IsOptional()
  @ApiProperty({
    description: "댓글 내용",
    example: "댓글 내용을 입력해주세요.",
  })
  content: string;
}
