import {
  Controller,
  Inject,
  Post,
  Get,
  Patch,
  Delete,
  HttpCode,
  Body,
  Param,
} from "@nestjs/common";
import { BoardsService } from "@boards/services/boards.service";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from "@nestjs/swagger";
import { CreateNewBoardRequestDto } from "@boards/dtos/create-new-board.request.dto";
import { UpdateBoardRequestDto } from "@boards/dtos/update-board.request.dto";
import { UnitOfList } from "@boards/dtos/get-list-of-boards.response.dto";
import { DeleteBoardRequestDto } from "../dtos/delete-board.request.dto";
import { GetBoardResponseDto } from "../dtos/get-board.response.dto";
import { CreateNewBoardResponseDto } from "../dtos/create-new-board.response.dto";

@Controller("boards")
export class BoardsController {
  constructor(
    @Inject()
    private boardService: BoardsService,
  ) {}
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "create new board" })
  @ApiCreatedResponse({
    description: "Success",
    type: CreateNewBoardResponseDto,
  })
  async createNewBoard(@Body() request: CreateNewBoardRequestDto) {
    return await this.boardService.createNewBoard(request);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: "get list of multiple boards" })
  @ApiOkResponse({
    description: "Success",
    type: [UnitOfList],
  })
  async getListOfBoard() {
    return await this.boardService.getListOfBoards();
  }

  @Get(":id")
  @HttpCode(200)
  @ApiOperation({ summary: "get information of target board" })
  @ApiParam({
    name: "id",
    required: true,
    description: "게시글 id",
    example: "1",
  })
  @ApiOkResponse({
    description: "Success",
    type: GetBoardResponseDto,
  })
  async getBoard(@Param("id") id: string) {
    return await this.boardService.getBoard(id);
  }

  @Patch(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "update information of target board" })
  @ApiParam({
    name: "id",
    required: true,
    description: "게시글 id",
    example: "1",
  })
  async updateBoard(
    @Param("id") id: string,
    @Body() request: UpdateBoardRequestDto,
  ) {
    return await this.boardService.updateBoard(id, request);
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "soft delete target board" })
  @ApiParam({
    name: "id",
    required: true,
    description: "게시글 id",
    example: "1",
  })
  async deleteBoard(
    @Param("id") id: string,
    @Body() request: DeleteBoardRequestDto,
  ) {
    return await this.boardService.deleteBoard({
      id,
      password: request.password,
    });
  }
}
