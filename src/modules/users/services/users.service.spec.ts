import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { UserRepository } from "../repositories/users.repository";
import { CreateNewUserRequestDto } from "../dto/create-new-user-request.dto";
import { HttpException } from "@nestjs/common";
import { ALREADY_EXIST_USER } from "../errors/users.error-message";

describe("UsersService", () => {
  let userService: UsersService;
  let userRepository: UserRepository;

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
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

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
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nickname: request.nickname,
      }),
    );

    // 반환되는 값이 예상한 값과 일치한지 확인
    expect(newUser).toEqual({
      id: "1",
      nickname: request.nickname,
    });
  });
});
