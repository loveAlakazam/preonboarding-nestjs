import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import {
  BadRequestException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "@users/services/users.service";
import { UserRepository } from "@users/repositories/users.repository";
import { CreateNewUserRequestDto } from "@users/dto/create-new-user-request.dto";
import {
  ALREADY_EXIST_USER,
  LOGIN_FAILED,
  NOT_FOUND_USER,
} from "@users/errors/users.error-message";
import { LoginUserRequestDto } from "@users/dto/login-user.request.dto";
import { TOKEN_FAILED } from "@auth/auth.error-message";

describe("UsersService", () => {
  let userService: UsersService;
  let userRepository: UserRepository;
  let jwtService: JwtService;

  const sampleUserData = {
    nickname: "testUser",
    password: "testPassword1234",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            findOneByNickname: jest.fn(),
            create: jest.fn().mockResolvedValue({
              id: "1",
              ...sampleUserData,
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("loginUser", () => {
    it("닉네임이 존재하지 않으면 예외가 발생하여 회원 로그인이 실패된다.", async () => {
      // Mock 설정: 계정정보가 존재하지 않음
      (userRepository.findOneByNickname as jest.Mock).mockResolvedValue(null);

      // 로그인 요청 dto
      const invalidRequest: LoginUserRequestDto = sampleUserData;

      // 비밀번호 불일치시 예외발생
      await expect(userService.loginUser(invalidRequest)).rejects.toThrow(
        new NotFoundException(NOT_FOUND_USER),
      );
    });
    it("비밀번호가 일치하지 않으면 예외가 발생하여 회원 로그인이 실패된다.", async () => {
      // Mock 설정: 계정정보
      (userRepository.findOneByNickname as jest.Mock).mockResolvedValue({
        id: "1",
        nickname: sampleUserData.nickname,
        password: sampleUserData.password,
      });

      // 로그인 요청 dto
      const invalidRequest: LoginUserRequestDto = {
        nickname: sampleUserData.nickname,
        password: "invalidPassword1234", // invalid
      };

      // 비밀번호 불일치시 예외발생
      await expect(userService.loginUser(invalidRequest)).rejects.toThrow(
        new BadRequestException(LOGIN_FAILED),
      );
    });
    it("인증정보 검증후 jwtService에서 토큰생성에 오류가 발생하면, UnauthorizedException을 발생시킨다", async () => {
      // Mock 설정: 계정정보
      (userRepository.findOneByNickname as jest.Mock).mockResolvedValue({
        id: "1",
        nickname: sampleUserData.nickname,
        password: sampleUserData.password,
      });
      (jwtService.signAsync as jest.Mock).mockReturnValue(null);

      // 로그인 요청 dto
      const request: LoginUserRequestDto = { ...sampleUserData };

      // 토큰생성 오류발생하여 UnauthorizedException 발생확인
      await expect(userService.loginUser(request)).rejects.toThrow(
        new UnauthorizedException(TOKEN_FAILED),
      );
    });
    it("계정정보가 일치하면 회원로그인을 성공하며, accessToken을 리턴한다", async () => {
      // Mock 설정: 계정정보
      (userRepository.findOneByNickname as jest.Mock).mockResolvedValue({
        id: "1",
        nickname: sampleUserData.nickname,
        password: sampleUserData.password,
      });
      (jwtService.signAsync as jest.Mock).mockResolvedValue(
        "loginSuccessAccessToken1234",
      );

      // 로그인 요청 dto
      const request: LoginUserRequestDto = { ...sampleUserData };

      // 토큰생성확인
      const response = await userService.loginUser(request);
      expect(response).toBeDefined();
    });
  });

  describe("createNewUser", () => {
    it("닉네임이 이미 존재하는 경우에는 예외가 발생하며 회원가입이 실패된다.", async () => {
      // Mock 설정: 닉네임이 이미 존재하는 유저 반환
      (userRepository.findOneByNickname as jest.Mock).mockResolvedValue({
        id: "1",
        nickname: sampleUserData.nickname,
        password: sampleUserData.password,
      });

      // 회원가입 요청 dto
      const request: CreateNewUserRequestDto = {
        nickname: sampleUserData.nickname,
        password: sampleUserData.password,
        passwordConfirm: sampleUserData.password,
      };

      // 회원가입시 예외발생 검증
      await expect(userService.createNewUser(request)).rejects.toThrow(
        new HttpException(ALREADY_EXIST_USER, 409),
      );
    });

    it("닉네임이 중복되지 않은 경우, 회원가입이 정상적으로 완료되어야한다.", async () => {
      // Mock 설정: 닉네임이 존재하지 않도록 설정
      (userRepository.findOneByNickname as jest.Mock).mockResolvedValue(null);

      // Mock 설정: 신규유저 생성시 id: "1" 인 유저데이터를 반환하도록 설정
      (userRepository.create as jest.Mock).mockResolvedValue({
        id: "1",
        nickname: sampleUserData.nickname,
      });

      // 회원가입 요청 dto
      const request: CreateNewUserRequestDto = {
        nickname: sampleUserData.nickname,
        password: sampleUserData.password,
        passwordConfirm: sampleUserData.password,
      };

      // 회원가입 함수 호출
      const newUser = await userService.createNewUser(request);

      // 회원이 생성됐는지 확인
      expect(newUser).toBeDefined();
      expect(newUser.id).toBe("1");
      expect(newUser.nickname).toBe(request.nickname);

      // 올바르게 호출됐는지 확인
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nickname: request.nickname,
          password: request.password,
        }),
      );
    });
  });
});
