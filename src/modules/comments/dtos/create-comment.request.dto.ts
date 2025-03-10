import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { DEFAULT_COMMENT_CONTENT } from "../constants/comment.constant";
import { ApiProperty } from "@nestjs/swagger";
import {
  SHOULD_BE_EXIST,
  SHOULD_BE_STRING,
} from "@src/commons/errors/commons.error-message";

export class CreateNewCommentRequestDto {
  // boardId: 게시글 아이디
  @IsNotEmpty({ message: SHOULD_BE_EXIST("boardId") })
  @IsString({ message: SHOULD_BE_STRING("boardId") })
  @ApiProperty({ description: "게시글 id", example: "1" })
  boardId: string;

  // userId: 작성 유저 아이디
  @IsNotEmpty({ message: SHOULD_BE_EXIST("userId") })
  @IsString({ message: SHOULD_BE_STRING("userId") })
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
