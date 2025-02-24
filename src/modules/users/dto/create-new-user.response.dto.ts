import { Exclude, Expose } from "class-transformer";

export class CreateNewUserResponseDto {
  @Expose()
  id: string;

  @Expose()
  nickname: string;

  @Exclude()
  password: string;

  @Expose()
  createdAt: Date;

  constructor(partial: Partial<CreateNewUserResponseDto>) {
    Object.assign(this, partial);
  }
}
