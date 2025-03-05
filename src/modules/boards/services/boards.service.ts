import {
  BadRequestException,
  forwardRef,
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
  NOT_FOUND_BOARD,
  NOT_CONFIRMED_BOARD_PASSWORD,
} from "@boards/errors/board.error-message";
import { DeleteBoardDto } from "../dtos/delete-board.request.dto";
import { GetBoardResponseDto } from "../dtos/get-board.response.dto";
import { CommentDto } from "@comments/dtos/comment.dto";
import { UpdateBoardResponseDto } from "@boards/dtos/update-board.response.dto";
import { CommentRepository } from "@comments/repositories/comments.repository";

@Injectable()
export class BoardsService {
  constructor(
    @Inject()
    private boardRepository: BoardRepository,
    @Inject()
    private userRepository: UserRepository,
    @Inject()
    private commentRepository: CommentRepository,
  ) {}

  async createNewBoard(
    requestDto: CreateNewBoardRequestDto,
  ): Promise<CreateNewBoardResponseDto> {
    const { nickname, title, content, password } = requestDto;

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
    // 게시글 정보를 구한다 (유저정보 포함)
    const board = await this.boardRepository.findOneById(id);
    if (!board) {
      throw new NotFoundException(NOT_FOUND_BOARD);
    }

    // 댓글 정보를 구한다
    const comments = await this.commentRepository.findCommentsByBoardId(id);

    return {
      id: board.id,
      title: board.title,
      content: board.content,
      createdAt: board.createdAt,
      author: board.user.nickname,
      comments: comments.map((comment) => {
        return {
          id: comment.id,
          content: comment.content,
          author: comment.user.nickname,
          createdAt: comment.createdAt,
        } as CommentDto;
      }),
    } as GetBoardResponseDto;
  }

  async updateBoard(id: string, requestDto: UpdateBoardRequestDto) {
    const { password } = requestDto;

    // 게시글 존재여부 및 비밀번호 일치여부 확인
    await this.confirmBoardPassword(id, password);

    // 원본 게시글 데이터 확인
    const originBoard = await this.getBoard(id);

    // 게시글 업데이트
    const updatedBoard = await this.boardRepository.update({
      id: id,
      ...requestDto,
    });

    return {
      id: originBoard.id,
      title: updatedBoard.title ?? originBoard.title,
      content: updatedBoard.content ?? originBoard.content,
      author: originBoard.author,
    } as UpdateBoardResponseDto;
  }

  async deleteBoard(requestDto: DeleteBoardDto) {
    const { id, password } = requestDto;

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
      throw new NotFoundException(NOT_FOUND_BOARD);
    }

    // 입력패스워드와 실제 패스워드 비교
    if (board.password !== inputPassword)
      throw new BadRequestException(NOT_CONFIRMED_BOARD_PASSWORD);
  }
}
