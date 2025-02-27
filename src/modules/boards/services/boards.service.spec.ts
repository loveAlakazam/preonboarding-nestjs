import { Test, TestingModule } from "@nestjs/testing";
import { BoardsService } from "./boards.service";
import { BoardRepository } from "@boards/repositories/boards.repository";
import { UserRepository } from "@users/repositories/users.repository";
import { CreateNewBoardRequestDto } from "../dtos/create-new-board.request.dto";
import { NOT_FOUND_USER } from "@src/modules/users/errors/users.error-message";
import { NotFoundException } from "@nestjs/common";
import { GetListOfBoardsResponseDto } from "../dtos/get-list-of-boards.response.dto";

describe("BoardsService", () => {
  let boardService: BoardsService;
  let boardRepository: BoardRepository;
  let userRepository: UserRepository;

  const sampleUserData = {
    id: "1",
    nickname: "testUser",
    password: "testPassword1234",
  } as const;
  const sampleBoardData = {
    id: "1",
    title: "test title",
    content: "test content",
    password: "1234",
  };
  const sampleListOfBoardData = [
    {
      id: "1",
      title: "test title 1",
      user: { nickname: "testUser" },
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "test title 2",
      user: { nickname: "testUser" },
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: BoardRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findOneByNickname: jest.fn(),
          },
        },
      ],
    }).compile();

    boardService = module.get<BoardsService>(BoardsService);
    boardRepository = module.get<BoardRepository>(BoardRepository);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("updateBoard", () => {});
  describe("getListOfBoards", () => {
    it("게시글 리스트 조회를 성공한다", async () => {
      (boardRepository.findAll as jest.Mock).mockResolvedValue(
        sampleListOfBoardData,
      );
      // 게시글 조회
      const boards = await boardService.getListOfBoards();

      // 실제결과 확인
      expect(boards).toBeDefined();
      expect(boards.length).toBe(2);

      expect(boardRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });
  describe("createNewBoard", () => {
    it("nickname 에 해당되는 회원이 존재하지않으면 NotFoundException 예외를 발생시킨다", async () => {
      // Mock설정: nickname에 해당되는 회원정보가 존재하지않음
      (userRepository.findOneByNickname as jest.Mock).mockResolvedValue(null);

      // 게시글 작성
      const invalidRequest: CreateNewBoardRequestDto = {
        ...sampleBoardData,
        nickname: "invalid", // invalid
      };

      // 예외발생확인
      await expect(boardService.createNewBoard(invalidRequest)).rejects.toThrow(
        new NotFoundException(NOT_FOUND_USER),
      );
    });
    it("nickname 에 해당 회원이라면 게시글 생성에 성공한다", async () => {
      // Mock 설정: nickname에 해당되는 회원정보가 존재함
      (userRepository.findOneByNickname as jest.Mock).mockResolvedValue(
        sampleUserData,
      );
      (boardRepository.create as jest.Mock).mockResolvedValue({
        ...sampleBoardData,
        user: { nickname: sampleUserData.nickname },
      });

      // 게시글 작성
      const request: CreateNewBoardRequestDto = {
        nickname: sampleUserData.nickname,
        title: sampleBoardData.title,
        content: sampleBoardData.content,
        password: sampleBoardData.password,
      };
      const newBoard = await boardService.createNewBoard(request);

      // 생성된 게시글이 올바르게 작성됐는지 확인
      expect(newBoard).toBeDefined();
      expect(newBoard.id).toBe("1");
      expect(newBoard.title).toBe(sampleBoardData.title);
      expect(newBoard.content).toBe(sampleBoardData.content);
      expect(newBoard.author).toBe(sampleUserData.nickname);

      // 올바르게 호출됐는지 확인
      expect(boardRepository.create).toHaveBeenCalledTimes(1); // 1번 호출해서 저장을 했는지
    });
  });
});
