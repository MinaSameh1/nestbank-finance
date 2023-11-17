import { Injectable, Logger } from '@nestjs/common'
import { DataSource, EntityManager, QueryRunner } from 'typeorm'

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name)

  private readonly dataSource: DataSource

  getDataSource(): DataSource {
    return this.dataSource
  }

  async getQueryRunner() {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    return queryRunner
  }

  commitTransaction(queryRunner: QueryRunner) {
    return queryRunner.commitTransaction()
  }

  rollbackTransaction(queryRunner: QueryRunner) {
    return queryRunner.rollbackTransaction()
  }

  releaseQueryRunner(queryRunner: QueryRunner) {
    return queryRunner.release()
  }

  doInTransaction<T>(callback: (entityManager: EntityManager) => Promise<T>) {
    return this.dataSource.transaction(callback)
  }
}
