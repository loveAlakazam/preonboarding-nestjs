import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CommentsService } from "@comments/services/comments.service";
import { CommentRepository } from "@comments/repositories/comments.repository";
import { BoardRepository } from "@boards/repositories/boards.repository";
import { UserRepository } from "@users/repositories/users.repository";
import { CreateNewCommentRequestDto } from "@comments/dtos/create-comment.request.dto";
import { DEFAULT_COMMENT_CONTENT } from "@comments/constants/comment.constant";
import { NOT_FOUND_USER } from "@users/errors/users.error-message";
import { NOT_FOUND_BOARD } from "@boards/errors/board.error-message";
import {
  INVALID_COMMENT_AUTHOR,
  NOT_FOUND_COMMENT,
} from "@comments/errors/comments.error-message";

describe("CommentsService", () => {
  let commentService: CommentsService;
  let commentRepository: CommentRepository;
  let boardRepository: BoardRepository;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: CommentRepository,
          useValue: {
            create: jest.fn(),
            findOneById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: BoardRepository,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    commentService = module.get<CommentsService>(CommentsService);
    commentRepository = module.get<CommentRepository>(CommentRepository);
    boardRepository = module.get<BoardRepository>(BoardRepository);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(commentService).toBeDefined();
  });

  const commentId = "1";
  const boardId = "1";
  const userId = "1";
  const commentContent = "댓글 내용 수정 테스트";
  const emptyCommentContent = "";

  // 조회요청시 NotFoundException 예외가 발생한다
  const invalidBoardId = "99";
  const invalidUserId = "99";
  const invalidCommentId = "99";

  const sampleUser = {
    id: userId,
    nickname: "sampleUser",
    password: "sampleUserPassword",
  };
  const sampleBoard = {
    id: boardId,
    title: "sampleBoard-Title",
    content: "sampleBoard-Content",
    password: "sampleBoardPassword1234",
    user: {
      id: sampleUser.id,
      nickname: sampleUser.nickname,
    },
  };
  const sampleComment = {
    id: commentId,
    content: "sampleCommentContent",
    user: {
      ...sampleUser,
    },
    board: {
      ...sampleBoard,
    },
  };

  describe("createComment", () => {
    it("댓글 요청 작성자 id에 해당되는 유저데이터가 존재하지 않으면, NotFoundException 예외를 발생시킨다.", async () => {
      (userRepository.findOneById as jest.Mock).mockReturnValue(null);

      const invalidRequest = {
        boardId: boardId,
        userId: invalidUserId, // invalid
        content: commentContent,
      } as CreateNewCommentRequestDto;

      expect(commentService.createComment(invalidRequest)).rejects.toThrow(
        new NotFoundException(NOT_FOUND_USER),
      );
    });
    it("게시글이 존재하지 않으면, NotFoundException 예외를 발생시킨다.", async () => {
      (userRepository.findOneById as jest.Mock).mockReturnValue(sampleUser);
      (boardRepository.findOneById as jest.Mock).mockReturnValue(null);

      const invalidRequest = {
        boardId: invalidBoardId, // invalid
        userId: userId,
        content: commentContent,
      };
      expect(commentService.createComment(invalidRequest)).rejects.toThrow(
        new NotFoundException(NOT_FOUND_BOARD),
      );
    });
    it(`댓글 내용이 비어있으면, 기본값(${DEFAULT_COMMENT_CONTENT})으로 댓글 등록이 성공한다.`, async () => {
      (userRepository.findOneById as jest.Mock).mockReturnValue(sampleUser);
      (boardRepository.findOneById as jest.Mock).mockReturnValue(sampleBoard);
      (commentRepository.create as jest.Mock).mockResolvedValue({
        id: boardId,
        content: DEFAULT_COMMENT_CONTENT,
        user: { ...sampleUser },
        board: { ...sampleBoard },
      });

      const request = {
        boardId: boardId,
        userId: userId,
        content: emptyCommentContent, // 코멘트 내용이 비어있음
      };
      const newComment = await commentService.createComment(request);

      // 예상과 실제 비교
      expect(newComment).toBeDefined();
      expect(newComment.id).toBe("1");
      expect(newComment.author).toBe(sampleUser.nickname);
      expect(newComment.content).toBe(DEFAULT_COMMENT_CONTENT);

      // 호출확인
      expect(commentRepository.create).toHaveBeenCalledTimes(1);
    });
    it("댓글 내용이 존재하면, 입력된 값으로 댓글 등록을 성공한다.", async () => {
      (userRepository.findOneById as jest.Mock).mockReturnValue(sampleUser);
      (boardRepository.findOneById as jest.Mock).mockReturnValue(sampleBoard);
      (commentRepository.create as jest.Mock).mockResolvedValue({
        id: "1",
        content: commentContent,
        user: { ...sampleUser },
        board: { ...sampleBoard },
      });

      const request = {
        boardId: boardId,
        userId: userId,
        content: commentContent, // 댓글내용 존재
      };
      const newComment = await commentService.createComment(request);

      // 예상과 실제 비교
      expect(newComment).toBeDefined();
      expect(newComment.id).toBe("1");
      expect(newComment.author).toBe(sampleUser.nickname);
      expect(newComment.content).toBe(commentContent);

      // 호출확인
      expect(commentRepository.create).toHaveBeenCalledTimes(1);
    });
  });
  describe("updateComment", () => {
    it("댓글 요청 작성자 id에 해당되는 유저데이터가 존재하지 않으면, NotFoundException 예외를 발생시킨다.", async () => {
      (userRepository.findOneById as jest.Mock).mockReturnValue(null);
      const invalidRequest = {
        id: commentId,
        userId: invalidUserId, // invalid
        content: commentContent,
      };

      expect(commentService.updateComment(invalidRequest)).rejects.toThrow(
        new NotFoundException(NOT_FOUND_USER),
      );
    });
    it("댓글 요청 작성자 id와 실제 댓글 작성자 id가 일치하지 않으면, BadRequestException 예외를 발생시킨다.", async () => {
      (userRepository.findOneById as jest.Mock).mockReturnValue(sampleUser);

      const invalidRequest = {
        id: commentId,
        userId: invalidUserId, // invalid
        content: commentContent,
      };
      expect(commentService.updateComment(invalidRequest)).rejects.toThrow(
        new BadRequestException(INVALID_COMMENT_AUTHOR),
      );
    });
    it("댓글id에 해당되는 댓글데이터가 존재하지 않으면, NotFoundException 예외를 발생시킨다.", async () => {
      (userRepository.findOneById as jest.Mock).mockReturnValue(sampleUser);
      (commentRepository.findOneById as jest.Mock).mockReturnValue(null);
      const invalidRequest = {
        id: invalidCommentId, //  invalid
        userId: userId,
        content: commentContent,
      };
      expect(commentService.updateComment(invalidRequest)).rejects.toThrow(
        new BadRequestException(NOT_FOUND_COMMENT),
      );
    });
    it("댓글 수정을 성공한다.", async () => {
      (userRepository.findOneById as jest.Mock).mockReturnValue(sampleUser);
      (commentRepository.findOneById as jest.Mock).mockReturnValue(
        sampleComment,
      );

      const request = {
        id: commentId,
        userId: userId,
        content: commentContent,
      };

      const updatedComment = await commentService.updateComment(request);

      // 예상과 실제 비교
      expect(updatedComment).toBeDefined();
      expect(updatedComment.id).toBe(request.id);
      expect(updatedComment.author).toBe(sampleUser.nickname);
      expect(updatedComment.content).toBe(request.content);

      // 호출 확인
      expect(commentRepository.update).toHaveBeenCalledTimes(1);
    });
  });
  describe("deleteComment", () => {
    it("댓글 요청 작성자 id에 해당되는 유저데이터가 존재하지 않으면, NotFoundException 예외를 발생시킨다.", async () => {});
    it("댓글 요청 작성자 id와 실제 댓글 작성자 id가 일치하지 않으면, BadRequestException 예외를 발생시킨다.", async () => {});
    it("댓글id에 해당되는 댓글데이터가 존재하지 않으면, NotFoundException 예외를 발생시킨다.", async () => {});
    it("댓글 삭제를 성공한다.", async () => {});
  });
});
