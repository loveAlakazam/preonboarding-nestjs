import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { UsersService } from "@users/services/users.service";
import { CreateNewUserRequestDto } from "@users/dto/create-new-user-request.dto";
import {
  USER_NICKNAME_MIN_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
} from "@users/constants/users.constant";
import {
  MINLENGTH,
  SHOULD_BE_EXIST,
} from "@src/commons/errors/commons.error-message";
import {
  ALLOW_ALPHABET_AND_NUMBER,
  PASSWORD_CONTAINS_NICKNAME,
  PASSWORD_NOT_EQUALS_TO_CONFIRMED_PASSWORD,
} from "../errors/users.error-message";
import * as request from "supertest";
import { LoginUserRequestDto } from "../dto/login-user.request.dto";

describe("UsersController (request validation)", () => {
  let app: INestApplication;

  const rightRequestDto: CreateNewUserRequestDto = {
    nickname: "TestUser1234",
    password: "TestPassword1234",
    passwordConfirm: "TestPassword1234",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createNewUser: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    ); // ValidationPipe 적용
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  describe("sign-in", () => {
    it("nickname 데이터가 비어있으면 유효성검사에 실패한다", async () => {
      const invalidRequestDto: LoginUserRequestDto = {
        nickname: "",
        password: "password1234",
      };

      const response = await request(app.getHttpServer())
        .post("/users/sign-in")
        .send(invalidRequestDto);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(SHOULD_BE_EXIST("nickname"));
    });
  });

  describe("sign-up", () => {
    describe("nickname", () => {
      it("nickname 길이가 최소글자 미만일 경우 유효성검사에 실패해야한다.", async () => {
        const invalidRequestDto: CreateNewUserRequestDto = {
          nickname: "a", // invalid
          password: rightRequestDto.password,
          passwordConfirm: rightRequestDto.passwordConfirm,
        };

        const response = await request(app.getHttpServer())
          .post("/users/sign-up")
          .send(invalidRequestDto);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
          MINLENGTH("nickname", USER_NICKNAME_MIN_LENGTH),
        );
      });

      it("nickname 이 알파벳+숫자 조합이 아닌 경우 유효성검사에 실패해야한다.", async () => {
        const invalidRequestDto: CreateNewUserRequestDto = {
          nickname: "테스트1234", // invalid
          password: rightRequestDto.password,
          passwordConfirm: rightRequestDto.passwordConfirm,
        };

        const response = await request(app.getHttpServer())
          .post("/users/sign-up")
          .send(invalidRequestDto);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
          ALLOW_ALPHABET_AND_NUMBER("nickname"),
        );
      });
    });

    describe("password", () => {
      it("password 길이가 최소글자 미만일 경우 유효성검사에 실패해야한다.", async () => {
        const invalidRequestDto: CreateNewUserRequestDto = {
          nickname: "testUser",
          password: "a1", // invalid
          passwordConfirm: "a1",
        };

        const response = await request(app.getHttpServer())
          .post("/users/sign-up")
          .send(invalidRequestDto);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
          MINLENGTH("password", USER_PASSWORD_MIN_LENGTH),
        );
      });
      it("password 가 알파벳+숫자 조합이 아닌 경우 유효성검사에 실패해야한다.", async () => {
        const invalidRequestDto: CreateNewUserRequestDto = {
          nickname: rightRequestDto.nickname,
          password: "비밀번호1234", // invalid
          passwordConfirm: "비밀번호1234",
        };

        const response = await request(app.getHttpServer())
          .post("/users/sign-up")
          .send(invalidRequestDto);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
          ALLOW_ALPHABET_AND_NUMBER("password"),
        );
      });

      it("password 에 nickname 이 포함되면 유효성검사에 실패해야한다.", async () => {
        const invalidRequestDto: CreateNewUserRequestDto = {
          nickname: "testUser",
          password: "testUser1234", // invalid
          passwordConfirm: "testUser1234",
        };

        const response = await request(app.getHttpServer())
          .post("/users/sign-up")
          .send(invalidRequestDto);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(PASSWORD_CONTAINS_NICKNAME);
      });
      it("password 와 passwordConfirm 이 일치하지 않으면 유효성검사에 실패해야한다.", async () => {
        const invalidRequestDto: CreateNewUserRequestDto = {
          nickname: "helloworld",
          password: "testUser1234",
          passwordConfirm: "testUser1235", // invalid
        };

        const response = await request(app.getHttpServer())
          .post("/users/sign-up")
          .send(invalidRequestDto);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
          PASSWORD_NOT_EQUALS_TO_CONFIRMED_PASSWORD,
        );
      });
    });
  });
});
