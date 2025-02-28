import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class DeleteBoardRequestDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @ApiProperty({ description: "게시글 비밀번호", example: "board password" })
  password: string;
}

export class DeleteBoardDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  password: string;
}
