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
import { ApiOkResponse, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateNewBoardRequestDto } from "@boards/dtos/create-new-board.request.dto";
import { UpdateBoardRequestDto } from "@boards/dtos/update-board.request.dto";
import { UnitOfList } from "@boards/dtos/get-list-of-boards.response.dto";

@Controller("boards")
export class BoardsController {
  constructor(
    @Inject()
    private boardService: BoardsService,
  ) {}
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "create new board" })
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
  async getBoard(@Param("id") id: string) {
    return await this.boardService.getBoard(id);
  }

  @Patch(":id")
  @HttpCode(200)
  @ApiOperation({ summary: "update information of target board" })
  async updateBoard(
    @Param("id") id: string,
    @Body() request: UpdateBoardRequestDto,
  ) {
    return await this.boardService.updateBoard(id, request);
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "soft delete target board" })
  async deleteBoard(@Param("id") id: string) {
    return await this.boardService.deleteBoard(id);
  }
}
