import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  Validate,
  ValidateIf,
} from "class-validator";
import {
  ALLOW_ALPHABET_AND_NUMBER,
  PASSWORD_CONTAINS_NICKNAME,
  PASSWORD_NOT_EQUALS_TO_CONFIRMED_PASSWORD,
} from "@users/errors/users.error-message";
import {
  USER_NICKNAME_MIN_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
} from "@users/constants/users.constant";
import {
  MINLENGTH,
  SHOULD_BE_EXIST,
  SHOULD_BE_STRING,
} from "@src/commons/errors/commons.error-message";

export class CreateNewUserRequestDto {
  /** nickname : 닉네임
   * - 최소 3 글자이상
   * - 알파벳 대소문자+숫자 로 구성
   */
  @IsNotEmpty({ message: SHOULD_BE_EXIST("nickname") })
  @IsString({ message: SHOULD_BE_STRING("nickname") })
  @MinLength(USER_NICKNAME_MIN_LENGTH, {
    message: MINLENGTH("nickname", USER_NICKNAME_MIN_LENGTH),
  })
  @Matches(/^[A-Za-z0-9]+$/, { message: ALLOW_ALPHABET_AND_NUMBER("nickname") })
  nickname: string;

  /** password : 비밀번호
   * - 최소 4 글자이상
   * - 알파벳 대소문자+숫자 로 구성
   * - 비밀번호에 nickname값이 포함되면 안됨
   */
  @IsNotEmpty({ message: SHOULD_BE_EXIST("password") })
  @IsString({ message: SHOULD_BE_STRING("password") })
  @MinLength(USER_PASSWORD_MIN_LENGTH, {
    message: MINLENGTH("password", USER_PASSWORD_MIN_LENGTH),
  })
  @Matches(/^[A-Za-z]+[0-9]$/, {
    message: ALLOW_ALPHABET_AND_NUMBER("password"),
  })
  @ValidateIf((o) => !o.password.contains(o.nickname), {
    message: PASSWORD_CONTAINS_NICKNAME,
  })
  password: string;

  /** passwordConfirm : 비밀번호 확인
   * - 비밀번호(password) 입력값과 일치한지 확인
   */
  @IsNotEmpty({ message: SHOULD_BE_EXIST("passwordConfirm") })
  @IsString({ message: SHOULD_BE_STRING("passwordConfirm") })
  @ValidateIf((o) => o.password === o.passwordConfirm, {
    message: PASSWORD_NOT_EQUALS_TO_CONFIRMED_PASSWORD,
  })
  passwordConfirm: string;
}
