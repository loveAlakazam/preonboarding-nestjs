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
} from "@src/modules/users/errors/users.error-message";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;
  let userService: UsersService;
  let userRepository: UserRepository;

  const testUser = {
    nickname: "testUser",
    password: "testPassword1234",
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<UserRepository>(UserRepository);
    userService = moduleFixture.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    // 테스트데이터 삭제
    await userRepository.removeByNickname(testUser.nickname);
    await app.close();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Hello World!");
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
});
