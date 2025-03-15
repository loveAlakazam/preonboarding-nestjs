import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";
import {
  ALREADY_EXIST_USER,
  LOGIN_FAILED,
} from "@users/errors/users.error-message";
import { CreateNewBoardRequestDto } from "@boards/dtos/create-new-board.request.dto";
import { CreateNewCommentRequestDto } from "@comments/dtos/create-comment.request.dto";
import { DEFAULT_COMMENT_CONTENT } from "@comments/constants/comment.constant";
import { StartedMySqlContainer } from "@testcontainers/mysql";
import { setUpTestContainer } from "./\btest.helper";
import { DataSource } from "typeorm";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;
  let dbContainer: StartedMySqlContainer;
  let dataSource: DataSource;

  // variables & constants for test
  let accessToken; // 토큰
  let userId; // 유저아이디
  const testUser = {
    nickname: "testUser",
    password: "testPassword1234",
  };
  let boardId; // 게시글 생성
  let boardIdForComment; // 코멘트 테스트를 위한 boardId
  let commentId; // 댓글 아이디

  beforeAll(async () => {
    // Mysql TestContainer 셋업 후 TypeORM 컨테이너변수 설정
    dbContainer = await setUpTestContainer();

    // Nestjs 앱 초기화
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // TypeORM 데이터베이스 연결확인
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await dataSource.runMigrations(); // 마이그레이션 수행
  }, 30 * 1000);

  afterAll(async () => {
    // 데이터를 모두 삭제한다.
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);

      // mysql에서는 truncate 쿼리문의경우 pk도 1부터 다시시작하게된다.
      await repository.query(`TRUNCATE TABLE ${entity.tableName}`);
    }

    // DB연결(typeorm 연결) 해제
    await dataSource.destroy();

    // Mysql 컨테이너 종료
    await dbContainer.stop();

    // 애플리케이션 종료
    await app.close();
  }, 30 * 1000);

  /**
   * Users
   **/
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
      userId = response.body.id;
    });
    it("로그인을 성공한다", async () => {
      const response = await request(app.getHttpServer())
        .post("/users/sign-in")
        .send({
          nickname: testUser.nickname,
          password: testUser.password,
        })
        .expect(200);

      accessToken = response.body.accessToken;
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

  /**
   * Boards
   **/
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
        .set("Authorization", `Bearer ${accessToken}`)
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
      expect(response.body.length).toBe(1);
    });
    it("게시글 수정에 성공한다", async () => {
      const updatedTitle = "수정된 게시글 제목입니다.";
      const response = await request(app.getHttpServer())
        .patch(`/boards/${boardId}`)
        .set("Authorization", `Bearer ${accessToken}`)
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
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          password: password,
        })
        .expect(204);
    });
  });
  /**
   * Comments
   */
  describe("comments", () => {
    const nickname = testUser.nickname;
    const title = "댓글 e2e 테스트 게시글 제목";
    const boardContent = "댓글 e2e 테스트 게시글 내용";
    const password = "boardCommentPassword1234";
    const updatedCommentContent = "e2e테스트를 위한 댓글 내용입니다"; // 수정테스트에 사용

    // 게시글 생성
    it("게시글 생성에 성공한다", async () => {
      const requestDto = {
        nickname: nickname,
        title: title,
        content: boardContent,
        password: password,
      } as CreateNewBoardRequestDto;

      const response = await request(app.getHttpServer())
        .post("/boards")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(requestDto)
        .expect(201);

      // 응답데이터 검증
      expect(response).toBeDefined();
      expect(response.body.author).toBe(nickname);
      expect(response.body.title).toBe(title);
      expect(response.body.content).toBe(boardContent);

      // 생성된 게시글의 id를 boardIdForComment 변수에 할당한다
      boardIdForComment = response.body.id;
      expect(boardIdForComment).toBeTruthy();
    });
    // 댓글 생성
    it("댓글 생성에 성공한다", async () => {
      const requestDto = {
        boardId: boardIdForComment,
        userId: userId,
        content: undefined,
      } as CreateNewCommentRequestDto;

      const response = await request(app.getHttpServer())
        .post("/comments/")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(requestDto)
        .expect(201);

      // 응답데이터 검증
      expect(response).toBeDefined();
      expect(response.body.author).toBe(nickname);
      expect(response.body.content).toBe(DEFAULT_COMMENT_CONTENT);

      // 생성된 댓글 아이디를 commentId에 할당
      commentId = response.body.id;
      expect(commentId).toBeTruthy();
    });
    it("게시글내 댓글 생성후, 게시글에 댓글개수는 1 개이다", async () => {
      const response = await request(app.getHttpServer())
        .get(`/boards/${boardIdForComment}`)
        .send()
        .expect(200);

      expect(response).toBeDefined();

      // 댓글 개수 확인
      expect(response.body.comments.length).toBe(1);
    });
    // 댓글 수정
    it("댓글내용 수정에 성공한다", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/comments/${commentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: userId,
          content: updatedCommentContent,
        })
        .expect(200);

      expect(response.body.content).toBe(updatedCommentContent);
    });
    // 댓글 삭제
    it("댓글내용 삭제(soft-delete)에 성공한다", async () => {
      await request(app.getHttpServer())
        .delete(`/comments/${commentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          userId: userId,
        })
        .expect(204);
    });
    it("게시글내 댓글 삭제후, 게시글에 댓글개수는 0 개이다.", async () => {
      const response = await request(app.getHttpServer())
        .get(`/boards/${boardIdForComment}`)
        .send()
        .expect(200);

      expect(response).toBeDefined();

      // 댓글 개수 확인
      expect(response.body.comments.length).toBe(0);
    });
  });
});
