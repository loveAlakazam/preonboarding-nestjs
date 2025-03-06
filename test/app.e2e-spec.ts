import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";
import { UserRepository } from "@users/repositories/users.repository";
import { UsersService } from "@users/services/users.service";
import {
  ALREADY_EXIST_USER,
  LOGIN_FAILED,
} from "@users/errors/users.error-message";
import { CreateNewBoardRequestDto } from "@boards/dtos/create-new-board.request.dto";
import { BoardsService } from "@src/modules/boards/services/boards.service";
import { BoardRepository } from "@src/modules/boards/repositories/boards.repository";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;
  let userService: UsersService;
  let userRepository: UserRepository;
  let boardService: BoardsService;
  let boardRepository: BoardRepository;

  const testUser = {
    nickname: "testUser",
    password: "testPassword1234",
  };
  let boardId; // 게시글 생성

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<UserRepository>(UserRepository);
    userService = moduleFixture.get<UsersService>(UsersService);

    boardRepository = moduleFixture.get<BoardRepository>(BoardRepository);
    boardService = moduleFixture.get<BoardsService>(BoardsService);
  });

  afterAll(async () => {
    // 게시글 테스트데이터 삭제
    await boardRepository.remove(boardId);

    // user 테스트데이터 삭제
    await userRepository.removeByNickname(testUser.nickname);

    await app.close();
  });

  describe("users", () => {
    it("회원가입 성공한다", async () => {
      const response = await request(app.getHttpServer())
        .post("/users/sign-up")
        .send({
          nickname: testUser.nickname,
          password: testUser.password,
          passwordConfirm: testUser.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty("nickname", testUser.nickname);
    });
    it("로그인을 성공한다", async () => {
      await request(app.getHttpServer())
        .post("/users/sign-in")
        .send({
          nickname: testUser.nickname,
          password: testUser.password,
        })
        .expect(200);
    });
    it("닉네임과 비밀번호가 일치하지 않으면 로그인에 실패한다", async () => {
      const response = await request(app.getHttpServer())
        .post("/users/sign-in")
        .send({
          nickname: testUser.nickname,
          password: "invalidPassword",
        })
        .expect(400);

      expect(response.body.message).toContain(LOGIN_FAILED);
    });
    it("이미 존재하는 닉네임일 경우 회원가입에 실패한다.", async () => {
      const response = await request(app.getHttpServer())
        .post("/users/sign-up")
        .send({
          nickname: testUser.nickname, // duplicated
          password: testUser.password,
          passwordConfirm: testUser.password,
        })
        .expect(409);

      expect(response.body.message).toContain(ALREADY_EXIST_USER);
    });
  });
  describe("boards", () => {
    const nickname = testUser.nickname;
    const title = "e2e 테스트 제목";
    const content = "e2e 테스트 내용입니다.";
    const password = "boardPassword1234";

    it("게시글 작성에 성공한다", async () => {
      const requestDto = {
        nickname: nickname,
        title: title,
        content: content,
        password: password,
      } as CreateNewBoardRequestDto;

      const response = await request(app.getHttpServer())
        .post("/boards/")
        .send(requestDto)
        .expect(201);

      // 응답데이터 검증
      expect(response).toBeDefined();
      expect(response.body.author).toBe(requestDto.nickname);
      expect(response.body.title).toBe(requestDto.title);
      expect(response.body.content).toBe(requestDto.content);

      // 생성된 게시글의 id를 boardId 변수에 할당한다
      boardId = response.body.id;
      expect(boardId).toBeTruthy();
    });
    it("게시글 단건 조회에 성공한다", async () => {
      const response = await request(app.getHttpServer())
        .get(`/boards/${boardId}`)
        .send();

      // 응답코드 확인
      expect(response.status).toBe(200);

      // 응답데이터 검증
      expect(response).toBeDefined();
      expect(response.body.id).toBe(boardId);
      expect(response.body.author).toBe(nickname);
      expect(response.body.title).toBe(title);
      expect(response.body.content).toBe(content);
    });
    it("게시글 목록 조회에 성공한다", async () => {
      const response = await request(app.getHttpServer())
        .get("/boards")
        .send()
        .expect(200);

      // 응답데이터 검증
      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(7);
      // for (const r of response.body) {
      //   expect(r.author).toBe(nickname);
      //   expect(r.title).toBe(title);
      //   expect(r.content).toBe(content);
      // }
    });
    it("게시글 수정에 성공한다", async () => {
      const updatedTitle = "수정된 게시글 제목입니다.";
      const response = await request(app.getHttpServer())
        .patch(`/boards/${boardId}`)
        .send({
          password: password,
          title: updatedTitle,
        })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.title).toBe(updatedTitle);
    });
    it("게시글 삭제(soft-delete)에 성공한다", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/boards/${boardId}`)
        .send({
          password: password,
        })
        .expect(204);
    });
  });
});
