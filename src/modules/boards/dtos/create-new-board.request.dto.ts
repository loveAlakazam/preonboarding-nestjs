import { ApiProperty } from "@nestjs/swagger";
import {
  MINLENGTH,
  SHOULD_BE_EXIST,
} from "@src/commons/errors/commons.error-message";
import { USER_NICKNAME_MIN_LENGTH } from "@src/modules/users/constants/users.constant";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateNewBoardRequestDto {
  @IsNotEmpty({ message: SHOULD_BE_EXIST("nickname") })
  @IsString()
  @MinLength(USER_NICKNAME_MIN_LENGTH)
  @ApiProperty({ description: "유저 닉네임", example: "testUser" })
  nickname: string; // 작성자명(user.nickname)

  @IsNotEmpty({ message: SHOULD_BE_EXIST("title") })
  @IsString()
  @MinLength(1, { message: MINLENGTH("title", 1) })
  @ApiProperty({ description: "제목", example: "게시글 제목" })
  title: string;

  @IsNotEmpty({ message: SHOULD_BE_EXIST("content") })
  @IsString()
  @MinLength(1, { message: MINLENGTH("content", 1) })
  @ApiProperty({ description: "내용", example: "게시글 내용" })
  content: string;

  @IsNotEmpty({ message: SHOULD_BE_EXIST("password") })
  @IsString()
  @MinLength(1, { message: MINLENGTH("password", 1) })
  @ApiProperty({ description: "게시글 비밀번호", example: "비밀번호" })
  password: string;
}
