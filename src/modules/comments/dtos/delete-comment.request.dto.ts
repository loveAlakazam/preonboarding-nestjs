import { ApiProperty } from "@nestjs/swagger";
import {
  SHOULD_BE_EXIST,
  SHOULD_BE_STRING,
} from "@src/commons/errors/commons.error-message";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteCommentRequestDto {
  // 작성자 아이디
  @IsNotEmpty({ message: SHOULD_BE_EXIST("userId") })
  @IsString({ message: SHOULD_BE_STRING("userId") })
  @ApiProperty({ description: "유저 id", example: "1" })
  userId: string;
}

export class DeleteCommentDto {
  // 댓글 아이디
  @IsNotEmpty()
  @IsString()
  id: string;

  // 작성자 아이디
  @IsNotEmpty()
  @IsString()
  userId: string;
}
