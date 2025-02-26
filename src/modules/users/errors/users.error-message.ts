export const ALLOW_ALPHABET_AND_NUMBER = (fieldName: string): string => {
  return `${fieldName}은(는) 알파벳 대소문자와 숫자 조합만 허용합니다.`;
};

export const PASSWORD_NOT_EQUALS_TO_CONFIRMED_PASSWORD =
  "비밀번호와 비밀번호 확인이 일치하지 않습니다.";

export const PASSWORD_CONTAINS_NICKNAME =
  "비밀번호에 닉네임이 포함되어있습니다.";

export const ALREADY_EXIST_USER = "이미 존재하는 회원입니다.";

export const LOGIN_FAILED = "닉네임 또는 비밀번호를 확인해주세요.";
