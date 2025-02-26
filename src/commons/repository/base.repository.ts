/**
 * BaseRepository 목적
 *
 * 모든 데이터베이스 작업을 수행하는데 공통 레포지토리 기능을 제공한다.
 * getRepository 메소드는 TypeORM 래포지토리 인스턴스를 생성하는 기능을 수행한다.
 * 트랜잭션이 적용된 요청과 그렇지 않은 요청을 모두 처리할 수 있도록 설계되어있다.
 */

import { Request } from "express";
import { DataSource, EntityManager } from "typeorm";
import { ENTITY_MANAGER_KEY } from "../interceptors/transaction.interceptor";

export class BaseRepository {
  constructor(
    private dataSource: DataSource,
    private request: Request,
  ) {}

  protected getRepository<T>(entityClass: new () => T) {
    const entityManager: EntityManager =
      this.request[ENTITY_MANAGER_KEY] ?? this.dataSource.manager;
    return entityManager.getRepository(entityClass);
  }
}
