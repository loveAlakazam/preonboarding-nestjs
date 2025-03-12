import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { BoardRepository } from "@boards/repositories/boards.repository";
import { UserRepository } from "@users/repositories/users.repository";
import { CommentsController } from "@comments/controllers/comments.controller";
import { CommentsService } from "@comments/services/comments.service";
import { CommentRepository } from "@comments/repositories/comments.repository";
import * as request from "supertest";
import {
  SHOULD_BE_EXIST,
  SHOULD_BE_STRING,
} from "@src/commons/errors/commons.error-message";
import { DEFAULT_COMMENT_CONTENT } from "@comments/constants/comment.constant";
import { UpdateCommentRequestDto } from "@comments/dtos/update-comment.request.dto";

describe("CommentsController", () => {
  let app: INestApplication;
  let commentService: CommentsService;
  let commentRepository: CommentRepository;
  let boardRepository: BoardRepository;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        CommentsService,
        {
          provide: CommentRepository,
          useValue: {
            create: jest.fn(),
            findOneById: jest.fn(),
            update: jest.fn(),
            findCommentsByBoardId: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
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
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("CommentController", () => {
    const commentId = "1";
    /**
     * 댓글 생성
     */
    describe("createNewComment", () => {
      describe("boardId", () => {
        it("boardId 가 존재하지 않으면, BadRequestException 예외가 발생한다", async () => {
          const invalidRequest = {
            boardId: "", // invalid
            userId: "1",
            content: "",
          };

          const response = await request(app.getHttpServer())
            .post("/comments/")
            .send(invalidRequest);

          expect(response.status).toBe(400);
          expect(response.body.message).toContain(SHOULD_BE_EXIST("boardId"));
        });
        it("boardId 의 타입이 string이 아니라면, BadRequestException 예외가 발생한다", async () => {
          const invalidRequest = {
            boardId: true, // invalid
            userId: "1",
            content: "",
          };

          const response = await request(app.getHttpServer())
            .post("/comments/")
            .send(invalidRequest);

          expect(response.status).toBe(400);
          expect(response.body.message).toContain(SHOULD_BE_STRING("boardId"));
        });
      });
      describe("userId", () => {
        it("userId가 존재하지 않으면 BadRequestException 예외가 발생한다", async () => {
          const invalidRequest = {
            boardId: "1",
            userId: undefined, // invalid
            content: "",
          };

          const response = await request(app.getHttpServer())
            .post("/comments/")
            .send(invalidRequest);

          expect(response.status).toBe(400);
          expect(response.body.message).toContain(SHOULD_BE_EXIST("userId"));
        });
        it("userId 의 타입이 string이 아니라면, BadRequestException 예외가 발생한다", async () => {
          const invalidRequest = {
            boardId: "1",
            userId: 1, // invalid
            content: "",
          };

          const response = await request(app.getHttpServer())
            .post("/comments/")
            .send(invalidRequest);

          expect(response.status).toBe(400);
          expect(response.body.message).toContain(SHOULD_BE_STRING("userId"));
        });
      });
    });
    /**
     * 댓글 수정
     */
    describe("updateComment", () => {
      describe("userId", () => {
        it("userId가 존재하지 않으면 BadRequestException 예외가 발생한다", async () => {
          const invalidRequest = {
            userId: undefined, // invalid
            content: "",
          } as unknown as UpdateCommentRequestDto;

          const response = await request(app.getHttpServer())
            .patch(`/comments/${commentId}`)
            .send(invalidRequest);

          expect(response.status).toBe(400);
          expect(response.body.message).toContain(SHOULD_BE_EXIST("userId"));
        });
        it("userId 의 타입이 string이 아니라면, BadRequestException 예외가 발생한다", async () => {
          const invalidRequest = {
            userId: 1, // invalid
            content: "",
          } as unknown as UpdateCommentRequestDto;

          const response = await request(app.getHttpServer())
            .patch(`/comments/${commentId}`)
            .send(invalidRequest);

          expect(response.status).toBe(400);
          expect(response.body.message).toContain(SHOULD_BE_STRING("userId"));
        });
      });
      describe("content", () => {
        it(`content 값이 비어있더라도 유효성검사에서 통과된다.`, async () => {
          const updateRequest = {
            userId: "1",
            content: "",
          } as UpdateCommentRequestDto;

          const response = await request(app.getHttpServer())
            .patch(`/comments/${commentId}`)
            .send(updateRequest);

          expect(response.status).not.toBe(400);
        });
      });
    });
    /**
     * 댓글 삭제
     */
    describe("deleteComment", () => {
      describe("userId", () => {
        it("userId가 존재하지 않으면 BadRequestException 예외가 발생한다", async () => {
          const invalidRequest = {
            userId: undefined, // invalid
            content: "",
          } as unknown as UpdateCommentRequestDto;

          const response = await request(app.getHttpServer())
            .delete(`/comments/${commentId}`)
            .send(invalidRequest);

          expect(response.status).toBe(400);
          expect(response.body.message).toContain(SHOULD_BE_EXIST("userId"));
        });
        it("userId 의 타입이 string이 아니라면, BadRequestException 예외가 발생한다", async () => {
          const invalidRequest = {
            userId: 1, // invalid
            content: "",
          } as unknown as UpdateCommentRequestDto;

          const response = await request(app.getHttpServer())
            .delete(`/comments/${commentId}`)
            .send(invalidRequest);

          expect(response.status).toBe(400);
          expect(response.body.message).toContain(SHOULD_BE_STRING("userId"));
        });
      });
    });
  });
});
