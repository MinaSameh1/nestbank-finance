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

  public async clearAll() {
    // just to be safe
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Not implemented')
    }
    this.logger.warn('Clearing all data in database')

    const connection = this.dataSource.manager.connection

    await connection.dropDatabase()
    await connection.synchronize()
  }
}
