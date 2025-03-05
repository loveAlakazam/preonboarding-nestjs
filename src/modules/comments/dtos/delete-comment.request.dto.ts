import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteCommentRequestDto {
  // 작성자 아이디
  @IsNotEmpty()
  @IsString()
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
