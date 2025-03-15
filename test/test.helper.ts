import { MySqlContainer, StartedMySqlContainer } from "@testcontainers/mysql";
import * as dotenv from "dotenv";

dotenv.config({ path: ".test.env" });

export const setUpTestContainer = async () => {
  const databaseName = process.env.DB_NAME ?? "test";
  const container: StartedMySqlContainer = await new MySqlContainer()
    .withDatabase(databaseName)
    .withUsername("test")
    .withUserPassword("testPassword1234")
    .start();

  const mysqlConnectConfig = {
    host: container.getHost(),
    port: container.getPort().toString(),
    database: container.getDatabase(),
    user: container.getUsername(),
    password: container.getUserPassword(),
  };

  // TypeORM이 컨테이너 Mysql을 사용할 수 있도록 환경변수 설정
  process.env.DB_HOST = mysqlConnectConfig.host;
  process.env.DB_PORT = mysqlConnectConfig.port;
  process.env.DB_NAME = mysqlConnectConfig.database;
  process.env.DB_USERNAME = mysqlConnectConfig.user;
  process.env.DB_PASSWORD = mysqlConnectConfig.password;

  return container;
};
