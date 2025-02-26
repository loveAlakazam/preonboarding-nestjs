export const MINLENGTH = (fieldName: string, minLength: number): string => {
  return `${fieldName}은(는) 최소 ${minLength} 글자 이상이어야합니다.`;
};

export const SHOULD_BE_EXIST = (fieldName: string): string =>
  `${fieldName}은(는) 필수값 입니다.`;
export const SHOULD_BE_STRING = (fieldName: string): string =>
  `${fieldName}은(는) 문자열 입니다.`;
