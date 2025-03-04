import { Test, TestingModule } from "@nestjs/testing";
import { BoardsService } from "./boards.service";
import { BoardRepository } from "@boards/repositories/boards.repository";
import { UserRepository } from "@users/repositories/users.repository";
import { CreateNewBoardRequestDto } from "../dtos/create-new-board.request.dto";
import { NOT_FOUND_USER } from "@src/modules/users/errors/users.error-message";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  BOARD_NOT_FOUND,
  NOT_CONFIRMED_BOARD_PASSWORD,
} from "../errors/board.error-message";
import { DeleteBoardDto } from "../dtos/delete-board.request.dto";
import { UpdateBoardRequestDto } from "../dtos/update-board.request.dto";

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
  const notFoundBoardId = "999";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    boardService = module.get<BoardsService>(BoardsService);
    boardRepository = module.get<BoardRepository>(BoardRepository);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("deleteBoard", () => {
    it("게시글 id가 존재하지 않으면 NotFoundException 예외를 발생시킨다.", async () => {
      (boardRepository.findOneById as jest.Mock).mockReturnValue(null);

      const invalidRequest = {
        id: notFoundBoardId,
        password: "1234",
      } as DeleteBoardDto;

      // 예외발생 확인
      await expect(boardService.deleteBoard(invalidRequest)).rejects.toThrow(
        new NotFoundException(BOARD_NOT_FOUND),
      );

      // 삭제쿼리 실행하지 않음을 확인
      expect(boardRepository.delete).toHaveBeenCalledTimes(0);
    });
    it("게시글 비밀번호가 올바르지않으면 BadRequestException 예외를 발생시킨다.", async () => {
      (boardRepository.findOneById as jest.Mock).mockReturnValue({
        id: sampleBoardData.id,
        title: sampleBoardData.title,
        content: sampleBoardData.content,
        password: sampleBoardData.password,
        user: {
          id: sampleUserData.id,
          nickname: sampleUserData.nickname,
        },
        comments: [],
      });

      const invalidRequest = {
        id: sampleBoardData.id,
        password: "invalidPassword", // invalid
      } as DeleteBoardDto;

      // 예외발생 확인
      expect(boardService.deleteBoard(invalidRequest)).rejects.toThrow(
        new BadRequestException(NOT_CONFIRMED_BOARD_PASSWORD),
      );

      // 조회쿼리만 실행됨을 확인
      expect(boardRepository.findOneById).toHaveBeenCalledTimes(1);

      // 삭제쿼리 실행하지 않음을 확인
      expect(boardRepository.delete).toHaveBeenCalledTimes(0);
    });
    it("게시글 삭제를 성공한다.", async () => {
      (boardRepository.findOneById as jest.Mock).mockReturnValue({
        id: sampleBoardData.id,
        title: sampleBoardData.title,
        content: sampleBoardData.content,
        password: sampleBoardData.password,
        user: {
          id: sampleUserData.id,
          nickname: sampleUserData.nickname,
        },
        comments: [],
      });

      const request = {
        id: sampleBoardData.id,
        password: sampleBoardData.password,
      } as DeleteBoardDto;

      await expect(boardService.deleteBoard(request)).resolves.not.toThrow();

      // 조회쿼리 실행됨을 확인
      expect(boardRepository.findOneById).toHaveBeenCalledTimes(1);

      // 삭제쿼리 실행됨을 확인
      expect(boardRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
  describe("updateBoard", () => {
    it("게시글 id가 존재하지 않으면 NotFoundException 예외를 발생시킨다.", async () => {
      (boardRepository.findOneById as jest.Mock).mockReturnValue(null);

      // 예외발생 확인
      const invalidRequest = {
        password: "1234",
        title: "게시글 제목 수정",
      } as UpdateBoardRequestDto;

      // 예외발생 확인
      await expect(
        boardService.updateBoard(notFoundBoardId, invalidRequest),
      ).rejects.toThrow(new NotFoundException(BOARD_NOT_FOUND));

      // 수정쿼리 실행하지 않음을 확인
      expect(boardRepository.update).toHaveBeenCalledTimes(0);
    });
    it("게시글 비밀번호가 올바르지않으면 BadRequestException 예외를 발생시킨다.", async () => {
      const existedBoardId: string = sampleBoardData.id;
      (boardRepository.findOneById as jest.Mock).mockReturnValue({
        id: existedBoardId,
        title: sampleBoardData.title,
        content: sampleBoardData.content,
        password: sampleBoardData.password,
        user: {
          id: sampleUserData.id,
          nickname: sampleUserData.nickname,
        },
        comments: [],
      });

      const invalidRequest = {
        password: "invalidPassword", // invalid
        title: "게시글 제목 수정",
      } as UpdateBoardRequestDto;

      // 예외발생 확인
      expect(
        boardService.updateBoard(existedBoardId, invalidRequest),
      ).rejects.toThrow(new BadRequestException(NOT_CONFIRMED_BOARD_PASSWORD));

      // 조회쿼리만 실행됨을 확인
      expect(boardRepository.findOneById).toHaveBeenCalledTimes(1);

      // 수정쿼리 실행하지 않음을 확인
      expect(boardRepository.update).toHaveBeenCalledTimes(0);
    });
    it("게시글 수정을 성공한다.", async () => {
      const existedBoardId: string = sampleBoardData.id;
      const updatedBoardTitle: string = "게시글 제목 수정";

      // Mock 설정
      (boardRepository.findOneById as jest.Mock).mockReturnValue({
        id: existedBoardId,
        title: sampleBoardData.title,
        content: sampleBoardData.content,
        password: sampleBoardData.password,
        user: {
          id: sampleUserData.id,
          nickname: sampleUserData.nickname,
        },
        comments: [],
      });
      (boardRepository.update as jest.Mock).mockResolvedValue({
        id: existedBoardId,
        title: updatedBoardTitle, // 수정완료
        content: sampleBoardData.content,
        password: sampleBoardData.password,
        user: {
          id: sampleUserData.id,
          nickname: sampleUserData.nickname,
        },
        comments: [],
      });

      const request = {
        password: sampleBoardData.password,
        title: updatedBoardTitle,
      } as UpdateBoardRequestDto;

      const board = await boardService.updateBoard(existedBoardId, request);

      // 조회쿼리만 실행됨을 확인
      expect(boardService.getBoard).toHaveBeenCalledTimes(1);
      expect(boardRepository.findOneById).toHaveBeenCalledTimes(2);

      // 수정쿼리 실행 확인
      expect(boardRepository.update).toHaveBeenCalledTimes(1);

      // 수정이후 게시글 데이터를 확인한다.
      expect(board).toBeDefined();
      expect(board.id).toBe(existedBoardId);
      expect(board.title).toBe(updatedBoardTitle);
    });
  });
  describe("getBoard", () => {
    it("게시글 id가 존재하지 않으면 NotFoundException 예외를 발생시킨다.", async () => {
      (boardRepository.findOneById as jest.Mock).mockReturnValue(null);

      await expect(boardService.getBoard(notFoundBoardId)).rejects.toThrow(
        new NotFoundException(BOARD_NOT_FOUND),
      );
    });
    it("게시글 조회를 성공한다", async () => {
      const existedBoardId: string = sampleBoardData.id;
      // Mock설정
      (boardRepository.findOneById as jest.Mock).mockReturnValue({
        id: existedBoardId,
        title: sampleBoardData.title,
        content: sampleBoardData.content,
        user: {
          id: sampleUserData.id,
          nickname: sampleUserData.nickname,
        },
        comments: [],
      });

      const board = await boardService.getBoard(existedBoardId);

      // 실제결과 확인
      expect(board).toBeDefined();
      expect(board.id).toBe(existedBoardId);
      expect(board.title).toBe(sampleBoardData.title);
      expect(board.content).toBe(sampleBoardData.content);
      expect(board.author).toBe(sampleUserData.nickname);
      expect(board.comments.length).toBe(0);
    });
  });
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
