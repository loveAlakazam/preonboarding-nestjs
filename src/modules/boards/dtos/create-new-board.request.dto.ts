import { ApiProperty } from "@nestjs/swagger";
import {
  MINLENGTH,
  SHOULD_BE_EXIST,
} from "@src/commons/errors/commons.error-message";
import { IsNotEmpty, IsString, MinLength } from "class-validator";
import {
  BOARD_AUTHOR_NICKNAME_MIN_LENGTH,
  BOARD_TITLE_MIN_LENGTH,
  BOARD_CONTENT_MIN_LENGTH,
  BOARD_PASSWORD_MIN_LENGTH,
} from "../constants/board.constant";

export class CreateNewBoardRequestDto {
  @IsNotEmpty({ message: SHOULD_BE_EXIST("nickname") })
  @IsString()
  @MinLength(BOARD_AUTHOR_NICKNAME_MIN_LENGTH, {
    message: MINLENGTH("nickname", BOARD_AUTHOR_NICKNAME_MIN_LENGTH),
  })
  @ApiProperty({ description: "유저 닉네임", example: "testUser" })
  nickname: string; // 작성자명(user.nickname)

  @IsNotEmpty({ message: SHOULD_BE_EXIST("title") })
  @IsString()
  @MinLength(BOARD_TITLE_MIN_LENGTH, {
    message: MINLENGTH("title", BOARD_TITLE_MIN_LENGTH),
  })
  @ApiProperty({ description: "제목", example: "게시글 제목" })
  title: string;

  @IsNotEmpty({ message: SHOULD_BE_EXIST("content") })
  @IsString()
  @MinLength(BOARD_CONTENT_MIN_LENGTH, {
    message: MINLENGTH("content", BOARD_CONTENT_MIN_LENGTH),
  })
  @ApiProperty({ description: "내용", example: "게시글 내용" })
  content: string;

  @IsNotEmpty({ message: SHOULD_BE_EXIST("password") })
  @IsString()
  @MinLength(BOARD_PASSWORD_MIN_LENGTH, {
    message: MINLENGTH("password", BOARD_PASSWORD_MIN_LENGTH),
  })
  @ApiProperty({ description: "게시글 비밀번호", example: "비밀번호" })
  password: string;
}
