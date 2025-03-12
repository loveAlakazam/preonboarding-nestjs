import { Test, TestingModule } from "@nestjs/testing";
import { BoardsController } from "@boards/controllers/boards.controller";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { BoardsService } from "@boards/services/boards.service";
import { BoardRepository } from "@boards/repositories/boards.repository";
import { UserRepository } from "@users/repositories/users.repository";
import { CommentRepository } from "@comments/repositories/comments.repository";
import { CreateNewBoardRequestDto } from "@boards/dtos/create-new-board.request.dto";
import {
  MINLENGTH,
  SHOULD_BE_EXIST,
} from "@src/commons/errors/commons.error-message";
import * as request from "supertest";
import {
  BOARD_AUTHOR_NICKNAME_MIN_LENGTH,
  BOARD_CONTENT_MIN_LENGTH,
  BOARD_PASSWORD_MIN_LENGTH,
  BOARD_TITLE_MIN_LENGTH,
} from "@src/modules/boards/constants/board.constant";
import {
  NOT_FOUND_BOARD,
  NOT_CONFIRMED_BOARD_PASSWORD,
} from "@boards/errors/board.error-message";
import { JwtAuthGuard } from "@src/auth/jwt-auth.guard";

describe("BoardsController", () => {
  let app: INestApplication;
  let boardService: BoardsService;
  let boardRepository: BoardRepository;
  const MOCK_BEARER_TOKEN = "mock-bearer-token" as const;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [
        BoardsService,
        {
          provide: BoardRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOneById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findOneByNickname: jest.fn(),
          },
        },
        {
          provide: CommentRepository,
          useValue: {},
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // JWT Guard 를 Mock 처리
      .useValue({
        canActivate: jest.fn().mockResolvedValue(true),
      })
      .compile();

    boardService = module.get<BoardsService>(BoardsService);
    boardRepository = module.get<BoardRepository>(BoardRepository);
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
  afterAll(async () => {
    await app.close();
  });

  describe("createNewBoard", () => {
    describe("nickname", () => {
      it(`nickname 길이가 최소 ${BOARD_AUTHOR_NICKNAME_MIN_LENGTH}자 미만일 경우, 유효성검사에 실패하여 BadRequestException 예외를 발생한다.`, async () => {
        const invalidRequest = {
          nickname: "t", // invalid
          title: "테스트 제목",
          content: "테스트 내용",
          password: "password123",
        } as CreateNewBoardRequestDto;

        const response = await request(app.getHttpServer())
          .post("/boards/")
          .set("Authorization", MOCK_BEARER_TOKEN) // 가짜토큰 추가
          .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
          MINLENGTH("nickname", BOARD_AUTHOR_NICKNAME_MIN_LENGTH),
        );
      });
      it(`nickname 필드 누락하여 요청할 경우, 유효성검사에 실패하여 BadRequestException 예외를 발생한다.`, async () => {
        const invalidRequest = {
          title: "테스트 제목",
          content: "테스트 내용",
          password: "password123",
        } as CreateNewBoardRequestDto;

        const response = await request(app.getHttpServer())
          .post("/boards/")
          .set("Authorization", MOCK_BEARER_TOKEN) // 가짜토큰 추가
          .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(SHOULD_BE_EXIST("nickname"));
      });
    });

    describe("title", () => {
      it(`title 길이가 최소 ${BOARD_TITLE_MIN_LENGTH}자 미만일 경우, 유효성검사에 실패하여 BadRequestException 예외를 발생한다`, async () => {
        const invalidRequest = {
          nickname: "test",
          title: "", // invalid
          content: "테스트 내용",
          password: "password1234",
        };

        const response = await request(app.getHttpServer())
          .post("/boards/")
          .set("Authorization", MOCK_BEARER_TOKEN) // 가짜토큰 추가
          .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
          MINLENGTH("title", BOARD_TITLE_MIN_LENGTH),
        );
      });
      it("title 필드 누락하여 요청할경우, 유효성검사에 실패하여 BadRequestException 예외를 발생시킨다.", async () => {
        const invalidRequest = {
          nickname: "test",
          content: "테스트 내용",
          password: "password1234",
        };

        const response = await request(app.getHttpServer())
          .post("/boards/")
          .set("Authorization", MOCK_BEARER_TOKEN) // 가짜토큰 추가
          .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(SHOULD_BE_EXIST("title"));
      });
    });

    describe("content", () => {
      it(`content 길이가 최소 ${BOARD_CONTENT_MIN_LENGTH}자 미만일 경우, 유효성검사에 실패하여 BadRequestException 예외를 발생한다`, async () => {
        const invalidRequest = {
          nickname: "test",
          title: "테스트 제목",
          content: "", // invalid
          password: "password1234",
        };

        const response = await request(app.getHttpServer())
          .post("/boards/")
          .set("Authorization", MOCK_BEARER_TOKEN) // 가짜토큰 추가
          .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
          MINLENGTH("content", BOARD_CONTENT_MIN_LENGTH),
        );
      });
      it("content 필드 누락하여 요청할경우, 유효성검사에 실패하여 BadRequestException 예외를 발생시킨다.", async () => {
        const invalidRequest = {
          nickname: "test",
          title: "테스트제목",
          password: "password1234",
        };

        const response = await request(app.getHttpServer())
          .post("/boards/")
          .set("Authorization", MOCK_BEARER_TOKEN) // 가짜토큰 추가
          .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(SHOULD_BE_EXIST("content"));
      });
    });

    describe("password", () => {
      it(`password 길이가 최소 ${BOARD_PASSWORD_MIN_LENGTH}자 미만일 경우, 유효성검사에 실패하여 BadRequestException 예외를 발생한다`, async () => {
        const invalidRequest = {
          nickname: "test",
          title: "테스트 제목",
          content: "테스트 내용",
          password: "", // invalid
        };

        const response = await request(app.getHttpServer())
          .post("/boards/")
          .set("Authorization", MOCK_BEARER_TOKEN) // 가짜토큰 추가
          .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
          MINLENGTH("password", BOARD_PASSWORD_MIN_LENGTH),
        );
      });
      it("password 필드 누락하여 요청할경우, 유효성검사에 실패하여 BadRequestException 예외를 발생시킨다.", async () => {
        const invalidRequest = {
          nickname: "test",
          title: "테스트제목",
          content: "테스트 내용",
        };

        const response = await request(app.getHttpServer())
          .post("/boards/")
          .set("Authorization", MOCK_BEARER_TOKEN) // 가짜토큰 추가
          .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(SHOULD_BE_EXIST("password"));
      });
    });
  });
  describe("getBoard", () => {
    it("게시글 id에 해당되는 게시글이 존재하지 않으면, NotFoundException 예외가 발생한다", async () => {
      const notExistedBoardId = "99";
      const response = await request(app.getHttpServer())
        .get(`/boards/${notExistedBoardId}`)
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toContain(NOT_FOUND_BOARD);
    });
  });
  describe("updateBoard", () => {
    it("게시글 id에 해당되는 게시글이 존재하지 않으면, NotFoundException 예외가 발생한다", async () => {
      const notExistedBoardId = "99";
      const response = await request(app.getHttpServer())
        .patch(`/boards/${notExistedBoardId}`)
        .set("Authorization", MOCK_BEARER_TOKEN) // 가짜토큰 추가
        .send({
          password: "1234",
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain(NOT_FOUND_BOARD);
    });
    it("게시글의 비밀번호가 올바르지 않은면, BadRequestException 예외가 발생한다", async () => {
      const boardId = "1";
      (boardRepository.findOneById as jest.Mock).mockReturnValue({
        id: "1",
        title: "테스트 제목",
        content: "테스트 게시글 내용",
        password: "password1234",
      });

      const response = await request(app.getHttpServer())
        .patch(`/boards/${boardId}`)
        .set("Authorization", MOCK_BEARER_TOKEN) // 가짜토큰 추가
        .send({
          password: "invalidPassword", // invalid
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(NOT_CONFIRMED_BOARD_PASSWORD);
    });
  });
  describe("deleteBoard", () => {
    it("게시글 id에 해당되는 게시글이 존재하지 않으면, NotFoundException 예외가 발생한다", async () => {
      const notExistedBoardId = "99";
      const response = await request(app.getHttpServer())
        .delete(`/boards/${notExistedBoardId}`)
        .set("Authorization", MOCK_BEARER_TOKEN) // 가짜토큰 추가
        .send({
          password: "1234",
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain(NOT_FOUND_BOARD);
    });
    it("게시글의 비밀번호가 올바르지 않은면, BadRequestException 예외가 발생한다", async () => {
      const boardId = "1";
      (boardRepository.findOneById as jest.Mock).mockReturnValue({
        id: "1",
        title: "테스트 제목",
        content: "테스트 게시글 내용",
        password: "password1234",
      });

      const response = await request(app.getHttpServer())
        .delete(`/boards/${boardId}`)
        .set("Authorization", MOCK_BEARER_TOKEN) // 가짜토큰 추가
        .send({
          password: "invalidPassword", // invalid
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(NOT_CONFIRMED_BOARD_PASSWORD);
    });
  });
  // describe("getListOfBoards", () => {});
});
