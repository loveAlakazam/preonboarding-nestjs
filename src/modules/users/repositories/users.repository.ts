import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entity/users.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "../dto/create-user.dto";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private dataSource: Repository<UserEntity>,
  ) {}

  findAll(): Promise<UserEntity[]> {
    return this.dataSource.find();
  }

  findOneById(id: string): Promise<UserEntity | null> {
    return this.dataSource.findOneBy({ id });
  }

  findOneByNickname(nickname: string): Promise<UserEntity | null> {
    return this.dataSource.findOneBy({ nickname });
  }

  create(newUser: CreateUserDto) {
    return this.dataSource.save(newUser);
  }

  async delete(id: string) {
    await this.dataSource.softDelete(id);
  }

  async removeByNickname(nickname: string) {
    await this.dataSource.delete({ nickname: nickname });
  }
}
