import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { DEFAULT_COMMENT_CONTENT } from "../constants/comment.constant";

export class UpdateCommentRequestDto {
  // 유저 아이디
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: "댓글 작성자 아이디", example: "1" })
  userId: string;

  // 댓글내용
  @Transform(({ value }) => (value?.trim() ? value : DEFAULT_COMMENT_CONTENT))
  @IsString()
  @ApiProperty({
    description: "댓글 내용",
    example: "댓글 내용을 입력해주세요.",
  })
  content: string;
}

export class UpdateCommentDto {
  // 댓글 아이디
  @IsNotEmpty()
  @IsString()
  id: string;

  // 유저 아이디
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: "댓글 작성자 아이디", example: "1" })
  userId: string;

  // 댓글 내용
  @IsNotEmpty()
  @IsString()
  content: string;
}
