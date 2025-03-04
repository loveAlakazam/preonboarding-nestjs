import { Exclude, Expose } from "class-transformer";
import { IBoard } from "./board.interface";

export class UpdateBoardResponseDto implements IBoard {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  author: string;

  @Expose()
  content: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  password: string;
}
