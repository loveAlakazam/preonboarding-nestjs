/**
 * transaction.interceptor 의 목적
 *
 * 1. 한개의 트랜잭션에 2개이상의 쿼리를 수행해야될 경우
 * 2. 트랜잭션 수행에 이상없을경우에는 커밋(commit)을 수행하고
 *    트랜잭션 수행중 이상이 발생하면 롤백(rollback)을 수행하여, 수행이전의 상태로 되돌린다.
 *
 * 3. 결과에 상관없이 수행이 완료되면 커넥풀로 예약된 커넥션을 반환한다.
 *    커넥션을 반환하지않으면 데이터베이스 연결이 지속됨으로인해 성능문제를 야기하거나
 *    연결은 되어있지만 어떠한 작업이 이뤄지지 않아서 계속해서 연결을 시도하려고한다.
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { catchError, concatMap, finalize, Observable } from "rxjs";
import { DataSource } from "typeorm";

export const ENTITY_MANAGER_KEY = "ENTITY_MANAGER";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    // request 객체를 가져온다.
    const req = context.switchToHttp().getRequest<Request>();

    // 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    /**
     * 현재 인터셉터가 특정 라우트에 적용되는 시점이 언제든 상관없이
     * 트랜잭션을 시작하고 해당 트랜잭션이 갖는 entityManager를 req에 추가한다
     *
     **/
    req[ENTITY_MANAGER_KEY] = queryRunner.manager;

    /**
     * next.handle() 은 실제 요청 핸들러함수를 호출한다.
     * pipe 함수는 3가지 인자를 갖는다.
     *
     * 1. 요청 성공        : API 호출 성공과 동시에 트랜잭션 커밋하여 데이터를 있는 그대로 반환
     * 2. 요청 실패 에러핸들러: API 호출 실패와 동시에 트랜잭션 롤백
     * 3. 요청 성공/실패 상관없이 항상실행 : 커넥션풀로부터 예약한 커넥션을 release
     *
     */
    return next.handle().pipe(
      // 라우트핸들러가 성공적으로 완료될 때, concatMap 호출
      concatMap(async (data) => {
        await queryRunner.commitTransaction();
        return data;
      }),
      // 라우터핸들러가 실패될때, catchError 호출
      catchError(async (err) => {
        await queryRunner.rollbackTransaction();
        throw err;
      }),
      // 성공,실패 상관없이 항상마지막 부분에는 커넥션을 release
      finalize(async () => {
        await queryRunner.release();
      }),
    );
  }
}
