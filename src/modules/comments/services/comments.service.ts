import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserRepository } from "@users/repositories/users.repository";
import { NOT_FOUND_USER } from "@users/errors/users.error-message";
import { BoardRepository } from "@boards/repositories/boards.repository";
import { NOT_FOUND_BOARD } from "@boards/errors/board.error-message";
import { UpdateCommentDto } from "@comments/dtos/update-comment.request.dto";
import {
  INVALID_COMMENT_AUTHOR,
  NOT_FOUND_COMMENT,
} from "@comments/errors/comments.error-message";
import { CommentRepository } from "@comments/repositories/comments.repository";
import { CreateNewCommentRequestDto } from "@comments/dtos/create-comment.request.dto";
import { CreateNewCommentResponseDto } from "@comments/dtos/create-comment.response.dto";
import { UpdateCommentResponseDto } from "@src/modules/comments/dtos/update-comment.response.dto";
import { DeleteCommentDto } from "@comments/dtos/delete-comment.request.dto";

@Injectable()
export class CommentsService {
  constructor(
    @Inject()
    private commentRepository: CommentRepository,

    @Inject()
    private boardRepository: BoardRepository,

    @Inject()
    private userRepository: UserRepository,
  ) {}

  async createComment(requestDto: CreateNewCommentRequestDto) {
    const { userId, boardId, content } = requestDto;

    // todo: 게시글 작성자 본인인지 확인
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException(NOT_FOUND_USER);
    }

    // 게시글 존재 확인하기
    const board = await this.boardRepository.findOneById(boardId);
    if (!board) {
      throw new NotFoundException(NOT_FOUND_BOARD);
    }

    // 댓글 생성
    const newComment = await this.commentRepository.create({
      content: content,
      user: { ...user },
      board: { ...board },
    });

    return {
      id: newComment.id,
      content: newComment.content,
      author: user?.nickname,
    } as CreateNewCommentResponseDto;
  }
  async updateComment(requestDto: UpdateCommentDto) {
    const { id, userId, content } = requestDto;

    // todo: 게시글 작성자 본인인지 확인
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException(NOT_FOUND_USER);
    }
    if (userId !== user.id) {
      throw new BadRequestException(INVALID_COMMENT_AUTHOR);
    }

    // 댓글 존재 확인하기
    const comment = await this.commentRepository.findOneById(id);
    if (!comment) {
      throw new NotFoundException(NOT_FOUND_COMMENT);
    }

    // 댓글 수정
    await this.commentRepository.update({
      id,
      content,
    });

    // 수정이후 댓글정보 리턴
    return {
      id: id,
      author: user.nickname,
      content: content,
    } as UpdateCommentResponseDto;
  }

  async deleteComment(requestDto: DeleteCommentDto) {
    // todo: 게시글 작성자 본인인지 확인
    const { id, userId } = requestDto;

    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException(NOT_FOUND_USER);
    }
    if (userId != user.id) {
      throw new BadRequestException(INVALID_COMMENT_AUTHOR);
    }

    // 댓글 존재 확인하기
    const comment = await this.commentRepository.findOneById(id);
    if (!comment) {
      throw new NotFoundException(NOT_FOUND_COMMENT);
    }

    // 댓글 삭제
    await this.commentRepository.delete(id);
  }
}
