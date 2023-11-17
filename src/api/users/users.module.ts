import { DynamicModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entities/user.entity'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
})
export class UsersModule {
  // Only if used within an app export the service and repo to allow for injection
  static forRoot(
    options?: {
      controller?: boolean
      repoOnly?: boolean
    },
  ): DynamicModule {
    if (options?.controller) {
      return {
        module: UsersModule,
        controllers: [UsersController],
        providers: [UsersService],
        exports: [UsersService],
      }
    }
    if (options?.repoOnly) {
      return {
        module: UsersModule,
        imports: [TypeOrmModule.forFeature([User])],
        providers: [],
        exports: [TypeOrmModule],
      }
    }
    return {
      module: UsersModule,
      providers: [UsersService],
      exports: [UsersService],
    }
  }
}
