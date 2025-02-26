import { ApiProperty } from "@nestjs/swagger";
import { SHOULD_BE_EXIST } from "@src/commons/errors/commons.error-message";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginUserRequestDto {
  /** 닉네임 */
  @IsNotEmpty({ message: SHOULD_BE_EXIST("nickname") })
  @IsString()
  @ApiProperty({ description: "닉네임", example: "test123" })
  nickname: string;

  /** 비밀번호 */
  @IsNotEmpty({ message: SHOULD_BE_EXIST("password") })
  @IsString()
  @ApiProperty({ description: "비밀번호", example: "secretValue1" })
  password: string;
}
