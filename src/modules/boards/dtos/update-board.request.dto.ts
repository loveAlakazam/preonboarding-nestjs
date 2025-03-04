import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateBoardRequestDto {
  // (필수) 게시글 비밀번호입력
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @ApiProperty({ description: "게시글 비밀번호", example: "boardpassword1234" })
  password: string;

  // (선택) 제목
  @IsOptional()
  @IsString()
  @MinLength(1)
  @ApiProperty({
    description: "게시글 제목 수정",
    example: "updated board title",
  })
  title?: string;

  // (선택) 내용
  @IsOptional()
  @IsString()
  @MinLength(1)
  @ApiProperty({
    description: "게시글 내용 수정",
    example: "updated board content",
  })
  content?: string;
}
