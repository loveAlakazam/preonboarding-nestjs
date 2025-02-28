import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BoardRepository } from "@boards/repositories/boards.repository";
import { CreateNewBoardRequestDto } from "@boards/dtos/create-new-board.request.dto";
import { UpdateBoardRequestDto } from "@boards/dtos/update-board.request.dto";
import { UserRepository } from "@users/repositories/users.repository";
import { NOT_FOUND_USER } from "@users/errors/users.error-message";
import { CreateNewBoardResponseDto } from "@boards/dtos/create-new-board.response.dto";
import {
  GetListOfBoardsResponseDto,
  UnitOfList,
} from "@boards/dtos/get-list-of-boards.response.dto";
import {
  BOARD_NOT_FOUND,
  NOT_CONFIRMED_BOARD_PASSWORD,
} from "@boards/errors/board.error-message";
import { DeleteBoardDto } from "../dtos/delete-board.request.dto";
import { GetBoardResponseDto } from "../dtos/get-board.response.dto";
import { CommentDto } from "@comments/dtos/comment.dto";

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

  async getBoard(id: string): Promise<GetBoardResponseDto> {
    const board = await this.boardRepository.findOneById(id);
    if (!board) {
      throw new NotFoundException(BOARD_NOT_FOUND);
    }

    return {
      id: board.id,
      title: board.title,
      content: board.content,
      createdAt: board.createdAt,
      author: board.user.nickname,
      comments: board.comments.map((comment) => {
        return {
          id: comment.id,
          content: comment.content,
          author: comment.user.nickname,
          createdAt: comment.createdAt,
        } as CommentDto;
      }),
    } as GetBoardResponseDto;
  }

  async updateBoard(id: string, request: UpdateBoardRequestDto) {
    const { password } = request;

    // 게시글 존재여부 및 비밀번호 일치여부 확인
    await this.confirmBoardPassword(id, password);

    // 게시글 업데이트
    await this.boardRepository.update({
      id: id,
      ...request,
    });
  }

  async deleteBoard(request: DeleteBoardDto) {
    const { id, password } = request;

    // 게시글 존재여부 및 비밀번호 일치여부 확인
    await this.confirmBoardPassword(id, password);

    // 게시글 삭제
    await this.boardRepository.delete(id);
  }

  private async confirmBoardPassword(
    id: string,
    inputPassword: string,
  ): Promise<void> {
    // 게시글 존재유무확인
    const board = await this.boardRepository.findOneById(id);

    if (!board) {
      throw new NotFoundException(BOARD_NOT_FOUND);
    }

    // 입력패스워드와 실제 패스워드 비교
    if (board.password !== inputPassword)
      throw new BadRequestException(NOT_CONFIRMED_BOARD_PASSWORD);
  }
}
