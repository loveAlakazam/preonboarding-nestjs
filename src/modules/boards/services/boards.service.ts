import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BoardRepository } from "@boards/repositories/boards.repository";
import { CreateNewBoardRequestDto } from "@boards/dtos/create-new-board.request.dto";
import { UpdateBoardRequestDto } from "@boards/dtos/update-board.request.dto";
import { UserRepository } from "@users/repositories/users.repository";
import { NOT_FOUND_USER } from "@users/errors/users.error-message";
import { CreateNewBoardResponseDto } from "@boards/dtos/create-new-board.response.dto";
import {
  GetListOfBoardsResponseDto,
  UnitOfList,
} from "../dtos/get-list-of-boards.response.dto";

@Injectable()
export class BoardsService {
  constructor(
    @Inject()
    private boardRepository: BoardRepository,
    @Inject()
    private userRepository: UserRepository,
  ) {}

  async createNewBoard(
    request: CreateNewBoardRequestDto,
  ): Promise<CreateNewBoardResponseDto> {
    const { nickname, title, content, password } = request;

    // nickname의 유저가 존재하는지 확인
    const author = await this.userRepository.findOneByNickname(nickname);
    if (!author) {
      throw new NotFoundException(NOT_FOUND_USER);
    }

    // 게시글 작성
    const newBoard = await this.boardRepository.create({
      title: title,
      content: content,
      password: password,
      user: { ...author }, // 작성자도 같이 저장
    });

    return new CreateNewBoardResponseDto({
      id: newBoard.id,
      title: newBoard.title,
      author: newBoard.user.nickname,
      content: newBoard.content,
      createdAt: newBoard.createdAt,
    });
  }

  async getListOfBoards(): Promise<GetListOfBoardsResponseDto> {
    const boards = await this.boardRepository.findAll();
    return boards.map((board) => {
      return {
        id: board.id,
        title: board.title,
        author: board.user.nickname,
        createdAt: board.createdAt,
      } as UnitOfList;
    });
  }

  async getBoard(id: string) {
    // 댓글목록도 같이조회필요
    return await this.boardRepository.findOneById(id);
  }

  async updateBoard(id: string, request: UpdateBoardRequestDto) {
    // 작성자가 존재하는지 확인

    // 게시글의 비밀번호가 일치한지 확인
    // 게시글 업데이트
    return await this.boardRepository.update({
      id: id,
      ...request,
    });
  }
  async deleteBoard(id: string) {
    // 게시글의 비밀번호가 일치한지 확인
    await this.boardRepository.delete(id);
  }
}
