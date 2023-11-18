import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource, EntityManager, QueryRunner } from 'typeorm'

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name)

  @InjectDataSource()
  private readonly dataSource: DataSource

  protected getDataSource(): DataSource {
    return this.dataSource
  }

  public async getQueryRunner() {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    return queryRunner
  }

  public commitTransaction(queryRunner: QueryRunner) {
    return queryRunner.commitTransaction()
  }

  public rollbackTransaction(queryRunner: QueryRunner) {
    return queryRunner.rollbackTransaction()
  }

  public releaseQueryRunner(queryRunner: QueryRunner) {
    return queryRunner.release()
  }

  public doInTransaction<T>(
    callback: (entityManager: EntityManager) => Promise<T>,
  ) {
    return this.dataSource.transaction(callback)
  }
}
