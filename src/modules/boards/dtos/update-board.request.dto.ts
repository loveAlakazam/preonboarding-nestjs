import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateBoardRequestDto {
  // (필수) 게시글 비밀번호입력
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  password: string;

  // (선택) 제목
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  // (선택) 내용
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;
}
