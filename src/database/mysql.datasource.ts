import { BoardEntity } from "@src/modules/boards/entity/boards.entity";
import { CommentEntity } from "@src/modules/comments/entity/comments.entity";
import { UserEntity } from "@src/modules/users/entity/users.entity";
import * as dotenv from "dotenv";
import * as path from "path";
import { DataSource } from "typeorm";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST ?? "localhost",
  port: +(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: process.env.NODE_ENV === "production" ? false : true,
  synchronize: false,
  entities: [UserEntity, BoardEntity, CommentEntity],
  migrations: [path.join(__dirname, "..", "migrations") + "/*.{js,ts}"],
  migrationsRun: false,
});

export default AppDataSource;
